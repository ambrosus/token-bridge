# ReceiptUtils
[Git Source](https://github.com/ambrosus/token-bridge/blob/1d5f7952fbb3e2e1a2ce109d93ab3ad11876d0b1/contracts/utils/ReceiptUtils.sol)


## Functions
### toHash

Shortcut to convert receipt to hash

*using [toEthSignedMessageHash](https://docs.openzeppelin.com/contracts/5.x/api/utils#MessageHashUtils-toEthSignedMessageHash-bytes32-) from OpenZeppelin's MessageHashUtils*


```solidity
function toHash(IBridgeTypes.Receipt memory receipt)
    internal
    pure
    returns (bytes32 hash);
```
**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`receipt`|`IBridgeTypes.Receipt`|receipt to convert|

**Returns**

|Name|Type|Description|
|----|----|-----------|
|`hash`|`bytes32`|converted|


### toEthSignedMessageHash

Convert receipt to hash via toEthSignedMessageHash

*using [toEthSignedMessageHash](https://docs.openzeppelin.com/contracts/5.x/api/utils#MessageHashUtils-toEthSignedMessageHash-bytes32-) from OpenZeppelin's MessageHashUtils*


```solidity
function toEthSignedMessageHash(IBridgeTypes.Receipt memory receipt)
    internal
    pure
    returns (bytes32 hash);
```
**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`receipt`|`IBridgeTypes.Receipt`|receipt to convert|

**Returns**

|Name|Type|Description|
|----|----|-----------|
|`hash`|`bytes32`|converted|


