import CommandId from "./commandId";
import Korockle from "./korockle";
import { checkUint8, toUint8, Uint8 } from "./util";

class LongDataWriter {
  static SEGMENT_SIZE = 3000;
  static MAX_SEGMENT_LENGTH = 62;
  results: number[] = [];
  korockle: Korockle;
  data: number[];
  offset = 0;
  sendedSegmentCount = 0;
  segmentSize = LongDataWriter.SEGMENT_SIZE;
  constructor(korockle: Korockle, data: number[]) {
    this.korockle = korockle;
    this.data = data;
  }
  async send() {
    const sendData: number[] = [];
    const remainingDataLength = this.data.length - this.offset;
    const reportId = toUint8(
      remainingDataLength <= 62
        ? 0b10000000 | remainingDataLength
        : LongDataWriter.MAX_SEGMENT_LENGTH
    );

    for (let i = 0; i < LongDataWriter.MAX_SEGMENT_LENGTH; i++) {
      if (this.offset + i < this.data.length) {
        sendData[i] = this.data[this.offset + i];
      } else {
        sendData[i] = 0; // パディング
      }
    }
    this.offset += LongDataWriter.MAX_SEGMENT_LENGTH;
    this.sendedSegmentCount++;
    // TODO:10セグメントごと、またはデータが終了した場合にレスポンスを待つ
    /*
  if (segmentCount % 10 == 0 || offset >= data.length) {
    deviceInputReportHandler = handleHidInputReport.bind(
      this,
      0,
      (responseCode) => {
        callback(responseCode);
      }
    );
    await connectedDeviceInfo.sendReport(0, buffer);
  }*/
    this.results.push(
      await this.korockle.sendData(CommandId.dataSegment, reportId, sendData)
    );
    if (!(this.offset >= this.data.length)) {
      await this.send();
    }
    return this.results;
  }
}

export default LongDataWriter;
