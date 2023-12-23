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
