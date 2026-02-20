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
  /**@type {number[][]} */
  __data = [];
  /**@type {EventTarget} */
  __event;
  /**@param {HIDDevice} hid  */
  constructor(hid) {
    this.hid = hid;
    this.hid.addEventListener("inputreport", (event) => {
      //@ts-ignore
      this.__inputreport(event);
    });
    this.__event = new EventTarget();
  }
  static async get() {
    const kHid = await getKorockle();
    if (!kHid) return null;
    return new Korockle(kHid);
  }
  async execute() {
    await this.sendCommand(COMMANDID.executeProgram);
  }
  /** `execute`と同じ */
  async runProgram() {
    await this.execute();
  }
  async stopProgram() {
    await this.sendCommand(COMMANDID.stopProgram);
  }
  /**@param {number[]} program */
  async writeProgram(program) {
    await this.sendCommand(
      COMMANDID.writeProgram,
      util.convertToDeviceEndian(program.length),
    );
    const longData = new LongDataWriter(this, program);
    return await longData.send();
  }
  /**@param {number[]} melody */
  async writeMelody(melody) {
    await this.sendCommand(
      COMMANDID.writeMelody,
      util.convertToDeviceEndian(melody.length),
    );
    const longData = new LongDataWriter(this, melody);
    return await longData.send();
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
    const read = this.readData(this.commandSequenceNumber, exceptLongData);
    await this.sendData(commandId, this.commandSequenceNumber, data);
    return await read;
  }
  async getInfoRaw() {
    if (!this.hid) throw new Error("HID not readied");
    const data = await this.sendCommand(COMMANDID.getInfo, []);
    if (!data) return null;
    return data.slice(2);
  }
  async readProgram() {
    if (!this.hid) throw new Error("HID not readied");
    const data = await this.sendCommand(COMMANDID.readProgram, [], true).catch(
      () => null,
    );
    if (!data) return null;
    return data.slice(2);
  }
  async readMelody() {
    if (!this.hid) throw new Error("HID not readied");
    const data = await this.sendCommand(COMMANDID.readMelody, [], true).catch(
      () => null,
    );
    if (!data) return null;
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
  async led(color = new Color(0, 0, 0)) {
    if (color.red === 0 && color.blue === 0 && color.green === 0) {
      await this.sendCommand(COMMANDID.action, [35, 0, 0, 0, 0]);
    } else {
      const constColor = color.constColor();
      const argment = [6, 0, color.red, color.green, color.blue];
      if (constColor !== 0) argment[0] = constColor + 3;
      await this.sendCommand(COMMANDID.action, argment);
    }
  }
  /**
   * @param {1|2|3} id
   */
  async sound(id) {
    await this.sendCommand(COMMANDID.action, [35 + id, 0]);
  }
  /**
   * @param {number} power 0でoff
   */
  async usb(power) {
    const value = power === 0 ? 140 : 138;
    await this.sendCommand(COMMANDID.action, [value, 0, power]);
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
  async melody(type, index = 0) {
    switch (type) {
      case "once":
        await this.sendCommand(COMMANDID.playMelody, [index + 1]);
        break;
      case "loop":
        await this.sendCommand(COMMANDID.action, [40, 0]);
        break;
      case "stop":
        await this.sendCommand(COMMANDID.stopMeloay);
        break;
    }
  }
  /**
   * @param {number | Date} hour_date
   * @param {number} _minute
   */
  async setTime(hour_date, _minute = -1) {
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
    await this.sendCommand(COMMANDID.setTimeOrAlerm, [
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
  async setAlerm(hour_date, _minute = -1) {
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
    await this.sendCommand(COMMANDID.setTimeOrAlerm, [
      ...THREE0,
      1,
      minute,
      hour,
    ]);
  }
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
      }, 50);
    } else {
      await this.setTime(new Date());
    }
  }
  /**@param {HIDInputReportEvent} event  */
  __inputreport(event) {
    if (!this.hid) return;
    if (event.device.productId !== this.hid.productId) return;
    if (event.device.vendorId !== this.hid.vendorId) return;

    this.__data.push(util.dataViewToArray(event.data));
    if (this.__data.length > 20) this.__data.shift();
    this.__event.dispatchEvent(new Event("data"));
  }
  /**
   * @param {boolean} isLong
   * @param {number} sequenceId
   * @param {number} timeout
   * @returns {Promise<number[]>}
   */
  readData(sequenceId, isLong = false, timeout = 2000) {
    let listener = () => {};
    /**@type {Promise<number[]>} */
    const reader = Promise.race([
      new Promise((r) => {
        if (!isLong)
          listener = () => {
            const last = this.__data[this.__data.length - 1];
            if (last[1] === sequenceId) r(last);
          };
        else {
          /**@type {number[]} */
          const ret = [];
          let segmentCount = 0;
          listener = () => {
            const last = this.__data[this.__data.length - 1];
            if (last[0] === COMMANDID.dataSegment) {
              ret.push(...last.slice(2));
              segmentCount++;
              if (last[1] > 0x7f)
                // データ終了時に、コロックルの想定している個数にデータを切り抜く
                r(ret.slice(0, (segmentCount - 1) * 62 + (last[1] & 0x7f) + 2));
            } else if (
              last[0] === 240 &&
              ret.length === 0 &&
              last[1] === sequenceId
            ) {
              const dataLength = last[2];
              ret.push(last[0], dataLength);
            }
          };
        }
        this.__event.addEventListener("data", listener);
      }),
      new Promise((r, j) =>
        setTimeout(() => j(new Error("Data Timeouted")), timeout),
      ),
    ]);
    reader.finally(() => this.__event.removeEventListener("data", listener));
    return reader;
  }
}
export { Korockle };
