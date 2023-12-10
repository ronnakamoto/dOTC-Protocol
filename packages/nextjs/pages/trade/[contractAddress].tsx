import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useAccount } from "wagmi";
import CandlestickChartComponent from "~~/components/CandlestickChart";
import OrderBook from "~~/components/OrderBook";
import OrderPlacement from "~~/components/OrderPlacement";
import TradeOverview from "~~/components/TradeOverview";
import { notification } from "~~/utils/scaffold-eth";

function groupOrdersByPrice(orders) {
  const groupedOrders = {};

  // Aggregate orders by price
  orders.forEach(order => {
    if (groupedOrders.hasOwnProperty(order.price)) {
      groupedOrders[order.price] += order.amount;
    } else {
      groupedOrders[order.price] = order.amount;
    }
  });

  // Convert the aggregated data into an array of objects
  return Object.keys(groupedOrders).map(price => {
    return {
      price: parseFloat(price),
      amount: groupedOrders[price],
    };
  });
}

export default function TradingTerminal() {
  const { address } = useAccount();
  const [orderType, setOrderType] = useState("BUY");
  const [availableBalance, setAvailableBalance] = useState(0);
  const [availableStableBalance, setAvailableStableBalance] = useState(0);
  const [refreshBalance, setRefreshBalance] = useState(false);
  const router = useRouter();
  const [buyOrders, setBuyOrders] = useState([]);
  const [sellOrders, setSellOrders] = useState([]);
  const [currentPrice, setCurrentPrice] = useState(0);

  const onOrderPlaced = (data: any) => {
    console.log("🚀 ~ file: [contractAddress].tsx:27 ~ onOrderPlaced ~ data:", data);
    notification.success("Order has been placed");
    setRefreshBalance(true);
  };

  useEffect(() => {
    if (router.query.contractAddress) {
      fetch(`/api/trade/${router.query.contractAddress}/market-price`)
        .then(res => res.json())
        .then(data => {
          console.log("🚀 ~ file: index.tsx:28 ~ useEffect ~ data:", data);
          setCurrentPrice(data);
        });
    }
  }, [router.query.contractAddress]);

  useEffect(() => {
    if (router.query.contractAddress && address) {
      fetch(`/api/balance?walletAddress=${address}&contractAddress=${router.query.contractAddress}`)
        .then(res => res.json())
        .then(data => {
          console.log("🚀 ~ file: index.tsx:28 ~ useEffect ~ balance:", data);
          setAvailableBalance(data);
          setRefreshBalance(false);
        });
    }
  }, [router.query.contractAddress, address, refreshBalance]);

  useEffect(() => {
    if (router.query.contractAddress) {
      fetch(`/api/trade/orders?contractAddress=${router.query.contractAddress}&orderType=BUY`)
        .then(res => res.json())
        .then(data => {
          console.log("🚀 ~ file: index.tsx:28 ~ useEffect ~ balance:", data);
          setBuyOrders(data);
        });
    }
  }, [router.query.contractAddress]);

  useEffect(() => {
    if (router.query.contractAddress) {
      fetch(`/api/trade/orders?contractAddress=${router.query.contractAddress}&orderType=SELL`)
        .then(res => res.json())
        .then(data => {
          console.log("🚀 ~ file: index.tsx:28 ~ useEffect ~ balance:", data);
          const orders = groupOrdersByPrice(data);
          setSellOrders(orders);
        });
    }
  }, [router.query.contractAddress]);

  return (
    <div className="container mx-auto p-4">
      <div className="mb-2 flex w-full border border-primary">
        <div className="w-5/6">
          <CandlestickChartComponent />
        </div>
        <div className="flex-grow">
          <TradeOverview volume="1.23M" price={currentPrice} marketCap="$1.23B" />
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
          <OrderPlacement
            orderType={orderType}
            availableBalance={availableBalance}
            availableStableBalance={availableStableBalance}
            walletAddress={address}
            contractAddress={router.query.contractAddress}
            onOrderPlaced={onOrderPlaced}
          />
        </div>
      </div>
    </div>
  );
}
