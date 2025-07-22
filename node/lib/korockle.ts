import getKorockle from "./get";
import * as nodeHid from "node-hid";
import * as util from "./util";
import { Uint8, toUint8 } from "./util";
import LongDataWriter from "./longdataWriter";
import CommandId from "./commandId";
import korockleDataToInfo from "./dataToInfo";
import { Color } from "./programBuilder/color";
const THREE0 = [0, 0, 0] as const;
class Korockle {
  hid: nodeHid.HIDAsync | null = null;
  commandSequenceNumber: Uint8 = 0;
  constructor(hid: nodeHid.HIDAsync | null = null) {
    if (!hid) {
      getKorockle().then((hid) => {
        this.hid = hid;
      });
    } else {
      this.hid = hid;
    }
  }
  async execute() {
    await this.sendCommand(CommandId.executeProgram);
  }
  /** `execute`と同じ */
  async runProgram() {
    await this.execute();
  }
  async stopProgram() {
    await this.sendCommand(CommandId.stopProgram);
  }
  async writeProgram(program: number[]) {
    await this.sendCommand(CommandId.writeProgram);
    const longData = new LongDataWriter(this, program);
    return await longData.send();
  }
  sendData(
    reportId: Uint8,
    commandId: Uint8,
    data: number[] = [],
    webAudio: 0 | 1 = 0
  ): Promise<number> {
    //TODO: パケット分割
    if (!this.hid) throw new Error("HID not readied");
    if (data.length >= 64) {
      throw new RangeError(`Data over. length:${data.length}`);
    }
    return this.hid.write([webAudio, reportId, commandId, ...data]);
  }
  async sendCommand(commandId: Uint8, data: number[] = []) {
    this.commandSequenceNumber = toUint8(this.commandSequenceNumber + 1);
    const status = await this.sendData(
      commandId,
      this.commandSequenceNumber,
      data
    );
    const read = await this.readData();
    return {
      status,
      data: read,
    };
  }
  async getInfoRaw() {
    if (!this.hid) throw new Error("HID not readied");
    const { data } = await this.sendCommand(CommandId.getInfo, []);
    if (!data) return null;
    return data.slice(2);
  }
  async getInfo() {
    const data = await this.getInfoRaw();
    if (!data) return null;
    return korockleDataToInfo(data);
  }
  async led(color: Color = new Color(0, 0, 0)) {
    if (color.red === 0 && color.blue === 0 && color.green === 0) {
      await this.sendCommand(CommandId.action, [35, 0, 0, 0, 0]);
    } else {
      const constColor = color.constColor();
      const argment = [6, 0, color.red, color.green, color.blue];
      if (constColor !== 0) argment[0] = constColor + 3;
      await this.sendCommand(CommandId.action, argment);
    }
  }
  async sound(id: 1 | 2 | 3) {
    await this.sendCommand(CommandId.action, [35 + id, 0]);
  }
  async melody(type: "once" | "loop" | "stop", index: number = 0) {
    switch (type) {
      case "once":
        await this.sendCommand(CommandId.playMelody, [index + 1]);
        break;
      case "loop":
        await this.sendCommand(CommandId.action, [40, 0]);
        break;
      case "stop":
        await this.sendCommand(CommandId.stopMeloay);
        break;
    }
  }
  async setTime(hour: number, minute: number): Promise<void>;
  async setTime(date: Date): Promise<void>;
  async setTime(param1: number | Date, param2: number = -1) {
    let hour: number, minute: number;
    if (typeof param1 !== "number") {
      hour = param1.getHours();
      minute = param1.getMinutes();
    } else {
      hour = param1;
      minute = param2;
    }
    await this.sendCommand(CommandId.setTimeOrAlerm, [
      1,
      minute,
      hour,
      ...THREE0,
    ]);
  }
  async setAlerm(hour: number, minute: number): Promise<void>;
  async setAlerm(date: Date): Promise<void>;
  async setAlerm(param1: number | Date, param2: number = -1) {
    let hour: number, minute: number;
    if (typeof param1 !== "number") {
      hour = param1.getHours();
      minute = param1.getMinutes();
    } else {
      hour = param1;
      minute = param2;
    }
    await this.sendCommand(CommandId.setTimeOrAlerm, [
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
      }, 100);
    } else {
      await this.setTime(new Date());
    }
  }
  async readData() {
    if (!this.hid) throw new Error("HID not readied");
    const data = (await this.hid.read(3000)) as Uint8[] | undefined;
    if (!data) return null;
    return [...data];
  }
}
export default Korockle;
