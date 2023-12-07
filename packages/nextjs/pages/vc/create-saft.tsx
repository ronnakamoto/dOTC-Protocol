import { useEffect, useState } from "react";
import Image from "next/image";
import axios from "axios";
import { useAccount } from "wagmi";
import { notification } from "~~/utils/scaffold-eth";

const CreateSaft = () => {
  const [formData, setFormData] = useState({
    projectName: "",
    projectSymbol: "",
    amountRaised: 0,
    pricePerToken: 0,
    saftDetails: "",
  });
  const [totalSupply, setTotalSupply] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const { address } = useAccount();

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(prevState => ({ ...prevState, [name]: value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post("/api/token/create", {
        tokenName: formData.projectName,
        totalSupply: totalSupply,
        owner: address,
        pricePerToken: formData.pricePerToken,
        saftDetails: formData.saftDetails,
        symbol: "o" + formData.projectSymbol,
        amountRaised: formData.amountRaised,
      });
      setFormData({
        projectName: "",
        projectSymbol: "",
        amountRaised: 0,
        pricePerToken: 0,
        saftDetails: "",
      });
      notification.success("SAFT-Backed Token for project created successfully");
    } catch (error) {
      console.error("Error:", error);
      notification.error("Failed to create token.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (formData.amountRaised && formData.pricePerToken) {
      const supply = formData.amountRaised / formData.pricePerToken;
      setTotalSupply(supply);
    } else {
      setTotalSupply(0);
    }
  }, [formData.amountRaised, formData.pricePerToken]);

  return (
    <div className="flex flex-row">
      {/* Left Column */}
      <div className="flex-1 p-4">
        <h1 className="text-primary text-lg font-extrabold mb-2">Create SAFT-Backed Token</h1>
        <form onSubmit={handleSubmit}>
          {/* Form Fields */}
          <input
            type="text"
            name="projectName"
            placeholder="Project Name"
            onChange={handleChange}
            className="input input-sm input-bordered w-full mb-4"
          />
          <input
            type="text"
            name="projectSymbol"
            placeholder="Project Symbol/Ticker"
            onChange={handleChange}
            className="input input-sm input-bordered w-full mb-4"
          />
          <input
            type="number"
            name="amountRaised"
            placeholder="Amount Raised (In USDT)"
            onChange={handleChange}
            className="input input-sm input-bordered w-full mb-4"
          />
          <input
            type="number"
            name="pricePerToken"
            placeholder="Price per Token"
            onChange={handleChange}
            className="input input-sm input-bordered w-full mb-4"
          />
          <textarea
            name="saftDetails"
            placeholder="SAFT Details"
            onChange={handleChange}
            className="textarea textarea-sm textarea-bordered w-full mb-4"
          />

          {/* Display Total Supply */}
          <div className="text-primary font-semibold">
            {totalSupply > 0 && (
              <p>
                Total Supply: {totalSupply.toFixed(2)} {"o" + formData.projectSymbol}
              </p>
            )}
          </div>
          <div className="flex justify-end">
            <button type="submit" className={`btn btn-primary btn-sm ${loading ? "loading loading-spinner" : ""}`}>
              {loading ? "Creating SAFT-Backed Token ..." : "Create SAFT-Backed Token"}
            </button>
          </div>
        </form>
      </div>

      {/* Right Column */}
      <div className="flex-1 p-4 flex justify-center items-center">
        <div className="shadow-lg border border-gray-200 rounded-lg overflow-hidden transform rotate-0 hover:rotate-3 transition-transform duration-300">
          <Image src="/dotc-placeholder.png" alt="NFT Placeholder" width={300} height={300} className="rounded-lg" />
        </div>
      </div>
    </div>
  );
};

export default CreateSaft;
