export const NORMAL_KOROCKLE_VENDOR_ID = 0x0c45;
export const NORMAL_KOROCKLE_PRODUCT_ID = 0x7044;

export const COMMANDID = {
  setTimeOrAlerm: 101,
  writeProgram: 102,
  readProgram: 103,
  executeProgram: 104,
  stopProgram: 105,
  writeMelody: 112,
  readMelody: 113,
  updateFirmware: 114,
  playMelody: 115,
  stopMeloay: 116,
  getLight: 117,
  getRunningProgramByteIndex: 118,
  /**@deprecated Please use COMMANDID.getSensorStatus */
  getInfo: 119,
  getSensorStatus: 119,
  action: 120,
  getVersion: 121,
  dataSegment: 208,
} as const;
