import { useEffect, useState } from "react";
import Link from "next/link";
import axios from "axios";
import { useAccount } from "wagmi";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { notification } from "~~/utils/scaffold-eth";

const CreateSaft = () => {
  const [formData, setFormData] = useState({
    projectName: "",
    projectSymbol: "",
    amountRaised: 0,
    pricePerToken: 0,
    saftDetails: "",
    offerType: "SAFT",
  });
  const [totalSupply, setTotalSupply] = useState<number>(0);
  const [totalSupplyCalculationType, setTotalSupplyCalculationType] = useState("automaticCalculation");
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
        offerType: formData.offerType,
      });
      console.log("🚀 ~ file: create-saft.tsx:40 ~ handleSubmit ~ response:", response);

      if (response?.data) {
        console.log("🚀 ~ file: create-saft.tsx:41 ~ .then ~ data:", response?.data);
        notification.success("SAFT-Backed Token for project created successfully");
        setFormData({
          projectName: "",
          projectSymbol: "",
          amountRaised: 0,
          pricePerToken: 0,
          saftDetails: "",
          offerType: "SAFT",
        });
      }
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
    <div className="flex flex-col">
      <div className="flex flex-row">
        {/* Left Column */}
        <div className="w-full md:w-1/2 p-4 justify-start">
          <h1 className="text-lg font-extrabold mb-2">Create a New OTC Deal</h1>
          <form>
            {/* Form Fields */}
            <div className="form-control max-w-sm mb-2">
              <label className="label">
                <span className="label-text">Choose the deal type?</span>
              </label>
              <select
                name="offerType"
                value={formData.offerType}
                onChange={handleChange}
                className="select select-bordered select-sm max-w-sm"
              >
                <option value={"SAFT"}>SAFT</option>
                <option value={"SAFE"}>SAFE</option>
                <option value={"TOKEN_WARRANT"}>Token Warrant</option>
              </select>
            </div>
            <div className="form-control w-full mb-2">
              <label className="label">
                <span className="label-text">What is the name of the Project/Deal?</span>
              </label>

              <input
                type="text"
                name="projectName"
                placeholder="Project Name"
                onChange={handleChange}
                value={formData.projectName}
                className="input input-sm input-bordered max-w-sm"
              />
            </div>
            <div className="form-control w-full mb-2">
              <label className="label">
                <span className="label-text">What is the token symbol of the Project/Deal?</span>
              </label>

              <input
                type="text"
                name="projectSymbol"
                placeholder="Project Symbol/Ticker like USDT, WETH, etc."
                onChange={handleChange}
                value={formData.projectSymbol}
                className="input input-sm input-bordered max-w-sm"
              />
            </div>
            <div className="form-control w-full mb-2">
              <label className="label">
                <span className="label-text">Description</span>
              </label>

              <textarea
                name="saftDetails"
                placeholder="Deal Details"
                onChange={handleChange}
                value={formData.saftDetails}
                className="textarea textarea-sm textarea-bordered max-w-sm mb-4"
              />
            </div>
          </form>
        </div>

        {/* Right Column */}
        <div className="w-full md:w-1/2 p-4 justify-start">
          {/* <div className="shadow-lg border border-gray-200 rounded-lg overflow-hidden transform rotate-0 hover:rotate-3 transition-transform duration-300">
          <Image src="/dotc-placeholder.png" alt="NFT Placeholder" width={300} height={300} className="rounded-lg" />
        </div> */}
          <div className="form-control w-full mb-2 mt-8">
            <label className="label">
              <span className="label-text font-bold">Choose how to calculate total supply of OTC tokens</span>
            </label>
            <label className="label cursor-pointer max-w-sm">
              <input
                type="radio"
                name="radio-10"
                className="radio radio-primary"
                checked={totalSupplyCalculationType === "automaticCalculation"}
                value="automaticCalculation"
                onChange={e => setTotalSupplyCalculationType(e.target.value)}
              />
              <span className="label-text">Automatically from amount raised</span>
            </label>
            <label className="label cursor-pointer max-w-sm">
              <input
                type="radio"
                name="radio-10"
                className="radio radio-primary"
                value="manualCalculation"
                checked={totalSupplyCalculationType === "manualCalculation"}
                onChange={e => setTotalSupplyCalculationType(e.target.value)}
              />
              <span className="label-text">Enter the total supply manually</span>
            </label>
          </div>
          {totalSupplyCalculationType === "automaticCalculation" ? (
            <>
              <div className="form-control max-w-sm mb-2">
                <label className="label">
                  <span className="label-text">What was the amount raised?</span>
                </label>

                <input
                  type="number"
                  name="amountRaised"
                  placeholder="Amount Raised (In USDT)"
                  onChange={handleChange}
                  value={formData.amountRaised}
                  className="input input-sm input-bordered max-w-sm"
                />
              </div>
              <div className="form-control max-w-sm mb-2">
                <label className="label">
                  <span className="label-text">What is the price per Token?</span>
                </label>

                <input
                  type="text"
                  name="pricePerToken"
                  placeholder="Price per Token"
                  onChange={handleChange}
                  value={formData.pricePerToken}
                  className="input input-sm input-bordered w-full"
                />
              </div>

              {/* Display Total Supply */}
              <div className="font-semibold">
                {totalSupply > 0 && (
                  <p>
                    Total Supply: {totalSupply.toFixed(2)} {"o" + formData.projectSymbol}
                  </p>
                )}
              </div>
            </>
          ) : (
            <div className="form-control max-w-sm mb-2">
              <label className="label">
                <span className="label-text">What is the total supply?</span>
              </label>

              <input
                type="number"
                name="totalSupply"
                placeholder="Total supply"
                onChange={e => setTotalSupply(parseFloat(e.target.value))}
                value={totalSupply}
                className="input input-sm input-bordered max-w-sm"
              />
            </div>
          )}
        </div>
      </div>
      <div className="flex flex-row">
        <div className="flex-1"></div>
        <div className="flex-1">
          <div className="flex justify-start">
            <Link href="/vc/list-saft" className={`btn btn-primary btn-sm mr-2`}>
              <ArrowLeftIcon height={16} width={16} />
              View All Projects
            </Link>
            <button onClick={handleSubmit} className={`btn btn-primary btn-sm`}>
              {loading && <span className="loading loading-spinner"></span>}
              {loading ? "Creating SAFT-Backed Token ..." : "Create SAFT-Backed Token"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateSaft;
