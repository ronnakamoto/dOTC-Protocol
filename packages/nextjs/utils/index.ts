export function removeArrayDuplicatesByProperty(arr: any[], prop: string) {
  const unique = new Set();
  return arr.filter((obj: any) => {
    if (!unique.has(obj[prop])) {
      unique.add(obj[prop]);
      return true;
    }
    return false;
  });
}

export function formatCurrency(amount: any) {
  console.log("🚀 ~ file: index.ts:13 ~ formatCurrency ~ amount:", amount);
  // Convert the amount to a number in case it's a string
  const numericAmount = parseFloat(amount);

  // Determine the suffix and divisor based on the size of the amount
  let suffix = "";
  let divisor = 1;
  if (numericAmount >= 1e9) {
    suffix = "B";
    divisor = 1e9;
  } else if (numericAmount >= 1e6) {
    suffix = "M";
    divisor = 1e6;
  }

  // Divide the amount by the divisor and round to two decimal places
  const dividedAmount = (numericAmount / divisor).toFixed(2);

  // Return the formatted string
  return `${dividedAmount}${suffix}`;
}

export function selectRpcProvider(chainId: number) {
  let rpcProviderKey = "RPC_";
  switch (chainId) {
    case 56: {
      rpcProviderKey += "BNB_SMARTCHAIN_MAINNET";
      break;
    }
    case 137: {
      rpcProviderKey += "POLYGON_MAINNET";
      break;
    }
    case 122: {
      rpcProviderKey += "FUSE_MAINNET";
      break;
    }
    case 42161: {
      rpcProviderKey += "ARBITRUM_ONE";
      break;
    }
    case 43114: {
      rpcProviderKey += "AVALANCHE_C_CHAIN";
      break;
    }
    case 8453: {
      rpcProviderKey += "BASE";
      break;
    }
    case 43113: {
      rpcProviderKey += "AVALANCHE_FUJI_TESTNET";
      break;
    }
    case 80001: {
      rpcProviderKey += "MUMBAI";
      break;
    }
    default:
      throw new Error("Unknown network");
  }

  return process.env[rpcProviderKey];
}
