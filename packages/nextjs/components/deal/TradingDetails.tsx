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
          tokensToSell: 0,
          pricePerToken: 0,
          serviceCharge: 5,
          minBuyAmount: 0,
        },
  );

  useEffect(() => {
    console.log("🚀 ~ file: TradingDetails.tsx:19 ~ useEffect ~ initialState, details:", initialState, details);
    updateState(details, "tradingDetails");
  }, [details]);

  // useEffect(() => {
  //   if (details.tokensToSell > 0 && details.pricePerToken > 0) {
  //     const otcMarketcap = details.tokensToSell * details.pricePerToken;
  //     if (otcMarketcap < Number.MAX_SAFE_INTEGER) {
  //       setDetails((prevState: any) => ({ ...prevState, otcMarketcap }));
  //     }
  //   } else {
  //     setDetails((prevState: any) => ({ ...prevState, otcMarketcap: 0 }));
  //   }
  // }, [details.tokensToSell, details.pricePerToken]);

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
      <div className="form-control max-w-sm mb-2">
        <label className="label">
          <span className="label-text">Total number of tokens to sell</span>
        </label>

        <input
          type="number"
          name="tokensToSell"
          placeholder="Amount of OTC tokens to sell"
          onChange={handleChange}
          value={details.tokensToSell}
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
      {details.tradeType === "LOT" && (
        <div className="form-control max-w-sm mb-2">
          <label className="label">
            <span className="label-text">Minimum number of tokens for purchase</span>
          </label>

          <input
            type="number"
            name="minBuyAmount"
            placeholder="Min. amount that can be bought"
            onChange={handleChange}
            value={details.minBuyAmount}
            className="input input-sm input-bordered max-w-sm"
          />
        </div>
      )}
      {/* Display OTC Token Marketcap */}
      {/* <div className="font-semibold">
        {details.otcMarketcap > 0 && <p>OTC Initial Marketcap: ${parseFloat(details.otcMarketcap).toFixed(2)}</p>}
      </div> */}
      <div className="form-control max-w-sm mb-2">
        <label className="label justify-start">
          <span className="label-text">Your service charge(%)</span>
          <span
            className="ml-2 cursor-pointer tooltip tooltip-info tooltip-right h-6 w-6"
            data-tip={`Service charge for OTC, excluding the platform fee of 20% of your service charge. Net service fee in your case would be ${(
              details.serviceCharge * 0.8
            ).toFixed(2)}%`}
          >
            <InformationCircleIcon />
          </span>
        </label>

        <input
          type="number"
          name="serviceCharge"
          placeholder="Service charge in percentage"
          onChange={handleChange}
          value={details.serviceCharge}
          className="input input-sm input-bordered max-w-sm"
        />
      </div>
    </>
  );
}
