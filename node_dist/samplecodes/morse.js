"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const export_1 = require("../lib/export");
async function main() {
    const KorockleHid = await export_1.device.getKorockle();
    const korockle = new export_1.device.Korockle(KorockleHid);
    let clicking = 0;
    let waiting = 0;
    let text = "";
    let morse = "";
    setInterval(async () => {
        const info = await korockle.getInfo();
        if (!info)
            throw new Error("Null");
        if (info.isButtonClicking) {
            waiting = 0;
            clicking++;
        }
        else {
            if (morse.length !== 0)
                waiting++;
            if (clicking > 6) {
                morse += "-";
                clicking = 0;
            }
            if (clicking !== 0) {
                morse += ".";
                clicking = 0;
            }
            if (waiting > 10) {
                const dec = decodepart(morse);
                morse = "";
                waiting = 0;
                if (!dec)
                    console.log("Undecoded");
                else
                    text += dec;
                morse = "";
            }
        }
        let morval = " ";
        if (clicking > 6)
            morval = "-";
        else if (clicking !== 0)
            morval = ".";
        console.log(`${text} [${morse} <${morval}>]`);
    }, 50);
}
main();
let json = {
    "0": "----- ",
    "1": ".---- ",
    "2": "..--- ",
    "3": "...-- ",
    "4": "....- ",
    "5": "..... ",
    "6": "-.... ",
    "7": "--... ",
    "8": "---.. ",
    "9": "----. ",
    a: ".- ",
    b: "-... ",
    c: "-.-. ",
    d: "-.. ",
    e: ". ",
    f: "..-. ",
    g: "--. ",
    h: ".... ",
    i: ".. ",
    j: ".--- ",
    k: "-.- ",
    l: ".-.. ",
    m: "-- ",
    n: "-. ",
    o: "--- ",
    p: ".--. ",
    q: "--.- ",
    r: ".-. ",
    s: "... ",
    t: "- ",
    u: "..- ",
    v: "...- ",
    w: ".-- ",
    x: "-..- ",
    y: "-.-- ",
    z: "--.. ",
    ".": ".-.-.- ",
    ",": "--..-- ",
    "?": "..--.. ",
    "!": "-.-.-- ",
    "-": "-....- ",
    "/": "-..-. ",
    "@": ".--.-. ",
    "(": "-.--. ",
    ")": "-.--.- ",
    "": " ",
};
// モールス信号 → 英語
function decode(mors) {
    let out = "";
    const morlArr = (mors + " ").split(" ");
    for (let i = 0; i < morlArr.length; i++) {
        let result = Object.keys(json).filter(function (k) {
            return json[k] === morlArr[i] + " ";
        })[0];
        out = out + result;
    }
    if (out.includes("undefined")) {
        return "?";
    }
    return out;
}
function decodepart(mors) {
    let result = Object.keys(json).filter(function (k) {
        return json[k] === mors + " ";
    })[0];
    return result;
}
//# sourceMappingURL=morse.js.map