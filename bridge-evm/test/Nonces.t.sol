// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "forge-std/Test.sol";

import {
    UnsafeUpgrades,
    Upgrades
} from "openzeppelin-foundry-upgrades/Upgrades.sol";

import {NoncesUpgradeable} from "../contracts/utils/NoncesUpgradeable.sol";

import {MockNonce} from "./mocks/MockNonce.sol";

contract NoncesTest is Test {

    MockNonce public mockNonce;

    address alice = address(0xA11ce);
    address bob = address(0xB0b);

    bytes32 key1 = bytes32("key1");
    bytes32 key2 = bytes32("key2");

    uint256 num1 = 1;
    uint256 num2 = 2;

    bytes32 private constant coverageProfile =
        keccak256(abi.encodePacked("coverage"));

    function isCoverage() internal view returns (bool) {
        return keccak256(
            abi.encodePacked(vm.envOr("FOUNDRY_PROFILE", string("default")))
        ) == coverageProfile;
    }

    function setUp() public {
        address proxy;
        if (isCoverage()) {
            address impl = address(new MockNonce());
            proxy = address(
                UnsafeUpgrades.deployUUPSProxy(
                    impl, abi.encodeCall(MockNonce.initialize, ())
                )
            );
        } else {
            proxy = address(
                Upgrades.deployUUPSProxy(
                    "MockNonce.sol", abi.encodeCall(MockNonce.initialize, ())
                )
            );
        }
        mockNonce = MockNonce(proxy);
    }

    function test_fuzz_useNonce(
        bytes32 keyBytes,
        uint256 keyUint,
        address owner
    )
        public
    {
        vm.assume(
            keyBytes != bytes32(keyUint) && keyUint != uint256(uint160(owner))
        );
        uint256 currentNonceAddress = mockNonce.nonces(owner);
        uint256 currentNonceBytes = mockNonce.nonces(keyBytes);
        uint256 currentNonceUint = mockNonce.nonces(keyUint);

        mockNonce.useNonce(keyBytes);
        assertEq(mockNonce.nonces(keyBytes), currentNonceBytes + 1);
        mockNonce.useCheckedNonce(keyBytes, currentNonceBytes + 1);
        assertEq(mockNonce.nonces(keyBytes), currentNonceBytes + 2);

        mockNonce.useNonce(owner);
        assertEq(mockNonce.nonces(owner), currentNonceAddress + 1);
        mockNonce.useCheckedNonce(owner, currentNonceAddress + 1);
        assertEq(mockNonce.nonces(owner), currentNonceAddress + 2);

        mockNonce.useNonce(keyUint);
        assertEq(mockNonce.nonces(keyUint), currentNonceUint + 1);
        mockNonce.useCheckedNonce(keyUint, currentNonceUint + 1);
        assertEq(mockNonce.nonces(keyUint), currentNonceUint + 2);
    }

    function test_getNonce_by_address() public view {
        assertEq(mockNonce.nonces(alice), 0);
        assertEq(mockNonce.nonces(bob), 0);
    }

    function test_getNonce_by_key() public view {
        assertEq(mockNonce.nonces(key1), 0);
        assertEq(mockNonce.nonces(key2), 0);
    }

    function test_getNonce_by_number() public view {
        assertEq(mockNonce.nonces(num1), 0);
        assertEq(mockNonce.nonces(num2), 0);
    }

    function test_useNonce_by_address() public {
        assertEq(mockNonce.nonces(alice), 0);
        mockNonce.useNonce(alice);
        assertEq(mockNonce.nonces(alice), 1);
        // increments only alice's nonce
        assertEq(mockNonce.nonces(bob), 0);
        assertEq(mockNonce.nonces(key1), 0);
        assertEq(mockNonce.nonces(key2), 0);
        assertEq(mockNonce.nonces(num1), 0);
        assertEq(mockNonce.nonces(num2), 0);
    }

    function test_useNonce_by_key() public {
        assertEq(mockNonce.nonces(key1), 0);
        mockNonce.useNonce(key1);
        assertEq(mockNonce.nonces(key1), 1);
        // increments only key1's nonce
        assertEq(mockNonce.nonces(alice), 0);
        assertEq(mockNonce.nonces(bob), 0);
        assertEq(mockNonce.nonces(key2), 0);
        assertEq(mockNonce.nonces(num1), 0);
        assertEq(mockNonce.nonces(num2), 0);
    }

    function test_useCheckedNonce_by_address() public {
        mockNonce.useNonce(alice);
        assertEq(mockNonce.nonces(alice), 1);
        mockNonce.useCheckedNonce(alice, 1);
        assertEq(mockNonce.nonces(alice), 2);
        // increments only alice's nonce
        assertEq(mockNonce.nonces(bob), 0);
        assertEq(mockNonce.nonces(key1), 0);
        assertEq(mockNonce.nonces(key2), 0);
        assertEq(mockNonce.nonces(num1), 0);
        assertEq(mockNonce.nonces(num2), 0);
    }

    function test_useCheckedNonce_by_number() public {
        mockNonce.useNonce(num1);
        assertEq(mockNonce.nonces(num1), 1);
        mockNonce.useCheckedNonce(num1, 1);
        assertEq(mockNonce.nonces(num1), 2);
        // increments only num1's nonce
        assertEq(mockNonce.nonces(alice), 0);
        assertEq(mockNonce.nonces(bob), 0);
        assertEq(mockNonce.nonces(key1), 0);
        assertEq(mockNonce.nonces(key2), 0);
        assertEq(mockNonce.nonces(num2), 0);
    }

    function test_useCheckedNonce_by_key() public {
        mockNonce.useNonce(key1);
        assertEq(mockNonce.nonces(key1), 1);
        mockNonce.useCheckedNonce(key1, 1);
        assertEq(mockNonce.nonces(key1), 2);
        // increments only key1's nonce
        assertEq(mockNonce.nonces(alice), 0);
        assertEq(mockNonce.nonces(bob), 0);
        assertEq(mockNonce.nonces(key2), 0);
    }

    function test_revertIf_useCheckedNonce_that_NotExpected() public {
        uint256 currentNonce = mockNonce.nonces(alice);
        vm.expectRevert(
            abi.encodeWithSelector(
                NoncesUpgradeable.InvalidAccountNonce.selector,
                uint256(uint160(alice)),
                currentNonce
            )
        );
        mockNonce.useCheckedNonce(alice, currentNonce + 1);
    }

}
