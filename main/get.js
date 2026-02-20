/**
 * @overload
 * @param {number} [index=0] [Nodeのみ] 該当インデックスのコロックルを返す。
 * @returns {Promise<HIDDevice>}
 */
/**
 * @overload
 * @param {"all"} index 全てのコロックルを返す。
 * @returns {Promise<HIDDevice[]>}
 */
async function getKorockle(index = 0) {
  const hid = navigator.hid;
  /**@type {HIDDevice[]} */
  const korockles = await hid.requestDevice({
    filters: [
      {
        vendorId: 3141,
        productId: 28740,
      },
    ],
  });
  if (index === "all") {
    await Promise.all(korockles.map((k) => k.open()));
    return korockles;
  }
  await korockles[index].open();
  return korockles[index];
}
export { getKorockle };
