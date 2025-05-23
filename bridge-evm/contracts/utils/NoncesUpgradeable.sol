// SPDX-License-Identifier: MIT
// OpenZeppelin Contracts (last updated v5.0.0) (utils/Nonces.sol)
// Forked by AirDAO
pragma solidity ^0.8.20;

import {Initializable} from
    "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

/**
 * @dev Provides tracking nonces for addresses and extending to use with uint256/bytes32. Nonces will only increment.
 */
abstract contract NoncesUpgradeable is Initializable {

    /**
     * @dev The nonce used for an `key` is not the expected current nonce.
     */
    error InvalidAccountNonce(uint256 key, uint256 currentNonce);

    /// @custom:storage-location erc7201:openzeppelin.storage.Nonces
    struct NoncesStorage {
        mapping(uint256 key => uint256) _nonces;
    }

    // keccak256(abi.encode(uint256(keccak256("openzeppelin.storage.Nonces")) - 1)) & ~bytes32(uint256(0xff))
    bytes32 private constant NoncesStorageLocation =
        0x5ab42ced628888259c08ac98db1eb0cf702fc1501344311d8b100cd1bfe4bb00;

    function _getNoncesStorage()
        private
        pure
        returns (NoncesStorage storage $)
    {
        assembly {
            $.slot := NoncesStorageLocation
        }
    }

    function __Nonces_init() internal onlyInitializing {}

    function __Nonces_init_unchained() internal onlyInitializing {}

    /**
     * @dev Returns the next unused nonce for an address.
     */
    function nonces(
        uint256 key
    ) public view virtual returns (uint256) {
        NoncesStorage storage $ = _getNoncesStorage();
        return $._nonces[key];
    }

    /**
     * @dev Returns the next unused nonce for an address.
     */
    function nonces(
        address owner
    ) public view virtual returns (uint256) {
        return nonces(uint256(uint160(owner)));
    }

    /**
     * @dev Returns the next unused nonce for an address.
     */
    function nonces(
        bytes32 key
    ) public view virtual returns (uint256) {
        return nonces(uint256(key));
    }

    /**
     * @dev Consumes a nonce.
     *
     * Returns the current value and increments nonce.
     */
    function _useNonce(
        uint256 key
    ) internal virtual returns (uint256) {
        NoncesStorage storage $ = _getNoncesStorage();
        // For each account, the nonce has an initial value of 0, can only be incremented by one, and cannot be
        // decremented or reset. This guarantees that the nonce never overflows.
        unchecked {
            // It is important to do x++ and not ++x here.
            return $._nonces[key]++;
        }
    }

    /**
     * @dev Consumes a nonce.
     *
     * Returns the current value and increments nonce.
     */
    function _useNonce(
        address owner
    ) internal virtual returns (uint256) {
        return _useNonce(uint256(uint160(owner)));
    }

    /**
     * @dev Consumes a nonce.
     *
     * Returns the current value and increments nonce.
     */
    function _useNonce(
        bytes32 key
    ) internal virtual returns (uint256) {
        return _useNonce(uint256(key));
    }

    /**
     * @dev Same as {_useNonce} but checking that `nonce` is the next valid for `owner`.
     */
    function _useCheckedNonce(uint256 key, uint256 nonce) internal virtual {
        uint256 current = _useNonce(key);
        if (nonce != current) {
            revert InvalidAccountNonce(key, current);
        }
    }

    /**
     * @dev Same as {_useNonce} but checking that `nonce` is the next valid for `owner`.
     */
    function _useCheckedNonce(address owner, uint256 nonce) internal virtual {
        _useCheckedNonce(uint256(uint160(owner)), nonce);
    }

    /**
     * @dev Same as {_useNonce} but checking that `nonce` is the next valid for `owner`.
     */
    function _useCheckedNonce(bytes32 key, uint256 nonce) internal virtual {
        _useCheckedNonce(uint256(key), nonce);
    }

}
