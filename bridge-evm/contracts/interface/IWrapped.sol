// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;
pragma abicoder v2;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

interface IWrapped is IERC20 {
    function deposit() external payable;

    function withdraw(uint amount) external;
}