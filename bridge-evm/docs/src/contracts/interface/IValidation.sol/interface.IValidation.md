# IValidation
[Git Source](https://github.com/ambrosus/token-bridge/blob/fd78173c03bc3176acad331d668a382df87c32fd/contracts/interface/IValidation.sol)

**Inherits:**
[IBridgeTypes](/contracts/interface/IBridgeTypes.sol/interface.IBridgeTypes.md)


## Functions
### setPayloadSigner

Set the address of the payload signer


```solidity
function setPayloadSigner(address _payloadSigner)
    external
    returns (bool success);
```
**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`_payloadSigner`|`address`|address of the payload signer|

**Returns**

|Name|Type|Description|
|----|----|-----------|
|`success`|`bool`|true if the payload signer was set|


### setFeeValidityWindow

Set the fee validity window in seconds


```solidity
function setFeeValidityWindow(uint256 _validityWindow)
    external
    returns (bool success);
```
**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`_validityWindow`|`uint256`|seconds of the fee validity window|

**Returns**

|Name|Type|Description|
|----|----|-----------|
|`success`|`bool`|true if the fee validity window was set|


### payloadSigner

Get the address of the payload signer


```solidity
function payloadSigner() external view returns (address payloadSigner);
```
**Returns**

|Name|Type|Description|
|----|----|-----------|
|`payloadSigner`|`address`|address of the payload signer|


### feeValidityWindow

Get the fee validity window in seconds. If the fee is older than this window, it is considered invalid and should be regenerated.


```solidity
function feeValidityWindow() external view returns (uint256 validityWindow);
```
**Returns**

|Name|Type|Description|
|----|----|-----------|
|`validityWindow`|`uint256`|seconds of the fee validity window|


### validate

Validate the transaction receipt


```solidity
function validate(
    Receipt memory receipt,
    bytes memory signature
)
    external
    view
    returns (bool isValid);
```
**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`receipt`|`Receipt`|transaction receipt|
|`signature`|`bytes`|signature of the receipt. Must be signed by all validators|

**Returns**

|Name|Type|Description|
|----|----|-----------|
|`isValid`|`bool`|true if the receipt is valid|


### validatePayload

Validate the send payload


```solidity
function validatePayload(
    SendPayload memory payload,
    bytes memory signature
)
    external
    view
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


## Events
### PayloadSignerChanged
Emits when the payload signer is changed


```solidity
event PayloadSignerChanged(address changer, address payloadSigner);
```

**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`changer`|`address`|Who changed the payload signer|
|`payloadSigner`|`address`|New payload signer address|

### FeeValidityWindowChanged
Emits when the fee validity window is changed


```solidity
event FeeValidityWindowChanged(address changer, uint256 validityWindow);
```

**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`changer`|`address`|Who changed the fee validity window|
|`validityWindow`|`uint256`|New fee validity window in seconds|

## Errors
### UnknownSigner
Reverts if the payload signer is unknown


```solidity
error UnknownSigner(address signer);
```

**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`signer`|`address`|address of the signer|

