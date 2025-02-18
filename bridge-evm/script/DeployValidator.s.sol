// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;
pragma abicoder v2;

import "./DeployerBase.s.sol";

import {AccessManager} from
    "@openzeppelin/contracts/access/manager/AccessManager.sol";
import {Strings} from "@openzeppelin/contracts/utils/Strings.sol";

contract DeployValidator is DeployerBase {

    function run() public override {
        getDeployer();
        vm.startBroadcast(deployer.privateKey);

        getAuthority();

        (bool deployed, address validatorAddress) = checkDeployed("Validator");
        if (deployed && !vm.envOr("FORCE_DEPLOY", false)) {
            console.log("Validator already deployed at", validatorAddress);
        } else {
            deployValidator();
        }
        vm.stopBroadcast();
    }

}
