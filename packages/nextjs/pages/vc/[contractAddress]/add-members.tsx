// pages/upload.tsx
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import * as fs from "fs";
import path from "path";
import { useContractWrite } from "wagmi";

let abiPath = "../../artifacts/contracts/SAFTToken.sol/SAFTToken.json";
abiPath = path.resolve(__dirname, abiPath);
console.log("🚀 ~ file: add-members-1.tsx:10 ~ abiPath:", abiPath);
// console.log("🚀 ~ file: add-members-1.tsx:10 ~ abiData:", abiData);

const UploadPage = () => {
  const [file, setFile] = useState<File | null>(null);
  const [uploadData, setUploadData] = useState<any[]>([]);
  const [merkleRoot, setMerkleRoot] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [contractAbi, setContractAbi] = useState({} as any);
  const router = useRouter();
  const { contractAddress } = router.query;
  console.log("🚀 ~ file: add-members.tsx:23 ~ UploadPage ~ contractAddress:", contractAddress);

  useEffect(() => {
    fetch("/api/abi")
      .then(response => response.json())
      .then(data => {
        console.log("🚀 ~ file: add-members-1.tsx:25 ~ useEffect ~ data:", data);

        setContractAbi(data);
      })
      .catch(err => console.log(err));
  }, []);

  const {
    writeAsync: callSetMerkleRoot,
    isSuccess,
    data,
  } = useContractWrite({
    address: contractAddress,
    functionName: "setMerkleRoot",
    abi: contractAbi?.abi,
    onSuccess: (data: any) => {
      console.log("Transaction data", data);
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      setFile(files[0]);
    }
  };

  const handleUpload = async () => {
    if (file) {
      setLoading(true);
      const formData = new FormData();
      formData.append("file", file);

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
    callSetMerkleRoot({ args: [merkleRoot] });
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
                  className="bg-blue-600 text-xs font-medium text-blue-100 text-center p-0.5 leading-none rounded-l-full h-4"
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
            <div className="flex justify-end">
              <div className="columns-2">
                <h3 className="text-lg">Merkle Root</h3>
                <p className="bg-gray-100 p-2 rounded">{merkleRoot}</p>
              </div>
            </div>
            <div className="flex justify-end">
              {isSuccess && <div>Transaction: {JSON.stringify(data)}</div>}
              <button className="btn btn-sm btn-primary" onClick={onConfirmedWhitelist}>
                Confirm Whitelisted Investors
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UploadPage;
