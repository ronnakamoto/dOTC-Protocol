import { useState } from "react";
import { useAccount, useNetwork } from "wagmi";
import VerticalSteps from "~~/components/VerticalSteps";
import DealSummary from "~~/components/deal/DealSummary";
import GeneralDetails from "~~/components/deal/GeneralDetails";
import RoundDetails from "~~/components/deal/RoundDetails";
import TradingDetails from "~~/components/deal/TradingDetails";
import { useDeployedContractInfo } from "~~/hooks/scaffold-eth";
import { formatCurrency } from "~~/utils";

export default function CreateDeal() {
  const [currentStep, setCurrentStep] = useState(0);
  const [allStepsData, setAllStepsData] = useState<Record<string, any>>({
    generalDetails: {},
    roundDetails: {},
    tradingDetails: {},
  });
  const [isLoadingCreateDealButton, setIsLoadingCreateDealButton] = useState(false);
  const { chain } = useNetwork();
  const { address: ownerAddress } = useAccount();
  const { data: baseTokenData } = useDeployedContractInfo("USDT");
  const { data: tradingWalletData } = useDeployedContractInfo("TradingWallet");
  const { data: executorManagerData } = useDeployedContractInfo("ExecutorManager");

  function handleNext() {
    setCurrentStep(step => step + 1);
  }

  function handlePrev() {
    setCurrentStep(step => step - 1);
  }

  const onSubmit = () => {
    console.log("Submit clicked: allStepsData => ", allStepsData);
    setIsLoadingCreateDealButton(true);
    /**
     * TODO: Remove insecure usage of passing contract addresses
     */
    fetch("/api/deal/create", {
      method: "POST",
      body: JSON.stringify({
        ...allStepsData,
        chainId: chain?.id,
        baseToken: baseTokenData?.address,
        tradingWallet: tradingWalletData?.address,
        ownerAddress,
        executorManager: executorManagerData?.address,
      }),
    })
      .then(response => response.json())
      .catch(err => console.log(err))
      .finally(() => setIsLoadingCreateDealButton(false));
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

  const initialOTCMarketcap =
    parseFloat(allStepsData.tradingDetails?.tokensToSell ?? 0) *
    parseFloat(allStepsData.tradingDetails?.pricePerToken ?? 0);

  const roundFdv = formatCurrency(allStepsData.roundDetails?.roundFdv ?? 0);

  const unFormattedOtcFdv =
    (allStepsData.roundDetails?.roundFdv ?? 0) *
    (parseFloat(allStepsData.tradingDetails?.pricePerToken ?? 0) / allStepsData.roundDetails?.roundPricePerToken);
  const otcFdv = formatCurrency(isNaN(unFormattedOtcFdv) ? 0 : unFormattedOtcFdv);
  return (
    <div className="flex m-4">
      <VerticalSteps
        steps={steps}
        currentStep={currentStep}
        onNext={handleNext}
        onPrev={handlePrev}
        onSubmit={onSubmit}
        onJumpToStep={onJumpToStep}
        summary={{
          label: "Deal Summary",
          content: <DealSummary initialOTCMarketcap={initialOTCMarketcap} roundFdv={roundFdv} otcFdv={otcFdv} />,
        }}
        isSubmitButtonLoading={isLoadingCreateDealButton}
      />
    </div>
  );
}
