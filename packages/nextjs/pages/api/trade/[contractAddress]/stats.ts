import type { NextApiRequest, NextApiResponse } from "next";
import { getAssetStats } from "~~/services/db";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { contractAddress } = req.query;
    const stats = await getAssetStats(contractAddress as string);
    res.status(200).json(stats);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
}
