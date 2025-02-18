// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import "forge-std/Test.sol";

import {BridgeTestBase} from "./bridge_tests/BridgeBase.t.sol";

import {BridgeClaimTest} from "./bridge_tests/BridgeClaim.t.sol";
import {BridgeRestrictedTest} from "./bridge_tests/BridgeRestricted.t.sol";
import {BridgeSendTest} from "./bridge_tests/BridgeSend.t.sol";
import {BridgeValidationTest} from "./bridge_tests/BridgeValidation.t.sol";
import {TokenManagerTest} from "./bridge_tests/TokenManager.t.sol";

contract BridgeTest is
    BridgeTestBase,
    TokenManagerTest,
    BridgeRestrictedTest,
    BridgeValidationTest,
    BridgeSendTest,
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

}
