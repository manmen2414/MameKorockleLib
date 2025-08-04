import getKorockle from "./get";
import Korockle from "./korockle";
import LongDataWriter from "./longdataWriter";
import * as util from "./util";
import { Color, ConstColor } from "./programBuilder/color";
import LED from "./programBuilder/led";

const device = {
  getKorockle,
  Korockle,
  LongDataWriter,
  util,
};
const programLib = {
  Color,
  ConstColor,
  LED,
};
export { device, programLib };
