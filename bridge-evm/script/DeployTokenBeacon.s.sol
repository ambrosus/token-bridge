// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;
pragma abicoder v2;

import "./DeployerBase.s.sol";

import {AccessManager} from
    "@openzeppelin/contracts/access/manager/AccessManager.sol";
import {Strings} from "@openzeppelin/contracts/utils/Strings.sol";

contract DeployTokenBeacon is DeployerBase {

    function run() public override {
        getDeployer();
        vm.startBroadcast(deployer.privateKey);

        (bool deployed, address beaconAddress) = checkDeployed("TokenBeacon");
        if (deployed && !vm.envOr("FORCE_DEPLOY", false)) {
            console.log("TokenBeacon already deployed at", beaconAddress);
        } else {
            deployTokenBeacon();
        }
        vm.stopBroadcast();
    }

}
