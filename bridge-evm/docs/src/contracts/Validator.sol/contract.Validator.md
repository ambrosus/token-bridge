# Validator
[Git Source](https://github.com/ambrosus/token-bridge/blob/fd78173c03bc3176acad331d668a382df87c32fd/contracts/Validator.sol)

**Inherits:**
[ValidatorUpgradeable](/contracts/upgradeable/ValidatorUpgradeable.sol/contract.ValidatorUpgradeable.md)


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


