const Card = ({ volume, price, marketCap }: any) => {
  return (
    <div className="bg-white h-full p-4 flex flex-col justify-center">
      <div className="mb-4">
        <h3 className="text-primary font-bold font-mono">Volume</h3>
        <p className="text-gray-900 leading-none font-mono">{volume}</p>
      </div>
      <div className="mb-4">
        <h3 className="text-primary font-bold font-mono">Current Price</h3>
        <p className="text-gray-900 leading-none font-mono">${price}</p>
      </div>
      <div className="mb-4">
        <h3 className="text-primary font-bold font-mono">Market Cap</h3>
        <p className="text-gray-900 leading-none font-mono">{marketCap}</p>
      </div>
    </div>
  );
};

export default Card;
