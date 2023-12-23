// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

interface IExecutorManager {
	function isExecutor(address _address) external view returns (bool);
}

contract SAFTToken is ERC1155, AccessControl {
	bytes32 public merkleRoot;
	mapping(uint256 => bool) public lockingFlags; // Reentrancy guard for minting
	uint256 private tokenIdCounter;
	bytes32 public constant EXECUTOR_ROLE = keccak256("EXECUTOR_ROLE");
	IExecutorManager public executorManager;

	event BundleProcessed(
		address indexed executor,
		uint256 indexed bundleNonce,
		bytes32 bundleHash,
		uint256 timestamp
	);

	constructor(
		address _owner,
		bytes32 _merkleRoot,
		string memory metadataUri,
		uint totalSupply,
		address _executorManager
	) ERC1155(metadataUri) {
		require(_owner != address(0), "Owner address cannot be empty");
		_mint(msg.sender, tokenIdCounter++, totalSupply, "");
		_setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
		merkleRoot = _merkleRoot;
		executorManager = IExecutorManager(_executorManager);
	}

	function whitelistMint(
		uint256 amount,
		bytes memory data,
		bytes32[] calldata merkleProof
	) public {
		uint256 id = tokenIdCounter;
		require(!lockingFlags[id], "Token is currently locked for minting");

		// Validate merkle proof using a single call
		require(isWhitelisted(merkleProof), "Caller is not whitelisted");

		lockingFlags[id] = true; // Set locking flag to prevent duplicate mints

		// Minimize external function calls for gas efficiency
		_mint(msg.sender, id, amount, data);

		lockingFlags[id] = false; // Unlock after successful minting
		tokenIdCounter++;
	}

	function isWhitelisted(
		bytes32[] calldata merkleProof
	) public view returns (bool) {
		bytes32 leaf = keccak256(abi.encodePacked(msg.sender));
		return MerkleProof.verify(merkleProof, merkleRoot, leaf);
	}

	function setMerkleRoot(
		bytes32 _merkleRoot
	) public onlyRole(DEFAULT_ADMIN_ROLE) {
		merkleRoot = _merkleRoot;
	}

	function supportsInterface(
		bytes4 interfaceId
	) public view virtual override(ERC1155, AccessControl) returns (bool) {
		return
			ERC1155.supportsInterface(interfaceId) ||
			AccessControl.supportsInterface(interfaceId);
	}

	function setExecutorManager(
		address _executorManager
	) public onlyRole(DEFAULT_ADMIN_ROLE) {
		executorManager = IExecutorManager(_executorManager);
	}

	function processBundle(
		bytes calldata bundleData,
		uint256 bundleNonce
	) public {
		require(
			executorManager.isExecutor(msg.sender),
			"Caller is not an authorized executor"
		);

		// Decode and process each transaction in the bundle
		for (uint i = 0; i < bundleData.length; i += 104) {
			(
				address buyer,
				address seller,
				uint256 tokenId,
				uint256 amount
			) = abi.decode(
					bundleData[i:i + 104],
					(address, address, uint256, uint256)
				);

			// Ensure that the seller has enough tokens
			require(
				balanceOf(seller, tokenId) >= amount,
				"Seller does not have enough tokens"
			);

			// Perform the token transfer from seller to buyer
			_safeTransferFrom(seller, buyer, tokenId, amount, "");
		}

		// Compute the hash of the bundle data for logging
		bytes32 bundleHash = keccak256(bundleData);

		// Emit the event with necessary details
		emit BundleProcessed(
			msg.sender,
			bundleNonce,
			bundleHash,
			block.timestamp
		);
	}
}
