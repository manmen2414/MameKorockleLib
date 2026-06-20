import * as HID from "node-hid";
import { GlobalHidDevice } from "../common/types";

export class NodeHidDevice implements GlobalHidDevice {
  private device: HID.HID | null = null;
  private path: string;

  constructor(path: string) {
    this.path = path;
  }

  async open() {
    this.device = new HID.HID(this.path);
  }

  async sendReport(reportId: number, data: Uint8Array) {
    if (!this.device) throw new Error("Device not opened");
    // node-hidは通常、先頭にreportIdを結合した配列を渡す仕様が多い
    const buffer = [reportId, ...Array.from(data)];
    this.device.write(buffer);
  }

  onData(callback: (data: Uint8Array) => void) {
    if (!this.device) throw new Error("Device not opened");
    this.device.on("data", (data: Buffer) => {
      callback(new Uint8Array(data));
    });
  }

  async close() {
    this.device?.close();
  }
}
