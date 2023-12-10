const OrderBook = ({ buyOrders, sellOrders }: any) => {
  return (
    <div className="flex">
      <div className="w-1/2">
        <h2 className="text-xl font-bold mb-4">Buy Orders</h2>
        <table className="table w-full table-compact">
          <thead>
            <tr>
              <th>Price</th>
              <th>Quantity</th>
            </tr>
          </thead>
          <tbody>
            {!buyOrders?.length && (
              <tr className="flex justify-center">
                <td>No buy orders yet</td>
              </tr>
            )}
            {buyOrders.map(order => (
              <tr key={order.id} className="bg-green-200">
                <td>{order.price}</td>
                <td>{order.amount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="w-1/2">
        <h2 className="text-xl font-bold mb-4">Sell Orders</h2>
        <table className="table w-full table-compact">
          <thead>
            <tr>
              <th>Price</th>
              <th>Quantity</th>
            </tr>
          </thead>
          <tbody>
            {!sellOrders?.length && (
              <tr className="flex justify-center">
                <td>No sell orders yet</td>
              </tr>
            )}
            {sellOrders.map(order => (
              <tr key={order.id} className="bg-red-200">
                <td>{order.price}</td>
                <td>{order.amount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default OrderBook;
