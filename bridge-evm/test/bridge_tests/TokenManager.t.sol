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

import {Bridge} from "../../contracts/Bridge.sol";

import {ERC20Bridged} from "../../contracts/token/ERC20Bridged.sol";

import {sAMB} from "../mocks/sAMB.sol";

import {BridgeTestBase} from "./BridgeBase.t.sol";

abstract contract TokenManagerTest is BridgeTestBase {

    using EnumerableSet for EnumerableSet.AddressSet;

    function addToken(
        address token,
        bytes32 externalTokenAddress,
        uint8 decimals
    ) public {
        ITokenManager.ExternalTokenUnmapped memory externalToken = ITokenManager
            .ExternalTokenUnmapped({
            externalTokenAddress: externalTokenAddress,
            decimals: decimals
        });
        vm.expectEmit(address(bridgeInstance));
        emit ITokenManager.TokenAdded(token);
        bridgeInstance.addToken(token, externalToken);
        assertEq(bridgeInstance.bridgableTokens(token), true);
        assertEq(bridgeInstance.external2token(externalTokenAddress), token);
        assertEq(bridgeInstance.pausedTokens(token), true);
    }

    function addToken(
        address token,
        bytes32 externalTokenAddress,
        uint8 decimals,
        bool paused
    ) public {
        ITokenManager.ExternalTokenUnmapped memory externalToken = ITokenManager
            .ExternalTokenUnmapped({
            externalTokenAddress: externalTokenAddress,
            decimals: decimals
        });

        vm.expectEmit(address(bridgeInstance));
        emit ITokenManager.TokenAdded(token);
        vm.expectEmit(address(bridgeInstance));
        if (paused) {
            emit ITokenManager.TokenPaused(token);
        } else {
            emit ITokenManager.TokenUnpaused(token);
        }
        bridgeInstance.addToken(token, externalToken, paused);
        assertEq(bridgeInstance.bridgableTokens(token), true);
        assertEq(bridgeInstance.external2token(externalTokenAddress), token);
        assertEq(bridgeInstance.pausedTokens(token), paused);
    }

    function removeToken(
        address token
    ) public {
        vm.expectEmit(address(bridgeInstance));
        emit ITokenManager.TokenRemoved(token);
        bridgeInstance.removeToken(token);
        assertEq(bridgeInstance.bridgableTokens(token), false);
        assertEq(bridgeInstance.pausedTokens(token), true);
    }

    function mapToken(
        address token,
        bytes32 externalTokenAddress,
        uint8 decimals
    ) public {
        ITokenManager.ExternalTokenUnmapped memory externalToken = ITokenManager
            .ExternalTokenUnmapped({
            externalTokenAddress: externalTokenAddress,
            decimals: decimals
        });
        vm.expectEmit(address(bridgeInstance));
        emit ITokenManager.TokenMapped(token, externalTokenAddress);
        bridgeInstance.mapExternalToken(externalToken, token);
        assertEq(bridgeInstance.external2token(externalTokenAddress), token);
    }

    function unmapToken(
        bytes32 externalTokenAddress
    ) public {
        vm.expectEmit(address(bridgeInstance));
        emit ITokenManager.TokenUnmapped(externalTokenAddress);
        bridgeInstance.unmapExternalToken(externalTokenAddress);
        assertEq(
            bridgeInstance.external2token(externalTokenAddress), address(0x0)
        );
    }

    function deployBridgedToken(
        bytes32 externalTokenAddress,
        string memory name,
        string memory symbol,
        uint8 decimals
    ) public returns (ERC20Bridged) {
        ITokenManager.ExternalTokenUnmapped memory externalToken = ITokenManager
            .ExternalTokenUnmapped({
            externalTokenAddress: externalTokenAddress,
            decimals: decimals
        });
        vm.expectEmit(false, true, false, false, address(bridgeInstance));
        emit ITokenManager.TokenMapped(address(0), externalTokenAddress);
        vm.expectEmit(false, false, false, false, address(bridgeInstance));
        emit ITokenManager.TokenAdded(address(0));
        vm.expectEmit(false, false, false, false, address(bridgeInstance));
        emit ITokenManager.TokenPaused(address(0));
        vm.expectEmit(true, true, true, false, address(bridgeInstance));
        emit ITokenManager.TokenDeployed(name, symbol, decimals, address(0));
        address bridgedToken = bridgeInstance.deployExternalTokenERC20(
            externalToken, name, symbol, decimals
        );
        ERC20Bridged bridgedTokenInstance = ERC20Bridged(bridgedToken);
        assertEq(bridgedTokenInstance.name(), name);
        assertEq(bridgedTokenInstance.symbol(), symbol);
        assertEq(bridgedTokenInstance.decimals(), decimals);
        assertEq(bridgedTokenInstance.bridge(), address(bridgeInstance));
        return bridgedTokenInstance;
    }

    function test_addToken() public {
        address token = address(wrappedToken);
        bytes32 externalTokenAddress = bytes32("sAMB");
        uint8 decimals = 6;
        addToken(token, externalTokenAddress, decimals);
    }

    function test_fuzz_addToken(
        address token,
        bytes32 externalTokenAddress,
        uint8 decimals
    ) public {
        vm.assume(token != address(0));
        addToken(token, externalTokenAddress, decimals);
    }

    function test_revertIf_addToken_zero_address() public {
        vm.expectRevert(ITokenManager.TokenZeroAddress.selector);
        ITokenManager.ExternalTokenUnmapped memory externalToken = ITokenManager
            .ExternalTokenUnmapped({
            externalTokenAddress: bytes32("sAMB"),
            decimals: 6
        });
        bridgeInstance.addToken(address(0), externalToken);
    }

    function test_revertIf_addToken_not_authority() public {
        vm.startPrank(bob);
        vm.expectRevert(
            abi.encodeWithSelector(
                IAccessManaged.AccessManagedUnauthorized.selector, bob
            )
        );
        ITokenManager.ExternalTokenUnmapped memory externalToken = ITokenManager
            .ExternalTokenUnmapped({
            externalTokenAddress: bytes32("sAMB"),
            decimals: 6
        });
        bridgeInstance.addToken(address(wrappedToken), externalToken);
        vm.stopPrank();
    }

    function test_revertIf_AlreadyAddedToken() public {
        address token = address(wrappedToken);
        bytes32 externalTokenAddress = bytes32("sAMB");
        uint8 decimals = 6;
        addToken(token, externalTokenAddress, decimals);
        ITokenManager.ExternalTokenUnmapped memory externalToken = ITokenManager
            .ExternalTokenUnmapped({
            externalTokenAddress: externalTokenAddress,
            decimals: decimals
        });
        vm.expectRevert(
            abi.encodeWithSelector(
                ITokenManager.TokenAlreadyAdded.selector, address(wrappedToken)
            )
        );
        bridgeInstance.addToken(token, externalToken);
    }

    function test_removeToken() public {
        address token = address(wrappedToken);
        bytes32 externalTokenAddress = bytes32("sAMB");
        uint8 decimals = 6;
        addToken(token, externalTokenAddress, decimals);
        removeToken(token);
    }

    function test_fuzz_removeToken(
        address token,
        bytes32 externalTokenAddress,
        uint8 decimals
    ) public {
        vm.assume(token != address(0));
        addToken(token, externalTokenAddress, decimals);
        removeToken(token);
    }

    function test_revertIf_removeToken_not_authority() public {
        address token = address(wrappedToken);
        bytes32 externalTokenAddress = bytes32("sAMB");
        uint8 decimals = 6;
        addToken(token, externalTokenAddress, decimals);
        vm.startPrank(bob);
        vm.expectRevert(
            abi.encodeWithSelector(
                IAccessManaged.AccessManagedUnauthorized.selector, bob
            )
        );
        bridgeInstance.removeToken(token);
        vm.stopPrank();
    }

    function test_revertIf_removeToken_NotAddedToken() public {
        address token = address(wrappedToken);
        vm.expectRevert(
            abi.encodeWithSelector(
                ITokenManager.TokenNotAdded.selector, address(wrappedToken)
            )
        );
        bridgeInstance.removeToken(token);
    }

    function test_mapExternalToken() public {
        address token = address(wrappedToken);
        bytes32 externalTokenAddress = bytes32("sAMB");
        uint8 decimals = 6;
        addToken(token, externalTokenAddress, decimals);
        bytes32 newExternalTokenAddress = bytes32("sAMB2");
        mapToken(token, newExternalTokenAddress, decimals);
    }

    function test_fuzz_mapExternalToken(
        address token,
        bytes32 externalTokenAddress,
        bytes32 newExternalTokenAddress
    ) public {
        vm.assume(token != address(0));
        uint256 a;
        uint256 b;
        externalTokenAddress = bytes32(bound(a, 0, type(uint256).max / 2));
        newExternalTokenAddress =
            bytes32(bound(b, type(uint256).max / 2, type(uint256).max));
        uint8 decimals = 6;
        addToken(token, externalTokenAddress, decimals);
        mapToken(token, newExternalTokenAddress, decimals);
    }

    function test_revertIf_mapExternalToken_notAdded() public {
        ITokenManager.ExternalTokenUnmapped memory externalToken = ITokenManager
            .ExternalTokenUnmapped({
            externalTokenAddress: bytes32("sAMB2"),
            decimals: 6
        });
        address token = address(wrappedToken);
        vm.expectRevert(
            abi.encodeWithSelector(
                ITokenManager.TokenNotBridgable.selector, address(wrappedToken)
            )
        );
        bridgeInstance.mapExternalToken(externalToken, token);
    }

    function test_revertIf_mapExternalToken_not_authority() public {
        address token = address(wrappedToken);
        bytes32 externalTokenAddress = bytes32("sAMB");
        uint8 decimals = 6;
        addToken(token, externalTokenAddress, decimals);
        bytes32 newExternalTokenAddress = bytes32("sAMB2");
        ITokenManager.ExternalTokenUnmapped memory externalToken = ITokenManager
            .ExternalTokenUnmapped({
            externalTokenAddress: newExternalTokenAddress,
            decimals: decimals
        });
        vm.startPrank(bob);
        vm.expectRevert(
            abi.encodeWithSelector(
                IAccessManaged.AccessManagedUnauthorized.selector, bob
            )
        );
        bridgeInstance.mapExternalToken(externalToken, token);
        vm.stopPrank();
    }

    function test_revertIf_mapExternalToken_alreadyMapped() public {
        address token = address(wrappedToken);
        bytes32 externalTokenAddress = bytes32("sAMB");
        uint8 decimals = 6;
        bytes32 newExternalTokenAddress = bytes32("sAMB");
        addToken(token, externalTokenAddress, decimals);
        vm.expectRevert(
            abi.encodeWithSelector(
                ITokenManager.TokenAlreadyMapped.selector,
                newExternalTokenAddress
            )
        );
        ITokenManager.ExternalTokenUnmapped memory externalToken = ITokenManager
            .ExternalTokenUnmapped({
            externalTokenAddress: newExternalTokenAddress,
            decimals: decimals
        });
        bridgeInstance.mapExternalToken(externalToken, token);
    }

    function test_unmapExternalToken() public {
        address token = address(wrappedToken);
        bytes32 externalTokenAddress = bytes32("sAMB");
        uint8 decimals = 6;
        addToken(token, externalTokenAddress, decimals);
        unmapToken(externalTokenAddress);
    }

    function test_fuzz_unmapExternalToken(
        address token,
        bytes32 externalTokenAddress,
        uint8 decimals
    ) public {
        vm.assume(token != address(0));
        addToken(token, externalTokenAddress, decimals);
        unmapToken(externalTokenAddress);
    }

    function test_revertIf_unmapExternalToken_not_authority() public {
        address token = address(wrappedToken);
        bytes32 externalTokenAddress = bytes32("sAMB");
        uint8 decimals = 6;
        addToken(token, externalTokenAddress, decimals);
        vm.startPrank(bob);
        vm.expectRevert(
            abi.encodeWithSelector(
                IAccessManaged.AccessManagedUnauthorized.selector, bob
            )
        );
        bridgeInstance.unmapExternalToken(externalTokenAddress);
        vm.stopPrank();
    }

    function test_revertIf_unmapExternalToken_notMapped() public {
        bytes32 externalTokenAddress = bytes32("sAMB");

        vm.expectRevert(
            abi.encodeWithSelector(
                ITokenManager.TokenNotMapped.selector, externalTokenAddress
            )
        );
        bridgeInstance.unmapExternalToken(externalTokenAddress);
    }

    function test_addTokenWithPaused() public {
        address token = address(wrappedToken);
        bytes32 externalTokenAddress = bytes32("sAMB");
        uint8 decimals = 6;
        addToken(token, externalTokenAddress, decimals, false);
    }

    function test_fuzz_addTokenWithPaused(
        address token,
        bytes32 externalTokenAddress,
        uint8 decimals,
        bool paused
    ) public {
        vm.assume(token != address(0));
        addToken(token, externalTokenAddress, decimals, paused);
    }

    function test_revertIf_addTokenWithPaused_not_authority() public {
        address token = address(wrappedToken);
        bytes32 externalTokenAddress = bytes32("sAMB");
        uint8 decimals = 6;
        ITokenManager.ExternalTokenUnmapped memory externalToken = ITokenManager
            .ExternalTokenUnmapped({
            externalTokenAddress: externalTokenAddress,
            decimals: decimals
        });
        vm.startPrank(bob);
        vm.expectRevert(
            abi.encodeWithSelector(
                IAccessManaged.AccessManagedUnauthorized.selector, bob
            )
        );
        bridgeInstance.addToken(token, externalToken, false);
        vm.stopPrank();
    }

    function test_revertIf_addTokenWithPaused_alreadyAdded() public {
        address token = address(wrappedToken);
        bytes32 externalTokenAddress = bytes32("sAMB");
        uint8 decimals = 6;
        addToken(token, externalTokenAddress, decimals);
        ITokenManager.ExternalTokenUnmapped memory externalToken = ITokenManager
            .ExternalTokenUnmapped({
            externalTokenAddress: externalTokenAddress,
            decimals: decimals
        });
        vm.expectRevert(
            abi.encodeWithSelector(
                ITokenManager.TokenAlreadyAdded.selector, address(wrappedToken)
            )
        );
        bridgeInstance.addToken(token, externalToken, false);
    }

    function test_tokenPause() public {
        address token = address(wrappedToken);
        bytes32 externalTokenAddress = bytes32("sAMB");
        uint8 decimals = 6;
        addToken(token, externalTokenAddress, decimals, false);
        vm.expectEmit(address(bridgeInstance));
        emit ITokenManager.TokenPaused(token);
        bridgeInstance.pauseToken(token);
        assertEq(bridgeInstance.pausedTokens(token), true);
    }

    function test_revertIf_tokenIsPaused() public {
        address token = address(wrappedToken);
        bytes32 externalTokenAddress = bytes32("sAMB");
        uint8 decimals = 6;
        addToken(token, externalTokenAddress, decimals, false);
        bridgeInstance.pauseToken(token);
        vm.expectRevert(
            abi.encodeWithSelector(
                ITokenManager.TokenIsPaused.selector, address(wrappedToken)
            )
        );
        bridgeInstance.pauseToken(token);
    }

    function test_tokenUnpause() public {
        address token = address(wrappedToken);
        bytes32 externalTokenAddress = bytes32("sAMB");
        uint8 decimals = 6;
        addToken(token, externalTokenAddress, decimals, false);
        vm.expectEmit(address(bridgeInstance));
        emit ITokenManager.TokenPaused(token);
        bridgeInstance.pauseToken(token);
        assertEq(bridgeInstance.pausedTokens(token), true);
        vm.expectEmit(address(bridgeInstance));
        emit ITokenManager.TokenUnpaused(token);
        bridgeInstance.unpauseToken(token);
        assertEq(bridgeInstance.pausedTokens(token), false);
    }

    function test_revertIf_tokenIsUnpaused() public {
        address token = address(wrappedToken);
        bytes32 externalTokenAddress = bytes32("sAMB");
        uint8 decimals = 6;
        addToken(token, externalTokenAddress, decimals, false);
        vm.expectRevert(
            abi.encodeWithSelector(
                ITokenManager.TokenNotPaused.selector, address(wrappedToken)
            )
        );
        bridgeInstance.unpauseToken(token);
    }

    function test_deployBridgedToken() public {
        bytes32 externalTokenAddress = bytes32("SOLANA_TOKEN");
        string memory name = "Wrapped Solana";
        string memory symbol = "wSOL";
        uint8 decimals = 18;
        deployBridgedToken(externalTokenAddress, name, symbol, decimals);
    }

    function test_fuzz_deployBridgedToken(
        bytes32 externalTokenAddress,
        string memory name,
        string memory symbol,
        uint8 decimals
    ) public {
        deployBridgedToken(externalTokenAddress, name, symbol, decimals);
    }

    function test_revertIf_deployBridgedToken_not_authority() public {
        bytes32 externalTokenAddress = bytes32("SOLANA_TOKEN");
        string memory name = "Wrapped Solana";
        string memory symbol = "wSOL";
        uint8 decimals = 18;
        ITokenManager.ExternalTokenUnmapped memory externalToken = ITokenManager
            .ExternalTokenUnmapped({
            externalTokenAddress: externalTokenAddress,
            decimals: decimals
        });

        vm.startPrank(bob);
        vm.expectRevert(
            abi.encodeWithSelector(
                IAccessManaged.AccessManagedUnauthorized.selector, bob
            )
        );
        bridgeInstance.deployExternalTokenERC20(
            externalToken, name, symbol, decimals
        );
        vm.stopPrank();
    }

    function test_revertIf_deployBridgedToken_alreadyMapped() public {
        bytes32 externalTokenAddress = bytes32("SOLANA_TOKEN");
        uint8 decimals = 18;
        addToken(address(wrappedToken), externalTokenAddress, decimals);
        string memory name = "Wrapped Solana";
        string memory symbol = "wSOL";
        ITokenManager.ExternalTokenUnmapped memory externalToken = ITokenManager
            .ExternalTokenUnmapped({
            externalTokenAddress: externalTokenAddress,
            decimals: decimals
        });
        vm.expectRevert(
            abi.encodeWithSelector(
                ITokenManager.TokenAlreadyMapped.selector, externalTokenAddress
            )
        );
        bridgeInstance.deployExternalTokenERC20(
            externalToken, name, symbol, decimals
        );
    }

    function test_should_return_samb_address() public view {
        assertEq(bridgeInstance.samb(), address(wrappedToken));
    }

}
