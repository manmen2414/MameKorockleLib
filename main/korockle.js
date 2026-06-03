/// <reference path="../webhid.d.ts" />
//@ts-check
import { getKorockle } from "./get.js";
import * as util from "./util.js";
import { toUint8 } from "./util.js";
import { LongDataWriter } from "./longdataWriter.js";
import { COMMANDID } from "./commandId.js";
import { korockleDataToInfo } from "./dataToInfo.js";
import { Color } from "./programBuilder/color.js";

const THREE0 = [0, 0, 0];
class Korockle {
  /**@type {HIDDevice | null} */
  hid = null;
  /**@type {number} */
  commandSequenceNumber = 0;
  /**@type {((report:number[])=>boolean)[]} @returns If the function returns true, the function is deleted from this list. */
  waitingReportListeners = [];

  /**@param {HIDDevice} hid  */
  constructor(hid) {
    this.hid = hid;
    this.hid.addEventListener("inputreport", (event) => {
      this._inputreport(event);
    });
  }
  static async get() {
    const kHid = await getKorockle();
    if (!kHid) return null;
    return new Korockle(kHid);
  }
  execute() {
    return this.sendCommand(COMMANDID.executeProgram);
  }
  /** `execute`と同じ */
  runProgram() {
    return this.execute();
  }
  stopProgram() {
    return this.sendCommand(COMMANDID.stopProgram);
  }
  /**@param {number[]} program */
  async writeProgram(program) {
    await this.sendCommand(
      COMMANDID.writeProgram,
      util.convertToDeviceEndian(program.length),
    );
    const longData = new LongDataWriter(this, program);
    await longData.send();
    return this.readData(COMMANDID.writeProgram);
  }
  /**@param {number[]} melody */
  async writeMelody(melody) {
    await this.sendCommand(
      COMMANDID.writeMelody,
      util.convertToDeviceEndian(melody.length),
    );
    const longData = new LongDataWriter(this, melody);
    await longData.send();
    return this.readData(COMMANDID.writeMelody);
  }
  /**
   * @param {number} reportId
   * @param {number} commandId
   * @param {number[]} data
   * @param {0 | 1} webAudio
   */
  sendData(reportId, commandId, data = [], webAudio = 0) {
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
  /**
   * @param {number} commandId
   * @param {number[]} data
   * @param {boolean} exceptLongData
   */
  async sendCommand(commandId, data = [], exceptLongData = false) {
    this.commandSequenceNumber = toUint8(this.commandSequenceNumber + 1);
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
    return korockleDataToInfo(data);
  }
  /**
   * @param {Color} color
   */
  led(color = new Color(0, 0, 0)) {
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
  sound(id) {
    return this.sendCommand(COMMANDID.action, [35 + id, 0]);
  }
  /**
   * @param {number} power 0でoff
   */
  usb(power) {
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
  melody(type, index = 0) {
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
  setTime(hour_date, _minute = -1) {
    /**@type {number} */
    let hour;
    /**@type {number} */
    let minute;
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
      ...THREE0,
    ]);
  }
  /**
   * @param {number | Date} hour_date
   * @param {number} _minute
   */
  setAlerm(hour_date, _minute = -1) {
    /**@type {number} */
    let hour;
    /**@type {number} */
    let minute;
    if (typeof hour_date !== "number") {
      hour = hour_date.getHours();
      minute = hour_date.getMinutes();
    } else {
      hour = hour_date;
      minute = _minute;
    }
    return this.sendCommand(COMMANDID.setTimeOrAlerm, [
      ...THREE0,
      1,
      minute,
      hour,
    ]);
  }
  /**
   * @param {boolean} reservation 予約モード: 時刻の秒が0秒になるまで待機し、なったら書き込む
   */
  /**
   * @overload
   * @param {true} reservation
   * @returns {Promise<undefined>}
   */
  /**
   * @overload
   * @param {false|undefined} reservation
   * @returns {Promise<number[]>}
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
  /**@param {HIDInputReportEvent} event  */
  _inputreport(event) {
    if (!this.hid) return;
    if (event.device.productId !== this.hid.productId) return;
    if (event.device.vendorId !== this.hid.vendorId) return;

    const report = util.dataViewToArray(event.data);

    this.waitingReportListeners.filter((listener) => {
      try {
        return !listener(report);
      } finally {
        return true;
      }
    });
  }
  /**
   * @param {number} exceptedSequenceId
   * @param {number} timeout
   */
  readData(exceptedSequenceId = -1, timeout = 100) {
    /**@type {Promise<number[]>} */
    const mainTask = new Promise((rs) =>
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
    /**@type {number[]} */
    const result = [];
    /**@type {Promise<number[]>} */
    const mainTask = new Promise((rs) =>
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
