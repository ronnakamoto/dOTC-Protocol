import { useState } from "react";
import CandlestickChartComponent from "~~/components/CandlestickChart";
import OrderBook from "~~/components/OrderBook";
import OrderPlacement from "~~/components/OrderPlacement";
import TradeOverview from "~~/components/TradeOverview";

const buyOrders = [
  { id: 1, price: 100, quantity: 10 },
  { id: 2, price: 90, quantity: 5 },
];

const sellOrders = [
  { id: 3, price: 110, quantity: 7 },
  { id: 4, price: 120, quantity: 3 },
];

export default function TradingTerminal() {
  const [orderType, setOrderType] = useState("BUY");
  const [availableBalance, setAvailableBalance] = useState(0);
  return (
    <div className="container mx-auto p-4">
      <div className="mb-2 flex w-full border border-primary">
        <div className="w-5/6">
          <CandlestickChartComponent />
        </div>
        <div className="flex-grow">
          <TradeOverview volume="1.23M" price="$1234.56" marketCap="$1.23B" />
        </div>
      </div>
      <div className="flex">
        <div className="w-2/3">
          <OrderBook buyOrders={buyOrders} sellOrders={sellOrders} />
        </div>
        <div className="flex-grow">
          <div className="tabs pl-4">
            <a
              className={orderType === "BUY" ? "tab tab-lifted tab-active" : "tab tab-lifted"}
              onClick={() => {
                setOrderType("BUY");
              }}
            >
              Buy
            </a>
            <a
              className={orderType === "SELL" ? "tab tab-lifted tab-active" : "tab tab-lifted"}
              onClick={() => {
                setOrderType("SELL");
              }}
            >
              Sell
            </a>
          </div>
          <OrderPlacement orderType={orderType} availableBalance={availableBalance} />
        </div>
      </div>
    </div>
  );
}
