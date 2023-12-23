import React, { useEffect, useState } from "react";
import TradingWalletABI from "../public/artifacts/contracts/TradingWallet.sol/TradingWallet.json";
import USDTABI from "../public/artifacts/contracts/USDT.sol/USDT.json";
import { ethers } from "ethers";
import { useAccount, useContractWrite, useWaitForTransaction } from "wagmi";
import { useScaffoldContractRead } from "~~/hooks/scaffold-eth";
import { notification } from "~~/utils/scaffold-eth";

const TRADING_WALLET_ADDRESS = "0x403b9F5580a6Dd698AA90DEe3b36b4a54Cf13677";
const USDT_CONTRACT_ADDRESS = "0x3D6D1F095a3F3c3bb889847d009c105D197D1735";

const Deposit = () => {
  const { address: userAddress } = useAccount();
  const [amount, setAmount] = useState("0");
  const [allowance, setAllowance] = useState("0");
  const [depositTxnHash, setDepositTxnHash] = useState("");
  const [deposits, setDeposits] = useState([]);
  const [refreshDeposits, setRefreshDeposits] = useState(true);
  const [depositStatus, setDepositStatus] = useState("");

  const { writeAsync: callDeposit, isLoading: isDepositLoading } = useContractWrite({
    address: TRADING_WALLET_ADDRESS,
    functionName: "depositERC20",
    abi: TradingWalletABI?.abi,
    onSuccess: (data: any) => {
      console.log("🚀 ~ file: Deposit.tsx:25 ~ Deposit ~ data:", data);

      notification.info(`Deposit is detected`);
      fetch("/api/wallet/pending-deposit", {
        method: "POST",
        body: JSON.stringify({
          contractAddress: TRADING_WALLET_ADDRESS,
          walletAddress: userAddress,
          transactionHash: data.hash,
          amount,
        }),
      })
        .then(response => response.json())
        .then(data => {
          setRefreshDeposits(true);
          setDepositStatus("PENDING");
          console.log("🚀 ~ file: Deposit.tsx:82 ~ useEffect ~ data:", data);
          notification.info("Deposit is pending and is being processed");
        })
        .catch(err => console.log(err));
      // Reset the amount after deposit
      setAmount("0");
      setDepositTxnHash(data.hash);
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
  console.log("🚀 ~ file: Deposit.tsx:82 ~ Deposit ~ depositTxnHash:", depositTxnHash);
  console.log("🚀 ~ file: Deposit.tsx:82 ~ Deposit ~ txnData:", txnData);

  useEffect(() => {
    if (txnData && depositStatus === "PENDING") {
      console.log("🚀 ~ file: Deposit.tsx:87 ~ useEffect ~ txnData:", txnData);
      const { logs }: any = txnData;
      const eventSignature = ethers.utils.id("Deposit(address,address,uint256)");
      const log = logs.find(log => log.topics[0] === eventSignature);
      if (log.topics[0]) {
        const iface = new ethers.utils.Interface(TradingWalletABI?.abi);
        const decodedLog = iface.parseLog(log);
        const decodedToken = decodedLog.args.token;
        console.log("🚀 ~ file: Deposit.tsx:95 ~ useEffect ~ decodedToken:", decodedToken);
        // const decodedAmount = ethers.utils.formatUnits(decodedLog.args.amount, 18);

        console.log("after decoded token check...");
        if (!txnData?.transactionHash) {
          return;
        }

        fetch("/api/wallet/finalize-deposit", {
          method: "POST",
          body: JSON.stringify({
            transactionHash: txnData.transactionHash,
          }),
        })
          .then(response => response.json())
          .then(data => {
            console.log("🚀 ~ file: Deposit.tsx:82 ~ useEffect ~ data:", data);
            setRefreshDeposits(true);
            setDepositTxnHash("");
            setDepositStatus("");
            notification.info("Deposit has been processed");
          })
          .catch(err => console.log(err));
      }
    }
  }, [txnData, depositStatus]);

  const handleDeposit = () => {
    // Logic to interact with the TradingWallet contract
    console.log(`Depositing ${amount}`);
    callDeposit({ args: ["0x3D6D1F095a3F3c3bb889847d009c105D197D1735", ethers.utils.parseUnits(amount, 18)] });
  };

  const handleApprove = () => {
    console.log(`Approving ${amount}`);
    callApprove({ args: ["0x403b9F5580a6Dd698AA90DEe3b36b4a54Cf13677", ethers.utils.parseUnits(amount, 18)] });
  };

  useEffect(() => {
    if (refreshDeposits && userAddress) {
      fetch(`/api/wallet/all-deposits?walletAddress=${userAddress}`)
        .then(response => response.json())
        .then(data => {
          console.log("🚀 ~ file: Deposit.tsx:82 ~ useEffect ~ data:", data);
          setDeposits(data);
        })
        .catch(err => console.log(err));
      setRefreshDeposits(false);
    }
  }, [refreshDeposits, userAddress]);

  const getStatus = status => {
    switch (status) {
      case "PENDING": {
        return <span className="badge badge-warning">{status}</span>;
      }
      case "PROCESSED": {
        return <span className="badge badge-success">{status}</span>;
      }
      case "FAILED": {
        return <span className="badge badge-error">{status}</span>;
      }

      default: {
        return "";
      }
    }
  };

  return (
    <div className="flex w-full flex-wrap">
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
      <div className="flex w-full">
        <div className="overflow-x-auto m-4 w-full">
          <table className="table">
            <thead>
              <tr>
                <th>Token</th>
                <th>Amount</th>
                <th>Transaction Hash</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {deposits.length ? (
                deposits.map((deposit: any, index: number) => (
                  <tr key={index}>
                    <td>{deposit?.symbol ?? "USDT"}</td>
                    <td>{deposit.amount}</td>
                    <td>{deposit?.transactionHash ?? ""}</td>
                    <td>{getStatus(deposit.status)}</td>
                  </tr>
                ))
              ) : (
                <tr className="flex w-full text-center justify-center">No Deposits ...</tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Deposit;
