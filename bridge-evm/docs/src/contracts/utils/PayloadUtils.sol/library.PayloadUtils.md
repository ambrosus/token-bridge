# PayloadUtils
[Git Source](https://github.com/ambrosus/token-bridge/blob/c9e5c0649869e1d0d7d463cf7e74634fda87430d/contracts/utils/PayloadUtils.sol)


## Functions
### toHash

Shortcut to convert payload to hash

*using [toEthSignedMessageHash](https://docs.openzeppelin.com/contracts/5.x/api/utils#MessageHashUtils-toEthSignedMessageHash-bytes32-) from OpenZeppelin's MessageHashUtils*


```solidity
function toHash(BridgeTypes.SendPayload memory payload)
    internal
    pure
    returns (bytes32 hash);
```
**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`payload`|`BridgeTypes.SendPayload`|payload to convert|

**Returns**

|Name|Type|Description|
|----|----|-----------|
|`hash`|`bytes32`|converted|


### toEthSignedMessageHash

Convert payload to hash via toEthSignedMessageHash

*using [toEthSignedMessageHash](https://docs.openzeppelin.com/contracts/5.x/api/utils#MessageHashUtils-toEthSignedMessageHash-bytes32-) from OpenZeppelin's MessageHashUtils*


```solidity
function toEthSignedMessageHash(BridgeTypes.SendPayload memory payload)
    internal
    pure
    returns (bytes32 hash);
```
**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`payload`|`BridgeTypes.SendPayload`|payload to convert|

**Returns**

|Name|Type|Description|
|----|----|-----------|
|`hash`|`bytes32`|converted|


