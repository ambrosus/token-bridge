// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;
pragma abicoder v2;

import "./DeployerBase.s.sol";

import {AccessManager} from
    "@openzeppelin/contracts/access/manager/AccessManager.sol";
import {Strings} from "@openzeppelin/contracts/utils/Strings.sol";

contract SetValidatorRelaySigner is DeployerBase {

    function run() public override {
        getDeployer();
        vm.startBroadcast(deployer.privateKey);
        getValidator();
        address[] memory signers = vm.envAddress("VALIDATORS", ",");
        for (uint256 i = 0; i < signers.length; i++) {
            require(signers[i] != address(0), "Zero address not allowed");
            validator.addValidator(signers[i]);
        }
        vm.stopBroadcast();
    }

}
