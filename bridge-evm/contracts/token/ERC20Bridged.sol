// SPDX-License-Identifier: MIT

pragma solidity ^0.8.20;

import {AccessManagedUpgradeable} from
    "@openzeppelin/contracts-upgradeable/access/manager/AccessManagedUpgradeable.sol";

import {Initializable} from
    "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import {ERC20Upgradeable} from
    "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";
import {ERC20PermitUpgradeable} from
    "@openzeppelin/contracts-upgradeable/token/ERC20/extensions/ERC20PermitUpgradeable.sol";

contract ERC20Bridged is
    Initializable,
    AccessManagedUpgradeable,
    ERC20Upgradeable,
    ERC20PermitUpgradeable
{

    /// @custom:storage-location erc7201:bridged.storage.ERC20Additional
    struct BridgedERC20Storage {
        /// @dev The number of decimals for the token
        uint8 _decimals;
        /// @dev The address of the bridge contract
        address _bridge;
        /// @dev The blacklist of addresses (blacklisted addresses cannot send or receive tokens)
        mapping(address => bool) _blacklist;
    }

    /// @dev Emitted when an address is blacklisted
    error Blacklisted(address account);

    // keccak256(abi.encode(uint256(keccak256("bridged.storage.ERC20Additional")) - 1)) & ~bytes32(uint256(0xff))
    bytes32 private constant ERC20AdditionalStorageLocation =
        0xb5ac4c0d6c28de524e1dbc51411a2e707582c4bdbfe893edf60b98f392fe9600;

    function _getERC20AdditionalStorage()
        private
        pure
        returns (BridgedERC20Storage storage $)
    {
        assembly {
            $.slot := ERC20AdditionalStorageLocation
        }
    }

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize(
        address authority_,
        string memory name_,
        string memory symbol_,
        uint8 decimals_,
        address bridge_
    ) public initializer {
        __ERC20Bridged_init(authority_, name_, symbol_, decimals_, bridge_);
    }

    function __ERC20Bridged_init(
        address authority_,
        string memory name_,
        string memory symbol_,
        uint8 decimals_,
        address bridge_
    ) internal onlyInitializing {
        __ERC20Bridged_init_unchained(
            authority_, name_, symbol_, decimals_, bridge_
        );
    }

    function __ERC20Bridged_init_unchained(
        address authority_,
        string memory name_,
        string memory symbol_,
        uint8 decimals_,
        address bridge_
    ) internal onlyInitializing {
        __AccessManaged_init(authority_);
        __ERC20_init(name_, symbol_);
        __ERC20Permit_init(name_);
        BridgedERC20Storage storage $ = _getERC20AdditionalStorage();
        $._decimals = decimals_;
        $._bridge = bridge_;
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
        BridgedERC20Storage storage $ = _getERC20AdditionalStorage();
        return $._decimals;
    }
    /**
     * @dev Returns the address of the bridge contract.
     * This address is used to mint and burn tokens.
     * @return bridgeAddress the address of the bridge contract
     */

    function bridge() public view returns (address bridgeAddress) {
        BridgedERC20Storage storage $ = _getERC20AdditionalStorage();
        return $._bridge;
    }

    /**
     * @dev Check is the address blacklisted.
     */
    modifier notInBlacklist(
        address account
    ) {
        BridgedERC20Storage storage $ = _getERC20AdditionalStorage();
        if ($._blacklist[account]) {
            revert Blacklisted(account);
        }
        _;
    }

    /**
     * @dev Add an address to the blacklist
     * @param account the address to add to the blacklist
     */
    function addBlacklist(
        address account
    ) public restricted {
        BridgedERC20Storage storage $ = _getERC20AdditionalStorage();
        $._blacklist[account] = true;
    }

    /**
     * @dev Remove an address from the blacklist
     * @param account the address to remove from the blacklist
     */
    function removeBlacklist(
        address account
    ) public restricted {
        BridgedERC20Storage storage $ = _getERC20AdditionalStorage();
        delete $._blacklist[account];
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
    ) internal override notInBlacklist(from) notInBlacklist(to) {
        address _bridgeAddress = bridge();
        // If token is sent from the bridge, mint it
        if (from == _bridgeAddress) {
            if (to == address(0) || to == _bridgeAddress) {
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
