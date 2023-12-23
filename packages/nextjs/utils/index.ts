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
  return `$${dividedAmount}${suffix}`;
}
