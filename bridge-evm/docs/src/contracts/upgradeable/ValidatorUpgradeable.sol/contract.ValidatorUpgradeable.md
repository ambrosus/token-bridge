# ValidatorUpgradeable
[Git Source](https://github.com/ambrosus/token-bridge/blob/fd78173c03bc3176acad331d668a382df87c32fd/contracts/upgradeable/ValidatorUpgradeable.sol)

**Inherits:**
[IValidation](/contracts/interface/IValidation.sol/interface.IValidation.md), [IValidatorV1](/contracts/interface/IValidatorV1.sol/interface.IValidatorV1.md), Initializable, AccessManagedUpgradeable


## State Variables
### VALIDATOR_STORAGE_POSITION

```solidity
bytes32 private constant VALIDATOR_STORAGE_POSITION =
    0xf44f62b48f788febe9286c9767b06db2bafdbe32f9720a2466ac3df5942cf200;
```


## Functions
### _getValidatorStorage


```solidity
function _getValidatorStorage()
    private
    pure
    returns (ValidatorStorage storage $);
```

### __Validator_init


```solidity
function __Validator_init(
    address authority_,
    address[] calldata validators_,
    address payloadSigner_,
    uint256 feeValidityWindow_
)
    internal
    onlyInitializing;
```

### __Validator_init_unchained


```solidity
function __Validator_init_unchained(
    address authority_,
    address[] calldata validators_,
    address payloadSigner_,
    uint256 feeValidityWindow_
)
    internal
    onlyInitializing;
```

### readyToValidate


```solidity
modifier readyToValidate();
```

### isValidator

Check if an address is a validator


```solidity
function isValidator(address validator_)
    public
    view
    override
    returns (bool isValidator_);
```
**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`validator_`|`address`||

**Returns**

|Name|Type|Description|
|----|----|-----------|
|`isValidator_`|`bool`|isValidator true if the address is a validator|


### addValidator

Add a new validator to the list


```solidity
function addValidator(address validator_)
    public
    override
    restricted
    returns (bool added);
```
**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`validator_`|`address`||

**Returns**

|Name|Type|Description|
|----|----|-----------|
|`added`|`bool`|true if the validator was added|


### removeValidator

Remove a validator from the list


```solidity
function removeValidator(address validator_)
    public
    override
    restricted
    returns (bool removed);
```
**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`validator_`|`address`||

**Returns**

|Name|Type|Description|
|----|----|-----------|
|`removed`|`bool`|true if the validator was removed|


### setPayloadSigner

Set the address of the payload signer


```solidity
function setPayloadSigner(address payloadSigner_)
    public
    override
    restricted
    returns (bool success);
```
**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`payloadSigner_`|`address`||

**Returns**

|Name|Type|Description|
|----|----|-----------|
|`success`|`bool`|true if the payload signer was set|


### setFeeValidityWindow

Set the fee validity window in seconds


```solidity
function setFeeValidityWindow(uint256 feeValidityWindow_)
    public
    override
    restricted
    returns (bool success);
```
**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`feeValidityWindow_`|`uint256`||

**Returns**

|Name|Type|Description|
|----|----|-----------|
|`success`|`bool`|true if the fee validity window was set|


### payloadSigner

Get the address of the payload signer


```solidity
function payloadSigner() public view override returns (address);
```
**Returns**

|Name|Type|Description|
|----|----|-----------|
|`<none>`|`address`|payloadSigner address of the payload signer|


### feeValidityWindow

Get the fee validity window in seconds. If the fee is older than this window, it is considered invalid and should be regenerated.


```solidity
function feeValidityWindow() public view override returns (uint256);
```
**Returns**

|Name|Type|Description|
|----|----|-----------|
|`<none>`|`uint256`|validityWindow seconds of the fee validity window|


### validate

Validate the transaction receipt


```solidity
function validate(
    Receipt calldata receipt,
    bytes calldata combinedSignatures
)
    public
    view
    override
    readyToValidate
    returns (bool isValid);
```
**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`receipt`|`Receipt`|transaction receipt|
|`combinedSignatures`|`bytes`||

**Returns**

|Name|Type|Description|
|----|----|-----------|
|`isValid`|`bool`|true if the receipt is valid|


### validatePayload

Validate the send payload


```solidity
function validatePayload(
    SendPayload calldata payload,
    bytes calldata signature
)
    public
    view
    override
    readyToValidate
    returns (bool isValid);
```
**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`payload`|`SendPayload`|send payload|
|`signature`|`bytes`|signature of the payload. Must be signed by the payload signer|

**Returns**

|Name|Type|Description|
|----|----|-----------|
|`isValid`|`bool`|true if the payload is valid|


## Structs
### ValidatorStorage

```solidity
struct ValidatorStorage {
    EnumerableSet.AddressSet validators;
    address payloadSigner;
    uint256 feeValidityWindow;
}
```

