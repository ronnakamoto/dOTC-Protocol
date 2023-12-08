import React, { useState } from "react";

const OrderPlacement = ({ orderType, availableBalance }: any) => {
  const [value, setValue] = useState(0);
  const [price, setPrice] = useState(0);
  const [amount, setAmount] = useState(0);

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
            value={availableBalance}
            onChange={e => setValue(e.target.value)}
            className="slider slider-horizontal w-full"
          />
          <div className="text-right">{value}%</div>
        </div>
        <div className="mt-4">
          {orderType === "BUY" && <button className="btn btn-sm btn-success btn-block">Buy</button>}
          {orderType === "SELL" && <button className="btn btn-sm btn-error btn-block mt-2">Sell</button>}
        </div>
      </div>
    </div>
  );
};

export default OrderPlacement;
