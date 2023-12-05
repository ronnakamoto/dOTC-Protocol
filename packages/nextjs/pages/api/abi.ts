// Import necessary modules
import fs from "fs";
import type { NextApiRequest, NextApiResponse } from "next";
import path from "path";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Path to your JSON file
    const jsonFilePath = path.join(process.cwd(), "artifacts/contracts/SAFTToken.sol/SAFTToken.json");

    // Read the JSON file
    const jsonData = fs.readFileSync(jsonFilePath, "utf8");

    // Parse and send the JSON data
    res.status(200).json(JSON.parse(jsonData));
  } catch (error) {
    // Error handling
    console.error("Error reading JSON file:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
