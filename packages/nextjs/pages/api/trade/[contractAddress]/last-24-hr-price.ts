import type { NextApiRequest, NextApiResponse } from "next";
import { getCurrentMarketPriceByContract, getPrice24HoursAgo } from "~~/services/db";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { contractAddress } = req.query;
    const currentPrice = await getCurrentMarketPriceByContract(contractAddress as string);
    const price24HoursAgo = await getPrice24HoursAgo(contractAddress as string);
    if (currentPrice !== null && price24HoursAgo !== null) {
      const priceChange = ((currentPrice - price24HoursAgo) / price24HoursAgo) * 100;
      return res.status(200).json(priceChange.toFixed(2));
    }
    res.status(200).json("-");
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
}
