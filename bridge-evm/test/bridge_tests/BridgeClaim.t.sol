// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import "forge-std/Test.sol";

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {ERC20Permit} from
    "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";
import {EnumerableSet} from
    "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";

import {IBridge} from "../../contracts/interface/IBridge.sol";

import {
    BridgeFlags, BridgeTypes
} from "../../contracts/interface/BridgeTypes.sol";
import {ITokenManager} from "../../contracts/interface/ITokenManager.sol";

import {Bridge} from "../../contracts/Bridge.sol";
import {ERC20Bridged} from "../../contracts/token/ERC20Bridged.sol";

import {PayloadUtils} from "../../contracts/utils/PayloadUtils.sol";
import {ReceiptUtils} from "../../contracts/utils/ReceiptUtils.sol";

import {SigUtils} from "../SigUtils.sol";
import {BridgeTestBase} from "./BridgeBase.t.sol";

abstract contract BridgeClaimTest is BridgeTestBase {

    using EnumerableSet for EnumerableSet.AddressSet;
    using ReceiptUtils for BridgeTypes.FullReceipt;
    using ReceiptUtils for BridgeTypes.MiniReceipt;
    using PayloadUtils for BridgeTypes.SendPayload;

    function signReceipt(
        BridgeTypes.MiniReceipt memory receipt
    ) public view returns (bytes memory) {
        bytes memory signature;
        bytes32 digest = receipt.toHash();
        for (uint256 i = 0; i < signers.length; i++) {
            (uint8 v, bytes32 r, bytes32 s) = vm.sign(signers[i].PK, digest);
            bytes memory signerSignature = abi.encodePacked(r, s, v); // note the order here is different from line above.
            signature = bytes.concat(signature, signerSignature);
        }
        return signature;
    }

    function test_claim_withFullReceipt(
        uint256 amount
    ) public returns (address) {
        ITokenManager.ExternalTokenUnmapped memory extToken = ITokenManager
            .ExternalTokenUnmapped({
            externalTokenAddress: bytes32("SOLANA_TOKEN"),
            decimals: permittableToken.decimals()
        });
        address token = bridgeInstance.deployExternalTokenERC20(
            extToken, "solana token", "SOL", 18
        );
        bridgeInstance.unpauseToken(token);
        BridgeTypes.FullReceipt memory receipt = BridgeTypes.FullReceipt({
            from: bytes32("SOLANA_SENDER"),
            to: bytes32(uint256(uint160(deadBeef))), // deadBeef
            tokenAddressFrom: bytes32("SOLANA_TOKEN"),
            tokenAddressTo: bytes32(uint256(uint160(token))),
            amountFrom: amount,
            amountTo: amount,
            chainFrom: uint256(bytes32("SOLANA")),
            chainTo: block.chainid,
            eventId: 555,
            flags: 0,
            data: new bytes(0)
        });
        bytes memory signature = signReceipt(receipt.asMini());
        vm.expectEmit(address(bridgeInstance));
        emit IBridge.TokenUnlocked(receipt.asMini());
        bridgeInstance.claim(receipt, signature);
        assertEq(ERC20(token).balanceOf(deadBeef), amount);
        assertTrue(bridgeInstance.isClaimed(receipt));
        assertTrue(bridgeInstance.isClaimed(receipt.asMini()));
        assertTrue(bridgeInstance.isClaimed(receipt.toHash()));
        return token;
    }

    function test_claim_withMiniReceipt(
        uint256 amount
    ) public returns (address) {
        ITokenManager.ExternalTokenUnmapped memory extToken = ITokenManager
            .ExternalTokenUnmapped({
            externalTokenAddress: bytes32("SOLANA_TOKEN"),
            decimals: permittableToken.decimals()
        });
        address token = bridgeInstance.deployExternalTokenERC20(
            extToken, "solana token", "SOL", 18
        );
        bridgeInstance.unpauseToken(token);
        BridgeTypes.FullReceipt memory receipt = BridgeTypes.FullReceipt({
            from: bytes32("SOLANA_SENDER"),
            to: bytes32(uint256(uint160(deadBeef))), // deadBeef
            tokenAddressFrom: bytes32("SOLANA_TOKEN"),
            tokenAddressTo: bytes32(uint256(uint160(token))),
            amountFrom: amount,
            amountTo: amount,
            chainFrom: uint256(bytes32("SOLANA")),
            chainTo: block.chainid,
            eventId: 555,
            flags: 0,
            data: new bytes(0)
        });
        BridgeTypes.MiniReceipt memory miniReceipt = receipt.asMini();
        bytes memory signature = signReceipt(miniReceipt);
        vm.expectEmit(address(bridgeInstance));
        emit IBridge.TokenUnlocked(miniReceipt);
        bridgeInstance.claim(miniReceipt, signature);
        assertEq(ERC20(token).balanceOf(deadBeef), amount);
        assertTrue(bridgeInstance.isClaimed(receipt));
        assertTrue(bridgeInstance.isClaimed(miniReceipt));
        assertTrue(bridgeInstance.isClaimed(receipt.toHash()));
        return token;
    }

    function test_revertIf_claim_alreadyClaimed(
        uint256 amount
    ) public {
        address token = test_claim_withFullReceipt(amount);
        BridgeTypes.FullReceipt memory sameReceipt = BridgeTypes.FullReceipt({
            from: bytes32("SOLANA_SENDER"),
            to: bytes32(uint256(uint160(deadBeef))), // deadBeef
            tokenAddressFrom: bytes32("SOLANA_TOKEN"),
            tokenAddressTo: bytes32(uint256(uint160(token))),
            amountFrom: amount,
            amountTo: amount,
            chainFrom: uint256(bytes32("SOLANA")),
            chainTo: block.chainid,
            eventId: 555,
            flags: 0,
            data: new bytes(0)
        });
        bytes memory signature = signReceipt(sameReceipt.asMini());
        vm.expectRevert(
            abi.encodeWithSelector(
                IBridge.Claimed.selector, sameReceipt.toHash()
            )
        );
        bridgeInstance.claim(sameReceipt, signature);
    }

    function test_revertIf_claim_TokenNotBridgable(
        uint256 amount
    ) public {
        BridgeTypes.FullReceipt memory receipt = BridgeTypes.FullReceipt({
            from: bytes32("SOLANA_SENDER"),
            to: bytes32(uint256(uint160(deadBeef))), // deadBeef
            tokenAddressFrom: bytes32("SOLANA_TOKEN"),
            tokenAddressTo: bytes32(uint256(uint160(deadBeef))),
            amountFrom: amount,
            amountTo: amount,
            chainFrom: uint256(bytes32("SOLANA")),
            chainTo: block.chainid,
            eventId: 555,
            flags: 0,
            data: new bytes(0)
        });
        bytes memory signature = signReceipt(receipt.asMini());
        vm.expectRevert(
            abi.encodeWithSelector(
                ITokenManager.TokenNotBridgable.selector, deadBeef
            )
        );
        bridgeInstance.claim(receipt, signature);
    }

    function test_revertIf_claim_wrongChain(
        uint256 amount
    ) public {
        ITokenManager.ExternalTokenUnmapped memory extToken = ITokenManager
            .ExternalTokenUnmapped({
            externalTokenAddress: bytes32("SOLANA_TOKEN"),
            decimals: permittableToken.decimals()
        });
        address token = bridgeInstance.deployExternalTokenERC20(
            extToken, "solana token", "SOL", 18
        );
        bridgeInstance.unpauseToken(token);
        BridgeTypes.FullReceipt memory receipt = BridgeTypes.FullReceipt({
            from: bytes32("SOLANA_SENDER"),
            to: bytes32(uint256(uint160(deadBeef))), // deadBeef
            tokenAddressFrom: bytes32("SOLANA_TOKEN"),
            tokenAddressTo: bytes32(uint256(uint160(token))),
            amountFrom: amount,
            amountTo: amount,
            chainFrom: uint256(bytes32("SOLANA")),
            chainTo: block.chainid + 1,
            eventId: 555,
            flags: 0,
            data: new bytes(0)
        });
        bytes memory signature = signReceipt(receipt.asMini());
        vm.expectRevert(IBridge.InvalidChain.selector);
        bridgeInstance.claim(receipt, signature);
    }

    function test_revertIf_claim_tokenPaused(
        uint256 amount
    ) public {
        ITokenManager.ExternalTokenUnmapped memory extToken = ITokenManager
            .ExternalTokenUnmapped({
            externalTokenAddress: bytes32("SOLANA_TOKEN"),
            decimals: permittableToken.decimals()
        });
        address token = bridgeInstance.deployExternalTokenERC20(
            extToken, "solana token", "SOL", 18
        );
        BridgeTypes.FullReceipt memory receipt = BridgeTypes.FullReceipt({
            from: bytes32("SOLANA_SENDER"),
            to: bytes32(uint256(uint160(deadBeef))), // deadBeef
            tokenAddressFrom: bytes32("SOLANA_TOKEN"),
            tokenAddressTo: bytes32(uint256(uint160(token))),
            amountFrom: amount,
            amountTo: amount,
            chainFrom: uint256(bytes32("SOLANA")),
            chainTo: block.chainid,
            eventId: 555,
            flags: 0,
            data: new bytes(0)
        });
        bytes memory signature = signReceipt(receipt.asMini());
        vm.expectRevert(
            abi.encodeWithSelector(
                ITokenManager.TokenIsPaused.selector,
                bytes32(uint256(uint160(token)))
            )
        );
        bridgeInstance.claim(receipt, signature);
    }

    function test_claim_wrapped(
        uint256 amount
    ) public {
        deal(address(wrappedToken), address(bridgeInstance), amount);
        ITokenManager.ExternalTokenUnmapped memory extToken = ITokenManager
            .ExternalTokenUnmapped({
            externalTokenAddress: bytes32("SOLANA_TOKEN"),
            decimals: permittableToken.decimals()
        });
        bridgeInstance.addToken(address(wrappedToken), extToken, false);
        BridgeTypes.FullReceipt memory receipt = BridgeTypes.FullReceipt({
            from: bytes32("SOLANA_SENDER"),
            to: bytes32(uint256(uint160(deadBeef))), // deadBeef
            tokenAddressFrom: bytes32("SOLANA_WRAPPED"),
            tokenAddressTo: bytes32(uint256(uint160(address(wrappedToken)))),
            amountFrom: amount,
            amountTo: amount,
            chainFrom: uint256(bytes32("SOLANA")),
            chainTo: block.chainid,
            eventId: 555,
            flags: 0,
            data: new bytes(0)
        });
        bytes memory signature = signReceipt(receipt.asMini());
        vm.expectEmit(address(bridgeInstance));
        emit IBridge.TokenUnlocked(receipt.asMini());
        bridgeInstance.claim(receipt, signature);
        assertEq(wrappedToken.balanceOf(deadBeef), amount);
        assertTrue(bridgeInstance.isClaimed(receipt));
        assertTrue(bridgeInstance.isClaimed(receipt.asMini()));
        assertTrue(bridgeInstance.isClaimed(receipt.toHash()));
    }

    function test_claim_wrapped_with_unwrap(
        uint256 amount
    ) public {
        vm.deal(address(bridgeInstance), amount);
        vm.startPrank(address(bridgeInstance));
        wrappedToken.deposit{value: amount}();
        vm.stopPrank();
        ITokenManager.ExternalTokenUnmapped memory extToken = ITokenManager
            .ExternalTokenUnmapped({
            externalTokenAddress: bytes32("SOLANA_TOKEN"),
            decimals: permittableToken.decimals()
        });

        bridgeInstance.addToken(address(wrappedToken), extToken, false);
        uint256 beefBalanceB = deadBeef.balance;
        BridgeTypes.FullReceipt memory receipt = BridgeTypes.FullReceipt({
            from: bytes32("SOLANA_SENDER"),
            to: bytes32(uint256(uint160(deadBeef))), // deadBeef
            tokenAddressFrom: bytes32("SOLANA_WRAPPED"),
            tokenAddressTo: bytes32(uint256(uint160(address(wrappedToken)))),
            amountFrom: amount,
            amountTo: amount,
            chainFrom: uint256(bytes32("SOLANA")),
            chainTo: block.chainid,
            eventId: 555,
            flags: BridgeFlags.SHOULD_UNWRAP,
            data: new bytes(0)
        });
        bytes memory signature = signReceipt(receipt.asMini());
        vm.expectEmit(address(bridgeInstance));
        emit IBridge.TokenUnlocked(receipt.asMini());
        bridgeInstance.claim(receipt, signature);
        assertEq(deadBeef.balance, beefBalanceB + amount);
        assertTrue(bridgeInstance.isClaimed(receipt));
        assertTrue(bridgeInstance.isClaimed(receipt.asMini()));
        assertTrue(bridgeInstance.isClaimed(receipt.toHash()));
    }

    function test_revertWhen_claim_wrapped_with_unwrap_BadReceiver(
        uint256 amount
    ) public {
        vm.deal(address(bridgeInstance), amount);
        vm.startPrank(address(bridgeInstance));
        wrappedToken.deposit{value: amount}();
        vm.stopPrank();
        ITokenManager.ExternalTokenUnmapped memory extToken = ITokenManager
            .ExternalTokenUnmapped({
            externalTokenAddress: bytes32("SOLANA_TOKEN"),
            decimals: permittableToken.decimals()
        });
        bridgeInstance.addToken(address(wrappedToken), extToken, false);
        BridgeTypes.FullReceipt memory receipt = BridgeTypes.FullReceipt({
            from: bytes32("SOLANA_SENDER"),
            to: bytes32(uint256(uint160(address(badReceiver)))), // deadBeef
            tokenAddressFrom: bytes32("SOLANA_WRAPPED"),
            tokenAddressTo: bytes32(uint256(uint160(address(wrappedToken)))),
            amountFrom: amount,
            amountTo: amount,
            chainFrom: uint256(bytes32("SOLANA")),
            chainTo: block.chainid,
            eventId: 555,
            flags: BridgeFlags.SHOULD_UNWRAP,
            data: new bytes(0)
        });
        bytes memory signature = signReceipt(receipt.asMini());
        vm.expectRevert(IBridge.TransferFailed.selector);
        bridgeInstance.claim(receipt, signature);
    }

    function test_claim_withSendNativeFlag(
        uint256 amount
    ) public {
        vm.deal(address(bridgeInstance), 100 ether);
        ITokenManager.ExternalTokenUnmapped memory extToken = ITokenManager
            .ExternalTokenUnmapped({
            externalTokenAddress: bytes32("SOLANA_TOKEN"),
            decimals: permittableToken.decimals()
        });
        address token = bridgeInstance.deployExternalTokenERC20(
            extToken, "solana token", "SOL", 18
        );
        bridgeInstance.unpauseToken(token);
        uint256 beefBalanceB = deadBeef.balance;
        BridgeTypes.FullReceipt memory receipt = BridgeTypes.FullReceipt({
            from: bytes32("SOLANA_SENDER"),
            to: bytes32(uint256(uint160(address(deadBeef)))), // deadBeef
            tokenAddressFrom: bytes32("SOLANA_TOKEN"),
            tokenAddressTo: bytes32(uint256(uint160(token))),
            amountFrom: amount,
            amountTo: amount,
            chainFrom: uint256(bytes32("SOLANA")),
            chainTo: block.chainid,
            eventId: 555,
            flags: BridgeFlags.SEND_NATIVE_TO_RECEIVER,
            data: new bytes(0)
        });
        bytes memory signature = signReceipt(receipt.asMini());
        vm.expectEmit(address(bridgeInstance));
        emit IBridge.TokenUnlocked(receipt.asMini());
        bridgeInstance.claim(receipt, signature);
        assertEq(ERC20Bridged(token).balanceOf(deadBeef), amount);
        assertEq(
            deadBeef.balance, beefBalanceB + bridgeInstance.nativeSendAmount()
        );
        assertTrue(bridgeInstance.isClaimed(receipt));
        assertTrue(bridgeInstance.isClaimed(receipt.asMini()));
        assertTrue(bridgeInstance.isClaimed(receipt.toHash()));
    }

    function test_revertWhen_claim_withSendNativeFlag_BadReceiver(
        uint256 amount
    ) public {
        vm.deal(address(bridgeInstance), amount);
        ITokenManager.ExternalTokenUnmapped memory extToken = ITokenManager
            .ExternalTokenUnmapped({
            externalTokenAddress: bytes32("SOLANA_TOKEN"),
            decimals: permittableToken.decimals()
        });
        address token = bridgeInstance.deployExternalTokenERC20(
            extToken, "solana token", "SOL", 18
        );
        bridgeInstance.unpauseToken(token);
        BridgeTypes.FullReceipt memory receipt = BridgeTypes.FullReceipt({
            from: bytes32("SOLANA_SENDER"),
            to: bytes32(uint256(uint160(address(badReceiver)))), // deadBeef
            tokenAddressFrom: bytes32("SOLANA_TOKEN"),
            tokenAddressTo: bytes32(uint256(uint160(token))),
            amountFrom: amount,
            amountTo: amount,
            chainFrom: uint256(bytes32("SOLANA")),
            chainTo: block.chainid,
            eventId: 555,
            flags: BridgeFlags.SEND_NATIVE_TO_RECEIVER,
            data: new bytes(0)
        });
        bytes memory signature = signReceipt(receipt.asMini());
        vm.expectRevert(IBridge.SendFailed.selector);
        bridgeInstance.claim(receipt, signature);
    }

}
