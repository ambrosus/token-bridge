// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {MessageHashUtils} from
    "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";

import {BridgeTypes} from "../interface/BridgeTypes.sol";

library ReceiptUtils {

    using MessageHashUtils for bytes32;

    /// Convert full receipt to mini receipt
    /// @param receipt receipt to convert
    /// @return mini receipt converted
    function asMini(
        BridgeTypes.FullReceipt memory receipt
    ) internal pure returns (BridgeTypes.MiniReceipt memory mini) {
        return BridgeTypes.MiniReceipt({
            to: receipt.to,
            tokenAddressTo: receipt.tokenAddressTo,
            amountTo: receipt.amountTo,
            chainFrom: receipt.chainFrom,
            chainTo: receipt.chainTo,
            eventId: receipt.eventId,
            flags: receipt.flags >> 65,
            data: receipt.data
        });
    }

    /// Shortcut to convert receipt to hash
    /// @dev using [toEthSignedMessageHash](https://docs.openzeppelin.com/contracts/5.x/api/utils#MessageHashUtils-toEthSignedMessageHash-bytes32-) from OpenZeppelin's MessageHashUtils
    /// @param receipt receipt to convert
    /// @return hash converted
    function toHash(
        BridgeTypes.FullReceipt memory receipt
    ) internal pure returns (bytes32 hash) {
        return toEthSignedMessageHash(asMini(receipt));
    }

    /// Shortcut to convert receipt to hash
    /// @dev using [toEthSignedMessageHash](https://docs.openzeppelin.com/contracts/5.x/api/utils#MessageHashUtils-toEthSignedMessageHash-bytes32-) from OpenZeppelin's MessageHashUtils
    /// @param receipt receipt to convert
    /// @return hash converted
    function toHash(
        BridgeTypes.MiniReceipt memory receipt
    ) internal pure returns (bytes32 hash) {
        return toEthSignedMessageHash(receipt);
    }

    /// Convert receipt to hash via toEthSignedMessageHash
    /// @dev using [toEthSignedMessageHash](https://docs.openzeppelin.com/contracts/5.x/api/utils#MessageHashUtils-toEthSignedMessageHash-bytes32-) from OpenZeppelin's MessageHashUtils
    /// @param receipt receipt to convert
    /// @return hash converted
    function toEthSignedMessageHash(
        BridgeTypes.MiniReceipt memory receipt
    ) internal pure returns (bytes32 hash) {
        bytes32 messageHash = keccak256(
            abi.encode(
                receipt.to,
                receipt.tokenAddressTo,
                receipt.amountTo,
                receipt.chainFrom,
                receipt.chainTo,
                receipt.eventId,
                receipt.flags,
                receipt.data
            )
        );
        return messageHash.toEthSignedMessageHash();
    }

}
