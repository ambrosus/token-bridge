# Validator
[Git Source](https://github.com/ambrosus/token-bridge/blob/c9e5c0649869e1d0d7d463cf7e74634fda87430d/contracts/Validator.sol)

**Inherits:**
[ValidatorUpgradeable](/contracts/upgradeable/ValidatorUpgradeable.sol/abstract.ValidatorUpgradeable.md)


## Functions
### initialize

Initialize the contract with the given parameters


```solidity
function initialize(
    address authority_,
    address[] calldata validators_,
    address payloadSigner_,
    uint256 feeValidityWindow_
)
    public
    initializer;
```
**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`authority_`|`address`|address of the authority contract [AccessManager](https://docs.openzeppelin.com/contracts/5.x/access-control#access-management)|
|`validators_`|`address[]`|address of the validator contract|
|`payloadSigner_`|`address`|address of the payload signer|
|`feeValidityWindow_`|`uint256`|fee validity window|


