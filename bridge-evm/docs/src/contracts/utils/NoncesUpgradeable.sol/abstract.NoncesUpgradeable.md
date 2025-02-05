# NoncesUpgradeable
[Git Source](https://github.com/ambrosus/token-bridge/blob/fd78173c03bc3176acad331d668a382df87c32fd/contracts/utils/NoncesUpgradeable.sol)

**Inherits:**
Initializable

*Provides tracking nonces for addresses and extending to use with uint256/bytes32. Nonces will only increment.*


## State Variables
### NoncesStorageLocation

```solidity
bytes32 private constant NoncesStorageLocation =
    0x5ab42ced628888259c08ac98db1eb0cf702fc1501344311d8b100cd1bfe4bb00;
```


## Functions
### _getNoncesStorage


```solidity
function _getNoncesStorage() private pure returns (NoncesStorage storage $);
```

### __Nonces_init


```solidity
function __Nonces_init() internal onlyInitializing;
```

### __Nonces_init_unchained


```solidity
function __Nonces_init_unchained() internal onlyInitializing;
```

### nonces

*Returns the next unused nonce for an address.*


```solidity
function nonces(uint256 key) public view virtual returns (uint256);
```

### nonces

*Returns the next unused nonce for an address.*


```solidity
function nonces(address owner) public view virtual returns (uint256);
```

### nonces

*Returns the next unused nonce for an address.*


```solidity
function nonces(bytes32 key) public view virtual returns (uint256);
```

### _useNonce

*Consumes a nonce.
Returns the current value and increments nonce.*


```solidity
function _useNonce(uint256 key) internal virtual returns (uint256);
```

### _useNonce

*Consumes a nonce.
Returns the current value and increments nonce.*


```solidity
function _useNonce(address owner) internal virtual returns (uint256);
```

### _useNonce

*Consumes a nonce.
Returns the current value and increments nonce.*


```solidity
function _useNonce(bytes32 key) internal virtual returns (uint256);
```

### _useCheckedNonce

*Same as [_useNonce](/contracts/utils/NoncesUpgradeable.sol/abstract.NoncesUpgradeable.md#_usenonce) but checking that `nonce` is the next valid for `owner`.*


```solidity
function _useCheckedNonce(uint256 key, uint256 nonce) internal virtual;
```

### _useCheckedNonce

*Same as [_useNonce](/contracts/utils/NoncesUpgradeable.sol/abstract.NoncesUpgradeable.md#_usenonce) but checking that `nonce` is the next valid for `owner`.*


```solidity
function _useCheckedNonce(address owner, uint256 nonce) internal virtual;
```

### _useCheckedNonce

*Same as [_useNonce](/contracts/utils/NoncesUpgradeable.sol/abstract.NoncesUpgradeable.md#_usenonce) but checking that `nonce` is the next valid for `owner`.*


```solidity
function _useCheckedNonce(bytes32 key, uint256 nonce) internal virtual;
```

## Errors
### InvalidAccountNonce
*The nonce used for an `key` is not the expected current nonce.*


```solidity
error InvalidAccountNonce(uint256 key, uint256 currentNonce);
```

## Structs
### NoncesStorage
**Note:**
storage-location: erc7201:openzeppelin.storage.Nonces


```solidity
struct NoncesStorage {
    mapping(uint256 key => uint256) _nonces;
}
```

