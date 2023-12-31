import React, { useEffect, useState } from "react";
import TradingWalletABI from "../public/artifacts/contracts/TradingWallet.sol/TradingWallet.json";
import LoadingSpinner from "./LoadingIndicator";
import { ethers } from "ethers";
import { formatUnits, parseUnits } from "viem";
import { useAccount, useWaitForTransaction } from "wagmi";
import { useDeployedContractInfo, useScaffoldContractRead, useScaffoldContractWrite } from "~~/hooks/scaffold-eth";
import { notification } from "~~/utils/scaffold-eth";

// TODO: Use env to get the real USDT contract address on mainnets
// const TRADING_WALLET_ADDRESS = "0x403b9F5580a6Dd698AA90DEe3b36b4a54Cf13677";
// const USDT_CONTRACT_ADDRESS = "0x184bc3968e47DDD10984940566FFbEC841C66510";

const Deposit = () => {
  const { address: userAddress } = useAccount();
  const [amount, setAmount] = useState("0");
  const [allowance, setAllowance] = useState(ethers.utils.parseUnits("0", 18).toBigInt());
  const [depositTxnHash, setDepositTxnHash] = useState("");
  const [deposits, setDeposits] = useState([]);
  const [refreshDeposits, setRefreshDeposits] = useState(false);
  const [depositStatus, setDepositStatus] = useState("");
  const tradingWalletContract = useDeployedContractInfo("TradingWallet");
  const usdtContract = useDeployedContractInfo("USDT");
  const [txnHistoryLoading, setTxnHistoryLoading] = useState(true);

  const { writeAsync: callDeposit, isLoading: isDepositLoading } = useScaffoldContractWrite({
    contractName: "TradingWallet",
    functionName: "depositERC20",
    args: [usdtContract.data?.address, parseUnits(amount, 18)],
    // abi: TradingWalletABI?.abi,
    onSuccess: (data: any) => {
      console.log("🚀 ~ file: Deposit.tsx:25 ~ Deposit ~ data:", data);

      notification.info(`Deposit is detected`);
      fetch("/api/wallet/pending-deposit", {
        method: "POST",
        body: JSON.stringify({
          contractAddress: tradingWalletContract.data?.address,
          walletAddress: userAddress,
          transactionHash: data.hash,
          amount,
          symbol: "USDT",
        }),
      })
        .then(response => response.json())
        .then(data => {
          setDepositStatus("PENDING");
          console.log("🚀 ~ file: Deposit.tsx:82 ~ useEffect ~ data:", data);
          notification.info("Deposit is pending and is being processed");
        })
        .catch(err => console.log(err))
        .finally(() => {
          setRefreshDeposits(true);
          // Reset the amount after deposit
          setAmount("0");
          setDepositTxnHash(data.hash);
        });
    },
  });

  const { writeAsync: callApprove, isLoading: isApproveLoading } = useScaffoldContractWrite({
    contractName: "USDT",
    functionName: "approve",
    args: [tradingWalletContract.data?.address, parseUnits(amount, 18)],
    // abi: USDTABI?.abi,
    onSuccess: (data: any) => {
      console.log("Transaction data", data);
      // notification.success(`Approval is successful`);
    },
  });

  const { data: allowanceData } = useScaffoldContractRead({
    contractName: "USDT",
    functionName: "allowance",
    args: [userAddress, tradingWalletContract.data?.address],
  });

  useEffect(() => {
    console.log("Fetched allowance data...", allowanceData);
    if (allowanceData) {
      console.log("🚀 ~ file: Deposit.tsx:42 ~ useEffect ~ allowanceData:", allowanceData);
      setAllowance(allowanceData);
    }
  }, [allowanceData]);

  const isApprovalNeeded = () => {
    console.log("Amount and allowance: ", parseFloat(amount), parseFloat(formatUnits(allowance, 18)));
    if (!amount && !allowance) {
      return true;
    }
    return parseFloat(amount) > parseFloat(formatUnits(allowance, 18));
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
    console.log(`Depositing ${amount} => ${BigInt(ethers.utils.parseUnits(amount, 18).toString())}`);
    callDeposit({ args: [usdtContract.data?.address, parseUnits(amount, 18)] });
  };

  const handleApprove = () => {
    console.log(`Approving ${amount}`);
    callApprove({ args: [tradingWalletContract.data?.address, parseUnits(amount, 18)] });
  };

  useEffect(() => {
    if (userAddress) {
      fetch(`/api/wallet/all-deposits?walletAddress=${userAddress}`)
        .then(response => response.json())
        .then(data => {
          console.log("🚀 ~ file: Deposit.tsx:82 ~ useEffect ~ data:", data);
          setDeposits(data);
        })
        .catch(err => console.log(err))
        .finally(() => {
          setTxnHistoryLoading(false);
        });
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

  if (txnHistoryLoading) {
    return (
      <div className="flex w-full justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="flex w-full flex-wrap">
      <div className="flex items-center justify-center p-4 bg-white rounded-lg shadow-md w-full">
        <h2 className="text-2xl font-semibold text-gray-800 m-4 w-full">Deposit Funds</h2>
        <input
          type="number"
          className="input input-bordered input-sm"
          value={amount}
          onChange={e => setAmount(e.target.value ?? "0")}
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
                    <td className="font-bold">{deposit?.symbol ?? "USDT"}</td>
                    <td>{deposit.amount}</td>
                    <td>{deposit?.transactionHash ?? ""}</td>
                    <td>{getStatus(deposit.status)}</td>
                  </tr>
                ))
              ) : (
                <tr className="flex-1 w-full justify-center">
                  <td className="text-center p-4" colSpan={100}>
                    No Deposits ...
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Deposit;
