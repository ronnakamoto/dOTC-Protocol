// Adjust the paths according to your project structure
import SAFTToken from "../../../public/artifacts/contracts/SAFTToken.sol/SAFTToken.json";
import { ethers } from "ethers";
import { parseUnits, zeroAddress } from "viem";
import { createDealDeposit, createProject, createSellOrder, createUser } from "~~/services/db";
import { selectRpcProvider } from "~~/utils";

export default async function handler(req, res) {
  if (req.method === "POST") {
    try {
      // Extract token data from the request body
      const {
        generalDetails,
        roundDetails,
        tradingDetails,
        ownerAddress,
        chainId,
        baseToken,
        tradingWallet,
        executorManager,
      } = JSON.parse(req.body);

      console.log(
        "🚀 ~ file: create.ts:13 ~ handler ~ ownerAddress, chainId, baseToken, tradingWallet:",
        ownerAddress,
        chainId,
        baseToken,
        tradingWallet,
        executorManager,
      );
      const user = await createUser({ wallet: ownerAddress });
      console.log("🚀 ~ file: create.ts:14 ~ handler ~ user:", user);

      const { projectName, projectSymbol, description, dealVisibility } = generalDetails;
      console.log(
        "🚀 ~ file: create.ts:14 ~ handler ~ projectName, projectSymbol, saftDetails:",
        projectName,
        projectSymbol,
        description,
      );
      const { investmentRound, offerType, roundFdv, roundPricePerToken, sellerType } = roundDetails;
      console.log(
        "🚀 ~ file: create.ts:16 ~ handler ~ investmentRound, offerType, roundFdv, roundPricePerToken, sellerType:",
        investmentRound,
        offerType,
        roundFdv,
        roundPricePerToken,
        sellerType,
      );
      const { minBuyAmount, pricePerToken, serviceCharge, tokensToSell, tradeType } = tradingDetails;
      console.log(
        "🚀 ~ file: create.ts:18 ~ handler ~ minBuyAmount, pricePerToken, serviceCharge, tokensToSell, tradeType:",
        minBuyAmount,
        pricePerToken,
        serviceCharge,
        tokensToSell,
        tradeType,
      );

      console.log("parseUnits(tokensToSell): ", ethers.utils.parseUnits(tokensToSell + "", 18));
      console.log("parseUnits(pricePerToken): ", parseUnits(pricePerToken + "", 18));

      // deploy the contract
      const provider = new ethers.providers.JsonRpcProvider(selectRpcProvider(chainId));

      const wallet = new ethers.Wallet(process.env.PRIVATE_KEY as any, provider);

      // return res.status(200).json({});
      const SAFTTokenFactory = new ethers.ContractFactory(SAFTToken.abi, SAFTToken.bytecode, wallet);
      const saftToken = await SAFTTokenFactory.deploy(
        ownerAddress, // _owner
        ethers.utils.formatBytes32String(""), // _merkleRoot
        ethers.utils.formatBytes32String(""), // metadataUri
        ethers.utils.parseUnits(tokensToSell + "", 18), // totalSupply
        ethers.utils.parseUnits(pricePerToken + "", 18), // _pricePerToken
        executorManager, // _executorManager
        ethers.utils.parseUnits(serviceCharge + "", 18), // _serviceFee
        ethers.utils.parseUnits("0.05", 18), // _platformFee
        baseToken, // _baseToken
        tradingWallet, // _platformTreasury
        tradingWallet, // _tradingWallet,
      );

      const deployedContract = await saftToken.deployed();

      //   Let's have a 2 phase commit scheme for deal creation.
      // Store the details we have off-chain
      const projectCreated = await createProject({
        name: projectName,
        symbol: projectSymbol,
        description,
        dealVisibility,
        offerType,
        investmentRound,
        sellerType,
        roundFdv: parseFloat(roundFdv),
        roundPricePerToken: parseFloat(roundPricePerToken),
        tradeType,
        tokensToSell: parseFloat(tokensToSell),
        pricePerToken: parseFloat(pricePerToken),
        serviceCharge: parseFloat(serviceCharge),
        userId: user.id,
        transactionHash: deployedContract.deployTransaction.hash,
        contractAddress: deployedContract.address,
        chainId: parseInt(chainId),
      });
      // Then update with the on-chain data once txn is completed.

      if (!projectCreated) {
        throw new Error("Unable to create project");
      }
      return res.status(200).json({
        contractAddress: deployedContract.address,
        txHash: deployedContract.deployTransaction.hash,
      });
    } catch (error) {
      console.log("🚀 ~ file: create.ts:37 ~ handler ~ error:", error);
      // Handle errors
      return res.status(500).json({ error: "Internal Server Error" });
    }
  } else {
    // Handle non-POST requests
    res.setHeader("Allow", ["POST"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
