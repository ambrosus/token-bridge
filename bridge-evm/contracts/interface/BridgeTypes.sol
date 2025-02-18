// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;
pragma abicoder v2;

/// @dev Flags for the bridge operations
library BridgeFlags {

    // 0-64 bits are reserved for the sender flags
    /// @dev Sender is tx.origin (not msg.sender)
    uint256 constant SENDER_IS_TXORIGIN = 1 << 0;

    /// @dev Should send with permit action
    uint256 constant SEND_WITH_PERMIT = 1 << 1;

    /// @dev Should wrap the tokens before sending
    uint256 constant SHOULD_WRAP = 1 << 2;

    // 65-128 bits are reserved for the receiver flags
    /// @dev Should unwrap the tokens after receiving
    uint256 constant SHOULD_UNWRAP = 1 << 65;

    /// @dev Should send the additional native tokens to the receiver on the other chain in exchange of higher fee amount
    uint256 constant SEND_NATIVE_TO_RECEIVER = 1 << 66;

    /// @dev Should restake the received tokens
    // TODO: unused for now
    uint256 constant SHOULD_RESTAKE = 1 << 67;

}

interface BridgeTypes {

    /// Bridge transaction receipt structure that is used for locking tokens
    /// @param from source address
    /// @param to destination address
    /// @param tokenAddress source token address
    /// @param amount amount of tokens sent
    /// @param chainFrom chain id of the source chain
    /// @param chainTo chain id of the destination chain
    /// @param eventId transaction number
    /// @param flags flags for receiver
    /// @param data additional data of the transaction (eg. user nonce for Solana)
    struct FullReceipt {
        bytes32 from; // source address (bytes32 because of cross-chain compatibility)
        bytes32 to; // destination address (bytes32 because of cross-chain compatibility)
        bytes32 tokenAddressFrom; // source token address (bytes32 because of cross-chain compatibility)
        bytes32 tokenAddressTo; // source token address (bytes32 because of cross-chain compatibility)
        uint256 amountFrom; // amount of tokens sent
        uint256 amountTo; // amount of tokens received
        uint256 chainFrom; // chain id of the source chain
        uint256 chainTo; // chain id of the destination chain
        uint256 eventId; // transaction number
        uint256 flags; // flags for receiver
        bytes data; // additional data of the transaction (eg. user nonce for Solana)
    }
    /// Bridge transaction cropped receipt structure that is used for validation and unlocking tokens
    /// @param to destination address
    /// @param tokenAddressTo dest token address
    /// @param amountTo amount of tokens sent
    /// @param chainFrom chain id of the source chain
    /// @param chainTo chain id of the destination chain
    /// @param eventId transaction number
    /// @param flags flags for receiver
    /// @param data additional data of the transaction (eg. user nonce for Solana)

    struct MiniReceipt {
        bytes32 to; // destination address (bytes32 because of cross-chain compatibility)
        bytes32 tokenAddressTo; // dest token address (bytes32 because of cross-chain compatibility)
        uint256 amountTo; // amount of tokens sent
        uint256 chainFrom; // chain id of the source chain
        uint256 chainTo; // chain id of the destination chain
        uint256 eventId; // transaction number
        uint256 flags; // flags for receiver
        bytes data; // additional data of the transaction (eg. user nonce for Solana)
    }

    /// Fee structure that is used for signing and validation
    /// @param tokenAddress address of the token contract
    /// @param amountToSend amount of the tokens to be sent
    /// @param feeAmount amount of the fee
    /// @param timestamp timestamp of the fee was generated
    /// @param flags flags of the sending operation
    /// @param data additional data of the sending operation
    struct SendPayload {
        uint256 destChainId; // chain id of the destination chain
        bytes32 tokenAddress; // address of the token contract
        bytes32 externalTokenAddress; // address of the external token contract (in destination chain)
        uint256 amountToSend; // amount of the tokens to be sent
        uint256 feeAmount; // amount of the fee
        uint256 timestamp; // timestamp of the fee was generated
        uint256 flags; // flags of the sending operation
        bytes flagData; // additional data of the sending operation (unused for now)
    }

}
