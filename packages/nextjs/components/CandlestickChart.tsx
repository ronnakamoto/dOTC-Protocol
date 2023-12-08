import React from "react";
import { Chart } from "react-google-charts";

const sampleData = [
  ["Date", "Low", "Open", "Close", "High"],
  [new Date("2021-01-01"), 90, 100, 105, 110],
  [new Date("2021-01-02"), 95, 105, 110, 115],
  [new Date("2021-01-03"), 100, 110, 115, 120],
  [new Date("2021-01-04"), 105, 115, 120, 125],
  [new Date("2021-01-05"), 110, 120, 125, 130],
];

const options = {
  legend: "none",
  candlestick: {
    fallingColor: { strokeWidth: 0, fill: "#a52714" },
    risingColor: { strokeWidth: 0, fill: "#0f9d58" },
  },
};

const CandlestickChartComponent = () => {
  return (
    <div className="App">
      <Chart
        chartType="CandlestickChart"
        width="100%"
        height="400px"
        data={sampleData}
        options={options}
        loader={<div>Loading Chart</div>}
      />
    </div>
  );
};

export default CandlestickChartComponent;
