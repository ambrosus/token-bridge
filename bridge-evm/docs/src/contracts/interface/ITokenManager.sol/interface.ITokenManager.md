# ITokenManager
[Git Source](https://github.com/ambrosus/token-bridge/blob/c9e5c0649869e1d0d7d463cf7e74634fda87430d/contracts/interface/ITokenManager.sol)


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


### externalToken

Get external token address


```solidity
function externalToken(bytes32 externalTokenAddress)
    external
    view
    returns (ExternalToken memory externalToken);
```
**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`externalTokenAddress`|`bytes32`|address of the external token|

**Returns**

|Name|Type|Description|
|----|----|-----------|
|`externalToken`|`ExternalToken`|external token structure|


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
    ExternalTokenUnmapped calldata externalToken,
    bool paused
)
    external
    returns (bool success);
```
**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`token`|`address`|address of the token|
|`externalToken`|`ExternalTokenUnmapped`|external token that should be mapped to the token|
|`paused`|`bool`|true if the token should be paused at the start|

**Returns**

|Name|Type|Description|
|----|----|-----------|
|`success`|`bool`|true if the token was added successfully|


### addToken

Add token to the bridge with default paused state


```solidity
function addToken(
    address token,
    ExternalTokenUnmapped calldata externalToken
)
    external
    returns (bool success);
```
**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`token`|`address`|address of the token|
|`externalToken`|`ExternalTokenUnmapped`|external token that should be mapped to the token|

**Returns**

|Name|Type|Description|
|----|----|-----------|
|`success`|`bool`|true if the token was added|


### mapExternalToken

Map external token address to token


```solidity
function mapExternalToken(
    ExternalTokenUnmapped calldata externalToken,
    address token
)
    external
    returns (bool success);
```
**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`externalToken`|`ExternalTokenUnmapped`|external token that should be mapped to the token|
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
    ExternalTokenUnmapped calldata externalToken,
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
|`externalToken`|`ExternalTokenUnmapped`|external token data|
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
function removeToken(address token) external returns (bool success);
```
**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`token`|`address`|address of the token|

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
Emits when token is added to the bridge


```solidity
event TokenAdded(address indexed token);
```

**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`token`|`address`|address of the token|

### TokenMapped
Emits when external token is mapped to the bridge


```solidity
event TokenMapped(address indexed token, bytes32 indexed externalTokenAddress);
```

**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`token`|`address`|address of the token|
|`externalTokenAddress`|`bytes32`|external token address|

### TokenUnmapped
Emits when external token is unmapped from the bridge


```solidity
event TokenUnmapped(bytes32 indexed externalTokenAddress);
```

**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`externalTokenAddress`|`bytes32`|external token address|

### TokenDeployed
Emits when token is deployed from the bridge


```solidity
event TokenDeployed(string name, string symbol, uint8 decimals, address token);
```

**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`name`|`string`|name of the token|
|`symbol`|`string`|symbol of the token|
|`decimals`|`uint8`|decimals of the token|
|`token`|`address`|address of the token deployed|

### TokenRemoved
Emits when token is removed from the bridge


```solidity
event TokenRemoved(address indexed token);
```

**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`token`|`address`|address of the token|

### TokenPaused
Emits when token is paused


```solidity
event TokenPaused(address indexed token);
```

**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`token`|`address`|address of the token|

### TokenUnpaused
Emits when token is unpaused


```solidity
event TokenUnpaused(address indexed token);
```

**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`token`|`address`|address of the token|

## Errors
### TokenZeroAddress
Reverts if the token address is zero


```solidity
error TokenZeroAddress();
```

### TokenAlreadyAdded
Reverts if token already added


```solidity
error TokenAlreadyAdded(address token);
```

**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`token`|`address`|address of the token|

### TokenAlreadyMapped
Reverts if token already mapped


```solidity
error TokenAlreadyMapped(bytes32 externalTokenAddress);
```

**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`externalTokenAddress`|`bytes32`|external token address|

### TokenNotAdded
Reverts if token not added


```solidity
error TokenNotAdded(address token);
```

**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`token`|`address`|address of the token|

### TokenNotMapped
Reverts if token not mapped


```solidity
error TokenNotMapped(bytes32 externalTokenAddress);
```

**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`externalTokenAddress`|`bytes32`|external token address|

### TokenNotBridgable
Reverts if token not bridgable


```solidity
error TokenNotBridgable(address token);
```

**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`token`|`address`|address of the token|

### TokenNotPaused
Reverts if token is not paused


```solidity
error TokenNotPaused(address token);
```

**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`token`|`address`|address of the token|

### TokenIsPaused
Reverts if token is paused


```solidity
error TokenIsPaused(address token);
```

**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`token`|`address`|address of the token|

## Structs
### ExternalToken

```solidity
struct ExternalToken {
    bytes32 externalTokenAddress;
    address tokenAddress;
    uint8 decimals;
}
```

### ExternalTokenUnmapped

```solidity
struct ExternalTokenUnmapped {
    bytes32 externalTokenAddress;
    uint8 decimals;
}
```

