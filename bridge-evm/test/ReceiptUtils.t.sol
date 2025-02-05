// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "forge-std/Test.sol";

import {Strings} from "@openzeppelin/contracts/utils/Strings.sol";

import {IBridgeTypes} from "../contracts/interface/IBridgeTypes.sol";

import {ReceiptUtils} from "../contracts/utils/ReceiptUtils.sol";

contract ReceiptUtilsTest is Test {

    function iToHex(bytes memory buffer) public pure returns (string memory) {
        // Fixed buffer size for hexadecimal convertion
        bytes memory converted = new bytes(buffer.length * 2);

        bytes memory _base = "0123456789abcdef";

        for (uint256 i = 0; i < buffer.length; i++) {
            converted[i * 2] = _base[uint8(buffer[i]) / _base.length];
            converted[i * 2 + 1] = _base[uint8(buffer[i]) % _base.length];
        }

        return string(abi.encodePacked("0x", converted));
    }

    function test_fuzz_receipt2hash(
        bytes32 from, // source address (bytes32 because of cross-chain compatibility)
        bytes32 to, // destination address (bytes32 because of cross-chain compatibility)
        bytes32 tokenAddress, // source token address (bytes32 because of cross-chain compatibility)
        uint256 amount, // amount of tokens sent
        uint256 chainFrom, // chain id of the source chain
        uint256 chainTo, // chain id of the destination chain
        uint256 eventId, // transaction number
        uint256 flags, // flags for receiver
        bytes memory data // additional data of the transaction (eg. user nonce for Solana)
    )
        public
    {
        string[] memory runJsInputs = new string[](11);
        IBridgeTypes.Receipt memory receipt = IBridgeTypes.Receipt({
            from: from,
            to: to,
            tokenAddress: tokenAddress,
            amount: amount,
            chainFrom: chainFrom,
            chainTo: chainTo,
            eventId: eventId,
            flags: flags,
            data: data
        });

        // Build ffi command string
        runJsInputs[0] = "node";
        runJsInputs[1] = "./test/differential_testing/receipt2hash.js";
        runJsInputs[2] = Strings.toHexString(uint256(from), 32);
        runJsInputs[3] = Strings.toHexString(uint256(to), 32);
        runJsInputs[4] = Strings.toHexString(uint256(tokenAddress), 32);
        runJsInputs[5] = Strings.toHexString(amount, 32);
        runJsInputs[6] = Strings.toHexString(chainFrom, 32);
        runJsInputs[7] = Strings.toHexString(chainTo, 32);
        runJsInputs[8] = Strings.toHexString(eventId, 32);
        runJsInputs[9] = Strings.toHexString(flags, 32);
        runJsInputs[10] = iToHex(data);

        // Run command and capture output
        bytes memory jsResult = vm.ffi(runJsInputs);
        bytes32 jsGenerated = abi.decode(jsResult, (bytes32));

        bytes32 expectedHash = ReceiptUtils.toHash(receipt);
        assertEq(expectedHash, jsGenerated);
    }

}
