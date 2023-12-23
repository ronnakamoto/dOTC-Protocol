import React, { useState } from "react";
import mockUSDTABI from "../public/artifacts/contracts/USDT.sol/USDT.json";
import { ethers } from "ethers";
import { useAccount, useConnect, useContractWrite, useNetwork } from "wagmi";

// Path to your ABI file

const Faucet = ({ contractAddress }) => {
  const [amount, setAmount] = useState("");
  const { isConnected, address: walletAddress } = useAccount();
  const { connect } = useConnect();
  const { chain } = useNetwork();

  const { writeAsync, isLoading } = useContractWrite({
    address: contractAddress,
    abi: mockUSDTABI.abi,
    functionName: "mint",
    args: [walletAddress, amount ? ethers.utils.parseUnits(amount, 18) : 0],
  });

  const handleMint = () => {
    if (!isConnected) {
      connect();
    } else if (chain?.unsupported) {
      alert("Please connect to a supported network");
    } else {
      writeAsync?.();
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold text-gray-800 mb-4">Mint USDT</h2>
      <input
        type="number"
        className="input input-bordered w-full max-w-xs mb-4"
        value={amount}
        onChange={e => setAmount(e.target.value)}
        placeholder="Enter amount"
        disabled={isLoading}
      />
      <button className="btn btn-primary" onClick={handleMint} disabled={!amount || isLoading}>
        {isLoading ? "Minting..." : "Mint"}
      </button>
    </div>
  );
};

export default Faucet;
