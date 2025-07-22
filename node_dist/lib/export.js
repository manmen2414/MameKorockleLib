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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.programLib = exports.device = void 0;
const get_1 = __importDefault(require("./get"));
const korockle_1 = __importDefault(require("./korockle"));
const longdataWriter_1 = __importDefault(require("./longdataWriter"));
const util = __importStar(require("./util"));
const color_1 = require("./programBuilder/color");
const led_1 = __importDefault(require("./programBuilder/led"));
const device = {
    getKorockle: get_1.default,
    Korockle: korockle_1.default,
    LongDataWriter: longdataWriter_1.default,
    util,
};
exports.device = device;
const programLib = {
    Color: color_1.Color,
    ConstColor: color_1.ConstColor,
    LED: led_1.default,
};
exports.programLib = programLib;
//# sourceMappingURL=export.js.map