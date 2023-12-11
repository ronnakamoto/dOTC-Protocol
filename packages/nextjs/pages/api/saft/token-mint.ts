import type { NextApiRequest, NextApiResponse } from "next";
import { addSaftOTokenDeposit, createClaimToken } from "~~/services/db";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { contractAddress, tokenId, transactionHash, chainId, amount, walletAddress } = JSON.parse(req.body);
    const token = await createClaimToken({
      contractAddress,
      tokenId: parseInt(tokenId),
      transactionHash,
      chainId: parseInt(chainId),
      walletAddress,
      amount: parseFloat(amount),
    });
    // add amount to balance as well
    await addSaftOTokenDeposit({ contractAddress, walletAddress, amount: parseFloat(amount), transactionHash });
    res.status(200).json(token);
  } catch (error) {
    // Error handling
    console.error("Error reading JSON file:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
