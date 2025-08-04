import { device, programLib } from "../lib/export";
import { Color } from "../lib/programBuilder/color";

const SECOND = 1;
const COLORS: (string | Color)[] = [
  //VS 1-6
  "32ccba",
  "ffcc10",
  "fef00f",
  "ffbbcc",
  "dd4544",
  "3366cb",
  //L/N 7-10
  "33aaee",
  "d3b756",
  "ee6666",
  "bbdd22",
  //MMJ 11-14
  "ffccaa",
  "99ccff",
  "ffaacc",
  "99eedd",
  //VBS 15-18
  "ff6699",
  "00bbdd",
  "ff7722",
  "0077dd",
  //W*S 19-22
  "ffbb00",
  "ff66bb",
  "33dd99",
  "ba87ed",
  //25 23-26
  "bb6688",
  "8888cc",
  "ccaa88",
  "ddaacc",
];

async function main() {
  const korockle = new device.Korockle(await device.getKorockle());
  const colors = COLORS.map((v) => {
    if (typeof v === "string") return Color.fromRGB(v);
    return v;
  });
  let index = 0;
  setInterval(async () => {
    await korockle.led(colors[index]);
    await korockle.setTime(0, index + 1);
    index = (index + 1) % colors.length;
  }, SECOND * 1000);
}
main();
