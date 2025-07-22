"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkUint8 = checkUint8;
exports.toUint8 = toUint8;
exports.findIndex = findIndex;
function checkUint8(value) {
    if (value % 1 !== 0)
        return false;
    return 0 <= value && value < 256;
}
function toUint8(value) {
    while (value < 0) {
        value -= value;
    }
    const testvalue = Math.floor(value) % 256;
    if (!checkUint8(testvalue))
        return 0;
    return testvalue;
}
function Uint8Array2Uint8s(uint8array) {
    const arr = Array.from(uint8array);
    if (!arr.every((v) => checkUint8(v)))
        throw new Error(`[${arr}] has not uint8 value`);
    return arr;
}
function findIndex(object, key) {
    return Object.entries(object).find((kv) => kv[0] === key)?.[1];
}
//# sourceMappingURL=util.js.map