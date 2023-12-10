import type { NextApiRequest, NextApiResponse } from "next";
import { registerBundler } from "~~/services/db";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { registrationId, requestId } = req.body;
    console.log("🚀 ~ file: getRegistrationId.ts:6 ~ handler ~ registrationId, requestId:", registrationId, requestId);
    const bundler = await registerBundler({ registrationId, requestId });
    res.status(200).json({ registrationId: bundler.registrationId, requestId: bundler.requestId });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
}
