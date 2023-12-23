// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

contract BundlerManager {
	mapping(address => bool) public isBundler;
	mapping(address => uint256) public lastHeartbeat;
	uint256 public registrationFee;

	event BundlerRegistered(address indexed bundler);
	event Heartbeat(address indexed bundler, uint256 timestamp);

	// Registration function for Bundlers
	function registerAsBundler() public payable {
		require(msg.value == registrationFee, "Incorrect fee");
		isBundler[msg.sender] = true;
		emit BundlerRegistered(msg.sender);
	}

	// Function for Bundlers to signal activity
	function heartbeat() public {
		require(isBundler[msg.sender], "Not a registered bundler");
		lastHeartbeat[msg.sender] = block.timestamp;
		emit Heartbeat(msg.sender, block.timestamp);
	}

	// Admin function to set registration fee
	function setRegistrationFee(uint256 fee) public {
		// Only admin can set the fee
		registrationFee = fee;
	}

	// Additional functions as needed...
}
