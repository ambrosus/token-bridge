# IBridge
[Git Source](https://github.com/ambrosus/token-bridge/blob/c9e5c0649869e1d0d7d463cf7e74634fda87430d/contracts/interface/IBridge.sol)

**Inherits:**
[BridgeTypes](/contracts/interface/BridgeTypes.sol/interface.BridgeTypes.md)


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
    SendPayload calldata payload,
    bytes calldata payloadSignature
)
    external
    payable
    returns (FullReceipt memory receipt);
```
**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`recipient`|`bytes32`|address of the recipient on the other chain (string because of cross-chain compatibility)|
|`payload`|`SendPayload`|payload of sending operation bridge|
|`payloadSignature`|`bytes`|signature of the payload values to validate|

**Returns**

|Name|Type|Description|
|----|----|-----------|
|`receipt`|`FullReceipt`|data of the transaction which will be signed and sent to the other chain|


### send

Send tokens to another chain with permit params

*This function should be called by the user who wants to send tokens to another chain.
It transfers the tokens to the contract, and validates fee amount that was sent and emits a `TokensLocked` event.
The function should be payable to receive the fee in native currency.*


```solidity
function send(
    bytes32 recipient,
    SendPayload calldata payload,
    bytes calldata payloadSignature,
    uint256 _deadline,
    uint8 v,
    bytes32 r,
    bytes32 s
)
    external
    payable
    returns (FullReceipt memory receipt);
```
**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`recipient`|`bytes32`|address of the recipient on the other chain (string because of cross-chain compatibility)|
|`payload`|`SendPayload`|payload of sending operation bridge|
|`payloadSignature`|`bytes`|signature of the payload values to validate|
|`_deadline`|`uint256`|deadline of the permit|
|`v`|`uint8`|v of the permit ECDSA signature|
|`r`|`bytes32`|r of the permit ECDSA signature|
|`s`|`bytes32`|s of the permit ECDSA signature|

**Returns**

|Name|Type|Description|
|----|----|-----------|
|`receipt`|`FullReceipt`|data of the transaction which will be signed and sent to the other chain|


### claim

Claim tokens from another chain

*This function should be called by the user who wants to claim tokens from another chain.
It claims the tokens from the contract, and emits a `TokenUnlocked` event.*


```solidity
function claim(
    MiniReceipt calldata receipt,
    bytes calldata signature
)
    external
    returns (bool success);
```
**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`receipt`|`MiniReceipt`|`MiniReceipt` of the transaction to claim|
|`signature`|`bytes`|signature of the payload|

**Returns**

|Name|Type|Description|
|----|----|-----------|
|`success`|`bool`|true if the claim was successful|


### claim

Claim tokens from another chain

*This function should be called by the user who wants to claim tokens from another chain.
It claims the tokens from the contract, and emits a `TokenUnlocked` event.*


```solidity
function claim(
    FullReceipt calldata receipt,
    bytes calldata signature
)
    external
    returns (bool success);
```
**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`receipt`|`FullReceipt`|`FullReceipt` of the transaction to claim|
|`signature`|`bytes`|signature of the payload|

**Returns**

|Name|Type|Description|
|----|----|-----------|
|`success`|`bool`|true if the claim was successful|


### isClaimed

Check if the receipt is already claimed


```solidity
function isClaimed(FullReceipt calldata receipt)
    external
    view
    returns (bool claimed);
```
**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`receipt`|`FullReceipt`|`FullReceipt` of the transaction to check|

**Returns**

|Name|Type|Description|
|----|----|-----------|
|`claimed`|`bool`|true if the receipt is already claimed|


### isClaimed

Check if the receipt is already claimed


```solidity
function isClaimed(MiniReceipt calldata receipt)
    external
    view
    returns (bool claimed);
```
**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`receipt`|`MiniReceipt`|`MiniReceipt` of the transaction to check|

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
event TokenLocked(FullReceipt receipt);
```

### TokenUnlocked
Emits when tokens are claimed from the contract


```solidity
event TokenUnlocked(MiniReceipt receipt);
```

### FeeReceiverChanged
Emits when the fee receiver is changed


```solidity
event FeeReceiverChanged(
    address indexed changer, address indexed newFeeReceiver
);
```

**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`changer`|`address`|Who changed the fee receiver|
|`newFeeReceiver`|`address`|New fee receiver address|

### NativeSendAmountChanged
Emits when the native send amount is changed


```solidity
event NativeSendAmountChanged(
    address indexed changer, uint256 newNativeSendAmount
);
```

**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`changer`|`address`|Who changed the native send amount|
|`newNativeSendAmount`|`uint256`|New native send amount|

### ValidatorChanged
Emits when the validator contract is changed


```solidity
event ValidatorChanged(address indexed changer, address indexed newValidator);
```

**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`changer`|`address`|Who changed the validator contract|
|`newValidator`|`address`|New validator contract address|

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

