// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {MessageHashUtils} from
    "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";

import {IBridgeTypes} from "../interface/IBridgeTypes.sol";

library ReceiptUtils {

    using MessageHashUtils for bytes32;

    /// Shortcut to convert receipt to hash
    /// @dev using [toEthSignedMessageHash](https://docs.openzeppelin.com/contracts/5.x/api/utils#MessageHashUtils-toEthSignedMessageHash-bytes32-) from OpenZeppelin's MessageHashUtils
    /// @param receipt receipt to convert
    /// @return hash converted
    function toHash(IBridgeTypes.Receipt memory receipt)
        internal
        pure
        returns (bytes32 hash)
    {
        return toEthSignedMessageHash(receipt);
    }

    /// Convert receipt to hash via toEthSignedMessageHash
    /// @dev using [toEthSignedMessageHash](https://docs.openzeppelin.com/contracts/5.x/api/utils#MessageHashUtils-toEthSignedMessageHash-bytes32-) from OpenZeppelin's MessageHashUtils
    /// @param receipt receipt to convert
    /// @return hash converted
    function toEthSignedMessageHash(IBridgeTypes.Receipt memory receipt)
        internal
        pure
        returns (bytes32 hash)
    {
        bytes32 messageHash = keccak256(
            abi.encode(
                receipt.from,
                receipt.to,
                receipt.tokenAddress,
                receipt.amount,
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
