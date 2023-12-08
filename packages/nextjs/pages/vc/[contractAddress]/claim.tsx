import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { ethers } from "ethers";
import MerkleTree from "merkletreejs";
import { keccak256 } from "viem";
import {
  useAccount,
  useContractEvent,
  useContractRead,
  useContractWrite,
  useNetwork,
  useWaitForTransaction,
} from "wagmi";
import { notification } from "~~/utils/scaffold-eth";

export default function ClaimOTCTokens() {
  const router = useRouter();
  // const { contractAddress } = router.query;
  const [whitelist, setWhitelist] = useState<any[]>([]);
  const [availableTokens, setAvailableTokens] = useState(0);
  const { address, isConnected } = useAccount();
  const { chain } = useNetwork();
  const [contractAbi, setContractAbi] = useState({} as any);
  const [tokenId, setTokenId] = useState(null);
  const [contractAddress, setContractAddress] = useState(null);
  const [txHash, setTxHash] = useState("");

  useEffect(() => {
    if (router.query.contractAddress) {
      setContractAddress(router.query.contractAddress as any);
    }
  }, [router.query]);

  useEffect(() => {
    fetch("/api/abi")
      .then(response => response.json())
      .then(data => {
        setContractAbi(data);
      })
      .catch(err => console.log(err));
  }, []);

  const {
    writeAsync: callMint,
    isLoading,
    data: mintTxn,
  } = useContractWrite({
    address: contractAddress,
    functionName: "mint",
    abi: contractAbi?.abi,
    onSuccess: (data: any) => {
      notification.success("Successfully minted the OTC Tokens");
      console.log("Transaction data", data);
      console.log("mintTxn: ", mintTxn);
      setTxHash(data.hash);
    },
  });

  const { data: txnData } = useWaitForTransaction({
    hash: txHash as `0x${string}`,
  });

  useEffect(() => {
    if (txnData) {
      console.log("🚀 ~ file: claim.tsx:65 ~ useEffect ~ txnData:", txnData);
      const { logs }: any = txnData;
      if (logs[0].topics[0] === "0xc3d58168c5ae7397731d063d5bbf3d657854427343f4c083240f7aacaa2d0f62") {
        console.log("Got the TransferSIngle event ...");
        const iface = new ethers.utils.Interface(contractAbi?.abi);
        const decodedLog = iface.parseLog(logs[0]);
        console.log("🚀 ~ file: claim.tsx:71 ~ useEffect ~ decodedLog:", decodedLog);
        const decodedTokenId = decodedLog.args.id.toString(10);
        setTokenId(decodedTokenId);
        // associate [tokenId, transactionHash, chainId, projectId ] with the user in DB
        fetch("/api/saft/token-mint", {
          method: "POST",
          body: JSON.stringify({
            contractAddress,
            tokenId: decodedTokenId,
            transactionHash: txHash,
            chainId: chain?.id,
            walletAddress: address,
            amount: availableTokens,
          }),
        })
          .then(response => response.json())
          .then(data => {
            console.log("🚀 ~ file: claim.tsx:100 ~ listener ~ data:", data);
          })
          .catch(err => console.log(err));
        // const decodedEvent = ethers.utils.defaultAbiCoder.decode(
        //   ["address", "address", "address", "uint256", "uint256"],
        //   logs[0].data,
        // );
        // console.log("🚀 ~ file: claim.tsx:74 ~ useEffect ~ decodedEvent:", decodedEvent);
      }
    }
  }, [txnData]);

  const encodeLeaf = (address: any, amount: any) => {
    // Same as `abi.encodePacked` in Solidity
    return ethers.utils.defaultAbiCoder.encode(
      ["address", "uint256"], // The datatypes of arguments to encode
      [address, amount], // The actual values
    );
  };

  const handleClaim = () => {
    // generate merkle proof
    if (!whitelist.length) {
      console.log("Whitelist data not yet available");
    }
    console.log("whitelist: ", whitelist);
    const leaves = whitelist.map((x: any) => keccak256(x.userWalletAddress));
    const tree = new MerkleTree(leaves, keccak256, { sortPairs: true });
    const leaf = keccak256(address as any);
    const merkleProof = tree.getHexProof(leaf);
    callMint({ args: [availableTokens, "0x", merkleProof] });
  };

  useEffect(() => {
    if (isConnected && contractAddress) {
      // Call the endpoint to get the available tokens for the user
      fetch("/api/saft/claim", { method: "POST", body: JSON.stringify({ contractAddress, chainId: chain.id }) })
        .then(response => response.json())
        .then(data => {
          setWhitelist(data);
          const member = data.find((member: any) => member.userWalletAddress === address);

          setAvailableTokens(member.amount);
        })
        .catch(err => console.log(err));
      console.log("Connected and ready to fetch...", address);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contractAddress, isConnected]);

  // const { data, isLoading } = useContractRead({
  //   address: contractAddress as string,
  //   abi: contractAbi?.abi,
  //   functionName: "balanceOf",
  //   args: [address, parseInt(tokenId as any as string)],
  //   onSuccess(data) {
  //     console.log("useContractRead Success", data);
  //   },
  // });

  return (
    <div className="container">
      <div className="flex justify-center align-middle m-4 flex-wrap column">
        {availableTokens > 0 ? (
          <>
            {!tokenId && <div className="font-medium text-primary">You can claim {availableTokens} tokens.</div>}
            {tokenId ? (
              <div className="font-medium text-primary">
                You have claimed Token #{tokenId} with {availableTokens} tokens.
              </div>
            ) : (
              <button className="btn btn-sm btn-primary" onClick={handleClaim}>
                {isLoading && <span className="loading loading-spinner"></span>}
                {!txnData && isLoading ? "Claiming SAFT-Backed Tokens ..." : "Claim Tokens"}
              </button>
            )}
          </>
        ) : (
          <p>No tokens available to claim.</p>
        )}
      </div>
    </div>
  );
}
