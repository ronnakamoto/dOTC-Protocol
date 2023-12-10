import { useEffect, useState } from "react";
import Link from "next/link";
import { useAccount } from "wagmi";

export default function TradingTerminalIndex() {
  const { address } = useAccount();
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    if (address) {
      fetch(`/api/trade/all-projects?walletAddress=${address}`)
        .then(res => res.json())
        .then(data => {
          setProjects(data);
        });
    }
  }, [address]);

  return (
    <div className="container">
      <div className="flex">
        {projects.length > 0 ? (
          projects.map((project: any) => (
            <div key={project.id} className="card w-96 bg-base-100 shadow-xl m-4">
              <div className="card-body">
                <h2 className="card-title">
                  {project.name}({project.symbol})
                </h2>
                <div className="flex justify-between">
                  <span>Price: </span>
                  <span>${project.price}</span>
                </div>
                <div className="card-actions justify-end">
                  <Link href={`/trade/${project.contractAddress}`} className="btn btn-sm btn-primary">
                    Trade
                  </Link>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div>No Projects</div>
        )}
      </div>
    </div>
  );
}
