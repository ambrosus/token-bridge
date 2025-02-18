// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import "forge-std/Test.sol";

import {
    UnsafeUpgrades,
    Upgrades
} from "openzeppelin-foundry-upgrades/Upgrades.sol";

import {Initializable} from
    "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import {AccessManager} from
    "@openzeppelin/contracts/access/manager/AccessManager.sol";
import {IAccessManaged} from
    "@openzeppelin/contracts/access/manager/IAccessManaged.sol";

import {ECDSA} from "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import {EnumerableSet} from
    "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";

import {BridgeTypes} from "../contracts/interface/BridgeTypes.sol";
import {IValidation} from "../contracts/interface/IValidation.sol";
import {IValidatorV1} from "../contracts/interface/IValidatorV1.sol";
import {IWrapped} from "../contracts/interface/IWrapped.sol";

import {PayloadUtils} from "../contracts/utils/PayloadUtils.sol";
import {ReceiptUtils} from "../contracts/utils/ReceiptUtils.sol";

import {Validator} from "../contracts/Validator.sol";

import {sAMB} from "./mocks/sAMB.sol";

contract ValidatorTest is Test {

    using EnumerableSet for EnumerableSet.AddressSet;
    using ReceiptUtils for BridgeTypes.FullReceipt;
    using ReceiptUtils for BridgeTypes.MiniReceipt;
    using PayloadUtils for BridgeTypes.SendPayload;

    bytes32 private constant coverageProfile =
        keccak256(abi.encodePacked("coverage"));

    function isCoverage() internal view returns (bool) {
        return keccak256(
            abi.encodePacked(vm.envOr("FOUNDRY_PROFILE", string("default")))
        ) == coverageProfile;
    }

    struct Signer {
        address Address;
        uint256 PK;
    }

    AccessManager private authority;
    Validator private validatorInstance;
    IWrapped private wrappedToken;

    address alice = address(0xA11ce);
    address bob = address(0xB0b);
    address chris = address(0xC14);
    address deadBeef = address(0xDeadBeef);
    address payable fee = payable(address(0xFee));
    address fakeToken = address(0xF4143);

    Signer[] signers;
    Signer payloadSigner;
    EnumerableSet.AddressSet validatorSet;

    BridgeTypes.SendPayload payloadCommon;

    BridgeTypes.FullReceipt receiptCommon;
    BridgeTypes.MiniReceipt miniReceiptCommon;

    function setUpWrappedToken() public virtual returns (IWrapped) {
        address wrappedTokenAddress = address(new sAMB("Wrapped Amber", "sAMB"));
        wrappedToken = IWrapped(wrappedTokenAddress);
        return wrappedToken;
    }

    function setUpValidator(
        address authorityAddress,
        address[] memory validators,
        address pldSigner,
        uint256 feeValidityWindow
    ) public virtual returns (Validator) {
        address proxy;
        vm.expectEmit();
        emit IValidation.PayloadSignerChanged(address(this), pldSigner);
        vm.expectEmit();
        emit IValidation.FeeValidityWindowChanged(
            address(this), feeValidityWindow
        );
        for (uint256 i = 0; i < validators.length; i++) {
            vm.expectEmit();
            emit IValidatorV1.ValidatorAdded(validators[i]);
        }
        if (isCoverage()) {
            address validator = address(new Validator());
            proxy = address(
                UnsafeUpgrades.deployUUPSProxy(
                    validator,
                    abi.encodeCall(
                        Validator.initialize,
                        (
                            authorityAddress,
                            validators,
                            pldSigner,
                            feeValidityWindow
                        )
                    )
                )
            );
        } else {
            proxy = address(
                Upgrades.deployUUPSProxy(
                    "Validator.sol",
                    abi.encodeCall(
                        Validator.initialize,
                        (
                            authorityAddress,
                            validators,
                            pldSigner,
                            feeValidityWindow
                        )
                    )
                )
            );
        }
        validatorInstance = Validator(proxy);
        return validatorInstance;
    }

    function beforeTestSetup(
        bytes4 testSelector
    ) public pure returns (bytes[] memory beforeTestCalldata) {
        if (
            testSelector == this.test_validate.selector
                || testSelector
                    == this.test_revertWhen_validate_InvalidSignatureLength.selector
                || testSelector
                    == this.test_revertWhen_validate_EmptyValidatorSet.selector
                || testSelector
                    == this.test_revertWhen_validatePayload_EmptyValidatorSet.selector
        ) {
            beforeTestCalldata = new bytes[](1);
            beforeTestCalldata[0] =
                abi.encode(this.clearPredefinedValidators.selector);
        } else if (
            testSelector
                == this.test_revertWhen_validate_NoPayloadSigner.selector
                || testSelector
                    == this.test_revertWhen_validatePayload_NoPayloadSigner.selector
        ) {
            beforeTestCalldata = new bytes[](1);
            beforeTestCalldata[0] = abi.encode(this.clearPayloadSigner.selector);
        } else if (
            testSelector
                == this.test_revertWhen_validatePayload_ZeroValidityWindow.selector
                || testSelector
                    == this.test_revertWhen_validate_ZeroValidityWindow.selector
        ) {
            beforeTestCalldata = new bytes[](1);
            beforeTestCalldata[0] =
                abi.encode(this.setUpZeroFeeValidityWindow.selector);
        }
    }

    function clearPredefinedValidators() public {
        while (validatorSet.length() > 0) {
            validatorInstance.removeValidator(validatorSet.at(0));
            validatorSet.remove(validatorSet.at(0));
        }
    }

    function clearPayloadSigner() public {
        validatorInstance.setPayloadSigner(address(0));
    }

    function setUpZeroFeeValidityWindow() public {
        validatorInstance = setUpValidator(
            address(authority), validatorSet.values(), payloadSigner.Address, 0
        );
    }

    function setUp() public {
        authority = new AccessManager(address(this));

        (address psigner, uint256 psignerPk) = makeAddrAndKey("paylodSigner");
        payloadSigner = Signer(psigner, psignerPk);

        string[] memory signersKeys = new string[](5);
        signersKeys[0] = "alice";
        signersKeys[1] = "bob";
        signersKeys[2] = "chris";
        signersKeys[3] = "dave";
        signersKeys[4] = "fred";

        for (uint256 i = 0; i < signersKeys.length; i++) {
            (address signer, uint256 signerPk) = makeAddrAndKey(signersKeys[i]);
            signers.push(Signer(signer, signerPk));
        }

        validatorSet.add(alice);

        setUpWrappedToken();
        setUpValidator(
            address(authority),
            validatorSet.values(),
            payloadSigner.Address,
            100
        );

        payloadCommon = BridgeTypes.SendPayload({
            destChainId: uint256(bytes32("SOLANA")),
            tokenAddress: bytes32(uint256(uint160(fakeToken))),
            externalTokenAddress: bytes32("SOLANA_TOKEN"),
            amountToSend: 100 ether,
            feeAmount: 1 ether,
            timestamp: block.timestamp,
            flags: 0,
            flagData: bytes("SOME_USEFUL_DATA")
        });

        receiptCommon = BridgeTypes.FullReceipt({
            from: bytes32("GOOD_SENDER"),
            to: bytes32("GOOD_RECEIVER"),
            tokenAddressFrom: bytes32("SOLANA"),
            tokenAddressTo: bytes32(uint256(uint160(address(wrappedToken)))),
            amountFrom: 100 ether,
            amountTo: 100 ether,
            chainFrom: 1,
            chainTo: 2,
            eventId: 1,
            flags: 0,
            data: bytes("SOME_USEFUL_DATA")
        });
    }

    function test_addValidator() public {
        address newValidator = address(0xD0D0);
        vm.expectEmit(address(validatorInstance));
        emit IValidatorV1.ValidatorAdded(newValidator);
        assertTrue(validatorInstance.addValidator(newValidator));
        assertTrue(validatorInstance.isValidator(newValidator));
    }

    function test_addValidator_alreadyValidator() public {
        address newValidator = address(0xD0D0);
        assertTrue(validatorInstance.addValidator(newValidator));
        assertTrue(validatorInstance.isValidator(newValidator));
        assertFalse(validatorInstance.addValidator(newValidator));
        assertTrue(validatorInstance.isValidator(newValidator));
    }

    function test_fuzz_addValidator(
        address newValidator
    ) public {
        vm.assume(newValidator != address(0) && newValidator != alice);
        vm.expectEmit(address(validatorInstance));
        emit IValidatorV1.ValidatorAdded(newValidator);
        assertTrue(validatorInstance.addValidator(newValidator));
        assertTrue(validatorInstance.isValidator(newValidator));
    }

    function test_revertIf_addValidator_zero_address() public {
        address newValidator = address(0xD0D0);
        assertTrue(validatorInstance.addValidator(newValidator));
        assertFalse(validatorInstance.addValidator(address(0)));
    }

    function test_revertIf_addValidator_not_authority() public {
        vm.startPrank(bob);
        vm.expectRevert(
            abi.encodeWithSelector(
                IAccessManaged.AccessManagedUnauthorized.selector, bob
            )
        );
        address newValidator = address(0xD0D0);
        validatorInstance.addValidator(newValidator);
        vm.stopPrank();
    }

    function test_removeValidator() public {
        vm.expectEmit(address(validatorInstance));
        emit IValidatorV1.ValidatorRemoved(alice);
        assertTrue(validatorInstance.removeValidator(alice));
        assertFalse(validatorInstance.isValidator(alice));
    }

    function test_removeValidator_notValidator() public {
        assertFalse(validatorInstance.isValidator(deadBeef));
        assertFalse(validatorInstance.removeValidator(deadBeef));
        assertFalse(validatorInstance.isValidator(deadBeef));
    }

    function test_revertIf_removeValidator_not_authority() public {
        vm.startPrank(bob);
        vm.expectRevert(
            abi.encodeWithSelector(
                IAccessManaged.AccessManagedUnauthorized.selector, bob
            )
        );
        validatorInstance.removeValidator(alice);
        vm.stopPrank();
    }

    function test_isValidator() public view {
        assertTrue(validatorInstance.isValidator(alice));
        assertFalse(validatorInstance.isValidator(deadBeef));
    }

    function test_setPayloadSigner() public {
        vm.expectEmit(address(validatorInstance));
        emit IValidation.PayloadSignerChanged(address(this), alice);
        validatorInstance.setPayloadSigner(alice);
        assertEq(validatorInstance.payloadSigner(), alice);
    }

    function test_revertIf_setPayloadSigner_not_authority() public {
        vm.startPrank(bob);
        vm.expectRevert(
            abi.encodeWithSelector(
                IAccessManaged.AccessManagedUnauthorized.selector, bob
            )
        );
        validatorInstance.setPayloadSigner(alice);
        vm.stopPrank();
    }

    function test_setFeeValidityWindow() public {
        vm.expectEmit(address(validatorInstance));
        emit IValidation.FeeValidityWindowChanged(address(this), 300);
        validatorInstance.setFeeValidityWindow(300);
        assertEq(validatorInstance.feeValidityWindow(), 300);
    }

    function test_revertIf_setFeeValidityWindow_not_authority() public {
        vm.startPrank(bob);
        vm.expectRevert(
            abi.encodeWithSelector(
                IAccessManaged.AccessManagedUnauthorized.selector, bob
            )
        );
        validatorInstance.setFeeValidityWindow(100);
        vm.stopPrank();
    }

    function test_revertIf_setFeeValidityWindow_set_to_zero() public {
        vm.expectRevert("Fee validity window must be greater than 0");
        validatorInstance.setFeeValidityWindow(0);
    }

    function signPayload(
        BridgeTypes.SendPayload memory payload,
        Signer memory signer
    ) internal pure returns (bytes memory signature) {
        bytes32 digest = payload.toHash();
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(signer.PK, digest);
        signature = abi.encodePacked(r, s, v);
        return signature;
    }

    function test_validatePayload() public view {
        bytes memory signature = signPayload(payloadCommon, payloadSigner);
        assertTrue(
            validatorInstance.validatePayload(payloadCommon, signature),
            "Payload validation failed"
        );
    }

    function test_revertIf_validatePayload_InvalidSignature() public {
        (address signer, uint256 signerPk) = makeAddrAndKey("signer");
        bytes memory signature =
            signPayload(payloadCommon, Signer(signer, signerPk));
        // Unpack back values from signature (but in correct order)
        uint8 v;
        bytes32 r;
        bytes32 s;
        assembly ("memory-safe") {
            r := mload(add(signature, 0x20))
            s := mload(add(signature, 0x40))
            v := byte(0, mload(add(signature, 0x60)))
        }
        signature = abi.encodePacked(v, r, s);
        assembly ("memory-safe") {
            r := mload(add(signature, 0x20))
            s := mload(add(signature, 0x40))
            v := byte(0, mload(add(signature, 0x60)))
        }
        vm.expectRevert(
            abi.encodeWithSelector(ECDSA.ECDSAInvalidSignatureS.selector, s)
        );
        validatorInstance.validatePayload(payloadCommon, signature);
    }

    function test_revertWhen_validatePayload_UnknownSigner() public {
        (address signer, uint256 signerPk) = makeAddrAndKey("signer");
        bytes memory signature =
            signPayload(payloadCommon, Signer(signer, signerPk));
        vm.expectRevert(
            abi.encodeWithSelector(IValidation.UnknownSigner.selector, signer)
        );
        validatorInstance.validatePayload(payloadCommon, signature);
    }

    function test_revertWhen_validatePayload_NoPayloadSigner() public {
        bytes memory signature = signPayload(payloadCommon, payloadSigner); // note the order here is different from line above.
        vm.expectRevert(IValidatorV1.NoPayloadSigner.selector);
        vm.startPrank(alice);
        validatorInstance.validatePayload(payloadCommon, signature);
        vm.stopPrank();
    }

    function test_revertWhen_validatePayload_EmptyValidatorSet() public {
        bytes memory signature = signPayload(payloadCommon, payloadSigner);
        vm.startPrank(alice);
        vm.expectRevert(IValidatorV1.NoValidators.selector);
        validatorInstance.validatePayload(payloadCommon, signature);
        vm.stopPrank();
    }

    function test_revertWhen_validatePayload_ZeroValidityWindow() public {
        bytes memory signature = signPayload(payloadCommon, payloadSigner);
        vm.startPrank(alice);
        vm.expectRevert(IValidatorV1.NoFeeValidityWindow.selector);
        validatorInstance.validatePayload(payloadCommon, signature);
        vm.stopPrank();
    }

    function signReceipt(
        BridgeTypes.MiniReceipt memory receipt
    ) internal returns (bytes memory signature) {
        bytes32 digest = receipt.toHash();
        for (uint256 i = 0; i < signers.length; i++) {
            validatorInstance.addValidator(signers[i].Address);
            (uint8 v, bytes32 r, bytes32 s) = vm.sign(signers[i].PK, digest);
            bytes memory signerSignature = abi.encodePacked(r, s, v); // note the order here is different from line above.
            signature = bytes.concat(signature, signerSignature);
        }
        return signature;
    }

    function test_validate() public {
        bytes memory signature = signReceipt(receiptCommon.asMini());
        assertTrue(
            validatorInstance.validate(receiptCommon, signature),
            "Receipt validation failed"
        );
    }

    function test_revertWhen_validate_UnknownSigner() public {
        bytes memory signature;
        address unknownSignerAddress;
        bytes32 digest = receiptCommon.toHash();
        for (uint256 i = 0; i < signers.length; i++) {
            if (i != 0) {
                // We don't add the first signer to the validator set
                // to simulate an unknown signer
                // P.S. another alice is already in the validator set
                validatorInstance.addValidator(signers[i].Address);
            } else {
                unknownSignerAddress = signers[i].Address;
            }

            (uint8 v, bytes32 r, bytes32 s) = vm.sign(signers[i].PK, digest);
            bytes memory signerSignature = abi.encodePacked(r, s, v); // note the order here is different from line above.
            signature = bytes.concat(signature, signerSignature);
        }

        vm.expectRevert(
            abi.encodeWithSelector(
                IValidation.UnknownSigner.selector, unknownSignerAddress
            )
        );
        validatorInstance.validate(receiptCommon, signature);
    }

    function test_revertWhen_validate_SignatureCountMismatch() public {
        bytes memory signature = signReceipt(receiptCommon.asMini());
        // Another alice in the validator set, so the signature count is different
        vm.expectRevert(
            abi.encodeWithSelector(
                IValidatorV1.SignatureCountMismatch.selector,
                signers.length,
                signers.length + 1
            )
        );
        validatorInstance.validate(receiptCommon, signature);
    }

    function test_revertWhen_validate_InvalidSignatureLength() public {
        bytes memory signature = signReceipt(receiptCommon.asMini());
        // Change the signature length to simulate an invalid signature
        signature = bytes.concat(signature, bytes("GARBAGE"));
        vm.expectRevert(
            abi.encodeWithSelector(
                IValidatorV1.InvalidSignatureLength.selector, signature.length
            )
        );
        validatorInstance.validate(receiptCommon, signature);
    }

    function test_revertWhen_validate_EmptyValidatorSet() public {
        bytes memory signature;
        BridgeTypes.FullReceipt memory receipt = BridgeTypes.FullReceipt({
            from: bytes32("GOOD_SENDER"),
            to: bytes32("GOOD_RECEIVER"),
            tokenAddressFrom: bytes32("SOLANA"),
            tokenAddressTo: bytes32(uint256(uint160(address(wrappedToken)))),
            amountFrom: 100 ether,
            amountTo: 100 ether,
            chainFrom: 1,
            chainTo: 2,
            eventId: 1,
            flags: 0,
            data: bytes("SOME_USEFUL_DATA")
        });

        bytes32 digest = receipt.toHash();
        for (uint256 i = 0; i < signers.length; i++) {
            (uint8 v, bytes32 r, bytes32 s) = vm.sign(signers[i].PK, digest);
            bytes memory signerSignature = abi.encodePacked(r, s, v); // note the order here is different from line above.
            signature = bytes.concat(signature, signerSignature);
        }
        vm.expectRevert(IValidatorV1.NoValidators.selector);
        validatorInstance.validate(receipt, signature);
    }

    function test_revertWhen_validate_NoPayloadSigner() public {
        bytes memory signature = signReceipt(receiptCommon.asMini());
        vm.expectRevert(IValidatorV1.NoPayloadSigner.selector);
        validatorInstance.validate(receiptCommon, signature);
    }

    function test_revertWhen_validate_ZeroValidityWindow() public {
        bytes memory signature = signReceipt(receiptCommon.asMini());
        vm.expectRevert(IValidatorV1.NoFeeValidityWindow.selector);
        validatorInstance.validate(receiptCommon, signature);
    }

}
