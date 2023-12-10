import type { NextApiRequest, NextApiResponse } from "next";
import { getAllDeposits } from "~~/services/db";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { walletAddress } = req.query;
    const deposits = await getAllDeposits({
      walletAddress,
    });
    res.status(200).json(deposits);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
}
