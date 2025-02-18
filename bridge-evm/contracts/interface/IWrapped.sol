// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;
pragma abicoder v2;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

interface IWrapped is IERC20 {

    event Deposit(address indexed dst, uint256 amount);
    event Withdrawal(address indexed src, uint256 amount);
    /// Deposit tokens to the contract (a.k.a wrap tokens)
    /// @dev converts msg.value amount to ERC20 tokens with the same amount

    function deposit() external payable;

    /// Withdraw tokens from the contract (a.k.a unwrap tokens)
    /// @param amount amount of tokens to withdraw
    /// @dev converts ERC20 tokens to native currency with the same amount
    function withdraw(
        uint256 amount
    ) external;

}
