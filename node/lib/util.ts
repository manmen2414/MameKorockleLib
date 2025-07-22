type NumRange<
  N extends number,
  Result extends number = never,
  C extends never[] = []
> = C["length"] extends N
  ? Result
  : NumRange<N, Result | C["length"], [...C, never]>;
type Uint8 = NumRange<256>;
function checkUint8(value: number): value is Uint8 {
  if (value % 1 !== 0) return false;
  return 0 <= value && value < 256;
}
function toUint8(value: number): Uint8 {
  while (value < 0) {
    value -= value;
  }
  const testvalue = Math.floor(value) % 256;
  if (!checkUint8(testvalue)) return 0;
  return testvalue;
}
function Uint8Array2Uint8s(uint8array: Uint8Array) {
  const arr = Array.from(uint8array);
  if (!arr.every((v) => checkUint8(v)))
    throw new Error(`[${arr}] has not uint8 value`);
  return arr;
}
function findIndex(object: any, key: string): unknown | undefined {
  return Object.entries(object).find((kv) => kv[0] === key)?.[1];
}
export { NumRange, Uint8, checkUint8, toUint8, findIndex };
