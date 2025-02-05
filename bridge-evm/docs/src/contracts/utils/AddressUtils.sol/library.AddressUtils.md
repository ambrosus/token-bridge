# AddressUtils
[Git Source](https://github.com/ambrosus/token-bridge/blob/fd78173c03bc3176acad331d668a382df87c32fd/contracts/utils/AddressUtils.sol)


## Functions
### toAddressBE

Convert address to bytes32 using big-endian byte order

*example: `0x111122223333444455556666777788889999AAAABBBBCCCCDDDDEEEEFFFFCC` -> `0x777788889999AaAAbBbbCcccddDdeeeEfFFfCcCc`*


```solidity
function toAddressBE(bytes32 value) internal pure returns (address converted);
```
**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`value`|`bytes32`|address value to convert|

**Returns**

|Name|Type|Description|
|----|----|-----------|
|`converted`|`address`|address|


### toAddressLE

Convert bytes32 to address using little-endian byte order

*example: `0x111122223333444455556666777788889999AAAABBBBCCCCDDDDEEEEFFFFCC` -> `0x111122223333444455556666777788889999aAaa`*


```solidity
function toAddressLE(bytes32 value) internal pure returns (address converted);
```
**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`value`|`bytes32`|bytes32 value to convert|

**Returns**

|Name|Type|Description|
|----|----|-----------|
|`converted`|`address`|address|


### toAddress

Convert bytes32 to address using big-endian or little-endian byte order


```solidity
function toAddress(
    bytes32 value,
    bool le
)
    internal
    pure
    returns (address converted);
```
**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`value`|`bytes32`|bytes32 value to convert|
|`le`|`bool`|true if the value is in little-endian byte order|

**Returns**

|Name|Type|Description|
|----|----|-----------|
|`converted`|`address`|address|


### toAddress

Shortcut  to convert bytes32 to address using big-endian byte order

*example: `0x111122223333444455556666777788889999AAAABBBBCCCCDDDDEEEEFFFFCC` -> `0x777788889999AaAAbBbbCcccddDdeeeEfFFfCcCc`*


```solidity
function toAddress(bytes32 value) internal pure returns (address converted);
```
**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`value`|`bytes32`|bytes32 value to convert|

**Returns**

|Name|Type|Description|
|----|----|-----------|
|`converted`|`address`|address|


### toAddress

Convert string to address

*using [parseAddress](https://docs.openzeppelin.com/contracts/5.x/api/utils#Strings-parseAddress-string-) from OpenZeppelin's String library*


```solidity
function toAddress(string memory _address)
    public
    pure
    returns (address converted);
```
**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`_address`|`string`|string value to convert|

**Returns**

|Name|Type|Description|
|----|----|-----------|
|`converted`|`address`|address|


