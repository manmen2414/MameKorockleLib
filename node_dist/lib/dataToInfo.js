"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function korockleDataToInfo(gotData) {
    const [_1, isButtonClicking, isLight, light, temp, isHearing, isInputing, _2, _3,] = gotData;
    function bitToBool(val) {
        return !!val;
    }
    return {
        isButtonClicking: bitToBool(isButtonClicking),
        isLight: bitToBool(isLight),
        light,
        temp,
        isHearing: bitToBool(isHearing),
        isInputing: bitToBool(isInputing),
    };
}
exports.default = korockleDataToInfo;
//# sourceMappingURL=dataToInfo.js.map