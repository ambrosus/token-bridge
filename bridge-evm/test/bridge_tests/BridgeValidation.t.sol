// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import {BridgeTestBase} from "./BridgeBase.t.sol";
import "forge-std/Test.sol";

abstract contract BridgeValidationTest is BridgeTestBase {

    function test_feeValidity_change_reflects_on_bridge() public {
        uint256 newFeeValidityWindow = 200;
        validatorInstance.setFeeValidityWindow(newFeeValidityWindow);
        assertEq(validatorInstance.feeValidityWindow(), newFeeValidityWindow);
        assertEq(bridgeInstance.feeValidityWindow(), newFeeValidityWindow);
    }

}
