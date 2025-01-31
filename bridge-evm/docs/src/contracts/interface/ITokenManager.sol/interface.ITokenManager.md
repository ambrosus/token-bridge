# ITokenManager
[Git Source](https://github.com/ambrosus/token-bridge/blob/feca847ded93a058080932a4b6dbb25928c5534c/contracts/interface/ITokenManager.sol)


## Functions
### bridgableTokens

Check if the token is bridgable


```solidity
function bridgableTokens(address token)
    external
    view
    returns (bool isBridgable);
```
**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`token`|`address`|address of the token|

**Returns**

|Name|Type|Description|
|----|----|-----------|
|`isBridgable`|`bool`|true if the token is bridgable|


### external2token

Get token address by external token address


```solidity
function external2token(bytes32 externalTokenAddress)
    external
    view
    returns (address token);
```
**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`externalTokenAddress`|`bytes32`|external token address|

**Returns**

|Name|Type|Description|
|----|----|-----------|
|`token`|`address`|address of the token|


### pausedTokens

Check if the token is paused


```solidity
function pausedTokens(address token) external view returns (bool isPaused);
```
**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`token`|`address`|address of the token|

**Returns**

|Name|Type|Description|
|----|----|-----------|
|`isPaused`|`bool`|true if the token is paused|


### addToken

Add token to the bridge


```solidity
function addToken(
    address token,
    bytes32 externalTokenAddress,
    bool paused
)
    external
    returns (bool success);
```
**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`token`|`address`|address of the token|
|`externalTokenAddress`|`bytes32`|external token address|
|`paused`|`bool`|true if the token should be paused at the start|

**Returns**

|Name|Type|Description|
|----|----|-----------|
|`success`|`bool`|true if the token was added successfully|


### addToken

Add token to the bridge


```solidity
function addToken(
    address token,
    bytes32 externalTokenAddress
)
    external
    returns (bool success);
```
**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`token`|`address`|address of the token|
|`externalTokenAddress`|`bytes32`|external token address|

**Returns**

|Name|Type|Description|
|----|----|-----------|
|`success`|`bool`|true if the token was added|


### mapExternalToken

Map external token address to token


```solidity
function mapExternalToken(
    bytes32 externalTokenAddress,
    address token
)
    external
    returns (bool success);
```
**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`externalTokenAddress`|`bytes32`|external token address|
|`token`|`address`|address of the token|

**Returns**

|Name|Type|Description|
|----|----|-----------|
|`success`|`bool`|true if the token was added|


### unmapExternalToken

Unmap external token address to token


```solidity
function unmapExternalToken(bytes32 externalTokenAddress)
    external
    returns (bool success);
```
**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`externalTokenAddress`|`bytes32`|external token address|

**Returns**

|Name|Type|Description|
|----|----|-----------|
|`success`|`bool`|true if the token was removed|


### deployExternalTokenERC20

Deploy external ERC20 token to chain

*This function should be called by admin to deploy external token to the chain.*

*This token will be used for bridging as minting and burning. For more details see `ERC20Bridged` contract.*


```solidity
function deployExternalTokenERC20(
    bytes32 externalTokenAddress,
    string calldata name,
    string calldata symbol,
    uint8 decimals
)
    external
    returns (address token);
```
**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`externalTokenAddress`|`bytes32`|external token address|
|`name`|`string`|name of the token|
|`symbol`|`string`|symbol of the token|
|`decimals`|`uint8`|decimals of the token|

**Returns**

|Name|Type|Description|
|----|----|-----------|
|`token`|`address`|address of the token|


### removeToken

Remove token from the bridge


```solidity
function removeToken(
    address token,
    bytes32 externalTokenAddress
)
    external
    returns (bool success);
```
**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`token`|`address`|address of the token|
|`externalTokenAddress`|`bytes32`|external token address|

**Returns**

|Name|Type|Description|
|----|----|-----------|
|`success`|`bool`|true if the token was removed|


### pauseToken

Pause token bridging


```solidity
function pauseToken(address token) external returns (bool success);
```
**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`token`|`address`|address of the token|

**Returns**

|Name|Type|Description|
|----|----|-----------|
|`success`|`bool`|true if the token was paused|


### unpauseToken

Unpause token bridging


```solidity
function unpauseToken(address token) external returns (bool success);
```
**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`token`|`address`|address of the token|

**Returns**

|Name|Type|Description|
|----|----|-----------|
|`success`|`bool`|true if the token was unpaused|


## Events
### TokenAdded

```solidity
event TokenAdded(address token, bytes32 externalTokenAddress);
```

### TokenRemoved

```solidity
event TokenRemoved(address token);
```

### TokenPaused

```solidity
event TokenPaused(address token);
```

### TokenUnpaused

```solidity
event TokenUnpaused(address token);
```

### TokenDeployed

```solidity
event TokenDeployed(address token, bytes32 externalTokenAddress);
```

## Errors
### TokenZeroAddress

```solidity
error TokenZeroAddress();
```

### TokenAlreadyAdded

```solidity
error TokenAlreadyAdded(address token);
```

### TokenAlreadyMapped

```solidity
error TokenAlreadyMapped(bytes32 externalTokenAddress);
```

### TokenNotAdded

```solidity
error TokenNotAdded(address token);
```

### TokenNotMapped

```solidity
error TokenNotMapped(bytes32 externalTokenAddress);
```

### TokenNotBridgable

```solidity
error TokenNotBridgable(address token);
```

### TokenNotPaused

```solidity
error TokenNotPaused(address token);
```

### TokenIsPaused

```solidity
error TokenIsPaused(address token);
```

