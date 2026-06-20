//@ts-check
import { COMMANDID } from "./constants";
import { Korockle } from "./korockle";

export class LongDataWriter {
  static SEGMENT_SIZE = 3000;
  static MAX_SEGMENT_LENGTH = 62;
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
    const sendData = [];
    const remainingDataLength = this.data.length - this.offset;
    const reportId =
      remainingDataLength <= 62
        ? 0b10000000 | remainingDataLength
        : LongDataWriter.MAX_SEGMENT_LENGTH;
    for (let i = 0; i < LongDataWriter.MAX_SEGMENT_LENGTH; i++) {
      //WARNING: =いらないかも
      if (this.offset + i <= this.data.length) {
        sendData[i] = this.data[this.offset + i];
      } else {
        sendData[i] = 0; // パディング
      }
    }
    this.offset += LongDataWriter.MAX_SEGMENT_LENGTH;
    this.sendedSegmentCount++;
    // TODO:10セグメントごと、またはデータが終了した場合にレスポンスを待つ
    await this.korockle.sendData(COMMANDID.dataSegment, reportId, sendData);
    if (!(this.offset >= this.data.length)) {
      await this.send();
    }
  }
}
