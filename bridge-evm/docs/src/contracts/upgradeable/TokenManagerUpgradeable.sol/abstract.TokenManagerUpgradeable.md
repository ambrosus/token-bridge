# TokenManagerUpgradeable
[Git Source](https://github.com/ambrosus/token-bridge/blob/feca847ded93a058080932a4b6dbb25928c5534c/contracts/upgradeable/TokenManagerUpgradeable.sol)

**Inherits:**
[ITokenManager](/contracts/interface/ITokenManager.sol/interface.ITokenManager.md), Initializable


## State Variables
### TokenManagerStorageLocation

```solidity
bytes32 private constant TokenManagerStorageLocation =
    0x2d15676fe9c8ae7133aa3a07c866790ab075f046651b2191e662a4edad09af00;
```


## Functions
### _getTokenManagerStorage


```solidity
function _getTokenManagerStorage()
    private
    pure
    returns (TokenManagerStorage storage $);
```

### __TokenManager_init


```solidity
function __TokenManager_init(
    address bridge_,
    address SAMB
)
    internal
    onlyInitializing;
```

### __TokenManager_init_unchained


```solidity
function __TokenManager_init_unchained(
    address bridge_,
    address SAMB
)
    internal
    onlyInitializing;
```

### addToken

Add token to the bridge


```solidity
function addToken(
    address token,
    bytes32 externalTokenAddress,
    bool paused
)
    public
    virtual
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


### mapExternalToken

Map external token address to token


```solidity
function mapExternalToken(
    bytes32 externalTokenAddress,
    address token
)
    public
    virtual
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
    public
    virtual
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


### pauseToken

Pause token bridging


```solidity
function pauseToken(address token)
    public
    virtual
    override
    returns (bool success);
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
function unpauseToken(address token)
    public
    virtual
    override
    returns (bool success);
```
**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`token`|`address`|address of the token|

**Returns**

|Name|Type|Description|
|----|----|-----------|
|`success`|`bool`|true if the token was unpaused|


### removeToken

Remove token from the bridge


```solidity
function removeToken(
    address token,
    bytes32 externalTokenAddress
)
    public
    virtual
    override
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


### deployExternalTokenERC20

Deploy external ERC20 token to chain

*This function should be called by admin to deploy external token to the chain.*


```solidity
function deployExternalTokenERC20(
    bytes32 externalTokenAddress,
    string calldata name,
    string calldata symbol,
    uint8 decimals
)
    public
    virtual
    override
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


### _wrap

Used to wrap AMB to SAMB


```solidity
function _wrap(uint256 amount) internal;
```
**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`amount`|`uint256`|amount to wrap|


### _unwrap

Used to unwrap SAMB to AMB


```solidity
function _unwrap(uint256 amount) internal;
```
**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`amount`|`uint256`|amount to unwrap|


### receive


```solidity
receive() external payable;
```

### bridgableTokens

Check if the token is bridgable


```solidity
function bridgableTokens(address token)
    public
    view
    override
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
    public
    view
    override
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
function pausedTokens(address token)
    public
    view
    override
    returns (bool isPaused);
```
**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`token`|`address`|address of the token|

**Returns**

|Name|Type|Description|
|----|----|-----------|
|`isPaused`|`bool`|true if the token is paused|


### samb

SAMB address


```solidity
function samb() public view returns (address SAMB);
```
**Returns**

|Name|Type|Description|
|----|----|-----------|
|`SAMB`|`address`|address of wrapped token|


### _addToken

Adds token to the bridge


```solidity
function _addToken(
    address token,
    bytes32 externalTokenAddress,
    bool paused
)
    private
    returns (bool success);
```
**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`token`|`address`|address of the token|
|`externalTokenAddress`|`bytes32`|external token address|
|`paused`|`bool`||

**Returns**

|Name|Type|Description|
|----|----|-----------|
|`success`|`bool`|true if the token was added|


### _mapToken

Map external token address to token


```solidity
function _mapToken(
    bytes32 externalTokenAddress,
    address token
)
    private
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


### _unmapToken

Unmap external token address to token


```solidity
function _unmapToken(bytes32 externalTokenAddress)
    private
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


### _removeToken

Remove token from the bridge


```solidity
function _removeToken(
    address token,
    bytes32 externalTokenAddress
)
    private
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


### _deployExternalTokenERC20

Deploy external ERC20 token to chain

*This function should be called by admin to deploy external token to the chain.*

*This token will be used for bridging as minting and burning. For more details see `ERC20Bridged` contract.*


```solidity
function _deployExternalTokenERC20(
    bytes32 externalTokenAddress,
    string calldata name,
    string calldata symbol,
    uint8 decimals
)
    private
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


### _pauseToken

Pause token bridging


```solidity
function _pauseToken(address token) private returns (bool success);
```
**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`token`|`address`|address of the token|

**Returns**

|Name|Type|Description|
|----|----|-----------|
|`success`|`bool`|true if the token was paused|


### _unpauseToken

Unpause token bridging


```solidity
function _unpauseToken(address token) private returns (bool success);
```
**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`token`|`address`|address of the token|

**Returns**

|Name|Type|Description|
|----|----|-----------|
|`success`|`bool`|true if the token was unpaused|


## Structs
### TokenManagerStorage
**Note:**
storage-location: erc7201:airdao.bridge.token-manager.storage


```solidity
struct TokenManagerStorage {
    mapping(address => bool) bridgableTokens;
    mapping(bytes32 => address) external2token;
    mapping(address => bool) unpausedTokens;
    address bridge;
    address SAMB;
}
```

