import { hid } from "./util.js";

async function getKorockle() {
  const [korockle] = await hid.requestDevice({
    filters: [
      {
        vendorId: 3141,
        productId: 28740,
      },
    ],
  });
  await korockle.open();
  return korockle;
}
export default getKorockle;
