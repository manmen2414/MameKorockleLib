"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const export_1 = require("./lib/export");
const node_child_process_1 = require("node:child_process");
async function main() {
    const KorockleHid = await export_1.device.getKorockle();
    const korockle = new export_1.device.Korockle(KorockleHid);
    korockle.setTimeNow(true);
    const serv = (0, node_child_process_1.spawn)("java", [
        "-Xmx1024M",
        "-Xms1024M",
        "-jar",
        "D:\\Mameeenn\\Programs\\korockle\\serv\\server.jar",
        "nogui",
    ]);
    serv.stdout.on("data", (ch) => {
        console.log(ch);
    });
    /*
    let incIndex = 0;
    let led = [0, 0, 10];
    setInterval(async () => {
      led[incIndex]++;
      led[(incIndex + 2) % 3]--;
      if (led[incIndex] >= 10) {
        incIndex = (incIndex + 1) % 3;
      }
      await korockle.led(new Color(...led));
      if ((await korockle.getInfo())?.isButtonClicking) {
        await korockle.sound((Math.floor(Math.random() * 3) + 1) as 1 | 2 | 3);
      }
    }, 100);*/
}
main();
//# sourceMappingURL=index.js.map