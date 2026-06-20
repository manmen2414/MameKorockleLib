export interface GlobalHidDevice {
  open(): Promise<void>;
  sendReport(reportId: number, data: Uint8Array<ArrayBuffer>): Promise<void>;
  onData(callback: (data: Uint8Array) => void): void;
  close(): Promise<void>;
}
