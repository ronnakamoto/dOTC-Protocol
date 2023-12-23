// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "@openzeppelin/contracts/access/AccessControl.sol";

contract ExecutorManager is AccessControl {
	bytes32 public constant EXECUTOR_ROLE = keccak256("EXECUTOR_ROLE");

	event ExecutorRegistered(address indexed executor);
	event ExecutorUnregistered(address indexed executor);

	constructor() {
		_setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
	}

	// Function to register as an Executor
	function registerExecutor(
		address executor
	) public onlyRole(DEFAULT_ADMIN_ROLE) {
		_setupRole(EXECUTOR_ROLE, executor);
		emit ExecutorRegistered(executor);
	}

	// Function to remove an Executor
	function unregisterExecutor(
		address executor
	) public onlyRole(DEFAULT_ADMIN_ROLE) {
		_revokeRole(EXECUTOR_ROLE, executor);
		emit ExecutorUnregistered(executor);
	}

	// Function to check if an address is an Executor
	function isExecutor(address executor) public view returns (bool) {
		return hasRole(EXECUTOR_ROLE, executor);
	}
}
