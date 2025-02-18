// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;
pragma abicoder v2;

import "./DeployerBase.s.sol";

import {AccessManager} from
    "@openzeppelin/contracts/access/manager/AccessManager.sol";
import {Strings} from "@openzeppelin/contracts/utils/Strings.sol";

contract DeployAuthority is DeployerBase {

    function run() public override {
        getDeployer();
        vm.startBroadcast(deployer.privateKey);
        (bool deployed, address authorityAddress) =
            checkDeployed("AccessManager");
        if (deployed && !vm.envOr("FORCE_DEPLOY", false)) {
            console.log("AccessManager already deployed at", authorityAddress);
        } else {
            deployAuthority();
        }
        vm.stopBroadcast();
    }

}
