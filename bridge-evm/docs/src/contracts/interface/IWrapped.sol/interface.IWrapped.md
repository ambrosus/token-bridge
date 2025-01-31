# IWrapped
[Git Source](https://github.com/ambrosus/token-bridge/blob/feca847ded93a058080932a4b6dbb25928c5534c/contracts/interface/IWrapped.sol)

**Inherits:**
IERC20


## Functions
### deposit

Deposit tokens to the contract (a.k.a wrap tokens)

*converts msg.value amount to ERC20 tokens with the same amount*


```solidity
function deposit() external payable;
```

### withdraw

Withdraw tokens from the contract (a.k.a unwrap tokens)

*converts ERC20 tokens to native currency with the same amount*


```solidity
function withdraw(uint256 amount) external;
```
**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`amount`|`uint256`|amount of tokens to withdraw|


## Events
### Deposit

```solidity
event Deposit(address indexed dst, uint256 amount);
```

### Withdrawal

```solidity
event Withdrawal(address indexed src, uint256 amount);
```

