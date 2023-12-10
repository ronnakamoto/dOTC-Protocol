import React, { useEffect, useState } from "react";
import TradingWalletABI from "../artifacts/contracts/TradingWallet.sol/TradingWallet.json";
import USDTABI from "../artifacts/contracts/USDT.sol/USDT.json";
import { ethers } from "ethers";
import { useAccount, useContractEvent, useContractWrite, useNetwork, useWaitForTransaction } from "wagmi";
import { useScaffoldContractRead } from "~~/hooks/scaffold-eth";
import { notification } from "~~/utils/scaffold-eth";

const Deposit = () => {
  const { address: userAddress } = useAccount();
  const [amount, setAmount] = useState("0");
  const [allowance, setAllowance] = useState("0");
  const {
    chain: { chainId },
  } = useNetwork();
  const [depositTxnHash, setDepositTxnHash] = useState("");

  const { writeAsync: callDeposit, isLoading: isDepositLoading } = useContractWrite({
    address: "0x403b9F5580a6Dd698AA90DEe3b36b4a54Cf13677",
    functionName: "depositERC20",
    abi: TradingWalletABI?.abi,
    onSuccess: (data: any) => {
      console.log("Transaction data", data);
      setDepositTxnHash(data.hash);
      notification.success(`Deposit is successful`);
      // Reset the amount after deposit
      setAmount("0");
    },
  });

  const { writeAsync: callApprove, isLoading: isApproveLoading } = useContractWrite({
    address: "0x3D6D1F095a3F3c3bb889847d009c105D197D1735",
    functionName: "approve",
    abi: USDTABI?.abi,
    onSuccess: (data: any) => {
      console.log("Transaction data", data);
      notification.success(`Approval is successful`);
    },
  });

  const { data: allowanceData } = useScaffoldContractRead({
    contractName: "USDT",
    functionName: "allowance",
    args: [userAddress, "0x403b9F5580a6Dd698AA90DEe3b36b4a54Cf13677"],
  });

  useEffect(() => {
    if (allowanceData) {
      console.log("🚀 ~ file: Deposit.tsx:42 ~ useEffect ~ allowanceData:", allowanceData);
      setAllowance(allowanceData);
    }
  }, [allowanceData]);

  const isApprovalNeeded = () => {
    if (!amount && !allowance) {
      return true;
    }
    return ethers.utils.parseUnits(amount, 18).gt(allowance);
  };

  const { data: txnData } = useWaitForTransaction({
    hash: depositTxnHash as `0x${string}`,
  });

  useEffect(() => {
    if (txnData) {
      const { logs }: any = txnData;
      const eventSignature = ethers.utils.id("Deposit(address,address,uint256)");
      const log = logs.find(log => log.topics[0] === eventSignature);
      if (log.topics[0]) {
        const iface = new ethers.utils.Interface(TradingWalletABI?.abi);
        const decodedLog = iface.parseLog(log);
        const decodedUser = decodedLog.args.user;
        const decodedAmount = ethers.utils.formatUnits(decodedLog.args.amount, 18);

        // associate [tokenId, transactionHash, chainId, projectId ] with the user in DB
        // fetch("/api/saft/token-mint", {
        //   method: "POST",
        //   body: JSON.stringify({
        //     contractAddress,
        //     tokenId: decodedTokenId,
        //     transactionHash: txHash,
        //     chainId: chain?.id,
        //     walletAddress: address,
        //     amount: availableTokens,
        //   }),
        // })
        //   .then(response => response.json())
        //   .then(data => {
        //     console.log("🚀 ~ file: claim.tsx:100 ~ listener ~ data:", data);
        //   })
        //   .catch(err => console.log(err));
      }
    }
  }, [txnData]);

  const handleDeposit = () => {
    // Logic to interact with the TradingWallet contract
    console.log(`Depositing ${amount}`);
    callDeposit({ args: ["0x3D6D1F095a3F3c3bb889847d009c105D197D1735", ethers.utils.parseUnits(amount, 18)] });
  };

  const handleApprove = () => {
    console.log(`Approving ${amount}`);
    callApprove({ args: ["0x403b9F5580a6Dd698AA90DEe3b36b4a54Cf13677", ethers.utils.parseUnits(amount, 18)] });
  };

  return (
    <div className="flex items-center justify-center p-4 bg-white rounded-lg shadow-md w-full">
      <h2 className="text-2xl font-semibold text-gray-800 m-4 w-full">Deposit Funds</h2>
      <input
        type="number"
        className="input input-bordered input-sm"
        value={amount}
        onChange={e => setAmount(e.target.value)}
        placeholder="Enter amount"
      />
      <button className="btn btn-sm btn-secondary m-2" onClick={handleApprove} disabled={!isApprovalNeeded()}>
        {isApproveLoading && <span className="loading loading-spinner"></span>}
        {isApproveLoading ? "Approval in progress ..." : "Approve"}
      </button>
      <button className="btn btn-sm btn-primary m-2 ml-0" onClick={handleDeposit} disabled={parseInt(amount) < 1}>
        {isDepositLoading && <span className="loading loading-spinner"></span>}
        {isDepositLoading ? "Deposit in progress ..." : "Deposit USDT"}
      </button>
    </div>
  );
};

export default Deposit;
