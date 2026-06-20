import * as util from "../util";
import { LongDataWriter } from "./longDataWriter";
import { COMMANDID } from "./constants";
import { Color } from "./color";
import { GlobalHidDevice } from "../types";

class Korockle {
  hid: GlobalHidDevice | null = null;
  commandSequenceNumber: number = 0;
  waitingReportListeners: ((report: number[]) => boolean)[] = [];

  /**@param {GlobalHidDevice} hid  */
  constructor(hid: GlobalHidDevice) {
    this.hid = hid;
    this.hid.onData((event) => {
      this._inputreport(event);
    });
  }
  execute() {
    return this.sendCommand(COMMANDID.executeProgram);
  }
  /** The alias of `Korockle.execute()` */
  runProgram() {
    return this.execute();
  }
  stopProgram() {
    return this.sendCommand(COMMANDID.stopProgram);
  }
  async writeProgram(program: number[]) {
    await this.sendCommand(
      COMMANDID.writeProgram,
      util.convertToLittleEndianBytes(program.length),
    );
    const longData = new LongDataWriter(this, program);
    await longData.send();
    return this.readData(COMMANDID.writeProgram);
  }
  async writeMelody(melody: number[]) {
    await this.sendCommand(
      COMMANDID.writeMelody,
      util.convertToLittleEndianBytes(melody.length),
    );
    const longData = new LongDataWriter(this, melody);
    await longData.send();
    return this.readData(COMMANDID.writeMelody);
  }
  sendData(
    reportId: number,
    commandId: number,
    data: number[] = [],
    webAudio: 0 | 1 = 0,
  ) {
    //TODO: パケット分割
    if (!this.hid) throw new Error("HID not readied");
    if (data.length >= 64) {
      throw new RangeError(`Data over. length:${data.length}`);
    }
    return this.hid.sendReport(
      webAudio,
      Uint8Array.from([reportId, commandId, ...data]),
    );
  }
  async sendCommand(
    commandId: number,
    data: number[] = [],
    exceptLongData: boolean = false,
  ) {
    this.commandSequenceNumber = util.toUint8(this.commandSequenceNumber + 1);
    const read = (exceptLongData ? this.readLongData : this.readData).call(
      this,
      this.commandSequenceNumber,
    );
    await this.sendData(commandId, this.commandSequenceNumber, data);
    return await read;
  }
  async getInfoRaw() {
    if (!this.hid) throw new Error("HID not readied");
    const data = await this.sendCommand(COMMANDID.getInfo, []);
    return data.slice(2);
  }
  async readProgram() {
    if (!this.hid) throw new Error("HID not readied");
    const data = await this.sendCommand(COMMANDID.readProgram, [], true);
    return data.slice(2);
  }
  async readMelody() {
    if (!this.hid) throw new Error("HID not readied");
    const data = await this.sendCommand(COMMANDID.readMelody, [], true);
    return data.slice(2);
  }
  async getInfo() {
    const data = await this.getInfoRaw();
    if (!data) return null;
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
    ] = data;
    return {
      isButtonClicking: !!isButtonClicking,
      isLight: !!isLight,
      light,
      temp,
      isHearing: !!isHearing,
      isInputing: !!isInputing,
    };
  }
  led(color: Color = new Color(0, 0, 0)) {
    if (color.red === 0 && color.blue === 0 && color.green === 0) {
      return this.sendCommand(COMMANDID.action, [35, 0, 0, 0, 0]);
    } else {
      const constColor = color.constColor();
      const argment = [6, 0, color.red, color.green, color.blue];
      if (constColor !== 0) argment[0] = constColor + 3;
      return this.sendCommand(COMMANDID.action, argment);
    }
  }
  /**
   * @param {1|2|3} id
   */
  sound(id: 1 | 2 | 3) {
    return this.sendCommand(COMMANDID.action, [35 + id, 0]);
  }
  /**
   * @param {number} power 0でoff
   */
  usb(power: number) {
    const value = power === 0 ? 140 : 138;
    return this.sendCommand(COMMANDID.action, [value, 0, power]);
  }
  async getVersion() {
    return (await this.sendCommand(COMMANDID.getVersion))[2];
  }
  async getLightValue() {
    return (await this.sendCommand(COMMANDID.getLight))[2];
  }
  async getRunningProgramByteIndex() {
    return (await this.sendCommand(COMMANDID.getRunningProgramByteIndex))[2];
  }
  /**
   * @param {"once" | "loop" | "stop"} type
   * @param {number} index
   */
  melody(type: "once" | "loop" | "stop", index: number = 0) {
    switch (type) {
      case "once":
        return this.sendCommand(COMMANDID.playMelody, [index + 1]);
      case "loop":
        return this.sendCommand(COMMANDID.action, [40, 0]);
      case "stop":
        return this.sendCommand(COMMANDID.stopMeloay);
      default:
        throw new TypeError(
          `${type} is an invalid value, Needs "once"|"loop"|"stop"`,
        );
    }
  }
  /**
   * @param {number | Date} hour_date
   * @param {number} _minute
   */
  setTime(hour_date: number | Date, _minute: number = -1) {
    /**@type {number} */
    let hour: number;
    /**@type {number} */
    let minute: number;
    if (typeof hour_date !== "number") {
      hour = hour_date.getHours();
      minute = hour_date.getMinutes();
    } else {
      hour = hour_date;
      minute = _minute;
    }
    return this.sendCommand(COMMANDID.setTimeOrAlerm, [
      1,
      minute,
      hour,
      0,
      0,
      0,
    ]);
  }
  /**
   * @param {number | Date} hour_date
   * @param {number} _minute
   */
  setAlerm(hour_date: number | Date, _minute: number = -1) {
    /**@type {number} */
    let hour: number;
    /**@type {number} */
    let minute: number;
    if (typeof hour_date !== "number") {
      hour = hour_date.getHours();
      minute = hour_date.getMinutes();
    } else {
      hour = hour_date;
      minute = _minute;
    }
    return this.sendCommand(COMMANDID.setTimeOrAlerm, [
      0,
      0,
      0,
      1,
      minute,
      hour,
    ]);
  }

  async setTimeNow(reservation: true): Promise<undefined>;
  async setTimeNow(reservation?: false): Promise<number[]>;
  /**
   * @param reservation 予約モード: 時刻の秒が0秒になるまで待機し、なったら書き込む
   */
  async setTimeNow(reservation = false) {
    if (reservation) {
      //予約モード: 0秒になったら書き込む
      const id = setInterval(() => {
        const date = new Date();
        if (date.getSeconds() === 0) {
          this.setTime(date);
          clearInterval(id);
        }
      });
    } else {
      return this.setTime(new Date());
    }
  }
  _inputreport(event: Uint8Array) {
    if (!this.hid) return;

    const report = Array.from(event);

    this.waitingReportListeners.filter((listener) => {
      try {
        return !listener(report);
      } finally {
        return true;
      }
    });
  }
  readData(exceptedSequenceId: number = -1, timeout: number = 100) {
    const mainTask: Promise<number[]> = new Promise((rs) =>
      this.waitingReportListeners.push((report) => {
        const sequenceId = report[1];
        if (exceptedSequenceId !== -1 && exceptedSequenceId !== sequenceId)
          return false;
        rs(report);
        return true;
      }),
    );
    return util.raceWithTimeout(mainTask, timeout, "The response timed out");
  }
  /**
   * `[240, セグメントID, ...データ]`を返す。
   */
  readLongData(exceptedSequenceId = -1, overallTimeout = 300) {
    const result: number[] = [];
    const mainTask: Promise<number[]> = new Promise((rs) =>
      this.waitingReportListeners.push((report) => {
        const isHeaderChunk = report[0] === 240;
        // isHeaderChunk かつ result空 ならば シーケンスID
        // isHeaderChunk かつ result空 でなければ 0 (送信終了ヘッダー)
        // isHeaderChunk でないなら 最終チャンクか(1bit)とチャンク内データ長(7bit)
        const metadata = report[1];
        if (isHeaderChunk && exceptedSequenceId === metadata) {
          // 開始ヘッダーチャンク
          result.push(240, metadata);
          // 終了ヘッダーチャンクに対してやることはない(データ内の値で終了はわかる)
        } else if (!isHeaderChunk) {
          // データチャンク
          const isLastDataChunk = (metadata & 0b1000_0000) === 128;
          const detaLength = metadata & 0b0111_1111;
          // メタデータを除いたデータ範囲を切り抜く
          result.push(...report.slice(2, detaLength + 2));
          if (isLastDataChunk) {
            // 事前に必要なところだけ切り抜いているため、最後の一工夫は必要ない
            rs(result);
            return true;
          }
        }
        return false;
      }),
    );
    return util.raceWithTimeout(
      mainTask,
      overallTimeout,
      "The response timed out",
    );
  }
}
export { Korockle };
