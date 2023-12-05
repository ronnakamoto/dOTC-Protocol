// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";

contract SAFTToken is ERC1155, Ownable {
	bytes32 public merkleRoot;
	mapping(uint256 => bool) public lockingFlags; // Reentrancy guard for minting
	uint256 private tokenIdCounter;

	constructor(
		address _owner,
		bytes32 _merkleRoot,
		string memory metadataUri
	) ERC1155(metadataUri) {
		merkleRoot = _merkleRoot;
		require(_owner != address(0), "Owner address cannot be empty");
		_transferOwnership(_owner);
	}

	function mint(
		address account,
		uint256 amount,
		bytes memory data,
		bytes32[] calldata merkleProof
	) public {
		uint256 id = tokenIdCounter;
		require(!lockingFlags[id], "Token is currently locked for minting");

		// Validate merkle proof using a single call
		require(
			MerkleProof.verifyCalldata(
				merkleProof,
				merkleRoot,
				keccak256(abi.encodePacked(account, amount))
			),
			"Caller is not whitelisted"
		);

		lockingFlags[id] = true; // Set locking flag to prevent duplicate mints

		// Minimize external function calls for gas efficiency
		_mint(account, id, amount, data);

		lockingFlags[id] = false; // Unlock after successful minting
		tokenIdCounter++;
	}

	function isWhitelisted(
		address account,
		bytes32[] calldata merkleProof
	) public view returns (bool) {
		bytes32 leaf = keccak256(abi.encodePacked(account));
		return MerkleProof.verify(merkleProof, merkleRoot, leaf);
	}

	function setMerkleRoot(bytes32 _merkleRoot) public onlyOwner {
		merkleRoot = _merkleRoot;
	}
}
