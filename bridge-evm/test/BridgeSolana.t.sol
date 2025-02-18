// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import "forge-std/Test.sol";

import {
    UnsafeUpgrades,
    Upgrades
} from "openzeppelin-foundry-upgrades/Upgrades.sol";

import {BridgeTestBase} from "./bridge_tests/BridgeBase.t.sol";

import {BridgeClaimTest} from "./bridge_tests/BridgeClaim.t.sol";
import {BridgeRestrictedTest} from "./bridge_tests/BridgeRestricted.t.sol";
import {BridgeSolanaSendTest} from "./bridge_tests/BridgeSolanaSend.t.sol";
import {BridgeValidationTest} from "./bridge_tests/BridgeValidation.t.sol";
import {TokenManagerTest} from "./bridge_tests/TokenManager.t.sol";

import {IBridge} from "../contracts/interface/IBridge.sol";

import {IValidation} from "../contracts/interface/IValidation.sol";
import {IWrapped} from "../contracts/interface/IWrapped.sol";

import {Bridge} from "../contracts/Bridge.sol";
import {BridgeSolana} from "../contracts/BridgeSolana.sol";

contract BridgeTest is
    BridgeTestBase,
    TokenManagerTest,
    BridgeRestrictedTest,
    BridgeValidationTest,
    BridgeSolanaSendTest,
    BridgeClaimTest
{

    function beforeTestSetup(
        bytes4 testSelector
    ) public view returns (bytes[] memory beforeTestCalldata) {
        if (testSelector == this.test_revertWhen_send_BadFeeReceiver.selector) {
            beforeTestCalldata = new bytes[](1);
            beforeTestCalldata[0] = abi.encodeWithSelector(
                this.setFeeReceiver.selector, payable(address(badReceiver))
            );
        }
    }

    function setUpBridge(
        address authorityAddress,
        address tokenBeac,
        IWrapped samb,
        IValidation validation,
        address payable feeReceiver,
        uint256 nsa
    ) public override returns (Bridge) {
        address payable proxy;
        vm.expectEmit();
        emit IBridge.ValidatorChanged(address(this), address(validation));
        vm.expectEmit();
        emit IBridge.FeeReceiverChanged(address(this), feeReceiver);
        vm.expectEmit();
        emit IBridge.NativeSendAmountChanged(address(this), nsa);
        if (isCoverage()) {
            address bridge = address(new BridgeSolana());
            proxy = payable(
                address(
                    UnsafeUpgrades.deployUUPSProxy(
                        bridge,
                        abi.encodeCall(
                            BridgeSolana.initialize,
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
                        "BridgeSolana.sol",
                        abi.encodeCall(
                            BridgeSolana.initialize,
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

}
