import { Uint8 } from "./util";

function korockleDataToInfo(gotData: Uint8[]) {
  const [
    _1,
    isButtonClicking,
    isLight,
    light,
    temp,
    isHearing,
    isInputing,
    _2,
    _3,
  ] = gotData;
  function bitToBool(val: number) {
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

export default korockleDataToInfo;
