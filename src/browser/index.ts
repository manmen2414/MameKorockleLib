import { GlobalHidDevice } from "../common/types";

export class BrowserHidDevice implements GlobalHidDevice {
  private device: HIDDevice; // ブラウザ標準の型

  constructor(device: HIDDevice) {
    this.device = device;
  }

  async open() {
    if (!this.device.opened) await this.device.open();
  }

  async sendReport(reportId: number, data: Uint8Array<ArrayBuffer>) {
    await this.device.sendReport(reportId, data.buffer);
  }

  onData(callback: (data: Uint8Array) => void) {
    this.device.oninputreport = (event) => {
      const data = new Uint8Array(event.data.buffer);
      callback(data);
    };
  }

  async close() {
    await this.device.close();
  }
}
