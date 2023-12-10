import type { NextApiRequest, NextApiResponse } from "next";
import { getAvailableBalance } from "~~/services/db";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { contractAddress, walletAddress } = req.query;
    const balance = await getAvailableBalance(contractAddress as string, walletAddress as string);
    res.status(200).json(balance);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
}
