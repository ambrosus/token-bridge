// SPDX-License-Identifier: MIT

pragma solidity ^0.8.20;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {ERC20Permit} from
    "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";

contract ERC20Bridged is ERC20Permit {

    /// @dev The number of decimals for the token
    uint8 private _decimals;
    /// @dev The address of the bridge contract
    address private _bridgeAddress;

    constructor(
        string memory name_,
        string memory symbol_,
        uint8 decimals_,
        address bridge_
    )
        ERC20(name_, symbol_)
        ERC20Permit(name_)
    {
        _decimals = decimals_;
        _bridgeAddress = bridge_;
    }
    /**
     * @dev Returns the number of decimals used to get its user representation.
     * For example, if `decimals` equals `2`, a balance of `505` tokens should
     * be displayed to a user as `5.05` (`505 / 10 ** 2`).
     *
     * NOTE: This information is only used for _display_ purposes: it in
     * no way affects any of the arithmetic of the contract, including
     * {IERC20-balanceOf} and {IERC20-transfer}.
     * @return decimals_ the number of decimals of the token
     */

    function decimals() public view override returns (uint8 decimals_) {
        return _decimals;
    }
    /**
     * @dev Returns the address of the bridge contract.
     * This address is used to mint and burn tokens.
     * @return bridgeAddress the address of the bridge contract
     */

    function bridge() public view returns (address bridgeAddress) {
        return _bridgeAddress;
    }

    /**
     * @dev Transfers a `value` amount of tokens from `from` to `to`, or alternatively mints (or burns) if `from`
     * (or `to`) is the `bridge` address. (This is the only difference from the {ERC20} implementation.)
     *
     * Emits a {Transfer} event.
     */
    function _update(
        address from,
        address to,
        uint256 value
    )
        internal
        override
    {
        // If token is sent from the bridge, mint it
        if (from == _bridgeAddress) {
            if (to == address(0) || to == address(_bridgeAddress)) {
                revert ERC20InvalidReceiver(address(to));
            }
            super._update(address(0), to, value);
        }
        // If the token is sent to the bridge, burn it
        else if (to == _bridgeAddress) {
            super._update(from, address(0), value);
        } else {
            super._update(from, to, value);
        }
    }

}
