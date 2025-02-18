// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;
pragma abicoder v2;

import {AccessManagedUpgradeable} from
    "@openzeppelin/contracts-upgradeable/access/manager/AccessManagedUpgradeable.sol";
import {Initializable} from
    "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

import {ECDSA} from "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import {EnumerableSet} from
    "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";

import {IValidation} from "../interface/IValidation.sol";
import {IValidatorV1} from "../interface/IValidatorV1.sol";

import {PayloadUtils} from "../utils/PayloadUtils.sol";
import {ReceiptUtils} from "../utils/ReceiptUtils.sol";

abstract contract ValidatorUpgradeable is
    IValidation,
    IValidatorV1,
    Initializable,
    AccessManagedUpgradeable
{

    using EnumerableSet for EnumerableSet.AddressSet;
    using ECDSA for bytes32;
    using ReceiptUtils for FullReceipt;
    using ReceiptUtils for MiniReceipt;
    using PayloadUtils for SendPayload;

    struct ValidatorStorage {
        EnumerableSet.AddressSet validators;
        address payloadSigner;
        uint256 feeValidityWindow;
    }

    bytes32 private constant VALIDATOR_STORAGE_POSITION =
        0xf44f62b48f788febe9286c9767b06db2bafdbe32f9720a2466ac3df5942cf200;

    function _getValidatorStorage()
        private
        pure
        returns (ValidatorStorage storage $)
    {
        assembly {
            $.slot := VALIDATOR_STORAGE_POSITION
        }
    }

    function __Validator_init(
        address authority_,
        address[] calldata validators_,
        address payloadSigner_,
        uint256 feeValidityWindow_
    ) internal onlyInitializing {
        __Validator_init_unchained(
            authority_, validators_, payloadSigner_, feeValidityWindow_
        );
    }

    function __Validator_init_unchained(
        address authority_,
        address[] calldata validators_,
        address payloadSigner_,
        uint256 feeValidityWindow_
    ) internal onlyInitializing {
        // Dont know why it should be called here, according to docs it should be called in __Validator_init ...
        __AccessManaged_init(authority_);

        ValidatorStorage storage $ = _getValidatorStorage();
        $.payloadSigner = payloadSigner_;
        $.feeValidityWindow = feeValidityWindow_;
        emit PayloadSignerChanged(msg.sender, payloadSigner_);
        emit FeeValidityWindowChanged(msg.sender, feeValidityWindow_);
        for (uint256 i = 0; i < validators_.length; i++) {
            bool added = $.validators.add(validators_[i]);
            if (added) {
                emit ValidatorAdded(validators_[i]);
            }
        }
    }

    modifier readyToValidate() {
        ValidatorStorage storage $ = _getValidatorStorage();
        if ($.validators.length() == 0) {
            revert NoValidators();
        }
        if ($.payloadSigner == address(0)) {
            revert NoPayloadSigner();
        }
        if ($.feeValidityWindow == 0) {
            revert NoFeeValidityWindow();
        }
        _;
    }

    /// @inheritdoc IValidatorV1
    function isValidator(
        address validator_
    ) public view override returns (bool isValidator_) {
        ValidatorStorage storage $ = _getValidatorStorage();
        return $.validators.contains(validator_);
    }

    /// @inheritdoc IValidatorV1
    function addValidator(
        address validator_
    ) public override restricted returns (bool added) {
        if (validator_ == address(0)) {
            return false;
        }
        ValidatorStorage storage $ = _getValidatorStorage();
        added = $.validators.add(validator_);
        if (added) {
            emit ValidatorAdded(validator_);
        }
        return added;
    }

    /// @inheritdoc IValidatorV1
    function removeValidator(
        address validator_
    ) public override restricted returns (bool removed) {
        ValidatorStorage storage $ = _getValidatorStorage();
        removed = $.validators.remove(validator_);
        if (removed) {
            emit ValidatorRemoved(validator_);
        }
        return removed;
    }

    /// @inheritdoc IValidation
    function setPayloadSigner(
        address payloadSigner_
    ) public override restricted returns (bool success) {
        ValidatorStorage storage $ = _getValidatorStorage();
        $.payloadSigner = payloadSigner_;
        emit PayloadSignerChanged(msg.sender, payloadSigner_);
        return true;
    }

    /// @inheritdoc IValidation
    function setFeeValidityWindow(
        uint256 feeValidityWindow_
    ) public override restricted returns (bool success) {
        require(
            feeValidityWindow_ > 0, "Fee validity window must be greater than 0"
        );
        ValidatorStorage storage $ = _getValidatorStorage();
        $.feeValidityWindow = feeValidityWindow_;
        emit FeeValidityWindowChanged(msg.sender, feeValidityWindow_);
        return true;
    }

    /// @inheritdoc IValidation
    function payloadSigner() public view override returns (address) {
        ValidatorStorage storage $ = _getValidatorStorage();
        return $.payloadSigner;
    }

    /// @inheritdoc IValidation
    function feeValidityWindow() public view override returns (uint256) {
        ValidatorStorage storage $ = _getValidatorStorage();
        return $.feeValidityWindow;
    }

    function _validate(
        MiniReceipt memory receipt,
        bytes memory combinedSignatures
    ) internal view returns (bool isValid) {
        if (combinedSignatures.length % 65 != 0) {
            revert InvalidSignatureLength(combinedSignatures.length);
        }
        uint256 numSignatures = combinedSignatures.length / 65;
        ValidatorStorage storage $ = _getValidatorStorage();
        if (numSignatures != $.validators.length()) {
            revert SignatureCountMismatch(numSignatures, $.validators.length());
        }
        bytes32 hash = receipt.toHash();
        for (uint256 i = 0; i < numSignatures; i++) {
            bytes memory signature = new bytes(65);
            for (uint256 j = 0; j < 65; j++) {
                signature[j] = combinedSignatures[i * 65 + j];
            }
            address signer = hash.recover(signature);
            if (!$.validators.contains(signer)) {
                revert UnknownSigner(signer);
            }
        }
        return true;
    }

    /// @inheritdoc IValidation
    function validate(
        FullReceipt calldata receipt,
        bytes calldata combinedSignatures
    ) public view override readyToValidate returns (bool isValid) {
        return _validate(receipt.asMini(), combinedSignatures);
    }
    /// @inheritdoc IValidation

    function validate(
        MiniReceipt calldata receipt,
        bytes calldata combinedSignatures
    ) public view override readyToValidate returns (bool isValid) {
        return _validate(receipt, combinedSignatures);
    }

    /// @inheritdoc IValidation
    function validatePayload(
        SendPayload calldata payload,
        bytes calldata signature
    ) public view override readyToValidate returns (bool isValid) {
        ValidatorStorage storage $ = _getValidatorStorage();
        bytes32 hash = payload.toHash();
        address signer = hash.recover(signature);
        if (signer != $.payloadSigner) {
            revert UnknownSigner(signer);
        }
        return true;
    }

}
