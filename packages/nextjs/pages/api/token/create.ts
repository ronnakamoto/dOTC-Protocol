import { ethers } from "ethers";
import fs from "fs";
import path from "path";
import { createProject, createUser } from "~~/services/db";

// Adjust the paths according to your project structure
const artifactPath = path.join(process.cwd(), "../nextjs/artifacts/contracts/SAFTToken.sol/SAFTToken.json");
const SAFTToken = JSON.parse(fs.readFileSync(artifactPath, "utf8"));

export default async function handler(req, res) {
  if (req.method === "POST") {
    try {
      // Extract token data from the request body
      const { tokenName, totalSupply, owner, pricePerToken, symbol, saftDetails, amountRaised } = req.body;
      console.log("🚀 ~ file: create.ts:15 ~ handler ~ owner:", owner);

      // Mock token creation logic (In a real scenario, interact with blockchain)
      console.log("Creating token:", tokenName, "with total supply:", totalSupply);

      // Set the metadata URI
      const metadataUri = "https://www.oursong.com/project/erc1155token-meta/0.json";

      // Initialize Hardhat environment
      const provider = new ethers.providers.JsonRpcProvider(process.env.RPC_URL);

      const wallet = new ethers.Wallet(process.env.PRIVATE_KEY as any, provider);

      // Deploy the contract
      const SAFTTokenFactory = new ethers.ContractFactory(SAFTToken.abi, SAFTToken.bytecode, wallet);
      const saftToken = await SAFTTokenFactory.deploy(owner, ethers.utils.formatBytes32String(""), metadataUri);

      const deployedContract = await saftToken.deployed();

      // save to DB
      const user = await createUser({ wallet: owner });
      console.log("🚀 ~ file: create.ts:35 ~ handler ~ user:", user);
      const projectCreated = await createProject({
        name: tokenName,
        totalSupply,
        pricePerToken: parseFloat(pricePerToken),
        amountRaised: parseFloat(amountRaised),
        symbol,
        saftDetails,
        transactionHash: deployedContract.deployTransaction.hash,
        contractAddress: deployedContract.address,
        userId: user.id,
      });
      console.log("🚀 ~ file: create.ts:45 ~ handler ~ projectCreated:", projectCreated);

      res.status(200).json({
        data: {
          address: deployedContract.address,
          txHash: deployedContract.deployTransaction.hash,
        },
        message: `SAFT Contract for '${tokenName}' created successfully with a total supply of ${totalSupply} at ${deployedContract.address}.`,
      });
    } catch (error) {
      console.log("🚀 ~ file: create.ts:37 ~ handler ~ error:", error);
      // Handle errors
      res.status(500).json({ error: "Internal Server Error" });
    }
  } else {
    // Handle non-POST requests
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
