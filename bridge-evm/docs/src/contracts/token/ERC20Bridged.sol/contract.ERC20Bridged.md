# ERC20Bridged
[Git Source](https://github.com/ambrosus/token-bridge/blob/feca847ded93a058080932a4b6dbb25928c5534c/contracts/token/ERC20Bridged.sol)

**Inherits:**
ERC20Permit


## State Variables
### _decimals
*The number of decimals for the token*


```solidity
uint8 private _decimals;
```


### _bridgeAddress
*The address of the bridge contract*


```solidity
address private _bridgeAddress;
```


## Functions
### constructor


```solidity
constructor(
    string memory name_,
    string memory symbol_,
    uint8 decimals_,
    address bridge_
)
    ERC20(name_, symbol_)
    ERC20Permit(name_);
```

### decimals

*Returns the number of decimals used to get its user representation.
For example, if `decimals` equals `2`, a balance of `505` tokens should
be displayed to a user as `5.05` (`505 / 10 ** 2`).
NOTE: This information is only used for _display_ purposes: it in
no way affects any of the arithmetic of the contract, including
[IERC20-balanceOf](/lib/forge-std/test/StdCheats.t.sol/contract.BarERC1155.md#balanceof) and {IERC20-transfer}.*


```solidity
function decimals() public view override returns (uint8 decimals_);
```
**Returns**

|Name|Type|Description|
|----|----|-----------|
|`decimals_`|`uint8`|the number of decimals of the token|


### bridge

*Returns the address of the bridge contract.
This address is used to mint and burn tokens.*


```solidity
function bridge() public view returns (address bridgeAddress);
```
**Returns**

|Name|Type|Description|
|----|----|-----------|
|`bridgeAddress`|`address`|the address of the bridge contract|


### _update

*Transfers a `value` amount of tokens from `from` to `to`, or alternatively mints (or burns) if `from`
(or `to`) is the `bridge` address. (This is the only difference from the {ERC20} implementation.)
Emits a {Transfer} event.*


```solidity
function _update(address from, address to, uint256 value) internal override;
```

