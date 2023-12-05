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
  const account = await client.login("adarshron@gmail.com");
  console.log("🚀 ~ file: upload.ts:20 ~ ipfsUpload ~ account:", account);

  await client.setCurrentSpace("did:key:z6MkoD9ynCvuNh6UHykeMLNmzZFfE1fJ8nPNHtWMNTyb66pi");
  const files = await filesFromPaths([filePath]);
  const fileCid = await client.uploadFile(files[0]);
  return fileCid;
};

const uploadHandler = async (req: NextApiRequest, res: NextApiResponse) => {
  const form = formidable({});
  form.parse(req, async (err, _fields, files) => {
    if (err) {
      res.status(500).json({ error: "Error parsing the file" });
      return;
    }

    const file: any = files.file;
    const csvData = fs.readFileSync(file[0].filepath, "utf8");

    // Save to IPFS
    const cid = await ipfsUpload(file[0].filepath);
    console.log("🚀 ~ file: upload.ts:39 ~ form.parse ~ cid:", cid);

    Papa.parse(csvData, {
      header: true,
      complete: result => {
        // Process CSV data
        const contributions = result.data.filter((x: any) => x?.walletAddress);
        // Generate Merkle Tree Root
        const leaves = contributions.map((x: any) => keccak256(encodeLeaf(x.walletAddress, x.contribution)));
        const tree = new MerkleTree(leaves, keccak256, { sortPairs: true });
        const root = tree.getHexRoot();
        res.status(200).json({ data: contributions, merkleRoot: root });
      },
    });
  });
};

export default uploadHandler;
