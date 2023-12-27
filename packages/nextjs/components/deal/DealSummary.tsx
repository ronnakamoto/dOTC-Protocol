import KeyValue from "../KeyValue";

export default function DealSummary({ initialOTCMarketcap, roundFdv, otcFdv }: any) {
  const data = [
    {
      key: "Initial OTC Marketcap",
      value: `$${initialOTCMarketcap}`,
    },
    {
      key: "Round FDV",
      value: `$${roundFdv}`,
    },
    {
      key: "OTC FDV",
      value: `$${otcFdv}`,
    },
  ];
  return <KeyValue data={data} />;
}
