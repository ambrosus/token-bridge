// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {IValidation} from "./interface/IValidation.sol";

import {BridgeUpgradeable} from "./upgradeable/BridgeUpgradeable.sol";

contract Bridge is BridgeUpgradeable {

    /// Initialize the contract with the given parameters
    /// @param authority_ address of the authority contract [AccessManager](https://docs.openzeppelin.com/contracts/5.x/access-control#access-management)
    /// @param SAMB_ address of the Wrapped token contract
    /// @param validator_ address of the validator contract
    /// @param feeReceiver_ address of the fee receiver
    /// @param nativeSendAmount_ amount of native currency to send to the receiver in destination chain (here) if needed
    function initialize(
        address authority_,
        address SAMB_,
        IValidation validator_,
        address payable feeReceiver_,
        uint256 nativeSendAmount_
    )
        public
        initializer
    {
        __Bridge_init(
            authority_, SAMB_, validator_, feeReceiver_, nativeSendAmount_
        );
    }

}
