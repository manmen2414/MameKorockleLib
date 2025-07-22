"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const commandId_1 = __importDefault(require("./commandId"));
const util_1 = require("./util");
class LongDataWriter {
    static SEGMENT_SIZE = 3000;
    static MAX_SEGMENT_LENGTH = 62;
    results = [];
    korockle;
    data;
    offset = 0;
    sendedSegmentCount = 0;
    segmentSize = LongDataWriter.SEGMENT_SIZE;
    constructor(korockle, data) {
        this.korockle = korockle;
        this.data = data;
    }
    async send() {
        const sendData = [];
        const remainingDataLength = this.data.length - this.offset;
        const reportId = (0, util_1.toUint8)(remainingDataLength <= 62
            ? 0b10000000 | remainingDataLength
            : LongDataWriter.MAX_SEGMENT_LENGTH);
        for (let i = 0; i < LongDataWriter.MAX_SEGMENT_LENGTH; i++) {
            if (this.offset + i < this.data.length) {
                sendData[i] = this.data[this.offset + i];
            }
            else {
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
        this.results.push(await this.korockle.sendData(commandId_1.default.dataSegment, reportId, sendData));
        if (!(this.offset >= this.data.length)) {
            await this.send();
        }
        return this.results;
    }
}
exports.default = LongDataWriter;
//# sourceMappingURL=longdataWriter.js.map