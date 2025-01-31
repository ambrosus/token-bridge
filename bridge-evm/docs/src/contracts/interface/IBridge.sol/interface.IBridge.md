# IBridge
[Git Source](https://github.com/ambrosus/token-bridge/blob/feca847ded93a058080932a4b6dbb25928c5534c/contracts/interface/IBridge.sol)

**Inherits:**
[IBridgeTypes](/contracts/interface/IBridgeTypes.sol/interface.IBridgeTypes.md)


## Functions
### nextEventID

Get the last nonce of the chain transactions


```solidity
function nextEventID() external view returns (uint256 nonce);
```
**Returns**

|Name|Type|Description|
|----|----|-----------|
|`nonce`|`uint256`|last nonce that was used|


### send

Send tokens to another chain

*This function should be called by the user who wants to send tokens to another chain.
It transfers the tokens to the contract, and validates fee amount that was sent and emits a `TokensLocked` event.
The function should be payable to receive the fee in native currency.*


```solidity
function send(
    bytes32 recipient,
    uint256 chainTo,
    SendPayload calldata payload,
    bytes calldata payloadSignature
)
    external
    payable
    returns (Receipt memory receipt);
```
**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`recipient`|`bytes32`|address of the recipient on the other chain (string because of cross-chain compatibility)|
|`chainTo`|`uint256`||
|`payload`|`SendPayload`|payload of sending operation bridge|
|`payloadSignature`|`bytes`|signature of the payload values to validate|

**Returns**

|Name|Type|Description|
|----|----|-----------|
|`receipt`|`Receipt`|data of the transaction which will be signed and sent to the other chain|


### send

Send tokens to another chain with permit params

*This function should be called by the user who wants to send tokens to another chain.
It transfers the tokens to the contract, and validates fee amount that was sent and emits a `TokensLocked` event.
The function should be payable to receive the fee in native currency.*


```solidity
function send(
    bytes32 recipient,
    uint256 chainTo,
    SendPayload calldata payload,
    bytes calldata payloadSignature,
    uint256 _deadline,
    uint8 v,
    bytes32 r,
    bytes32 s
)
    external
    payable
    returns (Receipt memory receipt);
```
**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`recipient`|`bytes32`|address of the recipient on the other chain (string because of cross-chain compatibility)|
|`chainTo`|`uint256`||
|`payload`|`SendPayload`|payload of sending operation bridge|
|`payloadSignature`|`bytes`|signature of the payload values to validate|
|`_deadline`|`uint256`|deadline of the permit|
|`v`|`uint8`|v of the permit ECDSA signature|
|`r`|`bytes32`|r of the permit ECDSA signature|
|`s`|`bytes32`|s of the permit ECDSA signature|

**Returns**

|Name|Type|Description|
|----|----|-----------|
|`receipt`|`Receipt`|data of the transaction which will be signed and sent to the other chain|


### claim

Claim tokens from another chain

*This function should be called by the user who wants to claim tokens from another chain.
It claims the tokens from the contract, and emits a `TokenUnlocked` event.*


```solidity
function claim(
    Receipt calldata receipt,
    bytes calldata signature
)
    external
    returns (bool success);
```
**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`receipt`|`Receipt`|Receipt of the transaction to claim|
|`signature`|`bytes`|MPC signature of the payload|

**Returns**

|Name|Type|Description|
|----|----|-----------|
|`success`|`bool`|true if the claim was successful|


### isClaimed

Check if the receipt is already claimed


```solidity
function isClaimed(Receipt calldata receipt)
    external
    view
    returns (bool claimed);
```
**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`receipt`|`Receipt`|Receipt of the transaction to check|

**Returns**

|Name|Type|Description|
|----|----|-----------|
|`claimed`|`bool`|true if the receipt is already claimed|


### isClaimed

Check if the receipt is already claimed


```solidity
function isClaimed(bytes32 hash) external view returns (bool claimed);
```
**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`hash`|`bytes32`|hash of the receipt to check|

**Returns**

|Name|Type|Description|
|----|----|-----------|
|`claimed`|`bool`|true if the receipt is already claimed|


### feeReceiver

Get the address of the fee receiver


```solidity
function feeReceiver() external view returns (address payable feeReceiver);
```
**Returns**

|Name|Type|Description|
|----|----|-----------|
|`feeReceiver`|`address payable`|address of the fee receiver|


### nativeSendAmount

Amount of native currency that should be sent to the receiver in destination chain if needed


```solidity
function nativeSendAmount() external view returns (uint256 nativeSendAmount);
```
**Returns**

|Name|Type|Description|
|----|----|-----------|
|`nativeSendAmount`|`uint256`|amount of native currency that should be sent|


### validator

Get the validator contract


```solidity
function validator() external view returns (IValidation validator);
```
**Returns**

|Name|Type|Description|
|----|----|-----------|
|`validator`|`IValidation`|address of the validator contract|


### setFeeReceiver

Set the address of the fee receiver


```solidity
function setFeeReceiver(address payable _feeReceiver) external;
```
**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`_feeReceiver`|`address payable`|address of the fee receiver|


### setNativeSendAmount

Set the amount of native currency that should be sent to the receiver in destination chain if needed


```solidity
function setNativeSendAmount(uint256 _nativeSendAmount) external;
```
**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`_nativeSendAmount`|`uint256`|amount of native currency that should be sent|


### setValidator

Sets the validator contract


```solidity
function setValidator(IValidation validator) external;
```
**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`validator`|`IValidation`|address of the validator contract|


## Events
### TokenLocked
Emits when tokens are locked in the contract


```solidity
event TokenLocked(Receipt receipt);
```

### TokenUnlocked
Emits when tokens are claimed from the contract


```solidity
event TokenUnlocked(Receipt receipt);
```

## Errors
### InvalidPermitFlag
Reverts if passed permit signature without permit flag


```solidity
error InvalidPermitFlag();
```

### Claimed
Reverts if receipt is already claimed


```solidity
error Claimed(bytes32 hash);
```

**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`hash`|`bytes32`|hash of the receipt|

### InvalidChain
Reverts when the chain ID is invalid


```solidity
error InvalidChain();
```

### TransferFailed
Reverts failed transfer of tokens


```solidity
error TransferFailed();
```

### SendFailed
Reverts failed send of native currency


```solidity
error SendFailed();
```

### InvalidValueSent
Reverts when the value sent is invalid


```solidity
error InvalidValueSent(uint256 value, uint256 expectedValue);
```

**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`value`|`uint256`|sent value|
|`expectedValue`|`uint256`|expected value|

### InvalidAmount
Reverts when the amount is invalid (e.g. zero)


```solidity
error InvalidAmount();
```

