"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const get_1 = __importDefault(require("./get"));
const util_1 = require("./util");
const longdataWriter_1 = __importDefault(require("./longdataWriter"));
const commandId_1 = __importDefault(require("./commandId"));
const dataToInfo_1 = __importDefault(require("./dataToInfo"));
const color_1 = require("./programBuilder/color");
const THREE0 = [0, 0, 0];
class Korockle {
    hid = null;
    commandSequenceNumber = 0;
    constructor(hid = null) {
        if (!hid) {
            (0, get_1.default)().then((hid) => {
                this.hid = hid;
            });
        }
        else {
            this.hid = hid;
        }
    }
    async execute() {
        await this.sendCommand(commandId_1.default.executeProgram);
    }
    /** `execute`と同じ */
    async runProgram() {
        await this.execute();
    }
    async stopProgram() {
        await this.sendCommand(commandId_1.default.stopProgram);
    }
    async writeProgram(program) {
        await this.sendCommand(commandId_1.default.writeProgram);
        const longData = new longdataWriter_1.default(this, program);
        return await longData.send();
    }
    sendData(reportId, commandId, data = [], webAudio = 0) {
        //TODO: パケット分割
        if (!this.hid)
            throw new Error("HID not readied");
        if (data.length >= 64) {
            throw new RangeError(`Data over. length:${data.length}`);
        }
        return this.hid.write([webAudio, reportId, commandId, ...data]);
    }
    async sendCommand(commandId, data = []) {
        this.commandSequenceNumber = (0, util_1.toUint8)(this.commandSequenceNumber + 1);
        const status = await this.sendData(commandId, this.commandSequenceNumber, data);
        const read = await this.readData();
        return {
            status,
            data: read,
        };
    }
    async getInfoRaw() {
        if (!this.hid)
            throw new Error("HID not readied");
        const { data } = await this.sendCommand(commandId_1.default.getInfo, []);
        if (!data)
            return null;
        return data.slice(2);
    }
    async getInfo() {
        const data = await this.getInfoRaw();
        if (!data)
            return null;
        return (0, dataToInfo_1.default)(data);
    }
    async led(color = new color_1.Color(0, 0, 0)) {
        if (color.red === 0 && color.blue === 0 && color.green === 0) {
            await this.sendCommand(commandId_1.default.action, [35, 0, 0, 0, 0]);
        }
        else {
            const constColor = color.constColor();
            const argment = [6, 0, color.red, color.green, color.blue];
            if (constColor !== 0)
                argment[0] = constColor + 3;
            await this.sendCommand(commandId_1.default.action, argment);
        }
    }
    async sound(id) {
        await this.sendCommand(commandId_1.default.action, [35 + id, 0]);
    }
    async melody(type, index = 0) {
        switch (type) {
            case "once":
                await this.sendCommand(commandId_1.default.playMelody, [index + 1]);
                break;
            case "loop":
                await this.sendCommand(commandId_1.default.action, [40, 0]);
                break;
            case "stop":
                await this.sendCommand(commandId_1.default.stopMeloay);
                break;
        }
    }
    async setTime(param1, param2 = -1) {
        let hour, minute;
        if (typeof param1 !== "number") {
            hour = param1.getHours();
            minute = param1.getMinutes();
        }
        else {
            hour = param1;
            minute = param2;
        }
        await this.sendCommand(commandId_1.default.setTimeOrAlerm, [
            1,
            minute,
            hour,
            ...THREE0,
        ]);
    }
    async setAlerm(param1, param2 = -1) {
        let hour, minute;
        if (typeof param1 !== "number") {
            hour = param1.getHours();
            minute = param1.getMinutes();
        }
        else {
            hour = param1;
            minute = param2;
        }
        await this.sendCommand(commandId_1.default.setTimeOrAlerm, [
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
        }
        else {
            await this.setTime(new Date());
        }
    }
    async readData() {
        if (!this.hid)
            throw new Error("HID not readied");
        const data = (await this.hid.read(3000));
        if (!data)
            return null;
        return [...data];
    }
}
exports.default = Korockle;
//# sourceMappingURL=korockle.js.map