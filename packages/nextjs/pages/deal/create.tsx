import { useState } from "react";
import VerticalSteps from "~~/components/VerticalSteps";
import GeneralDetails from "~~/components/deal/GeneralDetails";
import RoundDetails from "~~/components/deal/RoundDetails";
import TradingDetails from "~~/components/deal/TradingDetails";

export default function CreateDeal() {
  const [currentStep, setCurrentStep] = useState(0);
  const [allStepsData, setAllStepsData] = useState({
    generalDetails: {},
    roundDetails: {},
    tradingDetails: {},
  });

  function handleNext() {
    setCurrentStep(step => step + 1);
  }

  function handlePrev() {
    setCurrentStep(step => step - 1);
  }

  const onSubmit = () => {
    console.log("Submit clicked: allStepsData => ", allStepsData);
  };

  const onJumpToStep = (step: number) => {
    setCurrentStep(step);
  };

  const updateData = (data: any, section: string) => {
    setAllStepsData({ ...allStepsData, [section]: data });
  };

  const steps = [
    {
      label: "General Details",
      content: <GeneralDetails updateState={updateData} initialState={allStepsData["generalDetails"]} />,
    },
    {
      label: "Round Details",
      content: <RoundDetails updateState={updateData} initialState={allStepsData["roundDetails"]} />,
    },
    {
      label: "OTC Trading Details",
      content: <TradingDetails updateState={updateData} initialState={allStepsData["tradingDetails"]} />,
    },
  ];

  return (
    <div className="flex m-4">
      <VerticalSteps
        steps={steps}
        currentStep={currentStep}
        onNext={handleNext}
        onPrev={handlePrev}
        onSubmit={onSubmit}
        onJumpToStep={onJumpToStep}
      />
    </div>
  );
}
