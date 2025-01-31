// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;
pragma abicoder v2;

import "forge-std/Script.sol";

import {Upgrades} from "openzeppelin-foundry-upgrades/Upgrades.sol";

import {AccessManager} from
    "@openzeppelin/contracts/access/manager/AccessManager.sol";
import {Strings} from "@openzeppelin/contracts/utils/Strings.sol";

import {Bridge} from "../contracts/Bridge.sol";
import {Validator} from "../contracts/Validator.sol";

contract DeployerBase is Script {

    AccessManager authority;
    Validator validator;
    Bridge bridge;

    function checkDeployed(string memory contractName)
        public
        view
        returns (bool, address)
    {
        try vm.getDeployment(contractName) returns (address contractAddress) {
            console.log(contractName, "already deployed at", contractAddress);
            return (true, contractAddress);
        } catch {
            console.log(contractName, "not deployed");
            return (false, address(0));
        }
    }

    function setAuthorityAdmin(address adminCandidate)
        public
        returns (bool adminGranted)
    {
        (bool isAdmin,) =
            authority.hasRole(authority.ADMIN_ROLE(), adminCandidate);
        if (!isAdmin) {
            console.log("Address", adminCandidate, "is not an admin");
            (bool isSenderAdmin,) =
                authority.hasRole(authority.ADMIN_ROLE(), adminCandidate);
            if (isSenderAdmin) {
                console.log("Sender can add the admin");
                string memory confirm = vm.prompt(
                    "Do you want grant role to the admin candidate? (y/n)"
                );
                if (
                    Strings.equal(confirm, "y") || Strings.equal(confirm, "Y")
                        || Strings.equal(confirm, "yes")
                        || Strings.equal(confirm, "Yes")
                ) {
                    authority.grantRole(
                        authority.ADMIN_ROLE(), adminCandidate, 0
                    );
                    console.log("Admin role granted to", adminCandidate);
                }
            } else {
                console.log("Sender is not an admin");
                return false;
            }
        } else {
            console.log("Address", adminCandidate, "is already an admin");
        }
        return true;
    }

    function removeAuthorityAdmin(address adminCandidate)
        public
        returns (bool adminRemoved)
    {
        (bool isAdmin,) =
            authority.hasRole(authority.ADMIN_ROLE(), adminCandidate);
        if (isAdmin) {
            (bool isSenderAdmin,) =
                authority.hasRole(authority.ADMIN_ROLE(), adminCandidate);
            if (isSenderAdmin) {
                authority.revokeRole(authority.ADMIN_ROLE(), adminCandidate);
                console.log("Admin revoked granted to", adminCandidate);
            } else {
                console.log("Sender is not an admin");
                return false;
            }
        } else {
            console.log("Address", adminCandidate, "is already not an admin");
        }
        return true;
    }

    function deployAuthority() public returns (AccessManager) {
        address admin = vm.envOr("AUTHORITY_ADMIN", msg.sender);
        authority = new AccessManager(admin);
        console.log("AccessManager deployed at", address(authority));
        return authority;
    }

    function deployValidator() public returns (Validator) {
        address[] memory validators =
            vm.envOr("VALIDATORS", ",", new address[](0));
        address payloadSigner = vm.envOr("PAYLOAD_SIGNER", address(0));
        uint256 feeValidityWindow = vm.envOr("FEE_VALIDITY_WINDOW", uint256(0));

        address proxy = address(
            Upgrades.deployUUPSProxy(
                "Validator.sol",
                abi.encodeCall(
                    Validator.initialize,
                    (
                        address(authority),
                        validators,
                        payloadSigner,
                        feeValidityWindow
                    )
                )
            )
        );
        validator = Validator(proxy);
        console.log("Validator deployed at:", address(validator));
        console.log(
            "   Implementation address:",
            Upgrades.getImplementationAddress(proxy)
        );
        return validator;
    }

    function deployBridge() public returns (Bridge) {
        address wrappedToken = vm.envAddress("WRAPPED_TOKEN");
        address payable feeReceiver =
            payable(vm.envOr("FEE_RECEIVER", address(0)));
        uint256 nativeSendAmount = vm.envOr("NATIVE_SEND_AMOUNT", uint256(0));
        address payable proxy = payable(
            address(
                Upgrades.deployUUPSProxy(
                    "Bridge.sol",
                    abi.encodeCall(
                        Bridge.initialize,
                        (
                            address(authority),
                            wrappedToken,
                            validator,
                            feeReceiver,
                            nativeSendAmount
                        )
                    )
                )
            )
        );
        bridge = Bridge(proxy);
        console.log("Bridge deployed at:", address(bridge));
        console.log(
            "   Implementation address:",
            Upgrades.getImplementationAddress(proxy)
        );
        return bridge;
    }

    function getAuthority() public returns (AccessManager) {
        (bool deployed, address authorityAddress) =
            checkDeployed("AccessManager");
        if (deployed) {
            authority = AccessManager(authorityAddress);
        } else {
            authority = deployAuthority();
        }
        return authority;
    }

    function getValidator() public returns (Validator) {
        (bool deployed, address validatorAddress) = checkDeployed("Validator");
        if (deployed) {
            validator = Validator(validatorAddress);
        } else {
            validator = deployValidator();
        }
        return validator;
    }

    function getBridge() public returns (Bridge) {
        (bool deployed, address bridgeAddress) = checkDeployed("Bridge");
        if (deployed) {
            bridge = Bridge(payable(bridgeAddress));
        } else {
            bridge = deployBridge();
        }
        return bridge;
    }

    function run() public virtual {}

}
