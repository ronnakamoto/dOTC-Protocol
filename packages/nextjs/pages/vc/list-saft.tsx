import { useEffect, useState } from "react";
import Link from "next/link";
import { useAccount } from "wagmi";

export default function ListSafts() {
  const [safts, setSafts] = useState<any>([]);
  const { address, isConnected } = useAccount();

  useEffect(() => {
    if (isConnected && address) {
      fetch("/api/saft/list", {
        method: "POST", // or 'PUT'
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ wallet: address }),
      })
        .then(res => res.json())
        .then(data => {
          setSafts(data);
        });
    }
  }, [address, isConnected]);
  return (
    <div className="container">
      <div className="flex justify-end m-4">
        <Link className="btn btn-sm btn-primary" href={"/vc/create-saft"}>
          Create SAFT
        </Link>
      </div>
      <div className="overflow-x-auto m-4">
        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Total Supply</th>
              <th>Initial Price</th>
              <th>Latest Price</th>
              <th>Buys/Sells</th>
              <th>Manage</th>
            </tr>
          </thead>
          <tbody>
            {safts.length ? (
              safts
                .filter((x: any) => x?.contractAddress)
                .map((saft: any, index: number) => (
                  <tr key={index}>
                    <td>{saft.name}</td>
                    <td>{saft.totalSupply}</td>
                    <td>{saft.pricePerToken}</td>
                    <td>{saft.pricePerToken}</td>
                    <td>{0}</td>
                    <td>
                      <Link className="btn btn-xs btn-primary" href={`/vc/${saft.contractAddress}/add-members`}>
                        Manage Members
                      </Link>
                    </td>
                  </tr>
                ))
            ) : (
              <tr className="flex justify-center">
                <td>Loading SAFTs data ...</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
