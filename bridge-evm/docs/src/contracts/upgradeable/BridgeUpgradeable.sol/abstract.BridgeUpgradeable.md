# BridgeUpgradeable
[Git Source](https://github.com/ambrosus/token-bridge/blob/08ecfb54703230310910522cefe4e0786efed918/contracts/upgradeable/BridgeUpgradeable.sol)

**Inherits:**
[IBridge](/contracts/interface/IBridge.sol/interface.IBridge.md), Initializable, AccessManagedUpgradeable, [NoncesUpgradeable](/contracts/utils/NoncesUpgradeable.sol/abstract.NoncesUpgradeable.md), [TokenManagerUpgradeable](/contracts/upgradeable/TokenManagerUpgradeable.sol/abstract.TokenManagerUpgradeable.md)


## State Variables
### BridgeStorageLocation

```solidity
bytes32 private constant BridgeStorageLocation =
    0x2025cb7006a1cd2283e3d168c03ae6ed5331b2b169fbf566938a066036efbf00;
```


## Functions
### _getBridgeStorage


```solidity
function _getBridgeStorage() private pure returns (BridgeStorage storage $);
```

### __Bridge_init


```solidity
function __Bridge_init(
    address authority_,
    address SAMB_,
    IValidation validator_,
    address payable feeReceiver_,
    uint256 nativeSendAmount_
)
    internal
    onlyInitializing;
```

### __Bridge_init_unchained


```solidity
function __Bridge_init_unchained(
    IValidation validator_,
    address payable feeReceiver_,
    uint256 nativeSendAmount_
)
    internal
    onlyInitializing;
```

### setFeeReceiver

Set the address of the fee receiver


```solidity
function setFeeReceiver(address payable newFeeReceiver)
    public
    override
    restricted;
```
**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`newFeeReceiver`|`address payable`||


### setNativeSendAmount

Set the amount of native currency that should be sent to the receiver in destination chain if needed


```solidity
function setNativeSendAmount(uint256 amount) public override restricted;
```
**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`amount`|`uint256`||


### setValidator

Sets the validator contract


```solidity
function setValidator(IValidation newValidator) public override restricted;
```
**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`newValidator`|`IValidation`||


### addToken

Add token to the bridge


```solidity
function addToken(
    address token,
    bytes32 externalTokenAddress
)
    external
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
|`success`|`bool`|true if the token was added successfully|


### mapExternalToken

Map external token address to token


```solidity
function mapExternalToken(
    bytes32 externalTokenAddress,
    address token
)
    public
    override
    restricted
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
    override
    restricted
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


### addToken

Add token to the bridge


```solidity
function addToken(
    address token,
    bytes32 externalTokenAddress,
    bool paused
)
    public
    override
    restricted
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
    override
    restricted
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
    override
    restricted
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
    override
    restricted
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


### feeReceiver

Get the address of the fee receiver


```solidity
function feeReceiver()
    public
    view
    override
    returns (address payable feeReceiver_);
```
**Returns**

|Name|Type|Description|
|----|----|-----------|
|`feeReceiver_`|`address payable`|feeReceiver address of the fee receiver|


### nativeSendAmount

Amount of native currency that should be sent to the receiver in destination chain if needed


```solidity
function nativeSendAmount()
    public
    view
    override
    returns (uint256 nativeSendAmount_);
```
**Returns**

|Name|Type|Description|
|----|----|-----------|
|`nativeSendAmount_`|`uint256`|nativeSendAmount amount of native currency that should be sent|


### feeValidityWindow

Fee validity window from the validator


```solidity
function feeValidityWindow() public view returns (uint256 validityWindow);
```
**Returns**

|Name|Type|Description|
|----|----|-----------|
|`validityWindow`|`uint256`|fee validity window|


### validator

Get the validator contract


```solidity
function validator() public view returns (IValidation);
```
**Returns**

|Name|Type|Description|
|----|----|-----------|
|`<none>`|`IValidation`|validator address of the validator contract|


### lastEventID

Get the last nonce of the chain transactions


```solidity
function lastEventID() external view override returns (uint256 nonce);
```
**Returns**

|Name|Type|Description|
|----|----|-----------|
|`nonce`|`uint256`|last nonce that was used|


### isClaimed

Check if the receipt is already claimed


```solidity
function isClaimed(Receipt calldata receipt)
    public
    view
    override
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
function isClaimed(bytes32 receiptHash)
    public
    view
    override
    returns (bool claimed);
```
**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`receiptHash`|`bytes32`||

**Returns**

|Name|Type|Description|
|----|----|-----------|
|`claimed`|`bool`|true if the receipt is already claimed|


### _validateSendValues

Guard for validate the send values


```solidity
function _validateSendValues(
    uint256 chainTo,
    SendPayload calldata payload,
    bytes calldata payloadSignature
)
    private
    view;
```
**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`chainTo`|`uint256`|destination chain id|
|`payload`|`SendPayload`|send payload|
|`payloadSignature`|`bytes`|signature of the payload|


### _validateClaim

Validate the claim values


```solidity
function _validateClaim(
    Receipt calldata receipt,
    bytes calldata signature
)
    private
    view;
```
**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`receipt`|`Receipt`|receipt data|
|`signature`|`bytes`|signature of the receipt|


### _markClaimed

Mark the receipt as claimed


```solidity
function _markClaimed(Receipt calldata receipt) private;
```
**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`receipt`|`Receipt`|receipt data|


### _transferTokenToBridge

Manages the transfer of the token to the bridge


```solidity
function _transferTokenToBridge(
    address sender,
    address token,
    uint256 amount,
    SendPayload calldata payload
)
    internal;
```
**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`sender`|`address`|address of the sender|
|`token`|`address`|address of the token|
|`amount`|`uint256`|amount of tokens to send|
|`payload`|`SendPayload`|send payload|


### _sendFee

Send the fee to the fee receiver


```solidity
function _sendFee(uint256 amount) internal;
```
**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`amount`|`uint256`|amount of native currency to send as fee|


### _transferClaim

Transfer the claimed token to the receiver


```solidity
function _transferClaim(
    uint256 flags,
    address token,
    uint256 amount,
    address receiver
)
    private;
```
**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`flags`|`uint256`|flags of the claim|
|`token`|`address`|address of the token|
|`amount`|`uint256`|amount of tokens to send|
|`receiver`|`address`|address of the receiver|


### _send

Perform the send operation (receive tokens and save receipt)


```solidity
function _send(
    bytes32 recipient,
    uint256 chainTo,
    SendPayload calldata payload,
    bytes calldata payloadSignature
)
    internal
    returns (Receipt memory receipt);
```
**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`recipient`|`bytes32`|address of the recipient on the other chain|
|`chainTo`|`uint256`|destination chain id|
|`payload`|`SendPayload`|send payload|
|`payloadSignature`|`bytes`|signature of the payload|


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
    override
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

Send tokens to another chain

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
    override
    returns (Receipt memory receipt);
```
**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`recipient`|`bytes32`|address of the recipient on the other chain (string because of cross-chain compatibility)|
|`chainTo`|`uint256`||
|`payload`|`SendPayload`|payload of sending operation bridge|
|`payloadSignature`|`bytes`|signature of the payload values to validate|
|`_deadline`|`uint256`||
|`v`|`uint8`||
|`r`|`bytes32`||
|`s`|`bytes32`||

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
    override
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


## Structs
### BridgeStorage

```solidity
struct BridgeStorage {
    uint256 nativeSendAmount;
    address payable feeReceiver;
    IValidation validator;
    mapping(bytes32 => bool) claimed;
}
```

