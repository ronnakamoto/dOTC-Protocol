import { useEffect, useState } from "react";

export default function RoundDetails({
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
          offerType: "SAFT",
          investmentRound: "PRE_SEED",
          sellerType: "INDIVIDUAL",
          roundFdv: 0,
          roundPricePerToken: 0,
        },
  );

  useEffect(() => {
    updateState(details, "roundDetails");
  }, [details]);

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setDetails((prevState: any) => ({ ...prevState, [name]: value }));
  };

  return (
    <>
      <div className="form-control max-w-sm mb-2">
        <label className="label">
          <span className="label-text">Deal Type</span>
        </label>
        <select
          name="offerType"
          value={details.offerType}
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
          <span className="label-text">Investment round</span>
        </label>
        <select
          name="investmentRound"
          value={details.investmentRound}
          onChange={handleChange}
          className="select select-bordered select-sm max-w-sm"
        >
          <option value={"PRE_SEED"}>Pre-Seed</option>
          <option value={"SEED"}>Seed</option>
          <option value={"ROUND_A"}>Round A</option>
          <option value={"ROUND_B"}>Round B</option>
          <option value={"ROUND_C"}>Round C</option>
          <option value={"TIER_1"}>Tier 1</option>
          <option value={"TIER_2"}>Tier 2</option>
          <option value={"TIER_3"}>Tier 3</option>
          <option value={"PRIVATE"}>Private</option>
        </select>
      </div>
      <div className="form-control w-full mb-2">
        <label className="label">
          <span className="label-text">Seller Type</span>
        </label>
        <select
          name="sellerType"
          value={details.sellerType}
          onChange={handleChange}
          className="select select-bordered select-sm max-w-sm"
        >
          <option value={"INDIVIDUAL"}>Individual</option>
          <option value={"VC"}>VC</option>
          <option value={"HEDGE_FUND"}>Hege Fund</option>
          <option value={"FAMILY_HOUSE"}>Family House</option>
        </select>
      </div>
      <div className="form-control max-w-sm mb-2">
        <label className="label">
          <span className="label-text">Round FDV($)</span>
        </label>

        <input
          type="number"
          name="roundFdv"
          placeholder="Round FDV (In USD)"
          onChange={handleChange}
          value={details.roundFdv}
          className="input input-sm input-bordered max-w-sm"
        />
      </div>
      <div className="form-control max-w-sm mb-2">
        <label className="label">
          <span className="label-text">Round price per token/share($)</span>
        </label>

        <input
          type="number"
          name="roundPricePerToken"
          placeholder="Price per token/share (In USD)"
          onChange={handleChange}
          value={details.roundPricePerToken}
          className="input input-sm input-bordered max-w-sm"
        />
      </div>
    </>
  );
}
