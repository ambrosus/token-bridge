# BridgeTypes
[Git Source](https://github.com/ambrosus/token-bridge/blob/c9e5c0649869e1d0d7d463cf7e74634fda87430d/contracts/interface/BridgeTypes.sol)


## Structs
### FullReceipt
Bridge transaction receipt structure that is used for locking tokens


```solidity
struct FullReceipt {
    bytes32 from;
    bytes32 to;
    bytes32 tokenAddressFrom;
    bytes32 tokenAddressTo;
    uint256 amountFrom;
    uint256 amountTo;
    uint256 chainFrom;
    uint256 chainTo;
    uint256 eventId;
    uint256 flags;
    bytes data;
}
```

**Properties**

|Name|Type|Description|
|----|----|-----------|
|`from`|`bytes32`|source address|
|`to`|`bytes32`|destination address|
|`tokenAddressFrom`|`bytes32`||
|`tokenAddressTo`|`bytes32`||
|`amountFrom`|`uint256`||
|`amountTo`|`uint256`||
|`chainFrom`|`uint256`|chain id of the source chain|
|`chainTo`|`uint256`|chain id of the destination chain|
|`eventId`|`uint256`|transaction number|
|`flags`|`uint256`|flags for receiver|
|`data`|`bytes`|additional data of the transaction (eg. user nonce for Solana)|

### MiniReceipt
Bridge transaction cropped receipt structure that is used for validation and unlocking tokens


```solidity
struct MiniReceipt {
    bytes32 to;
    bytes32 tokenAddressTo;
    uint256 amountTo;
    uint256 chainFrom;
    uint256 chainTo;
    uint256 eventId;
    uint256 flags;
    bytes data;
}
```

**Properties**

|Name|Type|Description|
|----|----|-----------|
|`to`|`bytes32`|destination address|
|`tokenAddressTo`|`bytes32`|dest token address|
|`amountTo`|`uint256`|amount of tokens sent|
|`chainFrom`|`uint256`|chain id of the source chain|
|`chainTo`|`uint256`|chain id of the destination chain|
|`eventId`|`uint256`|transaction number|
|`flags`|`uint256`|flags for receiver|
|`data`|`bytes`|additional data of the transaction (eg. user nonce for Solana)|

### SendPayload
Fee structure that is used for signing and validation


```solidity
struct SendPayload {
    uint256 destChainId;
    bytes32 tokenAddress;
    bytes32 externalTokenAddress;
    uint256 amountToSend;
    uint256 feeAmount;
    uint256 timestamp;
    uint256 flags;
    bytes flagData;
}
```

**Properties**

|Name|Type|Description|
|----|----|-----------|
|`destChainId`|`uint256`||
|`tokenAddress`|`bytes32`|address of the token contract|
|`externalTokenAddress`|`bytes32`||
|`amountToSend`|`uint256`|amount of the tokens to be sent|
|`feeAmount`|`uint256`|amount of the fee|
|`timestamp`|`uint256`|timestamp of the fee was generated|
|`flags`|`uint256`|flags of the sending operation|
|`flagData`|`bytes`||

