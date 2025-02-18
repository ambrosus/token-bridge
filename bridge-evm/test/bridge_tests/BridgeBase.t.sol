// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import "forge-std/Test.sol";

import {
    UnsafeUpgrades,
    Upgrades
} from "openzeppelin-foundry-upgrades/Upgrades.sol";

import {AccessManager} from
    "@openzeppelin/contracts/access/manager/AccessManager.sol";

import {ERC20Permit} from
    "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";
import {Strings} from "@openzeppelin/contracts/utils/Strings.sol";
import {EnumerableSet} from
    "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";

import {IBridge} from "../../contracts/interface/IBridge.sol";
import {IValidation} from "../../contracts/interface/IValidation.sol";
import {IValidatorV1} from "../../contracts/interface/IValidatorV1.sol";
import {IWrapped} from "../../contracts/interface/IWrapped.sol";

import {Bridge} from "../../contracts/Bridge.sol";

import {Validator} from "../../contracts/Validator.sol";
import {ERC20Bridged} from "../../contracts/token/ERC20Bridged.sol";
import {TokenBeacon} from "../../contracts/token/TokenBeacon.sol";

import {MockBadNativeReceiver} from "../mocks/MockBadNativeReceiver.sol";
import {MockERC20Permit} from "../mocks/MockERC20.sol";
import {sAMB} from "../mocks/sAMB.sol";

abstract contract BridgeTestBase is Test {

    using EnumerableSet for EnumerableSet.AddressSet;

    bytes32 constant coverageProfile = keccak256(abi.encodePacked("coverage"));

    function isCoverage() internal view returns (bool) {
        return keccak256(
            abi.encodePacked(vm.envOr("FOUNDRY_PROFILE", string("default")))
        ) == coverageProfile;
    }

    uint256 constant nativeSendAmount = 1 ether;
    AccessManager authority;
    Validator validatorInstance;
    Bridge bridgeInstance;
    IWrapped wrappedToken;
    MockBadNativeReceiver badReceiver;

    TokenBeacon tokenBeacon;

    ERC20Permit permittableToken;

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
        address wrappedTokenAddress = address(new sAMB("Wrapped Amber", "sAMB"));
        wrappedToken = IWrapped(wrappedTokenAddress);
        return wrappedToken;
    }

    function setUpPermittable() public virtual returns (ERC20Permit) {
        permittableToken = new MockERC20Permit();
        return permittableToken;
    }

    function setUpTokenBeacon() public virtual returns (TokenBeacon) {
        address implementation = address(new ERC20Bridged());
        tokenBeacon = new TokenBeacon(address(this), implementation);
        return tokenBeacon;
    }

    function setUpValidator(
        address authorityAddress,
        address[] memory validators,
        address pldSigner,
        uint256 feeValidityWindow
    ) public virtual returns (Validator) {
        address proxy;
        vm.expectEmit();
        emit IValidation.PayloadSignerChanged(address(this), pldSigner);
        vm.expectEmit();
        emit IValidation.FeeValidityWindowChanged(
            address(this), feeValidityWindow
        );
        for (uint256 i = 0; i < validators.length; i++) {
            vm.expectEmit();
            emit IValidatorV1.ValidatorAdded(validators[i]);
        }
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
        address tokenBeac,
        IWrapped samb,
        IValidation validation,
        address payable feeReceiver,
        uint256 nsa
    ) public virtual returns (Bridge) {
        address payable proxy;
        vm.expectEmit();
        emit IBridge.ValidatorChanged(address(this), address(validation));
        vm.expectEmit();
        emit IBridge.FeeReceiverChanged(address(this), feeReceiver);
        vm.expectEmit();
        emit IBridge.NativeSendAmountChanged(address(this), nsa);
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
                                address(tokenBeac),
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
                                address(tokenBeac),
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
        badReceiver = new MockBadNativeReceiver();
        authority = new AccessManager(address(this));

        for (uint256 i = 0; i < 3; i++) {
            (address signer, uint256 signerPk) = makeAddrAndKey(
                string.concat("relayer", Strings.toString(i + 1))
            );
            signers.push(Signer({Address: signer, PK: signerPk}));
            validatorSet.add(signer);
        }
        (address signerP, uint256 signerPPk) = makeAddrAndKey("payloadSigner");
        payloadSigner = Signer({Address: signerP, PK: signerPPk});
        setUpPermittable();
        setUpWrappedToken();
        setUpTokenBeacon();
        setUpValidator(
            address(authority),
            validatorSet.values(),
            payloadSigner.Address,
            100
        );
        setUpBridge(
            address(authority),
            address(tokenBeacon),
            wrappedToken,
            validatorInstance,
            fee,
            nativeSendAmount
        );
    }

    function setFeeReceiver(
        address payable receiver
    ) public {
        bridgeInstance.setFeeReceiver(receiver);
    }

}
