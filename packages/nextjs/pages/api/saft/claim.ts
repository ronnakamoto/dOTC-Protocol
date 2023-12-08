import type { NextApiRequest, NextApiResponse } from "next";
import { getProjectByContractAddress, getWhitelistByProjectId } from "~~/services/db";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { contractAddress } = JSON.parse(req.body);
    const project = await getProjectByContractAddress(contractAddress);
    if (!project) {
      throw new Error("Project not found");
    }
    const whitelistData = await getWhitelistByProjectId(project.id);
    res.status(200).json(whitelistData);
  } catch (error) {
    // Error handling
    console.error("Error reading JSON file:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
