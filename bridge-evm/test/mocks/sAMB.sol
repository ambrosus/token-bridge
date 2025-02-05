// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../../contracts/interface/IWrapped.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract sAMB is IWrapped, ERC20 {

    constructor(
        string memory name_,
        string memory symbol_
    )
        ERC20(name_, symbol_)
    {}

    function deposit() public payable override {
        _mint(msg.sender, msg.value);

        emit Deposit(msg.sender, msg.value);
    }

    function withdraw(uint256 amount) public override {
        _burn(msg.sender, amount);
        emit Withdrawal(msg.sender, amount);

        (bool sent,) = payable(msg.sender).call{value: amount}("");
        require(sent, "Transfer failed");
    }

}
