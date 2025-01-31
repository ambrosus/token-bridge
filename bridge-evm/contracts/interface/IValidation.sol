// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;
pragma abicoder v2;

import {IBridgeTypes} from "./IBridgeTypes.sol";

interface IValidation is IBridgeTypes {

    error UnknownSigner(address signer);

    /// Set the address of the payload signer
    /// @param _payloadSigner address of the payload signer
    /// @return success true if the payload signer was set
    function setPayloadSigner(address _payloadSigner)
        external
        returns (bool success);
    /// Set the fee validity window in seconds
    /// @param _validityWindow seconds of the fee validity window
    /// @return success true if the fee validity window was set
    function setFeeValidityWindow(uint256 _validityWindow)
        external
        returns (bool success);

    /// Get the address of the payload signer
    /// @return payloadSigner address of the payload signer
    function payloadSigner() external view returns (address payloadSigner);

    /// Get the fee validity window in seconds. If the fee is older than this window, it is considered invalid and should be regenerated.
    /// @return validityWindow seconds of the fee validity window
    function feeValidityWindow()
        external
        view
        returns (uint256 validityWindow);

    /// Validate the transaction receipt
    /// @param receipt transaction receipt
    /// @param signature signature of the receipt. Must be signed by all validators
    /// @return isValid true if the receipt is valid
    function validate(
        Receipt memory receipt,
        bytes memory signature
    )
        external
        view
        returns (bool isValid);

    /// Validate the send payload
    /// @param payload send payload
    /// @param signature signature of the payload. Must be signed by the payload signer
    /// @return isValid true if the payload is valid
    function validatePayload(
        SendPayload memory payload,
        bytes memory signature
    )
        external
        view
        returns (bool isValid);

}
