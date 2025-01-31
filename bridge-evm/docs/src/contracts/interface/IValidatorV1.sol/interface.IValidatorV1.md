# IValidatorV1
[Git Source](https://github.com/ambrosus/token-bridge/blob/f7df5b81ee6a756200c1bfb81fcd6b81d13f850e/contracts/interface/IValidatorV1.sol)


## Functions
### addValidator

Add a new validator to the list


```solidity
function addValidator(address validator) external returns (bool added);
```
**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`validator`|`address`|address of the validator|

**Returns**

|Name|Type|Description|
|----|----|-----------|
|`added`|`bool`|true if the validator was added|


### removeValidator

Remove a validator from the list


```solidity
function removeValidator(address validator) external returns (bool removed);
```
**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`validator`|`address`|address of the validator|

**Returns**

|Name|Type|Description|
|----|----|-----------|
|`removed`|`bool`|true if the validator was removed|


### isValidator

Check if an address is a validator


```solidity
function isValidator(address validator)
    external
    view
    returns (bool isValidator);
```
**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`validator`|`address`|address of the validator|

**Returns**

|Name|Type|Description|
|----|----|-----------|
|`isValidator`|`bool`|true if the address is a validator|


## Errors
### NoValidators
Reverts if no validators are set


```solidity
error NoValidators();
```

### NoPayloadSigner
Reverts if the payload signer is not set


```solidity
error NoPayloadSigner();
```

### NoFeeValidityWindow
Reverts if the fee validity window is not set


```solidity
error NoFeeValidityWindow();
```

### InvalidSignatureLength
Reverts if the signature length is invalid


```solidity
error InvalidSignatureLength(uint256 length);
```

### SignatureCountMismatch
Reverts if the number of signatures is invalid


```solidity
error SignatureCountMismatch(uint256 count, uint256 required);
```

