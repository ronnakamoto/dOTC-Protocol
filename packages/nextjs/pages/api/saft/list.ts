import type { NextApiRequest, NextApiResponse } from "next";
import { getAllSafts } from "~~/services/db";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { wallet } = req.body;
    const safts = await getAllSafts(wallet);
    res.status(200).json(safts);
  } catch (error) {
    // Error handling
    console.error("Error reading JSON file:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
