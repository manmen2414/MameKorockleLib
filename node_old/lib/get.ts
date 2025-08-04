import * as nodeHid from "node-hid";
async function getKorockle() {
  const devices = await nodeHid.devicesAsync();
  const korockle =
    devices.find((v) => v.vendorId === 3141 && v.productId === 28740) ??
    [null][0];
  if (!korockle) throw new Error("Korockle Not Found");
  if (!korockle.path) throw new Error("Korockle Path Not Found");
  return nodeHid.HIDAsync.open(korockle.path);
}
export default getKorockle;
