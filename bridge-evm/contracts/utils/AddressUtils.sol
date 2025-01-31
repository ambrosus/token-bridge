// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Strings} from "@openzeppelin/contracts/utils/Strings.sol";

library AddressUtils {

    using Strings for string;
    /// Convert address to bytes32 using big-endian byte order
    /// @dev example: `0x111122223333444455556666777788889999AAAABBBBCCCCDDDDEEEEFFFFCC` -> `0x777788889999AaAAbBbbCcccddDdeeeEfFFfCcCc`
    /// @param value address value to convert
    /// @return converted address

    function toAddressBE(bytes32 value)
        internal
        pure
        returns (address converted)
    {
        return address(uint160(uint256(value)));
    }

    /// Convert bytes32 to address using little-endian byte order
    /// @dev example: `0x111122223333444455556666777788889999AAAABBBBCCCCDDDDEEEEFFFFCC` -> `0x111122223333444455556666777788889999aAaa`
    /// @param value bytes32 value to convert
    /// @return converted address
    function toAddressLE(bytes32 value)
        internal
        pure
        returns (address converted)
    {
        return address(uint160(bytes20(value)));
    }

    /// Convert bytes32 to address using big-endian or little-endian byte order
    /// @param value bytes32 value to convert
    /// @param le true if the value is in little-endian byte order
    /// @return converted address
    function toAddress(
        bytes32 value,
        bool le
    )
        internal
        pure
        returns (address converted)
    {
        return le ? toAddressLE(value) : toAddressBE(value);
    }

    /// Shortcut  to convert bytes32 to address using big-endian byte order
    /// @dev example: `0x111122223333444455556666777788889999AAAABBBBCCCCDDDDEEEEFFFFCC` -> `0x777788889999AaAAbBbbCcccddDdeeeEfFFfCcCc`
    /// @param value bytes32 value to convert
    /// @return converted address
    function toAddress(bytes32 value)
        internal
        pure
        returns (address converted)
    {
        return toAddress(value, false);
    }

    /// Convert string to address
    /// @dev using [parseAddress](https://docs.openzeppelin.com/contracts/5.x/api/utils#Strings-parseAddress-string-) from OpenZeppelin's String library
    /// @param _address string value to convert
    /// @return converted address
    function toAddress(string memory _address)
        public
        pure
        returns (address converted)
    {
        return _address.parseAddress();
    }

}
