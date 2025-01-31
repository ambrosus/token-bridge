// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;
pragma abicoder v2;

interface IValidatorV1 {

    /// Reverts if no validators are set
    error NoValidators();

    /// Reverts if the payload signer is not set
    error NoPayloadSigner();

    /// Reverts if the fee validity window is not set
    error NoFeeValidityWindow();

    /// Reverts if the signature length is invalid
    error InvalidSignatureLength(uint256 length);

    /// Reverts if the number of signatures is invalid
    error SignatureCountMismatch(uint256 count, uint256 required);

    /// Add a new validator to the list
    /// @param validator address of the validator
    /// @return added true if the validator was added
    function addValidator(address validator) external returns (bool added);

    /// Remove a validator from the list
    /// @param validator address of the validator
    /// @return removed true if the validator was removed
    function removeValidator(address validator)
        external
        returns (bool removed);

    /// Check if an address is a validator
    /// @param validator address of the validator
    /// @return isValidator true if the address is a validator
    function isValidator(address validator)
        external
        view
        returns (bool isValidator);

}
