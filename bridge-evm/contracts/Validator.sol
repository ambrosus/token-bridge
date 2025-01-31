// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {ValidatorUpgradeable} from "./upgradeable/ValidatorUpgradeable.sol";

contract Validator is ValidatorUpgradeable {

    /// Initialize the contract with the given parameters
    /// @param authority_ address of the authority contract [AccessManager](https://docs.openzeppelin.com/contracts/5.x/access-control#access-management)
    /// @param validators_ address of the validator contract
    /// @param payloadSigner_ address of the payload signer
    /// @param feeValidityWindow_ fee validity window
    function initialize(
        address authority_,
        address[] calldata validators_,
        address payloadSigner_,
        uint256 feeValidityWindow_
    )
        public
        initializer
    {
        __Validator_init(
            authority_, validators_, payloadSigner_, feeValidityWindow_
        );
    }

}
