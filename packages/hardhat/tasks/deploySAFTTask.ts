import { task } from "hardhat/config";
import { HardhatRuntimeEnvironment } from "hardhat/types";

task("deploySAFT", "Deploys the SAFTToken contract with a Merkle root and metadata URI")
  .addParam("merkleRoot", "The Merkle root for the contract")
  .addParam("metadataUri", "The metadata URI for the contract")
  .setAction(async ({ merkleRoot, metadataUri }, hre: HardhatRuntimeEnvironment) => {
    process.env.MERKLE_ROOT = merkleRoot;
    process.env.METADATA_URI = metadataUri;
    await hre.run("deploy", { tags: ["SAFTToken"] });
  });
