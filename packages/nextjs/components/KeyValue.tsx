import { Address } from "./scaffold-eth";
import { isAddress } from "viem";

function KeyValue({ data }: any) {
  return (
    <div className="space-y-4 w-full">
      {data.map((item, index) => (
        <div key={index} className="flex items-center flex-row-reverse">
          <span className="font-bold text-right justify-right">
            {isAddress(item.value) ? <Address address={item.value} /> : item.value}
          </span>
          <hr className="border-gray-400 border-t-2 border-dotted flex-grow" />
          <span className="flex-grow">{item.key}</span>
        </div>
      ))}
    </div>
  );
}

export default KeyValue;
