// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";
import "@chainlink/contracts/src/v0.8/vrf/VRFConsumerBaseV2.sol";
import "@chainlink/contracts/src/v0.8/shared/access/ConfirmedOwner.sol";
import { FunctionsClient } from "@chainlink/contracts/src/v0.8/functions/dev/v1_0_0/FunctionsClient.sol";
import { FunctionsRequest } from "@chainlink/contracts/src/v0.8/functions/dev/v1_0_0/libraries/FunctionsRequest.sol";

contract DOTCBundlerService is
	VRFConsumerBaseV2,
	ConfirmedOwner,
	FunctionsClient
{
	using FunctionsRequest for FunctionsRequest.Request;
	event RequestSent(uint256 requestId, uint32 numWords);
	event BundlerIdRequestFulfilled(uint256 requestId, uint256[] bundlerIds);

	struct RequestStatus {
		bool fulfilled; // whether the request has been successfully fulfilled
		bool exists; // whether a requestId exists
		uint256[] bundlerIds;
	}
	mapping(uint256 => RequestStatus)
		public bundlerIdRequests; /* requestId --> requestStatus */
	VRFCoordinatorV2Interface COORDINATOR;

	// Your subscription ID.
	uint64 vrfSubscriptionId;

	// past requests Id.
	uint256[] public requestIds;
	uint256 public lastRequestId;

	// past requests for CLFn
	bytes32 public s_lastRequestId;
	bytes public s_lastResponse;
	bytes public s_lastError;

	// Using Fuji gas lane
	bytes32 keyHash =
		0x354d2f95da55398f44b7cff77da56283d9c6c829a4bdf1bbcaf2ad6a4d081f61;

	// Depends on the number of requested values that you want sent to the
	// fulfillRandomWords() function. Storing each word costs about 20,000 gas,
	// so 100,000 is a safe default for this example contract. Test and adjust
	// this limit based on the network that you select, the size of the request,
	// and the processing of the callback request in the fulfillRandomWords()
	// function.
	uint32 callbackGasLimit = 100000;

	// The default is 3, but you can set this higher.
	uint16 requestConfirmations = 3;

	uint32 idCount = 1;

	error UnexpectedCLFnRequestID(bytes32 requestId);

	event Response(bytes32 indexed requestId, bytes response, bytes err);

	/**
	 * FUJI
	 * COORDINATOR: 0x2eD832Ba664535e5886b75D64C46EB9a228C2610
	 */
	constructor(
		uint64 _vrfSubscriptionId,
		address router
	)
		FunctionsClient(router)
		VRFConsumerBaseV2(0x2eD832Ba664535e5886b75D64C46EB9a228C2610)
		ConfirmedOwner(msg.sender)
	{
		COORDINATOR = VRFCoordinatorV2Interface(
			0x2eD832Ba664535e5886b75D64C46EB9a228C2610
		);
		vrfSubscriptionId = _vrfSubscriptionId;
	}

	// Assumes the subscription is funded sufficiently.
	function requestBundlerId() external onlyOwner returns (uint256 requestId) {
		// Will revert if subscription is not set and funded.
		requestId = COORDINATOR.requestRandomWords(
			keyHash,
			vrfSubscriptionId,
			requestConfirmations,
			callbackGasLimit,
			idCount
		);
		bundlerIdRequests[requestId] = RequestStatus({
			bundlerIds: new uint256[](0),
			exists: true,
			fulfilled: false
		});
		requestIds.push(requestId);
		lastRequestId = requestId;
		emit RequestSent(requestId, idCount);
		return requestId;
	}

	function fulfillRandomWords(
		uint256 _requestId,
		uint256[] memory _bundlerIds
	) internal override {
		require(bundlerIdRequests[_requestId].exists, "request not found");
		bundlerIdRequests[_requestId].fulfilled = true;
		bundlerIdRequests[_requestId].bundlerIds = _bundlerIds;
		emit BundlerIdRequestFulfilled(_requestId, _bundlerIds);
	}

	function getRequestStatus(
		uint256 _requestId
	) external view returns (bool fulfilled, uint256[] memory bundlerIds) {
		require(bundlerIdRequests[_requestId].exists, "request not found");
		RequestStatus memory request = bundlerIdRequests[_requestId];
		return (request.fulfilled, request.bundlerIds);
	}

	/**
	 * @notice Send a simple request
	 * @param source JavaScript source code
	 * @param encryptedSecretsUrls Encrypted URLs where to fetch user secrets
	 * @param donHostedSecretsSlotID Don hosted secrets slotId
	 * @param donHostedSecretsVersion Don hosted secrets version
	 * @param args List of arguments accessible from within the source code
	 * @param bytesArgs Array of bytes arguments, represented as hex strings
	 * @param subscriptionId Billing ID
	 */
	function sendRequest(
		string memory source,
		bytes memory encryptedSecretsUrls,
		uint8 donHostedSecretsSlotID,
		uint64 donHostedSecretsVersion,
		string[] memory args,
		bytes[] memory bytesArgs,
		uint64 subscriptionId,
		uint32 gasLimit,
		bytes32 donID
	) external onlyOwner returns (bytes32 requestId) {
		FunctionsRequest.Request memory req;
		req.initializeRequestForInlineJavaScript(source);
		if (encryptedSecretsUrls.length > 0)
			req.addSecretsReference(encryptedSecretsUrls);
		else if (donHostedSecretsVersion > 0) {
			req.addDONHostedSecrets(
				donHostedSecretsSlotID,
				donHostedSecretsVersion
			);
		}
		if (args.length > 0) req.setArgs(args);
		if (bytesArgs.length > 0) req.setBytesArgs(bytesArgs);
		s_lastRequestId = _sendRequest(
			req.encodeCBOR(),
			subscriptionId,
			gasLimit,
			donID
		);
		return s_lastRequestId;
	}

	/**
	 * @notice Store latest CLFn result/error
	 * @param requestId The request ID, returned by sendRequest()
	 * @param response Aggregated response from the user code
	 * @param err Aggregated error from the user code or from the execution pipeline
	 * Either response or error parameter will be set, but never both
	 */
	function fulfillRequest(
		bytes32 requestId,
		bytes memory response,
		bytes memory err
	) internal override {
		if (s_lastRequestId != requestId) {
			revert UnexpectedCLFnRequestID(requestId);
		}
		s_lastResponse = response;
		s_lastError = err;
		emit Response(requestId, s_lastResponse, s_lastError);
	}
}
