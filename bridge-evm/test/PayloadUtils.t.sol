// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "forge-std/Test.sol";

import {Strings} from "@openzeppelin/contracts/utils/Strings.sol";

import {BridgeTypes} from "../contracts/interface/BridgeTypes.sol";

import {PayloadUtils} from "../contracts/utils/PayloadUtils.sol";

contract PayloadUtilsTest is Test {

    function iToHex(
        bytes memory buffer
    ) public pure returns (string memory) {
        // Fixed buffer size for hexadecimal convertion
        bytes memory converted = new bytes(buffer.length * 2);

        bytes memory _base = "0123456789abcdef";

        for (uint256 i = 0; i < buffer.length; i++) {
            converted[i * 2] = _base[uint8(buffer[i]) / _base.length];
            converted[i * 2 + 1] = _base[uint8(buffer[i]) % _base.length];
        }

        return string(abi.encodePacked("0x", converted));
    }

    string constant JS_PAYLOAD_HASH_ETHERS_PATH = "./test/differential_testing/payload2hashEthers.js";

    function test_fuzz_payload2hash_ethers(
        uint256 destChainId, // destination chain id
        bytes32 tokenAddress, // address of the token contract
        bytes32 externalTokenAddress, // address of the external token contract
        uint256 amountToSend, // amount of the tokens to be sent
        uint256 feeAmount, // amount of the fee
        uint256 timestamp, // timestamp of the fee was generated
        uint256 flags, // flags of the sending operation
        bytes memory flagData // additional data of the sending operation (unused for now)
    ) public {
        // Validate inputs
        require(flagData.length <= 1024, "Data too large");
        require(amountToSend <= type(uint256).max, "Amount to send overflow");
        require(feeAmount <= type(uint256).max, "Fee amount overflow");
        require(timestamp <= type(uint256).max, "Timestamp overflow");
        require(flags <= type(uint256).max, "Flags overflow");

        string[] memory runJsInputs = new string[](10);
        BridgeTypes.SendPayload memory payload = BridgeTypes.SendPayload({
            destChainId: destChainId,
            tokenAddress: tokenAddress,
            externalTokenAddress: externalTokenAddress,
            amountToSend: amountToSend,
            feeAmount: feeAmount,
            timestamp: timestamp,
            flags: flags,
            flagData: flagData
        });

        // Build ffi command string
        runJsInputs[0] = "node";
        runJsInputs[1] = JS_PAYLOAD_HASH_ETHERS_PATH;
        runJsInputs[2] = Strings.toHexString(uint256(destChainId), 32);
        runJsInputs[3] = Strings.toHexString(uint256(tokenAddress), 32);
        runJsInputs[4] = Strings.toHexString(uint256(externalTokenAddress), 32);
        runJsInputs[5] = Strings.toHexString(amountToSend, 32);
        runJsInputs[6] = Strings.toHexString(feeAmount, 32);
        runJsInputs[7] = Strings.toHexString(timestamp, 32);
        runJsInputs[8] = Strings.toHexString(flags, 32);
        runJsInputs[9] = iToHex(flagData);

        // Run command and capture output
        bytes memory jsResult = vm.ffi(runJsInputs);
        bytes32 jsGenerated = abi.decode(jsResult, (bytes32));

        bytes32 expectedHash = PayloadUtils.toHash(payload);
        assertEq(expectedHash, jsGenerated);
    }

    string constant JS_PAYLOAD_HASH_VIEM_PATH = "./test/differential_testing/payload2hashViem.js";

    function test_fuzz_payload2hash_viem(
        uint256 destChainId, // destination chain id
        bytes32 tokenAddress, // address of the token contract
        bytes32 externalTokenAddress, // address of the external token contract
        uint256 amountToSend, // amount of the tokens to be sent
        uint256 feeAmount, // amount of the fee
        uint256 timestamp, // timestamp of the fee was generated
        uint256 flags, // flags of the sending operation
        bytes memory flagData // additional data of the sending operation (unused for now)
    ) public {
        // Validate inputs
        require(flagData.length <= 1024, "Data too large");
        require(amountToSend <= type(uint256).max, "Amount to send overflow");
        require(feeAmount <= type(uint256).max, "Fee amount overflow");
        require(timestamp <= type(uint256).max, "Timestamp overflow");
        require(flags <= type(uint256).max, "Flags overflow");

        string[] memory runJsInputs = new string[](10);
        BridgeTypes.SendPayload memory payload = BridgeTypes.SendPayload({
            destChainId: destChainId,
            tokenAddress: tokenAddress,
            externalTokenAddress: externalTokenAddress,
            amountToSend: amountToSend,
            feeAmount: feeAmount,
            timestamp: timestamp,
            flags: flags,
            flagData: flagData
        });

        // Build ffi command string
        runJsInputs[0] = "node";
        runJsInputs[1] = JS_PAYLOAD_HASH_VIEM_PATH;
        runJsInputs[2] = Strings.toHexString(uint256(destChainId), 32);
        runJsInputs[3] = Strings.toHexString(uint256(tokenAddress), 32);
        runJsInputs[4] = Strings.toHexString(uint256(externalTokenAddress), 32);
        runJsInputs[5] = Strings.toHexString(amountToSend, 32);
        runJsInputs[6] = Strings.toHexString(feeAmount, 32);
        runJsInputs[7] = Strings.toHexString(timestamp, 32);
        runJsInputs[8] = Strings.toHexString(flags, 32);
        runJsInputs[9] = iToHex(flagData);

        // Run command and capture output
        bytes memory jsResult = vm.ffi(runJsInputs);
        bytes32 jsGenerated = abi.decode(jsResult, (bytes32));

        bytes32 expectedHash = PayloadUtils.toHash(payload);
        assertEq(expectedHash, jsGenerated);
    }

}
