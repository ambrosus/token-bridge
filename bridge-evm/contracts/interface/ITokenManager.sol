// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;
pragma abicoder v2;

interface ITokenManager {

    struct ExternalToken {
        bytes32 externalTokenAddress;
        address tokenAddress;
        uint8 decimals;
    }

    struct ExternalTokenUnmapped {
        bytes32 externalTokenAddress;
        uint8 decimals;
    }

    /// Emits when token is added to the bridge
    /// @param token address of the token
    event TokenAdded(address indexed token);

    /// Emits when external token is mapped to the bridge
    /// @param token address of the token
    /// @param externalTokenAddress external token address
    event TokenMapped(
        address indexed token, bytes32 indexed externalTokenAddress
    );

    /// Emits when external token is unmapped from the bridge
    /// @param externalTokenAddress external token address
    event TokenUnmapped(bytes32 indexed externalTokenAddress);

    /// Emits when token is deployed from the bridge
    /// @param name name of the token
    /// @param symbol symbol of the token
    /// @param decimals decimals of the token
    /// @param token address of the token deployed
    event TokenDeployed(
        string name, string symbol, uint8 decimals, address token
    );

    /// Emits when token is removed from the bridge
    /// @param token address of the token
    event TokenRemoved(address indexed token);

    /// Emits when token is paused
    /// @param token address of the token
    event TokenPaused(address indexed token);

    /// Emits when token is unpaused
    /// @param token address of the token
    event TokenUnpaused(address indexed token);

    /// Reverts if the token address is zero
    error TokenZeroAddress();

    /// Reverts if token already added
    /// @param token address of the token
    error TokenAlreadyAdded(address token);

    /// Reverts if token already mapped
    /// @param externalTokenAddress external token address
    error TokenAlreadyMapped(bytes32 externalTokenAddress);

    /// Reverts if token not added
    /// @param token address of the token
    error TokenNotAdded(address token);

    /// Reverts if token not mapped
    /// @param externalTokenAddress external token address
    error TokenNotMapped(bytes32 externalTokenAddress);

    /// Reverts if token not bridgable
    /// @param token address of the token
    error TokenNotBridgable(address token);

    /// Reverts if token is not paused
    /// @param token address of the token
    error TokenNotPaused(address token);

    /// Reverts if token is paused
    /// @param token address of the token
    error TokenIsPaused(address token);

    /// Check if the token is bridgable
    /// @param token address of the token
    /// @return isBridgable true if the token is bridgable
    function bridgableTokens(
        address token
    ) external view returns (bool isBridgable);

    /// Get external token address
    /// @param externalTokenAddress address of the external token
    /// @return externalToken external token structure
    function externalToken(
        bytes32 externalTokenAddress
    ) external view returns (ExternalToken memory externalToken);

    /// Get token address by external token address
    /// @param externalTokenAddress external token address
    /// @return token address of the token
    function external2token(
        bytes32 externalTokenAddress
    ) external view returns (address token);

    /// Check if the token is paused
    /// @param token address of the token
    /// @return isPaused true if the token is paused
    function pausedTokens(
        address token
    ) external view returns (bool isPaused);

    /// Add token to the bridge
    /// @param token address of the token
    /// @param externalToken external token that should be mapped to the token
    /// @param paused true if the token should be paused at the start
    /// @return success true if the token was added successfully
    function addToken(
        address token,
        ExternalTokenUnmapped calldata externalToken,
        bool paused
    ) external returns (bool success);

    /// Add token to the bridge with default paused state
    /// @param token address of the token
    /// @param externalToken external token that should be mapped to the token
    /// @return success true if the token was added
    function addToken(
        address token,
        ExternalTokenUnmapped calldata externalToken
    ) external returns (bool success);

    /// Map external token address to token
    /// @param externalToken external token that should be mapped to the token
    /// @param token address of the token
    /// @return success true if the token was added
    function mapExternalToken(
        ExternalTokenUnmapped calldata externalToken,
        address token
    ) external returns (bool success);

    /// Unmap external token address to token
    /// @param externalTokenAddress external token address
    /// @return success true if the token was removed
    function unmapExternalToken(
        bytes32 externalTokenAddress
    ) external returns (bool success);

    /// Deploy external ERC20 token to chain
    /// @dev This function should be called by admin to deploy external token to the chain.
    /// @dev This token will be used for bridging as minting and burning. For more details see `ERC20Bridged` contract.
    /// @param externalToken external token data
    /// @param name name of the token
    /// @param symbol symbol of the token
    /// @param decimals decimals of the token
    /// @return token address of the token
    function deployExternalTokenERC20(
        ExternalTokenUnmapped calldata externalToken,
        string calldata name,
        string calldata symbol,
        uint8 decimals
    ) external returns (address token);

    /// Remove token from the bridge
    /// @param token address of the token
    /// @return success true if the token was removed
    function removeToken(
        address token
    ) external returns (bool success);

    /// Pause token bridging
    /// @param token address of the token
    /// @return success true if the token was paused
    function pauseToken(
        address token
    ) external returns (bool success);

    /// Unpause token bridging
    /// @param token address of the token
    /// @return success true if the token was unpaused
    function unpauseToken(
        address token
    ) external returns (bool success);

}
