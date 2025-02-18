// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {IValidation} from "./interface/IValidation.sol";
import {SafeCast} from "@openzeppelin/contracts/utils/math/SafeCast.sol";

import {BridgeUpgradeable} from "./upgradeable/BridgeUpgradeable.sol";

contract BridgeSolana is BridgeUpgradeable {

    using SafeCast for uint256;
    /// Initialize the contract with the given parameters
    /// @param authority_ address of the authority contract [AccessManager](https://docs.openzeppelin.com/contracts/5.x/access-control#access-management)
    /// @param SAMB_ address of the Wrapped token contract
    /// @param validator_ address of the validator contract
    /// @param feeReceiver_ address of the fee receiver
    /// @param nativeSendAmount_ amount of native currency to send to the receiver in destination chain (here) if needed

    function initialize(
        address authority_,
        address tokenBeacon_,
        address SAMB_,
        IValidation validator_,
        address payable feeReceiver_,
        uint256 nativeSendAmount_
    ) public initializer {
        __Bridge_init(
            authority_,
            tokenBeacon_,
            SAMB_,
            validator_,
            feeReceiver_,
            nativeSendAmount_
        );
    }

    /// @inheritdoc BridgeUpgradeable
    /// @dev For Solana, the receipt is generated adding the nonce of the recipient address to the data field as a uint64
    function generateReceipt(
        address sender,
        bytes32 recipient,
        uint256 amountTo,
        SendPayload calldata payload,
        ExternalToken memory externalToken_
    ) internal override returns (FullReceipt memory) {
        FullReceipt memory _receipt = FullReceipt({
            from: bytes32(uint256(uint160(sender))),
            to: recipient,
            tokenAddressFrom: payload.tokenAddress,
            tokenAddressTo: externalToken_.externalTokenAddress,
            amountFrom: payload.amountToSend,
            amountTo: amountTo,
            chainFrom: block.chainid,
            chainTo: payload.destChainId,
            eventId: _useNonce(address(this)),
            flags: payload.flags >> 65, // remove sender flags
            data: abi.encodePacked(_useNonce(recipient).toUint64())
        });
        return _receipt;
    }

}
