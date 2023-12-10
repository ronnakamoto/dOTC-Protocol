import type { NextApiRequest, NextApiResponse } from "next";
import { createSellOrder } from "~~/services/db";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { price, amount, contractAddress, walletAddress } = JSON.parse(req.body);
    const sellOrder = await createSellOrder({
      price: parseFloat(price),
      amount: parseFloat(amount),
      contractAddress,
      walletAddress,
    });
    res.status(200).json(sellOrder);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
}
