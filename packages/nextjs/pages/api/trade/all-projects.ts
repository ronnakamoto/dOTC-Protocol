import type { NextApiRequest, NextApiResponse } from "next";
import { getPricesOfAllProjects } from "~~/services/db";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { walletAddress } = req.query;
    const projects = await getPricesOfAllProjects(walletAddress as string);
    res.status(200).json(projects);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
}
