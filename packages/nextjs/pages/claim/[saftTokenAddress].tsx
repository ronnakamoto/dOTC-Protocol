import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useAccount, useContractWrite } from "wagmi";

export default function ClaimOTCTokens() {
  const router = useRouter();
  const { saftTokenAddress } = router.query;
  const [availableTokens, setAvailableTokens] = useState(0);
  const { address, isConnected } = useAccount();
  const [contractAbi, setContractAbi] = useState({} as any);

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
    isSuccess,
    data,
  } = useContractWrite({
    address: saftTokenAddress,
    functionName: "mint",
    abi: contractAbi?.abi,
    onSuccess: (data: any) => {
      console.log("Transaction data", data);
    },
  });

  const fetchAvailableTokens = async () => {
    if (isConnected && saftTokenAddress) {
      // Call the endpoint to get the available tokens for the user
      console.log("Connected and ready to fetch...", address);
      setAvailableTokens(100);
    }
  };

  const handleClaim = () => {
    // generate merkle proof
    const merkleProof = "";
    callMint({ args: [address, 1, availableTokens, "", merkleProof] });
  };

  useEffect(() => {
    fetchAvailableTokens();
  }, [address, saftTokenAddress, isConnected]);

  return (
    <div className="container">
      <div className="flex justify-center align-middle m-4 flex-wrap column">
        {availableTokens > 0 ? (
          <>
            <p className="text-lg">You can claim {availableTokens} tokens.</p>
            <button className="btn btn-sm btn-primary" onClick={handleClaim}>
              Claim Tokens
            </button>
          </>
        ) : (
          <p>No tokens available to claim.</p>
        )}
      </div>
    </div>
  );
}
