import { useEffect, useState } from "react";
import { InformationCircleIcon } from "@heroicons/react/24/outline";

export default function TradingDetails({
  updateState,
  initialState,
}: {
  updateState: (state: any, section: string) => void;
  initialState: any;
}) {
  const [details, setDetails] = useState(
    Object.keys(initialState).length
      ? initialState
      : {
          tradeType: "NORMAL",
          totalSupplyCalculationType: "AUTOMATIC",
          amountToSell: 0,
          pricePerToken: 0,
          totalSupply: 0,
        },
  );

  useEffect(() => {
    console.log("🚀 ~ file: TradingDetails.tsx:19 ~ useEffect ~ initialState, details:", initialState, details);
    updateState(details, "tradingDetails");
  }, [details]);

  useEffect(() => {
    if (details.amountToSell > 0 && details.pricePerToken > 0) {
      const supply = details.amountToSell / details.pricePerToken;
      if (supply < Number.MAX_SAFE_INTEGER) {
        setDetails((prevState: any) => ({ ...prevState, totalSupply: supply }));
      }
    } else {
      setDetails((prevState: any) => ({ ...prevState, totalSupply: 0 }));
    }
  }, [details.amountToSell, details.pricePerToken]);

  useEffect(() => {
    setDetails((prevState: any) => ({ ...prevState, totalSupply: 0, amountToSell: 0, pricePerToken: 0 }));
  }, [details.totalSupplyCalculationType]);

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setDetails((prevState: any) => ({ ...prevState, [name]: value }));
  };

  return (
    <>
      <div className="form-control w-full">
        <label className="label justify-start">
          <span className="label-text">Choose style of OTC Trading</span>
          <span
            className="ml-2 cursor-pointer tooltip tooltip-info tooltip-right h-6 w-6"
            data-tip="Normal for CEX-Like Spot Trading. Lot for trading with Min Order Size/RFQ"
          >
            <InformationCircleIcon />
          </span>
        </label>
        <div className="flex flex-row">
          <label className="label cursor-pointer justify-start">
            <input
              type="radio"
              name="tradeType"
              className="radio radio-primary"
              checked={details.tradeType === "NORMAL"}
              value="NORMAL"
              onChange={handleChange}
            />
            <span className="label-text pl-2">Normal</span>
          </label>
          <label className="label cursor-pointer justify-start">
            <input
              type="radio"
              name="tradeType"
              className="radio radio-primary"
              value="LOT"
              checked={details.tradeType === "LOT"}
              onChange={handleChange}
            />
            <span className="label-text pl-2">Lot</span>
          </label>
        </div>
      </div>
      {/* Supply calculation */}
      <div className="form-control w-full mb-2">
        <label className="label justify-start">
          <span className="label-text">Choose how to calculate total supply of OTC tokens</span>
          <span
            className="ml-2 cursor-pointer tooltip tooltip-info tooltip-right h-6 w-6"
            data-tip="Automatic - Automatically from amount to sell. Manual - Enter the total supply manually"
          >
            <InformationCircleIcon />
          </span>
        </label>
        <div className="flex flex-row">
          <label className="label cursor-pointer justify-start">
            <input
              type="radio"
              name="totalSupplyCalculationType"
              className="radio radio-primary"
              checked={details.totalSupplyCalculationType === "AUTOMATIC"}
              value="AUTOMATIC"
              onChange={handleChange}
            />
            <span className="label-text pl-2">Automatic</span>
          </label>
          <label className="label cursor-pointer justify-start">
            <input
              type="radio"
              name="totalSupplyCalculationType"
              className="radio radio-primary"
              value="MANUAL"
              checked={details.totalSupplyCalculationType === "MANUAL"}
              onChange={handleChange}
            />
            <span className="label-text pl-2">Manual</span>
          </label>
        </div>
        {details.totalSupplyCalculationType === "AUTOMATIC" ? (
          <>
            <div className="form-control max-w-sm mb-2">
              <label className="label">
                <span className="label-text">Total amount to sell(USD)</span>
              </label>

              <input
                type="number"
                name="amountToSell"
                placeholder="Amount to sell (In USD)"
                onChange={handleChange}
                value={details.amountToSell}
                className="input input-sm input-bordered max-w-sm"
              />
            </div>
            <div className="form-control max-w-sm mb-2">
              <label className="label">
                <span className="label-text">Price per OTC Token</span>
              </label>

              <input
                type="number"
                name="pricePerToken"
                placeholder="Price per Token"
                onChange={handleChange}
                value={details.pricePerToken}
                className="input input-sm input-bordered w-full"
              />
            </div>

            {/* Display Total Supply */}
            <div className="font-semibold">
              {details?.totalSupply > 0 && <p>Total Supply: {parseFloat(details?.totalSupply)?.toFixed(2)}</p>}
            </div>
          </>
        ) : (
          <div className="form-control max-w-sm mb-2">
            <label className="label justify-start">
              <span className="label-text">What is the total supply?</span>
              <span
                className="ml-2 cursor-pointer tooltip tooltip-info tooltip-right h-6 w-6"
                data-tip="This is the amount of OTC tokens that will be created as the supply for OTC trading for this deal"
              >
                <InformationCircleIcon />
              </span>
            </label>

            <input
              type="number"
              name="totalSupply"
              placeholder="Total supply"
              onChange={handleChange}
              value={details.totalSupply}
              className="input input-sm input-bordered max-w-sm"
            />
          </div>
        )}
      </div>
    </>
  );
}
