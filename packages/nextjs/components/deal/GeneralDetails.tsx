import { useEffect, useState } from "react";

export default function GeneralDetails({
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
          projectName: "",
          projectSymbol: "",
          saftDetails: "",
        },
  );

  useEffect(() => {
    updateState(details, "generalDetails");
  }, [details]);

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setDetails((prevState: any) => ({ ...prevState, [name]: value }));
  };

  return (
    <>
      <div className="form-control w-full mb-2">
        <label className="label">
          <span className="label-text">What is the name of the Project/Deal?</span>
        </label>

        <input
          type="text"
          name="projectName"
          placeholder="Project Name"
          onChange={handleChange}
          value={details.projectName}
          className="input input-sm input-bordered max-w-sm"
        />
      </div>
      <div className="form-control w-full mb-2">
        <label className="label">
          <span className="label-text">What is the symbol/ticker of the Project/Deal?</span>
        </label>

        <input
          type="text"
          name="projectSymbol"
          placeholder="Project Symbol/Ticker like USDT, WETH, etc."
          onChange={handleChange}
          value={details.projectSymbol}
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
          value={details.saftDetails}
          className="textarea textarea-sm textarea-bordered max-w-sm mb-4"
        />
      </div>
    </>
  );
}
