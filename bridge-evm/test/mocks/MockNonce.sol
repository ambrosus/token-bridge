// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import {NoncesUpgradeable} from "../../contracts/utils/NoncesUpgradeable.sol";

contract MockNonce is NoncesUpgradeable {

    function initialize() public initializer {
        __Nonces_init_unchained();
    }

    function useNonce(address owner) public returns (uint256) {
        return _useNonce(owner);
    }

    function useNonce(bytes32 key) public returns (uint256) {
        return _useNonce(key);
    }

    function useNonce(uint256 key) public returns (uint256) {
        return _useNonce(key);
    }

    function useCheckedNonce(address owner, uint256 nonce) public {
        return _useCheckedNonce(owner, nonce);
    }

    function useCheckedNonce(bytes32 key, uint256 nonce) public {
        return _useCheckedNonce(key, nonce);
    }

    function useCheckedNonce(uint256 key, uint256 nonce) public {
        return _useCheckedNonce(key, nonce);
    }

}
