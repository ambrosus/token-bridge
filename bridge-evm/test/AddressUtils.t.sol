// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "forge-std/Test.sol";

import {Strings} from "@openzeppelin/contracts/utils/Strings.sol";

import {AddressUtils} from "../contracts/utils/AddressUtils.sol";

contract AddressUtilsTest is Test {

    function bytesToAddress(bytes memory bys)
        private
        pure
        returns (address addr)
    {
        assembly {
            addr := mload(add(bys, 20))
        }
    }

    function test_fuzz_bigEndian(bytes32 data) public {
        string[] memory runJsInputs = new string[](4);

        // Build ffi command string
        runJsInputs[0] = "node";
        runJsInputs[1] = "./test/differential_testing/bytes2address.js";
        runJsInputs[2] = Strings.toHexString(uint256(data), 32);
        runJsInputs[3] = "false";

        // Run command and capture output
        bytes memory jsResult = vm.ffi(runJsInputs);
        address jsGenerated = bytesToAddress(jsResult);

        address expected = AddressUtils.toAddressBE(data);
        assertEq(expected, jsGenerated);
    }

    function test_fuzz_littleEndian(bytes32 data) public {
        string[] memory runJsInputs = new string[](4);

        // Build ffi command string
        runJsInputs[0] = "node";
        runJsInputs[1] = "./test/differential_testing/bytes2address.js";
        runJsInputs[2] = Strings.toHexString(uint256(data), 32);
        runJsInputs[3] = "true";

        // Run command and capture output
        bytes memory jsResult = vm.ffi(runJsInputs);
        address jsGenerated = bytesToAddress(jsResult);

        address expected = AddressUtils.toAddressLE(data);
        assertEq(expected, jsGenerated);
    }

    function test_fuzz_default(bytes32 data) public {
        string[] memory runJsInputs = new string[](3);

        // Build ffi command string
        runJsInputs[0] = "node";
        runJsInputs[1] = "./test/differential_testing/bytes2address.js";
        runJsInputs[2] = Strings.toHexString(uint256(data), 32);

        // Run command and capture output
        bytes memory jsResult = vm.ffi(runJsInputs);
        address jsGenerated = bytesToAddress(jsResult);

        address expected = AddressUtils.toAddress(data);
        assertEq(expected, jsGenerated);
    }

    function test_fuzz_string2Address(bytes20 data) public {
        string memory dataStr = Strings.toHexString(address(data));
        string[] memory runJsInputs = new string[](3);
        // Build ffi command string
        runJsInputs[0] = "node";
        runJsInputs[1] = "./test/differential_testing/bytes2address.js";
        runJsInputs[2] = dataStr;

        // Run command and capture output
        bytes memory jsResult = vm.ffi(runJsInputs);
        address jsGenerated = bytesToAddress(jsResult);
        address expected = AddressUtils.toAddress(dataStr);
        assertEq(expected, jsGenerated);
    }

}
