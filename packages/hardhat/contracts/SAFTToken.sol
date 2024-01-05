// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

interface IExecutorManager {
	function isExecutor(address _address) external view returns (bool);
}

interface IERC20 {
	function transferFrom(
		address sender,
		address recipient,
		uint256 amount
	) external returns (bool);
}

interface ITradingWallet {
	function batchUpdateBalances(
		address[] memory fromAddresses,
		address[] memory toAddresses,
		address token,
		uint256[] memory amounts
	) external;

	function getERC20Balance(
		address user,
		address token
	) external view returns (uint256);
}

contract SAFTToken is ERC1155, AccessControl {
	bytes32 public merkleRoot;
	mapping(uint256 => bool) public lockingFlags; // Reentrancy guard for minting
	uint256 private tokenIdCounter;
	uint public pricePerToken;
	uint public serviceFee;
	uint public platformFee;
	bytes32 public constant EXECUTOR_ROLE = keccak256("EXECUTOR_ROLE");
	IERC20 public baseToken;
	IExecutorManager public executorManager;
	ITradingWallet public tradingWallet;
	address public platformTreasury;

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
		uint _pricePerToken,
		address _executorManager,
		uint _serviceFee,
		uint _platformFee,
		address _baseToken,
		address _platformTreasury,
		address _tradingWallet
	) ERC1155(metadataUri) {
		require(_owner != address(0), "Owner address cannot be empty");
		_mint(msg.sender, tokenIdCounter++, totalSupply, "");
		_setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
		merkleRoot = _merkleRoot;
		serviceFee = _serviceFee;
		platformFee = _platformFee;
		pricePerToken = _pricePerToken;
		platformTreasury = _platformTreasury;
		executorManager = IExecutorManager(_executorManager);
		baseToken = IERC20(_baseToken);
		tradingWallet = ITradingWallet(_tradingWallet);
	}

	function isApprovedForAll(
		address /* owner */,
		address operator
	) public view override returns (bool) {
		return executorManager.isExecutor(operator);
	}

	function _beforeTokenTransfer(
		address operator,
		address from,
		address to,
		uint256[] memory ids,
		uint256[] memory amounts,
		bytes memory data
	) internal override {
		if (from != address(0)) {
			// If it's not a mint operation
			require(isApprovedForAll(from, operator), "Transfer not approved");
		}
		super._beforeTokenTransfer(operator, from, to, ids, amounts, data);
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
				uint256 amount // otc token amount bought
			) = abi.decode(
					bundleData[i:i + 104],
					(address, address, uint256, uint256)
				);

			// Ensure that the seller has enough tokens
			require(
				balanceOf(seller, tokenId) >= amount,
				"Seller does not have enough tokens"
			);

			// Calculate total payment by buyer in stablecoin excluding fees
			uint256 totalPayment = amount * pricePerToken;

			// Calculate service fee and platform fee
			uint serviceFeeAmount = (totalPayment * serviceFee) / 100;
			uint platformFeeAmount = (totalPayment * platformFee) / 100;

			// Calculate total cost to the buyer in stablecoin
			uint256 totalCost = totalPayment +
				serviceFeeAmount +
				platformFeeAmount;

			// Ensure buyer has enough tokens
			require(
				tradingWallet.getERC20Balance(buyer, address(baseToken)) >=
					totalCost,
				"Buyer does not have enough tokens"
			);

			// Prepare the payment balance update data
			address[] memory fromAddresses = new address[](2);
			fromAddresses[0] = buyer;
			fromAddresses[1] = buyer;

			address[] memory toAddresses = new address[](2);
			toAddresses[0] = seller;
			toAddresses[1] = platformTreasury;

			uint[] memory amounts = new uint[](2);
			amounts[0] = serviceFeeAmount;
			amounts[1] = platformFeeAmount;
			// Perform the payment updates in batch
			tradingWallet.batchUpdateBalances(
				fromAddresses,
				toAddresses,
				address(baseToken),
				amounts
			);

			// Perform the otc balance settlement
			safeTransferFrom(seller, buyer, tokenId, amount, "");
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
