# IBridgeTypes
[Git Source](https://github.com/ambrosus/token-bridge/blob/fd78173c03bc3176acad331d668a382df87c32fd/contracts/interface/IBridgeTypes.sol)


## Structs
### Receipt
Bridge transaction receipt structure that is used for signing and validation


```solidity
struct Receipt {
    bytes32 from;
    bytes32 to;
    bytes32 tokenAddress;
    uint256 amount;
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
|`tokenAddress`|`bytes32`|source token address|
|`amount`|`uint256`|amount of tokens sent|
|`chainFrom`|`uint256`|chain id of the source chain|
|`chainTo`|`uint256`|chain id of the destination chain|
|`eventId`|`uint256`|transaction number|
|`flags`|`uint256`|flags for receiver|
|`data`|`bytes`|additional data of the transaction (eg. user nonce for Solana)|

### SendPayload
Fee structure that is used for signing and validation


```solidity
struct SendPayload {
    bytes32 tokenAddress;
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
|`tokenAddress`|`bytes32`|address of the token contract|
|`amountToSend`|`uint256`|amount of the tokens to be sent|
|`feeAmount`|`uint256`|amount of the fee|
|`timestamp`|`uint256`|timestamp of the fee was generated|
|`flags`|`uint256`|flags of the sending operation|
|`flagData`|`bytes`||

