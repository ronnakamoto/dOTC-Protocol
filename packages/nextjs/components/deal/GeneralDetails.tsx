import { useEffect, useState } from "react";
import { InformationCircleIcon } from "@heroicons/react/24/outline";

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
          description: "",
          dealVisibility: "PUBLIC",
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
          name="description"
          placeholder="Deal Details"
          onChange={handleChange}
          value={details.description}
          className="textarea textarea-sm textarea-bordered max-w-sm mb-4"
        />
      </div>
      <div className="form-control w-full">
        <label className="label justify-start">
          <span className="label-text">Choose visibility of deal</span>
          <span
            className="ml-2 cursor-pointer tooltip tooltip-info tooltip-right h-6 w-6"
            data-tip="Public - Can be seen by anyone. Private - Viewable by those with link and has been whitelisted"
          >
            <InformationCircleIcon />
          </span>
        </label>
        <div className="flex flex-row">
          <label className="label cursor-pointer justify-start">
            <input
              type="radio"
              name="dealVisibility"
              className="radio radio-primary"
              checked={details.dealVisibility === "PUBLIC"}
              value="PUBLIC"
              onChange={handleChange}
            />
            <span className="label-text pl-2">Public</span>
          </label>
          <label className="label cursor-pointer justify-start">
            <input
              type="radio"
              name="dealVisibility"
              className="radio radio-primary"
              value="LOT"
              checked={details.dealVisibility === "PRIVATE"}
              onChange={handleChange}
            />
            <span className="label-text pl-2">Private</span>
          </label>
        </div>
      </div>
    </>
  );
}
