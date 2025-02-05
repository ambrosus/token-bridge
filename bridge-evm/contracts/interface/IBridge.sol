// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;
pragma abicoder v2;

import {IBridgeTypes} from "./IBridgeTypes.sol";
import {IValidation} from "./IValidation.sol";

interface IBridge is IBridgeTypes {

    /// Reverts if passed permit signature without permit flag
    error InvalidPermitFlag();
    /// Reverts if receipt is already claimed
    /// @param hash hash of the receipt
    error Claimed(bytes32 hash);
    /// Reverts when the chain ID is invalid
    error InvalidChain();
    /// Reverts failed transfer of tokens
    error TransferFailed();
    /// Reverts failed send of native currency
    error SendFailed();
    /// Reverts when the value sent is invalid
    /// @param value sent value
    /// @param expectedValue expected value
    error InvalidValueSent(uint256 value, uint256 expectedValue);
    /// Reverts when the amount is invalid (e.g. zero)
    error InvalidAmount();

    /// Emits when tokens are locked in the contract
    event TokenLocked(Receipt receipt);

    /// Emits when tokens are claimed from the contract
    event TokenUnlocked(Receipt receipt);

    /// Emits when the fee receiver is changed
    /// @param changer Who changed the fee receiver
    /// @param newFeeReceiver New fee receiver address
    event FeeReceiverChanged(address indexed changer, address indexed newFeeReceiver);

    /// Emits when the native send amount is changed
    /// @param changer Who changed the native send amount
    /// @param newNativeSendAmount New native send amount
    event NativeSendAmountChanged(address indexed changer, uint256 newNativeSendAmount);

    /// Emits when the validator contract is changed
    /// @param changer Who changed the validator contract
    /// @param newValidator New validator contract address
    event ValidatorChanged(address indexed changer, address indexed newValidator);

    /// Get the last nonce of the chain transactions
    /// @return nonce last nonce that was used
    function nextEventID() external view returns (uint256 nonce);

    /// Send tokens to another chain
    /// @dev This function should be called by the user who wants to send tokens to another chain.
    /// It transfers the tokens to the contract, and validates fee amount that was sent and emits a `TokensLocked` event.
    /// The function should be payable to receive the fee in native currency.
    /// @param recipient address of the recipient on the other chain (string because of cross-chain compatibility)
    /// @param payload payload of sending operation bridge
    /// @param payloadSignature signature of the payload values to validate
    /// @return receipt data of the transaction which will be signed and sent to the other chain
    function send(
        bytes32 recipient,
        uint256 chainTo,
        SendPayload calldata payload,
        bytes calldata payloadSignature
    )
        external
        payable
        returns (Receipt memory receipt);

    /// Send tokens to another chain with permit params
    /// @dev This function should be called by the user who wants to send tokens to another chain.
    /// It transfers the tokens to the contract, and validates fee amount that was sent and emits a `TokensLocked` event.
    /// The function should be payable to receive the fee in native currency.
    /// @param recipient address of the recipient on the other chain (string because of cross-chain compatibility)
    /// @param payload payload of sending operation bridge
    /// @param payloadSignature signature of the payload values to validate
    /// @param _deadline deadline of the permit
    /// @param v v of the permit ECDSA signature
    /// @param r r of the permit ECDSA signature
    /// @param s s of the permit ECDSA signature
    /// @return receipt data of the transaction which will be signed and sent to the other chain
    function send(
        bytes32 recipient,
        uint256 chainTo,
        SendPayload calldata payload,
        bytes calldata payloadSignature,
        uint256 _deadline,
        uint8 v,
        bytes32 r,
        bytes32 s
    )
        external
        payable
        returns (Receipt memory receipt);

    /// Claim tokens from another chain
    /// @dev This function should be called by the user who wants to claim tokens from another chain.
    /// It claims the tokens from the contract, and emits a `TokenUnlocked` event.
    /// @param receipt Receipt of the transaction to claim
    /// @param signature MPC signature of the payload
    /// @return success true if the claim was successful
    function claim(
        Receipt calldata receipt,
        bytes calldata signature
    )
        external
        returns (bool success);

    /// Check if the receipt is already claimed
    /// @param receipt Receipt of the transaction to check
    /// @return claimed true if the receipt is already claimed
    function isClaimed(Receipt calldata receipt)
        external
        view
        returns (bool claimed);

    /// Check if the receipt is already claimed
    /// @param hash hash of the receipt to check
    /// @return claimed true if the receipt is already claimed
    function isClaimed(bytes32 hash) external view returns (bool claimed);

    /// Get the address of the fee receiver
    /// @return feeReceiver address of the fee receiver
    function feeReceiver()
        external
        view
        returns (address payable feeReceiver);

    /// Amount of native currency that should be sent to the receiver in destination chain if needed
    /// @return nativeSendAmount amount of native currency that should be sent
    function nativeSendAmount()
        external
        view
        returns (uint256 nativeSendAmount);

    /// Get the validator contract
    /// @return validator address of the validator contract
    function validator() external view returns (IValidation validator);

    /// Set the address of the fee receiver
    /// @param _feeReceiver address of the fee receiver
    function setFeeReceiver(address payable _feeReceiver) external;

    /// Set the amount of native currency that should be sent to the receiver in destination chain if needed
    /// @param _nativeSendAmount amount of native currency that should be sent
    function setNativeSendAmount(uint256 _nativeSendAmount) external;

    /// Sets the validator contract
    /// @param validator address of the validator contract
    function setValidator(IValidation validator) external;

}
