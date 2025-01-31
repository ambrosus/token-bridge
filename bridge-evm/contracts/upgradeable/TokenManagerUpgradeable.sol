// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Initializable} from
    "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

import {ITokenManager} from "../interface/ITokenManager.sol";
import {IWrapped} from "../interface/IWrapped.sol";

import {ERC20Bridged} from "../token/ERC20Bridged.sol";

abstract contract TokenManagerUpgradeable is ITokenManager, Initializable {

    /// @custom:storage-location erc7201:airdao.bridge.token-manager.storage
    struct TokenManagerStorage {
        mapping(address => bool) bridgableTokens;
        mapping(bytes32 => address) external2token;
        mapping(address => bool) unpausedTokens; // paused tokens where 0 is paused and 1 is unpaused
        address bridge;
        address SAMB;
    }

    // keccak256(abi.encode(uint256(keccak256("airdao.bridge.token-manager.storage")) - 1)) & ~bytes32(uint256(0xff))
    bytes32 private constant TokenManagerStorageLocation =
        0x2d15676fe9c8ae7133aa3a07c866790ab075f046651b2191e662a4edad09af00;

    function _getTokenManagerStorage()
        private
        pure
        returns (TokenManagerStorage storage $)
    {
        assembly {
            $.slot := TokenManagerStorageLocation
        }
    }

    function __TokenManager_init(
        address bridge_,
        address SAMB
    )
        internal
        onlyInitializing
    {
        __TokenManager_init_unchained(bridge_, SAMB);
    }

    function __TokenManager_init_unchained(
        address bridge_,
        address SAMB
    )
        internal
        onlyInitializing
    {
        TokenManagerStorage storage $ = _getTokenManagerStorage();
        $.bridge = bridge_;
        $.SAMB = SAMB;
    }
    /// @inheritdoc ITokenManager

    function addToken(
        address token,
        bytes32 externalTokenAddress,
        bool paused
    )
        public
        virtual
        returns (bool success)
    {
        bool res = _addToken(token, externalTokenAddress, paused);
        return res;
    }
    /// @inheritdoc ITokenManager

    function mapExternalToken(
        bytes32 externalTokenAddress,
        address token
    )
        public
        virtual
        returns (bool success)
    {
        return _mapToken(externalTokenAddress, token);
    }

    /// @inheritdoc ITokenManager
    function unmapExternalToken(bytes32 externalTokenAddress)
        public
        virtual
        returns (bool success)
    {
        return _unmapToken(externalTokenAddress);
    }

    /// @inheritdoc ITokenManager
    function pauseToken(address token)
        public
        virtual
        override
        returns (bool success)
    {
        return _pauseToken(token);
    }

    /// @inheritdoc ITokenManager
    function unpauseToken(address token)
        public
        virtual
        override
        returns (bool success)
    {
        return _unpauseToken(token);
    }

    /// @inheritdoc ITokenManager
    function removeToken(
        address token,
        bytes32 externalTokenAddress
    )
        public
        virtual
        override
        returns (bool success)
    {
        return _removeToken(token, externalTokenAddress);
    }

    /// @inheritdoc ITokenManager
    function deployExternalTokenERC20(
        bytes32 externalTokenAddress,
        string calldata name,
        string calldata symbol,
        uint8 decimals
    )
        public
        virtual
        override
        returns (address token)
    {
        return _deployExternalTokenERC20(
            externalTokenAddress, name, symbol, decimals
        );
    }
    /// Used to wrap AMB to SAMB
    /// @param amount amount to wrap

    function _wrap(uint256 amount) internal {
        return IWrapped(_getTokenManagerStorage().SAMB).deposit{value: amount}();
    }

    /// Used to unwrap SAMB to AMB
    /// @param amount amount to unwrap
    function _unwrap(uint256 amount) internal {
        return IWrapped(_getTokenManagerStorage().SAMB).withdraw(amount);
    }

    // Needed to receive AMB from wrapped SAMB
    receive() external payable {}

    /// @inheritdoc ITokenManager
    function bridgableTokens(address token)
        public
        view
        override
        returns (bool isBridgable)
    {
        TokenManagerStorage storage $ = _getTokenManagerStorage();
        return $.bridgableTokens[token];
    }

    // /// @inheritdoc ITokenManager
    // function token2external(
    //     address token
    // ) public view override returns (bytes32 externalTokenAddress) {
    //     TokenManagerStorage storage $ = _getTokenManagerStorage();
    //     return $.token2external[token];
    // }

    /// @inheritdoc ITokenManager
    function external2token(bytes32 externalTokenAddress)
        public
        view
        override
        returns (address token)
    {
        TokenManagerStorage storage $ = _getTokenManagerStorage();
        return $.external2token[externalTokenAddress];
    }

    /// @inheritdoc ITokenManager
    function pausedTokens(address token)
        public
        view
        override
        returns (bool isPaused)
    {
        TokenManagerStorage storage $ = _getTokenManagerStorage();
        return !$.unpausedTokens[token];
    }

    /// SAMB address
    /// @return SAMB address of wrapped token
    function samb() public view returns (address SAMB) {
        return _getTokenManagerStorage().SAMB;
    }

    /// Adds token to the bridge
    /// @param token address of the token
    /// @param externalTokenAddress external token address
    /// @return success true if the token was added
    function _addToken(
        address token,
        bytes32 externalTokenAddress,
        bool paused
    )
        private
        returns (bool success)
    {
        if (token == address(0)) {
            revert TokenZeroAddress();
        }
        TokenManagerStorage storage $ = _getTokenManagerStorage();
        if ($.bridgableTokens[token]) {
            revert TokenAlreadyAdded(token);
        }
        if ($.external2token[externalTokenAddress] != address(0)) {
            revert TokenAlreadyMapped(externalTokenAddress);
        }
        $.bridgableTokens[token] = true;
        // $.token2external[token] = externalTokenAddress;
        $.external2token[externalTokenAddress] = token;
        $.unpausedTokens[token] = !paused;
        return true;
    }

    /// Map external token address to token
    /// @param externalTokenAddress external token address
    /// @param token address of the token
    /// @return success true if the token was added
    function _mapToken(
        bytes32 externalTokenAddress,
        address token
    )
        private
        returns (bool success)
    {
        TokenManagerStorage storage $ = _getTokenManagerStorage();
        if (!$.bridgableTokens[token]) {
            revert TokenNotBridgable(token);
        }
        if ($.external2token[externalTokenAddress] != address(0)) {
            revert TokenAlreadyMapped(externalTokenAddress);
        }
        $.external2token[externalTokenAddress] = token;
        return true;
    }

    /// Unmap external token address to token
    /// @param externalTokenAddress external token address
    /// @return success true if the token was removed
    function _unmapToken(bytes32 externalTokenAddress)
        private
        returns (bool success)
    {
        TokenManagerStorage storage $ = _getTokenManagerStorage();
        if ($.external2token[externalTokenAddress] == address(0)) {
            revert TokenNotMapped(externalTokenAddress);
        }
        delete $.external2token[externalTokenAddress];
        return true;
    }

    /// Remove token from the bridge
    /// @param token address of the token
    /// @param externalTokenAddress external token address
    /// @return success true if the token was removed
    function _removeToken(
        address token,
        bytes32 externalTokenAddress
    )
        private
        returns (bool success)
    {
        TokenManagerStorage storage $ = _getTokenManagerStorage();
        if (!$.bridgableTokens[token]) {
            revert TokenNotAdded(token);
        }
        delete $.bridgableTokens[token];
        // delete $.token2external[token];
        delete $.external2token[externalTokenAddress];
        delete $.unpausedTokens[token];
        return true;
    }

    /// Deploy external ERC20 token to chain
    /// @dev This function should be called by admin to deploy external token to the chain.
    /// @dev This token will be used for bridging as minting and burning. For more details see `ERC20Bridged` contract.
    /// @param externalTokenAddress external token address
    /// @param name name of the token
    /// @param symbol symbol of the token
    /// @param decimals decimals of the token
    /// @return token address of the token
    function _deployExternalTokenERC20(
        bytes32 externalTokenAddress,
        string calldata name,
        string calldata symbol,
        uint8 decimals
    )
        private
        returns (address token)
    {
        TokenManagerStorage storage $ = _getTokenManagerStorage();
        address bridge = $.bridge;
        token = address(new ERC20Bridged(name, symbol, decimals, bridge));
        _addToken(token, externalTokenAddress, true);
        return token;
    }

    /// Pause token bridging
    /// @param token address of the token
    /// @return success true if the token was paused
    function _pauseToken(address token) private returns (bool success) {
        TokenManagerStorage storage $ = _getTokenManagerStorage();
        if (!$.unpausedTokens[token]) {
            revert TokenIsPaused(token);
        }
        $.unpausedTokens[token] = false;
        return true;
    }

    /// Unpause token bridging
    /// @param token address of the token
    /// @return success true if the token was unpaused
    function _unpauseToken(address token) private returns (bool success) {
        TokenManagerStorage storage $ = _getTokenManagerStorage();
        if ($.unpausedTokens[token]) {
            revert TokenNotPaused(token);
        }
        $.unpausedTokens[token] = true;
        return true;
    }

}
