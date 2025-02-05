// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {AccessManagedUpgradeable} from
    "@openzeppelin/contracts-upgradeable/access/manager/AccessManagedUpgradeable.sol";
import {Initializable} from
    "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {IERC20Permit} from
    "@openzeppelin/contracts/token/ERC20/extensions/IERC20Permit.sol";
import {SafeCast} from "@openzeppelin/contracts/utils/math/SafeCast.sol";

import {IBridge} from "../interface/IBridge.sol";
import {BridgeFlags} from "../interface/IBridgeTypes.sol";
import {ITokenManager} from "../interface/ITokenManager.sol";
import {IValidation} from "../interface/IValidation.sol";

import {AddressUtils} from "../utils/AddressUtils.sol";
import {NoncesUpgradeable} from "../utils/NoncesUpgradeable.sol";
import {ReceiptUtils} from "../utils/ReceiptUtils.sol";

import {TokenManagerUpgradeable} from "./TokenManagerUpgradeable.sol";

abstract contract BridgeUpgradeable is
    IBridge,
    Initializable,
    AccessManagedUpgradeable,
    NoncesUpgradeable,
    TokenManagerUpgradeable
{

    using AddressUtils for bytes32;
    using ReceiptUtils for Receipt;
    using SafeCast for uint256;
    /// @custom:storage-location erc7201:airdao.bridge.main.storage

    struct BridgeStorage {
        uint256 nativeSendAmount;
        address payable feeReceiver;
        IValidation validator;
        mapping(bytes32 => bool) claimed;
    }

    // keccak256(abi.encode(uint256(keccak256("airdao.bridge.main.storage")) - 1)) & ~bytes32(uint256(0xff))
    bytes32 private constant BridgeStorageLocation =
        0x2025cb7006a1cd2283e3d168c03ae6ed5331b2b169fbf566938a066036efbf00;

    function _getBridgeStorage()
        private
        pure
        returns (BridgeStorage storage $)
    {
        assembly {
            $.slot := BridgeStorageLocation
        }
    }

    function __Bridge_init(
        address authority_,
        address SAMB_,
        IValidation validator_,
        address payable feeReceiver_,
        uint256 nativeSendAmount_
    )
        internal
        onlyInitializing
    {
        __AccessManaged_init(authority_);
        __Nonces_init();
        __TokenManager_init(address(this), SAMB_);
        __Bridge_init_unchained(validator_, feeReceiver_, nativeSendAmount_);
    }

    function __Bridge_init_unchained(
        IValidation validator_,
        address payable feeReceiver_,
        uint256 nativeSendAmount_
    )
        internal
        onlyInitializing
    {
        BridgeStorage storage $ = _getBridgeStorage();
        $.validator = validator_;
        $.feeReceiver = feeReceiver_;
        $.nativeSendAmount = nativeSendAmount_;
        emit ValidatorChanged(msg.sender, address(validator_));
        emit FeeReceiverChanged(msg.sender, feeReceiver_);
        emit NativeSendAmountChanged(msg.sender, nativeSendAmount_);
    }

    // restricted functions

    /// @inheritdoc IBridge
    function setFeeReceiver(address payable newFeeReceiver)
        public
        override
        restricted
    {
        _getBridgeStorage().feeReceiver = newFeeReceiver;
        emit FeeReceiverChanged(msg.sender, newFeeReceiver);
    }

    /// @inheritdoc IBridge
    function setNativeSendAmount(uint256 amount) public override restricted {
        _getBridgeStorage().nativeSendAmount = amount;
        emit NativeSendAmountChanged(msg.sender, amount);
    }

    /// @inheritdoc IBridge
    function setValidator(IValidation newValidator)
        public
        override
        restricted
    {
        _getBridgeStorage().validator = newValidator;
        emit ValidatorChanged(msg.sender, address(newValidator));
    }

    /// @inheritdoc ITokenManager
    function addToken(
        address token,
        bytes32 externalTokenAddress
    )
        external
        virtual
        restricted
        returns (bool success)
    {
        return addToken(token, externalTokenAddress, true);
    }

    /// @inheritdoc ITokenManager
    function mapExternalToken(
        bytes32 externalTokenAddress,
        address token
    )
        public
        override
        restricted
        returns (bool success)
    {
        return super.mapExternalToken(externalTokenAddress, token);
    }

    /// @inheritdoc ITokenManager
    function unmapExternalToken(bytes32 externalTokenAddress)
        public
        override
        restricted
        returns (bool success)
    {
        return super.unmapExternalToken(externalTokenAddress);
    }

    /// @inheritdoc ITokenManager
    function addToken(
        address token,
        bytes32 externalTokenAddress,
        bool paused
    )
        public
        override
        restricted
        returns (bool success)
    {
        return super.addToken(token, externalTokenAddress, paused);
    }

    /// @inheritdoc ITokenManager
    function pauseToken(address token)
        public
        override
        restricted
        returns (bool success)
    {
        return super.pauseToken(token);
    }

    /// @inheritdoc ITokenManager
    function unpauseToken(address token)
        public
        override
        restricted
        returns (bool success)
    {
        return super.unpauseToken(token);
    }

    /// @inheritdoc ITokenManager
    function removeToken(
        address token,
        bytes32 externalTokenAddress
    )
        public
        override
        restricted
        returns (bool success)
    {
        return super.removeToken(token, externalTokenAddress);
    }

    /// @inheritdoc ITokenManager
    function deployExternalTokenERC20(
        bytes32 externalTokenAddress,
        string calldata name,
        string calldata symbol,
        uint8 decimals
    )
        public
        override
        restricted
        returns (address token)
    {
        return super.deployExternalTokenERC20(
            externalTokenAddress, name, symbol, decimals
        );
    }

    // view functions

    /// @inheritdoc IBridge
    function feeReceiver()
        public
        view
        override
        returns (address payable feeReceiver_)
    {
        return _getBridgeStorage().feeReceiver;
    }

    /// @inheritdoc IBridge
    function nativeSendAmount()
        public
        view
        override
        returns (uint256 nativeSendAmount_)
    {
        return _getBridgeStorage().nativeSendAmount;
    }

    /// Fee validity window from the validator
    /// @return validityWindow fee validity window
    function feeValidityWindow() public view returns (uint256 validityWindow) {
        return validator().feeValidityWindow();
    }

    /// @inheritdoc IBridge
    function validator() public view returns (IValidation) {
        return _getBridgeStorage().validator;
    }

    /// @inheritdoc IBridge
    function nextEventID() external view override returns (uint256 nonce) {
        return nonces(address(this));
    }

    /// @inheritdoc IBridge
    function isClaimed(Receipt calldata receipt)
        public
        view
        override
        returns (bool claimed)
    {
        return _getBridgeStorage().claimed[receipt.toHash()];
    }

    /// @inheritdoc IBridge
    function isClaimed(bytes32 receiptHash)
        public
        view
        override
        returns (bool claimed)
    {
        return _getBridgeStorage().claimed[receiptHash];
    }

    // internal functions

    //  -- guards

    /// Guard for validate the send values
    /// @param chainTo destination chain id
    /// @param payload send payload
    /// @param payloadSignature signature of the payload
    function _validateSendValues(
        uint256 chainTo,
        SendPayload calldata payload,
        bytes calldata payloadSignature
    )
        private
        view
    {
        validator().validatePayload(payload, payloadSignature);
        if (payload.amountToSend == 0) {
            revert InvalidAmount();
        }
        if (chainTo == block.chainid) {
            revert InvalidChain();
        }
        if (pausedTokens(payload.tokenAddress.toAddress())) {
            revert TokenIsPaused(payload.tokenAddress.toAddress());
        }
    }

    /// Validate the claim values
    /// @param receipt receipt data
    /// @param signature signature of the receipt
    function _validateClaim(
        Receipt calldata receipt,
        bytes calldata signature
    )
        private
        view
    {
        validator().validate(receipt, signature);
        if (isClaimed(receipt)) {
            revert Claimed(receipt.toHash());
        }
        if (receipt.chainTo != block.chainid) {
            revert InvalidChain();
        }
    }

    // -- savers
    /// Mark the receipt as claimed
    /// @param receipt receipt data
    function _markClaimed(Receipt calldata receipt) private {
        _getBridgeStorage().claimed[receipt.toHash()] = true;
    }

    // -- transfers
    /// Manages the transfer of the token to the bridge
    /// @param sender address of the sender
    /// @param token address of the token
    /// @param payload send payload
    function _transferTokenToBridge(
        address sender,
        address token,
        SendPayload calldata payload
    )
        private
    {
        if (token == samb() && payload.flags & BridgeFlags.SHOULD_WRAP != 0) {
            if (payload.feeAmount + payload.amountToSend != msg.value) {
                revert InvalidValueSent(
                    msg.value, payload.feeAmount + payload.amountToSend
                );
            }
            _wrap(payload.amountToSend);
        } else {
            if (payload.feeAmount != msg.value) {
                revert InvalidValueSent(msg.value, payload.feeAmount);
            }
            bool received = IERC20(token).transferFrom(
                sender, address(this), payload.amountToSend
            );
            if (!received) {
                revert TransferFailed();
            }
        }
    }

    /// Send the fee to the fee receiver
    /// @param amount amount of native currency to send as fee
    function _sendFee(uint256 amount) private {
        (bool sent,) = feeReceiver().call{value: amount}("");
        if (!sent) {
            revert SendFailed();
        }
    }

    /// Transfer the claimed token to the receiver
    /// @param flags flags of the claim
    /// @param token address of the token
    /// @param amount amount of tokens to send
    /// @param receiver address of the receiver
    function _transferClaim(
        uint256 flags,
        address token,
        uint256 amount,
        address receiver
    )
        private
    {
        if (pausedTokens(token)) {
            revert TokenIsPaused(token);
        }
        bool unlocked = false;
        if (token == samb() && flags & BridgeFlags.SHOULD_UNWRAP != 0) {
            _unwrap(amount);
            (unlocked,) = payable(receiver).call{value: amount}("");
        } else {
            unlocked = IERC20(token).transfer(receiver, amount);
        }
        if (!unlocked) {
            revert TransferFailed();
        }
        BridgeStorage storage $ = _getBridgeStorage();
        if (flags & BridgeFlags.SEND_NATIVE_TO_RECEIVER != 0) {
            (bool sent,) = payable(receiver).call{value: $.nativeSendAmount}("");
            if (!sent) {
                revert SendFailed();
            }
        }
    }

    // -- common internals

    /// Perform the send operation (receive tokens and save receipt)
    /// @param recipient address of the recipient on the other chain
    /// @param chainTo destination chain id
    /// @param payload send payload
    /// @param payloadSignature signature of the payload
    function _send(
        bytes32 recipient,
        uint256 chainTo,
        SendPayload calldata payload,
        bytes calldata payloadSignature
    )
        private
        returns (Receipt memory receipt)
    {
        _validateSendValues(chainTo, payload, payloadSignature);
        address sender = payload.flags & BridgeFlags.SENDER_IS_TXORIGIN != 0
            ? tx.origin
            : msg.sender;
        _transferTokenToBridge(
            sender, payload.tokenAddress.toAddress(), payload
        );
        Receipt memory _receipt = Receipt({
            from: bytes32(uint256(uint160(sender))),
            to: recipient,
            tokenAddress: payload.tokenAddress,
            amount: payload.amountToSend,
            chainFrom: block.chainid,
            chainTo: chainTo,
            eventId: _useNonce(address(this)),
            flags: payload.flags >> 65, // remove sender flags
            data: abi.encodePacked(_useNonce(recipient).toUint64())
        });
        _sendFee(payload.feeAmount);
        emit TokenLocked(_receipt);
        return _receipt;
    }

    // user functions

    /// @inheritdoc IBridge
    function send(
        bytes32 recipient,
        uint256 chainTo,
        SendPayload calldata payload,
        bytes calldata payloadSignature
    )
        external
        payable
        override
        returns (Receipt memory receipt)
    {
        return _send(recipient, chainTo, payload, payloadSignature);
    }

    /// @inheritdoc IBridge
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
        override
        returns (Receipt memory receipt)
    {
        address tokenAddress = payload.tokenAddress.toAddress();
        if (tokenAddress != address(0)) {
            if (payload.flags & BridgeFlags.SEND_WITH_PERMIT != 0) {
                IERC20Permit(tokenAddress).permit(
                    payload.flags & BridgeFlags.SENDER_IS_TXORIGIN != 0
                        ? tx.origin
                        : msg.sender,
                    address(this),
                    payload.amountToSend,
                    _deadline,
                    v,
                    r,
                    s
                );
            } else {
                revert InvalidPermitFlag();
            }
        }
        return _send(recipient, chainTo, payload, payloadSignature);
    }

    /// @inheritdoc IBridge
    function claim(
        Receipt calldata receipt,
        bytes calldata signature
    )
        external
        override
        returns (bool success)
    {
        _validateClaim(receipt, signature);
        address token = external2token(receipt.tokenAddress);
        if (token == address(0)) {
            revert TokenNotMapped(receipt.tokenAddress);
        }
        uint256 receivedFlags = receipt.flags << 65; // restore flags position
        address receiver = receipt.to.toAddress();
        _transferClaim(receivedFlags, token, receipt.amount, receiver);
        _markClaimed(receipt);
        emit TokenUnlocked(receipt);
        return true;
    }

}
