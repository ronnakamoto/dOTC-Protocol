// pages/upload.tsx
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import axios from "axios";
import path from "path";
import { TransactionReceipt } from "viem";
import { useContractWrite, useWaitForTransaction } from "wagmi";
import { TxReceipt } from "~~/components/scaffold-eth";
import { notification } from "~~/utils/scaffold-eth";

const UploadPage = () => {
  const [file, setFile] = useState<File | null>(null);
  const [uploadData, setUploadData] = useState<any[]>([]);
  const [merkleRoot, setMerkleRoot] = useState<string>("");
  const [ipfsUrl, setIpfsUrl] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [onConfirmLoading, setOnConfirmLoading] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [contractAbi, setContractAbi] = useState({} as any);
  const [displayedTxResult, setDisplayedTxResult] = useState<TransactionReceipt>();
  const router = useRouter();
  const { contractAddress } = router.query;

  useEffect(() => {
    fetch("/api/abi")
      .then(response => response.json())
      .then(data => {
        console.log("🚀 ~ file: add-members-1.tsx:25 ~ useEffect ~ data:", data);

        setContractAbi(data);
      })
      .catch(err => console.log(err));
  }, []);

  const { writeAsync: callSetMerkleRoot, data: writeResult } = useContractWrite({
    address: contractAddress as string,
    functionName: "setMerkleRoot",
    abi: contractAbi?.abi,
    onSuccess: (data: any) => {
      setOnConfirmLoading(false);
      console.log("Transaction data", data);
      notification.success(`Transaction to whitelist members is successful`);
    },
  });

  const { data: txResult } = useWaitForTransaction({
    hash: writeResult?.hash,
  });
  useEffect(() => {
    setDisplayedTxResult(txResult);
  }, [txResult]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      setFile(files[0]);
    }
  };

  const handleUpload = async () => {
    if (file && router.isReady) {
      setLoading(true);
      const formData = new FormData();
      formData.append("file", file);
      formData.append("contractAddress", contractAddress as string);

      try {
        const response = await axios.post("/api/upload", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          onUploadProgress: (progressEvent: any) => {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress(percentCompleted);
          },
        });
        setUploadData(response.data.data);
        setMerkleRoot(response.data.merkleRoot);
        setIpfsUrl(response.data.url);
      } catch (error) {
        console.error("Error uploading file:", error);
      }
      setLoading(false);
    }
  };

  const onConfirmedWhitelist = () => {
    // Save offchain data to the database
    // const data = {
    //   merkleRoot,
    //   whitelisted: true,
    // };
    // call setMerkleRoot method on-chain
    if (merkleRoot) {
      setOnConfirmLoading(true);
      callSetMerkleRoot({ args: [merkleRoot] });
    }
  };

  return (
    <div className="container mx-auto p-4">
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title">Upload Contribution CSV To Whitelist Investors</h2>
          <div className="flex items-center justify-between">
            <div
              className="p-4 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-100"
              onClick={() => document.getElementById("fileInput")?.click()}
            >
              <p>{file ? file.name : "Click to select a file"}</p>
            </div>
            <input id="fileInput" type="file" onChange={handleFileChange} className="hidden" />
            {file && (
              <div className="w-1/2 bg-gray-200 rounded-full h-4 overflow-hidden">
                <div
                  className="bg-secondary text-xs font-medium text-primary-content text-center p-0.5 leading-none rounded-l-full h-4"
                  style={{ width: `${uploadProgress}%` }}
                >
                  {" "}
                  {uploadProgress}%{" "}
                </div>
              </div>
            )}
            <button
              onClick={handleUpload}
              className={`btn btn-sm btn-primary m-4 ${
                file && 0 > uploadProgress && uploadProgress < 100 ? "loading" : ""
              }`}
            >
              Upload
            </button>
          </div>
        </div>
      </div>
      {loading && (
        <div className="card bg-base-100 shadow-xl mt-4">
          <div className="card-body flex justify-center">
            <div>The file is being processed and saved to IPFS ...</div>
            <div>You will receive the link to the file along with the merkle root hash soon ...</div>
            <progress className="progress w-56"></progress>
          </div>
        </div>
      )}

      {uploadData.length > 0 && (
        <div className="card bg-base-100 shadow-xl mt-4">
          <div className="card-body">
            <h2 className="card-title">Uploaded Data</h2>
            <div className="overflow-x-auto">
              <table className="table w-full">
                <thead>
                  <tr>
                    <th>Wallet Address</th>
                    <th>Contribution</th>
                  </tr>
                </thead>
                <tbody>
                  {uploadData.map((data, index) => (
                    <tr key={index}>
                      <td>{data.walletAddress}</td>
                      <td>{data.contribution}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex p-4 pb-1">
              <div className="flex p-2 w-full justify-between font-mono">
                <div className="font-semibold">Merkle Root</div>
                <div className="bg-secondary p-2">{merkleRoot}</div>
              </div>
            </div>
            <div className="flex p-4 pt-1">
              <div className="flex p-2 w-full justify-between font-mono">
                <div className="font-semibold">IPFS Url</div>
                <Link href={ipfsUrl} target="_blank" className="bg-secondary p-2">
                  {ipfsUrl}
                </Link>
              </div>
            </div>
            {displayedTxResult ? (
              <div className="flex-grow basis-0">
                <TxReceipt txResult={displayedTxResult} />
              </div>
            ) : null}
            <div className="flex justify-end">
              {!txResult ? (
                <button className={`btn btn-sm btn-primary`} onClick={onConfirmedWhitelist}>
                  {onConfirmLoading && <span className="loading loading-spinner"></span>}
                  {onConfirmLoading && !txResult
                    ? "Confirming Whitelist On-chain ..."
                    : "Confirm Whitelisted Investors"}
                </button>
              ) : (
                <Link href={`/vc/${contractAddress}/claim`} className="btn btn-sm btn-primary">
                  Share Token Claim Link For Members/Investors
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UploadPage;
