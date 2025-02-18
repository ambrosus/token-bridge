// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Initializable} from
    "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

import {ITokenManager} from "../interface/ITokenManager.sol";
import {IWrapped} from "../interface/IWrapped.sol";
import {AddressUtils} from "../utils/AddressUtils.sol";

import {ERC20Bridged} from "../token/ERC20Bridged.sol";
import {BeaconProxy} from "@openzeppelin/contracts/proxy/beacon/BeaconProxy.sol";

abstract contract TokenManagerUpgradeable is ITokenManager, Initializable {

    using AddressUtils for bytes32;

    /// @custom:storage-location erc7201:airdao.bridge.token-manager.storage
    struct TokenManagerStorage {
        mapping(address => bool) bridgableTokens;
        mapping(bytes32 => ExternalToken) externalTokens;
        mapping(address => bool) unpausedTokens; // paused tokens where 0 is paused and 1 is unpaused
        address bridge;
        address SAMB;
        address tokenBeacon;
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
        address tokenBeacon_,
        address bridge_,
        address SAMB
    ) internal onlyInitializing {
        __TokenManager_init_unchained(tokenBeacon_, bridge_, SAMB);
    }

    function __TokenManager_init_unchained(
        address tokenBeacon_,
        address bridge_,
        address SAMB
    ) internal onlyInitializing {
        TokenManagerStorage storage $ = _getTokenManagerStorage();
        $.bridge = bridge_;
        $.SAMB = SAMB;
        $.tokenBeacon = tokenBeacon_;
    }

    modifier isBridgable(
        bytes32 token
    ) {
        if (!bridgableTokens(token.toAddress())) {
            revert TokenNotBridgable(token.toAddress());
        }
        _;
    }

    /// @inheritdoc ITokenManager

    function addToken(
        address token,
        ExternalTokenUnmapped calldata externalToken_,
        bool paused
    ) public virtual returns (bool success) {
        bool res = _addToken(token, externalToken_, paused);
        return res;
    }

    /// @inheritdoc ITokenManager

    function mapExternalToken(
        ExternalTokenUnmapped calldata externalToken_,
        address token
    ) public virtual override returns (bool success) {
        return _mapToken(externalToken_, token);
    }

    /// @inheritdoc ITokenManager
    function unmapExternalToken(
        bytes32 externalTokenAddress
    ) public virtual override returns (bool success) {
        return _unmapToken(externalTokenAddress);
    }

    /// @inheritdoc ITokenManager
    function pauseToken(
        address token
    ) public virtual override returns (bool success) {
        return _pauseToken(token);
    }

    /// @inheritdoc ITokenManager
    function unpauseToken(
        address token
    ) public virtual override returns (bool success) {
        return _unpauseToken(token);
    }

    /// @inheritdoc ITokenManager
    function removeToken(
        address token
    ) public virtual override returns (bool success) {
        return _removeToken(token);
    }

    /// @inheritdoc ITokenManager
    function deployExternalTokenERC20(
        ExternalTokenUnmapped calldata externalToken_,
        string calldata name,
        string calldata symbol,
        uint8 decimals
    ) public virtual override returns (address token) {
        // authority set to 0x0 to premissionless token
        return _deployExternalTokenERC20(
            address(0), externalToken_, name, symbol, decimals
        );
    }

    /// Used to wrap AMB to SAMB
    /// @param amount amount to wrap

    function _wrap(
        uint256 amount
    ) internal {
        return IWrapped(_getTokenManagerStorage().SAMB).deposit{value: amount}();
    }

    /// Used to unwrap SAMB to AMB
    /// @param amount amount to unwrap
    function _unwrap(
        uint256 amount
    ) internal {
        return IWrapped(_getTokenManagerStorage().SAMB).withdraw(amount);
    }

    // Needed to receive AMB from wrapped SAMB
    receive() external payable {}

    /// @inheritdoc ITokenManager
    function bridgableTokens(
        address token
    ) public view override returns (bool isBridgable_) {
        TokenManagerStorage storage $ = _getTokenManagerStorage();
        return $.bridgableTokens[token];
    }

    /// @inheritdoc ITokenManager
    function external2token(
        bytes32 externalTokenAddress
    ) public view override returns (address token) {
        TokenManagerStorage storage $ = _getTokenManagerStorage();
        return $.externalTokens[externalTokenAddress].tokenAddress;
    }

    /// @inheritdoc ITokenManager
    function externalToken(
        bytes32 externalTokenAddress
    ) public view override returns (ExternalToken memory _externalToken) {
        TokenManagerStorage storage $ = _getTokenManagerStorage();
        return $.externalTokens[externalTokenAddress];
    }

    /// @inheritdoc ITokenManager
    function pausedTokens(
        address token
    ) public view override returns (bool isPaused) {
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
    /// @param externalToken_ external token that should be mapped to the token
    /// @return success true if the token was added
    function _addToken(
        address token,
        ExternalTokenUnmapped memory externalToken_,
        bool paused
    ) private returns (bool success) {
        if (token == address(0)) {
            revert TokenZeroAddress();
        }
        TokenManagerStorage storage $ = _getTokenManagerStorage();
        if ($.bridgableTokens[token]) {
            revert TokenAlreadyAdded(token);
        }
        bytes32 extTAdrKey = externalToken_.externalTokenAddress;
        if (
            $.externalTokens[extTAdrKey].tokenAddress != address(0)
                && $.externalTokens[extTAdrKey].externalTokenAddress != bytes32(0)
        ) {
            revert TokenAlreadyMapped(extTAdrKey);
        }
        $.bridgableTokens[token] = true;
        $.externalTokens[extTAdrKey] = ExternalToken({
            externalTokenAddress: externalToken_.externalTokenAddress,
            decimals: externalToken_.decimals,
            tokenAddress: token
        });
        emit TokenMapped(token, extTAdrKey);
        emit TokenAdded(token);
        $.unpausedTokens[token] = !paused;
        if (paused) {
            emit TokenPaused(token);
        } else {
            emit TokenUnpaused(token);
        }
        return true;
    }

    /// Map external token address to token
    /// @param externalToken_ external token that should be mapped to the token
    /// @param token address of the token
    /// @return success true if the token was added
    function _mapToken(
        ExternalTokenUnmapped memory externalToken_,
        address token
    ) private returns (bool success) {
        TokenManagerStorage storage $ = _getTokenManagerStorage();
        if (!$.bridgableTokens[token]) {
            revert TokenNotBridgable(token);
        }
        bytes32 extTAdrKey = externalToken_.externalTokenAddress;
        if (
            $.externalTokens[extTAdrKey].externalTokenAddress != bytes32(0)
                && $.externalTokens[extTAdrKey].tokenAddress != address(0)
        ) {
            revert TokenAlreadyMapped(extTAdrKey);
        }
        $.externalTokens[extTAdrKey] = ExternalToken({
            externalTokenAddress: externalToken_.externalTokenAddress,
            decimals: externalToken_.decimals,
            tokenAddress: token
        });
        emit TokenMapped(token, extTAdrKey);
        return true;
    }

    /// Unmap external token address to token
    /// @param externalTokenAddress external token address
    /// @return success true if the token was removed
    function _unmapToken(
        bytes32 externalTokenAddress
    ) private returns (bool success) {
        TokenManagerStorage storage $ = _getTokenManagerStorage();
        address token = $.externalTokens[externalTokenAddress].tokenAddress;
        if (
            $.externalTokens[externalTokenAddress].externalTokenAddress
                == bytes32(0) && token == address(0)
        ) {
            revert TokenNotMapped(externalTokenAddress);
        }
        delete $.externalTokens[externalTokenAddress];
        emit TokenUnmapped(externalTokenAddress);
        return true;
    }

    /// Remove token from the bridge
    /// @param token address of the token
    /// @return success true if the token was removed
    function _removeToken(
        address token
    ) private returns (bool success) {
        TokenManagerStorage storage $ = _getTokenManagerStorage();
        if (!$.bridgableTokens[token]) {
            revert TokenNotAdded(token);
        }
        // FIXME: cant remove mapped external token
        delete $.bridgableTokens[token];
        delete $.unpausedTokens[token];
        emit TokenRemoved(token);
        return true;
    }

    /// Deploy external ERC20 token to chain
    /// @dev This function should be called by admin to deploy external token to the chain.
    /// @dev This token will be used for bridging as minting and burning. For more details see `ERC20Bridged` contract.
    /// @param externalToken_ external token that will be mapped to the token
    /// @param name name of the token
    /// @param symbol symbol of the token
    /// @param decimals decimals of the token
    /// @return token address of the token
    function _deployExternalTokenERC20(
        address authority,
        ExternalTokenUnmapped memory externalToken_,
        string calldata name,
        string calldata symbol,
        uint8 decimals
    ) internal returns (address token) {
        TokenManagerStorage storage $ = _getTokenManagerStorage();
        address bridge = $.bridge;
        bytes memory initData = abi.encodeWithSignature(
            "initialize(address,string,string,uint8,address)",
            authority,
            name,
            symbol,
            decimals,
            bridge
        );
        address tokenBeacon = $.tokenBeacon;
        token = address(new BeaconProxy(tokenBeacon, initData));
        _addToken(token, externalToken_, true);
        emit TokenDeployed(name, symbol, decimals, token);
        return token;
    }

    /// Pause token bridging
    /// @param token address of the token
    /// @return success true if the token was paused
    function _pauseToken(
        address token
    ) private returns (bool success) {
        TokenManagerStorage storage $ = _getTokenManagerStorage();
        if (!$.unpausedTokens[token]) {
            revert TokenIsPaused(token);
        }
        $.unpausedTokens[token] = false;
        emit TokenPaused(token);
        return true;
    }

    /// Unpause token bridging
    /// @param token address of the token
    /// @return success true if the token was unpaused
    function _unpauseToken(
        address token
    ) private returns (bool success) {
        TokenManagerStorage storage $ = _getTokenManagerStorage();
        if ($.unpausedTokens[token]) {
            revert TokenNotPaused(token);
        }
        $.unpausedTokens[token] = true;
        emit TokenUnpaused(token);
        return true;
    }

}
