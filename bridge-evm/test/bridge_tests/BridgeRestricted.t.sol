// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import "forge-std/Test.sol";

import {Initializable} from
    "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import {IAccessManaged} from
    "@openzeppelin/contracts/access/manager/IAccessManaged.sol";
import {EnumerableSet} from
    "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";

import {ITokenManager} from "../../contracts/interface/ITokenManager.sol";
import {IValidation} from "../../contracts/interface/IValidation.sol";
import {IWrapped} from "../../contracts/interface/IWrapped.sol";

import {BridgeUpgradeable} from
    "../../contracts/upgradeable/BridgeUpgradeable.sol";

import {Bridge} from "../../contracts/Bridge.sol";
import {Validator} from "../../contracts/Validator.sol";
import {ERC20Bridged} from "../../contracts/token/ERC20Bridged.sol";

import {sAMB} from "../mocks/sAMB.sol";

import {BridgeTestBase} from "./BridgeBase.t.sol";

abstract contract BridgeRestrictedTest is BridgeTestBase {

    using EnumerableSet for EnumerableSet.AddressSet;

    function test_revertWhen_initialize_twice() public {
        vm.expectRevert(Initializable.InvalidInitialization.selector);
        validatorInstance.initialize(
            address(authority), validatorSet.values(), deadBeef, 100
        );
        vm.expectRevert(Initializable.InvalidInitialization.selector);
        bridgeInstance.initialize(
            address(authority),
            address(wrappedToken),
            validatorInstance,
            payable(alice),
            nativeSendAmount
        );
    }

    function test_change_feeReceiver() public {
        bridgeInstance.setFeeReceiver(payable(alice));
        assertEq(bridgeInstance.feeReceiver(), payable(alice));
        bridgeInstance.setFeeReceiver(fee);
        assertEq(bridgeInstance.feeReceiver(), fee);
    }

    function test_revertIf_change_feeReceiver_not_authority() public {
        vm.startPrank(bob);
        vm.expectRevert(
            abi.encodeWithSelector(
                IAccessManaged.AccessManagedUnauthorized.selector, bob
            )
        );
        bridgeInstance.setFeeReceiver(payable(alice));
        vm.stopPrank();
    }

    function test_change_nativeSendAmount() public {
        bridgeInstance.setNativeSendAmount(2 ether);
        assertEq(bridgeInstance.nativeSendAmount(), 2 ether);
        bridgeInstance.setNativeSendAmount(1 ether);
        assertEq(bridgeInstance.nativeSendAmount(), 1 ether);
    }

    function test_revertIf_change_nativeSendAmount_not_authority() public {
        vm.startPrank(bob);
        vm.expectRevert(
            abi.encodeWithSelector(
                IAccessManaged.AccessManagedUnauthorized.selector, bob
            )
        );
        bridgeInstance.setNativeSendAmount(2 ether);
        vm.stopPrank();
    }

    function test_change_validator() public {
        Validator newValidator = Validator(address(0x0));
        bridgeInstance.setValidator(newValidator);
        assertEq(address(bridgeInstance.validator()), address(newValidator));
        bridgeInstance.setValidator(validatorInstance);
        assertEq(
            address(bridgeInstance.validator()), address(validatorInstance)
        );
    }

    function test_revertIf_change_validator_not_authority() public {
        vm.startPrank(bob);
        vm.expectRevert(
            abi.encodeWithSelector(
                IAccessManaged.AccessManagedUnauthorized.selector, bob
            )
        );
        Validator newValidator = Validator(address(0x0));
        bridgeInstance.setValidator(newValidator);
        vm.stopPrank();
    }

    function test_add_new_role_to_call_bridge() public {
        uint64 bridgeRoleID = 1;
        bytes4[] memory selectors = new bytes4[](3);
        selectors[0] = BridgeUpgradeable.setFeeReceiver.selector;
        selectors[1] = BridgeUpgradeable.setNativeSendAmount.selector;
        selectors[2] = BridgeUpgradeable.setValidator.selector;
        authority.setTargetFunctionRole(
            address(bridgeInstance), selectors, bridgeRoleID
        );
        authority.grantRole(bridgeRoleID, bob, 0);
        vm.startPrank(bob);
        bridgeInstance.setFeeReceiver(payable(alice));
        assertEq(bridgeInstance.feeReceiver(), payable(alice));
        bridgeInstance.setNativeSendAmount(2 ether);
        assertEq(bridgeInstance.nativeSendAmount(), 2 ether);
        bridgeInstance.setValidator(Validator(address(0x0)));
        vm.expectRevert(
            abi.encodeWithSelector(
                IAccessManaged.AccessManagedUnauthorized.selector, bob
            ),
            7
        );
        bridgeInstance.addToken(address(wrappedToken), bytes32("sAMB"));
        bridgeInstance.removeToken(address(wrappedToken), bytes32("sAMB"));
        bridgeInstance.deployExternalTokenERC20(
            bytes32("SOLANA"), "Wrapped Solana", "wSOL", 18
        );
        bridgeInstance.pauseToken(address(wrappedToken));
        bridgeInstance.unpauseToken(address(wrappedToken));
        bridgeInstance.mapExternalToken(
            bytes32("SOLANA"), address(wrappedToken)
        );
        bridgeInstance.unmapExternalToken(bytes32("SOLANA"));
        vm.stopPrank();
    }

}
