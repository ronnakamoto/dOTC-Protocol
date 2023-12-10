// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract TradingWallet {
	// Event emitted when a deposit is made
	event Deposit(address indexed user, address indexed token, uint256 amount);

	// Function to deposit ERC20 tokens
	function depositERC20(address token, uint256 amount) public {
		require(
			IERC20(token).transferFrom(msg.sender, address(this), amount),
			"Transfer failed"
		);
		emit Deposit(msg.sender, token, amount);
	}

	// Function to deposit native cryptocurrency (e.g., ETH)
	function depositETH() public payable {
		require(msg.value > 0, "Deposit amount must be greater than 0");
		emit Deposit(msg.sender, address(0), msg.value);
	}

	// Additional functions for withdrawals, balance checks, etc.
}
