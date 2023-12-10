import type { NextApiRequest, NextApiResponse } from "next";
import { finalizeDeposit } from "~~/services/db";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { transactionHash } = JSON.parse(req.body);
    const finalizedDeposit = await finalizeDeposit({
      transactionHash,
    });
    res.status(200).json(finalizedDeposit);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
}
