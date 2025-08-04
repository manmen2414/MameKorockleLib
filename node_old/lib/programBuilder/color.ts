import * as Util from "../util";
type colorNum = Util.NumRange<11>;
type ConstColorName =
  | "RED"
  | "GREEN"
  | "BLUE"
  | "YELLOW"
  | "PURPLE"
  | "CYAN"
  | "WHITE";

const ConstColor = {
  RED: 11,
  GREEN: 31,
  BLUE: 7,
  YELLOW: 15,
  PURPLE: 27,
  CYAN: 19,
  WHITE: 23,
} as const;
const ConstColorColor = {
  RED: [10, 0, 0],
  GREEN: [0, 10, 0],
  BLUE: [0, 0, 10],
  YELLOW: [10, 10, 0],
  PURPLE: [10, 0, 10],
  CYAN: [10, 10, 0],
  WHITE: [10, 10, 10],
};
function isColorNum(val: number): val is colorNum {
  if (typeof val !== "number") return false;
  if (val % 1 !== 0) return false;
  if (val < 0) return false;
  if (val > 10) return false;
  return true;
}
class Color {
  red: colorNum = 10;
  green: colorNum = 10;
  blue: colorNum = 10;
  /**
   * @param red 0~10 integer
   * @param green 0~10 integer
   * @param blue 0~10 integer
   */
  constructor(red: number = 10, green: number = 10, blue: number = 10) {
    if (!isColorNum(red)) throw new Error("red is not 0~10 integer");
    if (!isColorNum(green)) throw new Error("red is not 0~10 integer");
    if (!isColorNum(blue)) throw new Error("red is not 0~10 integer");
    this.red = red;
    this.green = green;
    this.blue = blue;
  }
  static fromRGB(rgb: string) {
    const rgbString = rgb;
    const arg: colorNum[] = [];
    for (let i = 0; i < 3; i++) {
      const color = rgbString[i * 2] + rgbString[i * 2 + 1];
      //0~255までの数値を255で割って10で掛けて四捨五入したものが0~10の範囲に収まらないわけがない
      const numMaped = Math.round(
        (parseInt(color, 16) / 0xff) * 10
      ) as colorNum;
      arg.push(numMaped);
    }
    return new Color(...arg);
  }
  static fromConstColor(constColor: number) {
    const colorsFinded = Object.entries(ConstColor).find(
      (v) => v[1] === constColor
    );
    if (!colorsFinded) throw new Error(`ConstColor ${constColor} is not found`);
    const colorName = colorsFinded[0];
    return new Color(
      ...(Util.findIndex(ConstColorColor, colorName) as colorNum[])
    );
  }
  constColor() {
    const rgb = [this.red, this.green, this.blue];
    const constColor = Object.entries(ConstColorColor).find((kv) =>
      kv[1].every((v, i) => rgb[i] === v)
    );
    if (!constColor) return 0;
    return ConstColor[constColor[0] as ConstColorName];
  }
  toString() {
    return `${this.red},${this.green},${this.blue}`;
  }
}
export { Color, ConstColor, ConstColorName };
