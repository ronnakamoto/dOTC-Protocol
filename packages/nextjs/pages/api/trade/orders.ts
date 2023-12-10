import { OrderType } from "@prisma/client";
import type { NextApiRequest, NextApiResponse } from "next";
import { getOpenBuyOrders, getOpenSellOrders } from "~~/services/db";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { contractAddress, orderType } = req.query;
    switch (orderType) {
      case OrderType.BUY: {
        const buyOrders = await getOpenBuyOrders(contractAddress as string);
        return res.status(200).json(buyOrders);
      }

      case OrderType.SELL: {
        const sellOrders = await getOpenSellOrders(contractAddress as string);
        return res.status(200).json(sellOrders);
      }

      default: {
        return res.status(200).json([]);
      }
    }
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
}
