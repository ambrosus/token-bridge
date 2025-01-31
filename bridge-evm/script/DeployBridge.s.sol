// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;
pragma abicoder v2;

import "./DeployerBase.s.sol";

import {AccessManager} from
    "@openzeppelin/contracts/access/manager/AccessManager.sol";
import {Strings} from "@openzeppelin/contracts/utils/Strings.sol";

contract DeployBridge is DeployerBase {

    function run() public override {
        vm.startBroadcast();

        getAuthority();
        getValidator();

        (bool deployed, address bridgeAddress) = checkDeployed("Bridge");
        if (deployed && !vm.envOr("FORCE_DEPLOY", false)) {
            console.log("Bridge already deployed at", bridgeAddress);
        } else {
            deployBridge();
        }
        vm.stopBroadcast();
    }

}
