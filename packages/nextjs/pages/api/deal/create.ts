// Adjust the paths according to your project structure
import SAFTToken from "../../../public/artifacts/contracts/SAFTToken.sol/SAFTToken.json";
import { ethers } from "ethers";
import { zeroAddress } from "viem";
import { createDealDeposit, createProject, createSellOrder, createUser } from "~~/services/db";

export default async function handler(req, res) {
  if (req.method === "POST") {
    try {
      // Extract token data from the request body
      const { generalDetails, roundDetails, tradingDetails } = JSON.parse(req.body);

      const { projectName, projectSymbol, saftDetails } = generalDetails;
      console.log(
        "🚀 ~ file: create.ts:14 ~ handler ~ projectName, projectSymbol, saftDetails:",
        projectName,
        projectSymbol,
        saftDetails,
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

      //   Let's have a 2 phase commit scheme for deal creation.
      // Store the details we have off-chain
      // Then update with the on-chain data once txn is completed.

      return res.status(200).json({
        contractAddress: "xyz",
        txHash: "abc",
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
