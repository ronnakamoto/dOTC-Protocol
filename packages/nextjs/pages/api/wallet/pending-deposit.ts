import type { NextApiRequest, NextApiResponse } from "next";
import { savePendingDeposit } from "~~/services/db";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { transactionHash, amount, contractAddress, walletAddress } = JSON.parse(req.body);
    const pendingDeposit = await savePendingDeposit({
      amount: parseFloat(amount),
      transactionHash,
      contractAddress,
      walletAddress,
    });
    res.status(200).json(pendingDeposit);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
}
