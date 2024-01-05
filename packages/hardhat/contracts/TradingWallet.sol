// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

interface IExecutorManager {
	function isExecutor(address _address) external view returns (bool);
}

contract TradingWallet is ReentrancyGuard {
	// Mapping from user to token to balance
	mapping(address => mapping(address => uint256)) private _balances;
	IExecutorManager public executorManager;

	// Event emitted when a deposit is made
	event Deposit(address indexed user, address indexed token, uint256 amount);
	// Event emitted when a withdrawal is made
	event Withdrawal(
		address indexed user,
		address indexed token,
		uint256 amount
	);
	// Event emitted when a batch transfer is made
	event UpdateBalance(
		address indexed from,
		address indexed to,
		address indexed token,
		uint256 amount
	);

	constructor(address _executorManager) {
		executorManager = IExecutorManager(_executorManager);
	}

	// Function to deposit ERC20 tokens
	function depositERC20(address token, uint256 amount) public nonReentrant {
		require(amount > 0, "Deposit amount must be greater than 0");
		require(
			IERC20(token).transferFrom(msg.sender, address(this), amount),
			"Transfer failed"
		);
		_balances[msg.sender][token] += amount;
		emit Deposit(msg.sender, token, amount);
	}

	// Function to withdraw ERC20 tokens
	function withdrawERC20(address token, uint256 amount) public nonReentrant {
		require(_balances[msg.sender][token] >= amount, "Insufficient balance");
		_balances[msg.sender][token] -= amount;
		require(IERC20(token).transfer(msg.sender, amount), "Transfer failed");
		emit Withdrawal(msg.sender, token, amount);
	}

	// Function to deposit native cryptocurrency (e.g., ETH)
	function depositETH() public payable nonReentrant {
		require(msg.value > 0, "Deposit amount must be greater than 0");
		_balances[msg.sender][address(0)] += msg.value;
		emit Deposit(msg.sender, address(0), msg.value);
	}

	// Function to get ERC20 token balance
	function getERC20Balance(
		address user,
		address token
	) external view returns (uint256) {
		return _balances[user][token];
	}

	// Function to batch update balances
	function batchUpdateBalances(
		address[] memory fromAddresses,
		address[] memory toAddresses,
		address token,
		uint256[] memory amounts
	) external nonReentrant {
		require(
			executorManager.isExecutor(msg.sender),
			"Permission denied for non-executor"
		);
		require(
			fromAddresses.length == toAddresses.length &&
				toAddresses.length == amounts.length,
			"Arrays must have the same length"
		);

		for (uint256 i = 0; i < fromAddresses.length; i++) {
			address from = fromAddresses[i];
			address to = toAddresses[i];
			uint256 amount = amounts[i];

			require(
				_balances[from][token] >= amount,
				"Insufficient balance for transfer"
			);
			_balances[from][token] -= amount;
			_balances[to][token] += amount;

			emit UpdateBalance(from, to, token, amount);
		}
	}
}
