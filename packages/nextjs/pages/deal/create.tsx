import { useState } from "react";
import { pickProperties } from "../../utils";
import { useAccount, useNetwork } from "wagmi";
import { ShareIcon } from "@heroicons/react/24/outline";
import Summary from "~~/components/Summary";
import VerticalSteps from "~~/components/VerticalSteps";
import DealSummary from "~~/components/deal/DealSummary";
import GeneralDetails from "~~/components/deal/GeneralDetails";
import RoundDetails from "~~/components/deal/RoundDetails";
import TradingDetails from "~~/components/deal/TradingDetails";
import { useDeployedContractInfo } from "~~/hooks/scaffold-eth";
import { formatCurrency } from "~~/utils";
import { notification } from "~~/utils/scaffold-eth";

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
  // Array of objects suited for summary component
  const [dealCreated, setDealCreated] = useState<any[]>([]);
  const [dealContractAddress, setDealContractAddress] = useState("");

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
      .then(data => {
        console.log("reponse data: ", data);
        const formattedData = pickProperties(
          {
            ...allStepsData.generalDetails,
            ...allStepsData.tradingDetails,
            ...data,
          },
          [
            { field: "projectName" },
            { field: "projectSymbol" },
            { field: "pricePerToken" },
            { field: "tokensToSell" },
            { field: "contractAddress" },
          ],
        );
        setDealCreated(formattedData);
        setDealContractAddress(data?.contractAddress);
      })
      .catch(err => {
        console.log(err);
        notification.error("Failed to create the deal");
      })
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
      {dealCreated?.length ? (
        <Summary
          heading="Deal Successfully Created"
          Icon={ShareIcon}
          data={dealCreated}
          primaryButtonHref={`/trade/${dealContractAddress}`}
          primaryButtonText="Open Link to Share Deal"
          secondaryButtonHref="/deal"
          secondaryButtonText="View All Deals"
        />
      ) : (
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
      )}
    </div>
  );
}
