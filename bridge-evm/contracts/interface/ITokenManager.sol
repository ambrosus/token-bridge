// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;
pragma abicoder v2;

interface ITokenManager {

    event TokenAdded(address token, bytes32 externalTokenAddress);

    event TokenRemoved(address token);

    event TokenPaused(address token);

    event TokenUnpaused(address token);

    event TokenDeployed(address token, bytes32 externalTokenAddress);

    error TokenZeroAddress();
    error TokenAlreadyAdded(address token);
    error TokenAlreadyMapped(bytes32 externalTokenAddress);
    error TokenNotAdded(address token);
    error TokenNotMapped(bytes32 externalTokenAddress);
    error TokenNotBridgable(address token);
    error TokenNotPaused(address token);
    error TokenIsPaused(address token);

    /// Check if the token is bridgable
    /// @param token address of the token
    /// @return isBridgable true if the token is bridgable
    function bridgableTokens(address token)
        external
        view
        returns (bool isBridgable);

    // /// Get external token address
    // /// @param token address of the token
    // /// @return externalTokenAddress external token address
    // function token2external(
    //     address token
    // ) external view returns (bytes32 externalTokenAddress);

    /// Get token address by external token address
    /// @param externalTokenAddress external token address
    /// @return token address of the token
    function external2token(bytes32 externalTokenAddress)
        external
        view
        returns (address token);

    /// Check if the token is paused
    /// @param token address of the token
    /// @return isPaused true if the token is paused
    function pausedTokens(address token)
        external
        view
        returns (bool isPaused);

    /// Add token to the bridge
    /// @param token address of the token
    /// @param externalTokenAddress external token address
    /// @param paused true if the token should be paused at the start
    /// @return success true if the token was added successfully
    function addToken(
        address token,
        bytes32 externalTokenAddress,
        bool paused
    )
        external
        returns (bool success);

    /// Add token to the bridge
    /// @param token address of the token
    /// @param externalTokenAddress external token address
    /// @return success true if the token was added
    function addToken(
        address token,
        bytes32 externalTokenAddress
    )
        external
        returns (bool success);

    /// Map external token address to token
    /// @param externalTokenAddress external token address
    /// @param token address of the token
    /// @return success true if the token was added
    function mapExternalToken(
        bytes32 externalTokenAddress,
        address token
    )
        external
        returns (bool success);

    /// Unmap external token address to token
    /// @param externalTokenAddress external token address
    /// @return success true if the token was removed
    function unmapExternalToken(bytes32 externalTokenAddress)
        external
        returns (bool success);

    /// Deploy external ERC20 token to chain
    /// @dev This function should be called by admin to deploy external token to the chain.
    /// @dev This token will be used for bridging as minting and burning. For more details see `ERC20Bridged` contract.
    /// @param externalTokenAddress external token address
    /// @param name name of the token
    /// @param symbol symbol of the token
    /// @param decimals decimals of the token
    /// @return token address of the token
    function deployExternalTokenERC20(
        bytes32 externalTokenAddress,
        string calldata name,
        string calldata symbol,
        uint8 decimals
    )
        external
        returns (address token);

    /// Remove token from the bridge
    /// @param token address of the token
    /// @param externalTokenAddress external token address
    /// @return success true if the token was removed
    function removeToken(
        address token,
        bytes32 externalTokenAddress
    )
        external
        returns (bool success);

    /// Pause token bridging
    /// @param token address of the token
    /// @return success true if the token was paused
    function pauseToken(address token) external returns (bool success);

    /// Unpause token bridging
    /// @param token address of the token
    /// @return success true if the token was unpaused
    function unpauseToken(address token) external returns (bool success);

}
