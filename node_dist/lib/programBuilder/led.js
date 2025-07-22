"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const color_1 = require("./color");
class LED {
    color;
    action = "on";
    melodySync = false;
    animation = "none";
    special = { noIndexNumber: false, waitTick: 0 };
    constructor(setting = {}) {
        this.color = setting.color ?? new color_1.Color(10, 10, 10);
        this.action = setting.action ?? this.action;
        this.melodySync = setting.melodySync ?? this.melodySync;
        this.animation = setting.animation ?? this.animation;
    }
    build(buildHelpers, index) {
        if (this.action === "on") {
            //TODO: ビルド実装
        }
        return [];
    }
}
exports.default = LED;
//# sourceMappingURL=led.js.map