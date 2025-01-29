// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../interface/IBridgeTypes.sol";
import "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";

library PayloadUtils {
    using MessageHashUtils for bytes32;
    function toHash(IBridgeTypes.SendPayload calldata payload) internal pure returns (bytes32) {
    /// Shortcut to convert payload to hash
    /// @dev using [toEthSignedMessageHash](https://docs.openzeppelin.com/contracts/5.x/api/utils#MessageHashUtils-toEthSignedMessageHash-bytes32-) from OpenZeppelin's MessageHashUtils
    /// @param payload payload to convert
    /// @return hash converted

        return toEthSignedMessageHash(payload);
    }
    /// Convert payload to hash via toEthSignedMessageHash
    /// @dev using [toEthSignedMessageHash](https://docs.openzeppelin.com/contracts/5.x/api/utils#MessageHashUtils-toEthSignedMessageHash-bytes32-) from OpenZeppelin's MessageHashUtils
    /// @param payload payload to convert
    /// @return hash converted

    function toEthSignedMessageHash(IBridgeTypes.SendPayload calldata payload) internal pure returns (bytes32) {
        bytes32 messageHash = keccak256(
            abi.encode(
                payload.tokenAddress,
                payload.amountToSend,
                payload.feeAmount,
                payload.timestamp,
                payload.flags,
                payload.data
            )
        );
        return messageHash.toEthSignedMessageHash();
    }
}