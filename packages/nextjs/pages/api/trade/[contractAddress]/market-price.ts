import type { NextApiRequest, NextApiResponse } from "next";
import { getCurrentMarketPriceByContract } from "~~/services/db";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { contractAddress } = req.query;
    const price = await getCurrentMarketPriceByContract(contractAddress as string);
    res.status(200).json(price);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
}
