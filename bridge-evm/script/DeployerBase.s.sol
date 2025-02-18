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
import {ERC20Bridged} from "../contracts/token/ERC20Bridged.sol";
import {TokenBeacon} from "../contracts/token/TokenBeacon.sol";

contract DeployerBase is Script {

    AccessManager authority;
    Validator validator;
    Bridge bridge;
    TokenBeacon tokenBeacon;
    VmSafe.Wallet deployer;

    function getDeployer() public returns (VmSafe.Wallet memory) {
        uint256 deployerPK = vm.envUint("PRIVATE_KEY");
        deployer = vm.createWallet(deployerPK);
        return deployer;
    }

    struct Deployments {
        Deployment[] contracts;
    }

    struct Deployment {
        string contractName;
        address implementationAddress;
        address proxyAddress;
    }

    string deploymentsKey = "deployments";

    function getDeployments() public returns (Deployment[] memory) {
        string memory root = vm.projectRoot();
        string memory path = string.concat(
            root, "/deployments/", vm.toString(block.chainid), ".json"
        );
        try vm.readFile(path) returns (string memory json) {
            bytes memory data = vm.parseJson(json);
            return abi.decode(data, (Deployments)).contracts;
        } catch (bytes memory) {
            vm.writeJson("[]", path);
            return new Deployment[](0);
        }
    }

    // Function to serialize the apples array
    function serializeDeployments(
        Deployment[] memory deployments
    ) internal returns (string memory) {
        string[] memory deploymentsJson = new string[](deployments.length);

        // Serialize each apple object
        for (uint256 i = 0; i < deployments.length; i++) {
            string memory deploymentJson = "contracts";
            vm.serializeString(
                deploymentJson, "contractName", deployments[i].contractName
            );
            vm.serializeAddress(
                deploymentJson, "proxyAddress", deployments[i].proxyAddress
            );
            string memory obj = vm.serializeAddress(
                deploymentJson,
                "implementationAddress",
                deployments[i].implementationAddress
            );
            console.log(deploymentJson);
            deploymentsJson[i] = obj;
        }

        // Combine the apples array into a JSON array
        string memory deploymentsJsonArray =
            vm.serializeString(deploymentsKey, "contracts", deploymentsJson);
        // for (uint256 i = 0; i < deploymentsJson.length; i++) {
        //     deploymentsJsonArray = string(abi.encodePacked(deploymentsJsonArray, deploymentsJson[i]));
        //     if (i < deploymentsJson.length - 1) {
        //         deploymentsJsonArray = string(abi.encodePacked(deploymentsJsonArray, ","));
        //     }
        // }
        // deploymentsJsonArray = string(abi.encodePacked(deploymentsJsonArray, "]"));

        return deploymentsJsonArray;
    }

    function writeDeployments(
        Deployment[] memory data
    ) public {
        string memory root = vm.projectRoot();
        string memory path = string.concat(
            root, "/deployments/", vm.toString(block.chainid), ".json"
        );
        string memory deploymentsJson = serializeDeployments(data);
        console.log(deploymentsJson);
        vm.writeJson(deploymentsJson, path);
    }

    function checkDeployed(
        string memory contractName
    ) public returns (bool deployed, address contractOrProxyAddress) {
        Deployment[] memory deployments = getDeployments();
        for (uint256 i = 0; i < deployments.length; i++) {
            if (Strings.equal(deployments[i].contractName, contractName)) {
                if (deployments[i].proxyAddress == address(0)) {
                    if (deployments[i].implementationAddress == address(0)) {
                        console.log(contractName, "not deployed");
                        return (false, address(0));
                    } else {
                        console.log(
                            contractName,
                            "already deployed as implementation at",
                            deployments[i].implementationAddress
                        );
                        return (true, deployments[i].implementationAddress);
                    }
                } else {
                    console.log(
                        contractName,
                        "already deployed as proxy at",
                        deployments[i].proxyAddress
                    );
                    return (true, deployments[i].proxyAddress);
                }
            }
        }
    }

    function setAuthorityAdmin(
        address adminCandidate
    ) public returns (bool adminGranted) {
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

    function removeAuthorityAdmin(
        address adminCandidate
    ) public returns (bool adminRemoved) {
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

    function addDeployment(
        Deployment memory deployment
    ) public {
        Deployment[] memory deployments = getDeployments();
        Deployment[] memory newDeployments =
            new Deployment[](deployments.length + 1);
        newDeployments[deployments.length] = deployment;
        for (uint256 i = 0; i < deployments.length; i++) {
            if (
                Strings.equal(
                    deployments[i].contractName, deployment.contractName
                )
            ) {
                newDeployments[i] = deployments[i];
                delete newDeployments[deployments.length];
            } else {
                newDeployments[i] = deployments[i];
            }
        }
        writeDeployments(newDeployments);
    }

    function deployAuthority() public returns (AccessManager) {
        address admin = vm.envOr("AUTHORITY_ADMIN", deployer.addr);
        authority = new AccessManager(admin);
        console.log("AccessManager deployed at", address(authority));
        addDeployment(
            Deployment({
                contractName: "AccessManager",
                proxyAddress: address(0),
                implementationAddress: address(authority)
            })
        );
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
        addDeployment(
            Deployment({
                contractName: "Validator",
                proxyAddress: proxy,
                implementationAddress: Upgrades.getImplementationAddress(proxy)
            })
        );
        return validator;
    }

    function deployTokenBeacon() public returns (TokenBeacon) {
        address owner = vm.envOr("TOKEN_BEACON_OWNER", deployer.addr);
        tokenBeacon =
            TokenBeacon(Upgrades.deployBeacon("ERC20Bridged.sol", owner));
        console.log("TokenBeacon deployed at:", address(tokenBeacon));
        console.log("   Implementation address:", tokenBeacon.implementation());
        addDeployment(
            Deployment({
                contractName: "ERC20Bridged",
                proxyAddress: address(tokenBeacon),
                implementationAddress: tokenBeacon.implementation()
            })
        );
        return tokenBeacon;
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
                            address(tokenBeacon),
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
        addDeployment(
            Deployment({
                contractName: "Bridge",
                proxyAddress: proxy,
                implementationAddress: Upgrades.getImplementationAddress(proxy)
            })
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

    function getTokenBeacon() public returns (TokenBeacon) {
        (bool deployed, address tokenBeaconAddress) =
            checkDeployed("TokenBeacon");
        if (deployed) {
            tokenBeacon = TokenBeacon(tokenBeaconAddress);
        } else {
            tokenBeacon = deployTokenBeacon();
        }
        return tokenBeacon;
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
