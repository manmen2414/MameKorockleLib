"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConstColor = exports.Color = void 0;
const Util = __importStar(require("../util"));
const ConstColor = {
    RED: 11,
    GREEN: 31,
    BLUE: 7,
    YELLOW: 15,
    PURPLE: 27,
    CYAN: 19,
    WHITE: 23,
};
exports.ConstColor = ConstColor;
const ConstColorColor = {
    RED: [10, 0, 0],
    GREEN: [0, 10, 0],
    BLUE: [0, 0, 10],
    YELLOW: [10, 0, 10],
    PURPLE: [10, 10, 10],
    CYAN: [10, 10, 0],
    WHITE: [10, 10, 10],
};
function isColorNum(val) {
    if (typeof val !== "number")
        return false;
    if (val % 1 !== 0)
        return false;
    if (val < 0)
        return false;
    if (val > 10)
        return false;
    return true;
}
class Color {
    red = 10;
    green = 10;
    blue = 10;
    /**
     * @param red 0~10 integer
     * @param green 0~10 integer
     * @param blue 0~10 integer
     */
    constructor(red = 10, green = 10, blue = 10) {
        if (!isColorNum(red))
            throw new Error("red is not 0~10 integer");
        if (!isColorNum(green))
            throw new Error("red is not 0~10 integer");
        if (!isColorNum(blue))
            throw new Error("red is not 0~10 integer");
        this.red = red;
        this.green = green;
        this.blue = blue;
    }
    static fromRGB(rgb) {
        const rgbString = rgb;
        const arg = [];
        for (let i = 0; i < 3; i++) {
            const color = rgbString[i] + rgbString[i + 1];
            //0~255までの数値を255で割って10で掛けて四捨五入したものが0~10の範囲に収まらないわけがない
            const numMaped = Math.round((parseInt(color, 16) / 0xff) * 10);
            arg.push(numMaped);
        }
        return new Color(...arg);
    }
    static fromConstColor(constColor) {
        const colorsFinded = Object.entries(ConstColor).find((v) => v[1] === constColor);
        if (!colorsFinded)
            throw new Error(`ConstColor ${constColor} is not found`);
        const colorName = colorsFinded[0];
        return new Color(...Util.findIndex(ConstColorColor, colorName));
    }
    constColor() {
        const rgb = [this.red, this.green, this.blue];
        const constColor = Object.entries(ConstColorColor).find((kv) => kv[1].every((v, i) => rgb[i] === v));
        if (!constColor)
            return 0;
        return ConstColor[constColor[0]];
    }
    toString() {
        return `${this.red},${this.green},${this.blue}`;
    }
}
exports.Color = Color;
//# sourceMappingURL=color.js.map