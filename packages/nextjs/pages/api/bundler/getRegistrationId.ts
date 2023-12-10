import { ReturnType, decodeResult } from "@chainlink/functions-toolkit";
import { Contract, utils } from "ethers";
import type { NextApiRequest, NextApiResponse } from "next";
import deployedContracts from "~~/contracts/deployedContracts";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const dOTCBundlerServiceContract = new Contract(
      deployedContracts[43113]["DOTCBundlerService"].address,
      new utils.Interface(deployedContracts[43113]["DOTCBundlerService"].abi),
      process.env.RPC_URL as any,
    );
    const responseBytes = await dOTCBundlerServiceContract.s_lastResponse();
    console.log("\nResponse Bytes : ", responseBytes);

    const decodedResponse = decodeResult(responseBytes, ReturnType.string);

    console.log("\nDecoded response from register endpoint:", decodedResponse);
    res.status(200).json(decodedResponse);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
}
