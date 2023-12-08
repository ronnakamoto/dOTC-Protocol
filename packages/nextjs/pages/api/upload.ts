// pages/api/upload.ts
import * as Client from "@web3-storage/w3up-client";
import { ethers } from "ethers";
import { filesFromPaths } from "files-from-path";
import formidable from "formidable";
import fs from "fs";
import keccak256 from "keccak256";
import { MerkleTree } from "merkletreejs";
import type { NextApiRequest, NextApiResponse } from "next";
import Papa from "papaparse";
import { addWhitelist, getProjectByContractAddress } from "~~/services/db";

export const config = {
  api: {
    bodyParser: false,
  },
};

function encodeLeaf(address: string, amount: number) {
  // Same as `abi.encodePacked` in Solidity
  return ethers.utils.defaultAbiCoder.encode(
    ["address", "uint256"], // The datatypes of arguments to encode
    [address, amount], // The actual values
  );
}

const ipfsUpload = async (filePath: string) => {
  // authorize your local agent to act on your behalf
  const client = await Client.create();
  await client.login("adarshron@gmail.com");

  await client.setCurrentSpace("did:key:z6MkoD9ynCvuNh6UHykeMLNmzZFfE1fJ8nPNHtWMNTyb66pi");
  const files = await filesFromPaths([filePath]);
  const fileCid = await client.uploadFile(files[0]);
  return fileCid;
};

const uploadHandler = async (req: NextApiRequest, res: NextApiResponse) => {
  const form = formidable({});
  form.parse(req, async (err, _fields, files) => {
    const contractAddress = _fields["contractAddress"] ? _fields["contractAddress"][0] : "";
    if (err) {
      res.status(500).json({ error: "Error parsing the file" });
      return;
    }

    const file: any = files.file;
    const csvData = fs.readFileSync(file[0].filepath, "utf8");

    // Save to IPFS
    const cid = await ipfsUpload(file[0].filepath);

    Papa.parse(csvData, {
      header: true,
      complete: async result => {
        // Process CSV data
        const contributions = result.data.filter((x: any) => x?.walletAddress);
        // prepare the whitelist data tp be inserted
        const whitelistToSaveToDb: any[] = [];
        const project = await getProjectByContractAddress(contractAddress);

        if (!project) {
          throw new Error("Project not found");
        }
        // Generate Merkle Tree Root
        const leaves = contributions.map((x: any) => {
          whitelistToSaveToDb.push({
            projectId: project?.id,
            userWalletAddress: x.walletAddress,
            amount: parseFloat(x.contribution),
          });
          return keccak256(x.walletAddress);
        });
        await addWhitelist(whitelistToSaveToDb, cid as any as string);
        const tree = new MerkleTree(leaves, keccak256, { sortPairs: true });
        const root = tree.getHexRoot();
        res
          .status(200)
          .json({ data: contributions, merkleRoot: root, url: `https://${cid}.ipfs.${process.env.IPFS_GATEWAY_HOST}` });
      },
    });
  });
};

export default uploadHandler;
