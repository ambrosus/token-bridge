// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;
pragma abicoder v2;

import "./DeployerBase.s.sol";

import {AccessManager} from
    "@openzeppelin/contracts/access/manager/AccessManager.sol";
import {Strings} from "@openzeppelin/contracts/utils/Strings.sol";

contract SetValidatorPayloadSigner is DeployerBase {

    function run() public override {
        getDeployer();
        vm.startBroadcast(deployer.privateKey);
        getValidator();
        address signer = vm.envAddress("PAYLOAD_SIGNER");
        validator.setPayloadSigner(signer);
        vm.stopBroadcast();
    }

}
