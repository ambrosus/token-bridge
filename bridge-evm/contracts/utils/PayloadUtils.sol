// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {MessageHashUtils} from
    "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";

import {BridgeTypes} from "../interface/BridgeTypes.sol";

library PayloadUtils {

    using MessageHashUtils for bytes32;
    /// Shortcut to convert payload to hash
    /// @dev using [toEthSignedMessageHash](https://docs.openzeppelin.com/contracts/5.x/api/utils#MessageHashUtils-toEthSignedMessageHash-bytes32-) from OpenZeppelin's MessageHashUtils
    /// @param payload payload to convert
    /// @return hash converted

    function toHash(
        BridgeTypes.SendPayload memory payload
    ) internal pure returns (bytes32 hash) {
        return toEthSignedMessageHash(payload);
    }
    /// Convert payload to hash via toEthSignedMessageHash
    /// @dev using [toEthSignedMessageHash](https://docs.openzeppelin.com/contracts/5.x/api/utils#MessageHashUtils-toEthSignedMessageHash-bytes32-) from OpenZeppelin's MessageHashUtils
    /// @param payload payload to convert
    /// @return hash converted

    function toEthSignedMessageHash(
        BridgeTypes.SendPayload memory payload
    ) internal pure returns (bytes32 hash) {
        bytes32 messageHash = keccak256(
            abi.encode(
                payload.destChainId,
                payload.tokenAddress,
                payload.externalTokenAddress,
                payload.amountToSend,
                payload.feeAmount,
                payload.timestamp,
                payload.flags,
                payload.flagData
            )
        );
        return messageHash.toEthSignedMessageHash();
    }

}
