import * as util from "../util";
type ColorNumber = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;
export const ConstantColor = {
  RED: 11,
  GREEN: 31,
  BLUE: 7,
  YELLOW: 15,
  PURPLE: 27,
  CYAN: 19,
  WHITE: 23,
} as const;
export { ConstantColor as ConstColor };
export type ConstantColorName = keyof typeof ConstantColor;
export const ConstantColorDefine = {
  RED: [10, 0, 0],
  GREEN: [0, 10, 0],
  BLUE: [0, 0, 10],
  YELLOW: [10, 10, 0],
  PURPLE: [10, 0, 10],
  CYAN: [0, 10, 10],
  WHITE: [10, 10, 10],
} as const;

function isColorNum(val: number): val is ColorNumber {
  if (typeof val !== "number") return false;
  if (val % 1 !== 0) return false;
  if (val < 0) return false;
  if (val > 10) return false;
  return true;
}

function clampToColorNum(val: number) {
  const integerChecked = Math.round(val);
  const minChecked = 0 < integerChecked ? integerChecked : 0;
  const maxChecked = minChecked < 10 ? minChecked : 10;
  return maxChecked as ColorNumber;
}

export class Color {
  red: ColorNumber = 10;
  green: ColorNumber = 10;
  blue: ColorNumber = 10;
  /**
   * @param red 0~10
   * @param green 0~10
   * @param blue 0~10
   */
  constructor(red: number, green: number, blue: number);
  /**
   * Generates White Color.
   */
  constructor();
  constructor(rgb: string);
  constructor(constColor: number);
  constructor(arg1?: number | string, arg2?: number, arg3?: number) {
    if (typeof arg1 === "string") {
      const rgbString = arg1.startsWith("#") ? arg1.slice(1) : arg1;
      for (let i = 0; i < 3; i++) {
        const color = rgbString[i * 2] + rgbString[i * 2 + 1];
        const numMaped = clampToColorNum(parseInt(color, 16) / (0xff / 10));
        switch (i) {
          case 0:
            this.red = numMaped;
            break;
          case 1:
            this.green = numMaped;
            break;
          case 2:
            this.blue = numMaped;
            break;
        }
      }
    } else if (
      typeof arg1 === "number" &&
      typeof arg2 === "number" &&
      typeof arg3 === "number"
    ) {
      this.red = clampToColorNum(arg1);
      this.green = clampToColorNum(arg2);
      this.blue = clampToColorNum(arg3);
    } else if (typeof arg1 === "number") {
      const colorsFinded = Object.entries(ConstantColor).find(
        (v) => v[1] === arg1,
      );
      if (!colorsFinded) throw new Error(`ConstColor ${arg1} is not found`);
      const colorName = colorsFinded[0];
      const color = ConstantColorDefine[colorName];
      this.red = color[0];
      this.green = color[1];
      this.blue = color[2];
    }
  }
  static fromRGB(rgb: string) {
    return new this(rgb);
  }
  static fromConstColor(constColor: number) {
    return new this(constColor);
  }
  /**@returns If the color isn't included in constant colors, this method returns 0. */
  constColor(): number {
    const rgb = [this.red, this.green, this.blue];
    const constColor = Object.entries(ConstantColorDefine).find((kv) =>
      kv[1].every((v, i) => rgb[i] === v),
    );
    if (!constColor) return 0;
    return ConstantColor[constColor[0]];
  }
  toString() {
    return `${this.red},${this.green},${this.blue}`;
  }
  isNone() {
    return this.red === 0 && this.blue === 0 && this.green === 0;
  }
  static NONE = new Color(0, 0, 0);
}
