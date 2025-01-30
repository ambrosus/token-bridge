// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import "forge-std/Test.sol";

import {UnsafeUpgrades, Upgrades} from "openzeppelin-foundry-upgrades/Upgrades.sol";

import {AccessManager} from "@openzeppelin/contracts/access/manager/AccessManager.sol";
import {EnumerableSet} from "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import {Strings} from "@openzeppelin/contracts/utils/Strings.sol";

import {IValidation} from "../../contracts/interface/IValidation.sol";
import {IWrapped} from "../../contracts/interface/IWrapped.sol";

import {Bridge} from "../../contracts/Bridge.sol";
import {Validator} from "../../contracts/Validator.sol";

import {sAMB} from "../mocks/sAMB.sol";

abstract contract BridgeTestBase is Test {
    using EnumerableSet for EnumerableSet.AddressSet;

    bytes32 constant coverageProfile = keccak256(abi.encodePacked("coverage"));

    function isCoverage() internal view returns (bool) {
        return
            keccak256(
                abi.encodePacked(vm.envOr("FOUNDRY_PROFILE", string("default")))
            ) == coverageProfile;
    }

    uint256 constant nativeSendAmount = 1 ether;
    AccessManager authority;
    Validator validatorInstance;
    Bridge bridgeInstance;
    IWrapped wrappedToken;

    address alice = address(0xA11ce);
    address bob = address(0xB0b);
    address chris = address(0xC14);
    address deadBeef = address(0xDeadBeef);
    address payable fee = payable(address(0xFee));

    struct Signer {
        address Address;
        uint256 PK;
    }

    Signer[] signers;
    Signer payloadSigner;

    EnumerableSet.AddressSet validatorSet;

    function setUpWrappedToken() public virtual returns (IWrapped) {
        address wrappedTokenAddress = address(
            new sAMB("Wrapped Amber", "sAMB")
        );
        wrappedToken = IWrapped(wrappedTokenAddress);
        return wrappedToken;
    }

    function setUpValidator(
        address authorityAddress,
        address[] memory validators,
        address pldSigner,
        uint256 feeValidityWindow
    ) public virtual returns (Validator) {
        address proxy;
        if (isCoverage()) {
            address validator = address(new Validator());
            proxy = address(
                UnsafeUpgrades.deployUUPSProxy(
                    validator,
                    abi.encodeCall(
                        Validator.initialize,
                        (
                            authorityAddress,
                            validators,
                            pldSigner,
                            feeValidityWindow
                        )
                    )
                )
            );
        } else {
            proxy = address(
                Upgrades.deployUUPSProxy(
                    "Validator.sol",
                    abi.encodeCall(
                        Validator.initialize,
                        (
                            authorityAddress,
                            validators,
                            pldSigner,
                            feeValidityWindow
                        )
                    )
                )
            );
        }
        validatorInstance = Validator(proxy);
        return validatorInstance;
    }

    function setUpBridge(
        address authorityAddress,
        IWrapped samb,
        IValidation validation,
        address payable feeReceiver,
        uint256 nsa
    ) public virtual returns (Bridge) {
        address payable proxy;
        if (isCoverage()) {
            address bridge = address(new Bridge());
            proxy = payable(
                address(
                    UnsafeUpgrades.deployUUPSProxy(
                        bridge,
                        abi.encodeCall(
                            Bridge.initialize,
                            (
                                authorityAddress,
                                address(samb),
                                validation,
                                feeReceiver,
                                nsa
                            )
                        )
                    )
                )
            );
        } else {
            proxy = payable(
                address(
                    Upgrades.deployUUPSProxy(
                        "Bridge.sol",
                        abi.encodeCall(
                            Bridge.initialize,
                            (
                                authorityAddress,
                                address(samb),
                                validation,
                                feeReceiver,
                                nsa
                            )
                        )
                    )
                )
            );
        }
        bridgeInstance = Bridge(proxy);
        return bridgeInstance;
    }

    function setUp() public {
        authority = new AccessManager(address(this));

        for(uint i = 0; i < 3; i++) {
            (address signer, uint256 signerPk) = makeAddrAndKey(string.concat("relayer", Strings.toString(i+1)));
            signers.push(Signer({
                Address: signer,
                PK: signerPk
            }));
            validatorSet.add(signer);
        }
        (address signerP, uint256 signerPPk) = makeAddrAndKey("payloadSigner");
        payloadSigner = Signer({
            Address: signerP,
            PK: signerPPk
        });
        setUpWrappedToken();
        setUpValidator(
            address(authority),
            validatorSet.values(),
            payloadSigner.Address,
            100
        );
        setUpBridge(
            address(authority),
            wrappedToken,
            validatorInstance,
            fee,
            nativeSendAmount
        );
    }
}
