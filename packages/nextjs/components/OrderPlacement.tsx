import React, { useState } from "react";

const OrderPlacement = ({
  orderType,
  availableBalance,
  availableStableBalance,
  walletAddress,
  contractAddress,
  onOrderPlaced,
}: any) => {
  const [sliderValue, setSliderValue] = useState(0);
  const [price, setPrice] = useState(0);
  const [amount, setAmount] = useState(0);
  const [loading, setLoading] = useState(false);

  const onSell = e => {
    e.preventDefault();
    setLoading(true);
    fetch(`/api/trade/sell`, {
      method: "POST",
      body: JSON.stringify({ price, amount, walletAddress, contractAddress }),
    })
      .then(res => res.json())
      .then(data => {
        console.log("🚀 ~ file: OrderPlacement.tsx:12 ~ onSell ~ data:", data);
        setLoading(false);
        setPrice(0);
        setAmount(0);
        onOrderPlaced(data);
      });
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-4 m-4 mr-0">
      <div className="mb-4">
        <div className="mt-4">
          <label className="block text-gray-700">Price</label>
          <input
            type="number"
            value={price}
            onChange={e => setPrice(e.target.value)}
            className="input input-bordered w-full input-sm"
          />
        </div>
        <div className="mt-4">
          <label className="block text-gray-700">Amount</label>
          <input
            type="number"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            className="input input-bordered w-full input-sm"
          />
        </div>
        <div className="mt-4">
          <label className="block text-gray-700">Amount to Spend</label>
          <input
            type="range"
            min="0"
            max="100"
            value={sliderValue}
            onChange={e => setSliderValue(e.target.value)}
            className="slider slider-horizontal w-full"
          />
          <div className="text-right">{sliderValue}%</div>
        </div>
        <div className="flex justify-end">
          <div className="text-sm">Balance: {orderType === "SELL" ? availableBalance : availableStableBalance}</div>
        </div>
        <div className="mt-4">
          {orderType === "BUY" && <button className="btn btn-sm btn-success btn-block">Buy</button>}
          {orderType === "SELL" && (
            <button className="btn btn-sm btn-error btn-block mt-2" onClick={onSell}>
              {loading && <span className="loading loading-spinner"></span>}
              {loading ? "Processing Sell Order ..." : "Sell"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderPlacement;
