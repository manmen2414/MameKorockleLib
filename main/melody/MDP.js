import { Melody, Note, NOTE_LENGTHS, NOTE_SCALES } from "./melody.js";

class MDP {
  /**
   * .mdp ファイルを読み込み、Melodyに変換する。\
   * NodeJS かつ 古い形式のMDPファイルを読み取るには`fast-xml-parser`ライブラリが必要。
   * @param {string} content
   */
  static async readMDP(content) {
    const isJSONReadable = (() => {
      try {
        JSON.parse(content);
        return true;
      } catch (ex) {
        return false;
      }
    })();
    if (isJSONReadable) {
      return this._readV4_3MDP(content);
    } else {
      return this._readOldMDP(content);
    }
  }
  /**
   * Webアプリ v4.3 以降で用いられているJSON形式からデータを読み取る
   * @param {string} content
   */
  static _readV4_3MDP(content) {
    /**@type {import("./MDPtypes.ts").MDPJson} */
    const mdp = JSON.parse(content);
    const melody = new Melody(mdp._tempoIndex, mdp._ledFlag);
    melody.notes = mdp._keys.map(
      ({ _rank: scale, _length: length }) => new Note(scale + 1, length),
    );
    return melody;
  }
  /**
   * Webアプリ v4.3 以前で用いられているXML形式からデータを読み取る\
   * NodeJSでは`fast-xml-parser`ライブラリを要求する(Webでは標準のパーサーで処理します)
   * @param {string} content
   */
  static async _readOldMDP(content) {
    if (typeof DOMParser !== "undefined") {
      return this._readOldMDPInWeb(content);
    } else {
      const lib = await import("fast-xml-parser");
      if (!!lib) {
        return this._readOldMDPInNode(content, lib);
      }
    }
    throw new Error("DOMParser or fast-xml-parser not found");
  }
  /**
   * Webアプリ v4.3 以前で用いられているXML形式からデータを読み取る\
   * **WebJS専用**
   * @param {string} content
   */
  static _readOldMDPInWeb(content) {
    const parser = new DOMParser();
    const xml = parser.parseFromString(content, "text/xml");
    const isMDP = xml.getElementsByTagName("MelodyModule").length === 1;
    const bpmIndex = parseInt(xml.querySelector("tempoIndex")?.innerHTML ?? "");
    const ledFlag = xml.querySelector("ledFlag")?.innerHTML === "true";
    if (!isMDP || isNaN(bpmIndex)) {
      throw new Error(`The file parsing at old mdp isn't mdp file.`);
    }
    const notes = xml.querySelector("Keys")?.children;
    if (!notes) throw new Error(`Keys element not found in old MDP`);
    const melody = new Melody(bpmIndex, ledFlag);
    for (let i = 0; i < notes.length; i++) {
      const key = notes[i];
      const scaleStr = key.querySelector("Rank")?.innerHTML;
      const lengthStr = key.querySelector("Length")?.innerHTML;

      if (!scaleStr || !lengthStr) continue;
      /**@type {number?} */
      const scale = NOTE_SCALES[scaleStr];
      /**@type {number?} */
      const length = NOTE_LENGTHS[lengthStr];
      if (!scale && scale !== 0) continue;
      if (!length && length !== 0) continue;
      melody.addNoteV(scale, length);
    }
    return melody;
  }
  /**
   * Webアプリ v4.3 以前で用いられているXML形式からデータを読み取る\
   * **NodeJS専用**
   * @param {string} content
   * @param {import("fast-xml-parser")} fastXMLParser
   */
  static _readOldMDPInNode(content, fastXMLParser) {
    const parser = new fastXMLParser.XMLParser({ ignoreAttributes: false });
    /**@type {import("./MDPtypes.ts").MDPFastXMLParsed} */
    const xml = parser.parse(content);
    const melody = new Melody(
      xml.MelodyModule.tempoIndex,
      xml.MelodyModule.ledFlag,
    );
    melody.notes = xml.MelodyModule.Keys.Key.flatMap(
      ({ Rank: scaleStr, Length: lengthStr }) => {
        if (!scaleStr || !lengthStr) return [];
        /**@type {number?} */
        const scale = NOTE_SCALES[scaleStr];
        /**@type {number?} */
        const length = NOTE_LENGTHS[lengthStr];
        if (!scale && scale !== 0) return [];
        if (!length && length !== 0) return [];
        return [new Note(scale, length)];
      },
    );
    return melody;
  }
  /**
   * メロディーデータをWebアプリ v4.3 以降で用いられているJSON形式にエクスポートする
   * @param {Melody} melody
   * @param {import("./MDPtypes.ts").MDPConvertSettings} settings
   */
  static melodyToV4_3MDP(melody, settings = {}) {
    /**@type {import("./MDPtypes.ts").MDPJson} */
    const json = {
      $$proto: "MelodyModule",
      _ledFlag: melody.isLEDLinked,
      _tempoIndex: melody.bpmIndex,
      _report: {
        $$proto: "ReportModule",
        _class: settings.class ?? "",
        _comment: settings.comment ?? "",
        _grade: settings.grade ?? "",
        _name: settings.name ?? "",
        _number: settings.number ?? "",
      },
      _keys: melody.notes.map(({ length, scale }) => ({
        $$proto: "Key",
        _rank: scale - 1,
        _length: length,
      })),
    };
    return JSON.stringify(json);
  }
  /**
   * メロディーデータをWebアプリ v4.3 以前で用いられているXML形式にエクスポートする\
   * NodeJSでは`fast-xml-parser`ライブラリを要求する(Webでは標準のパーサーで処理します)
   * @param {Melody} melody
   * @param {import("./MDPtypes.ts").MDPConvertSettings} settings
   */
  static async melodyToOldMDP(melody, settings = {}) {
    if (typeof document !== "undefined") {
      return this._melodyToOldMDPInWeb(melody, settings);
    } else {
      const lib = await import("fast-xml-parser");
      if (!!lib) {
        return this._melodyToOldMDPInNode(melody, settings, lib);
      }
    }
    throw new Error("DOMParser or fast-xml-parser not found");
  }
  /**
   * メロディーデータをWebアプリ v4.3 以前で用いられているXML形式にエクスポートする\
   * **WebJS専用**
   * @param {Melody} melody
   * @param {import("./MDPtypes.ts").MDPConvertSettings} settings
   */
  static _melodyToOldMDPInWeb(melody, settings) {
    const xml = document.implementation.createDocument("", "", null);
    const root = xml.createElement("root");
    const MelodyModule = xml.createElement("MelodyModule");
    MelodyModule.setAttribute("xmlns:xsd", "http://www.w3.org/2001/XMLSchema");
    MelodyModule.setAttribute(
      "xmlns:xsi",
      "http://www.w3.org/2001/XMLSchema-instance",
    );

    const Keys = xml.createElement("Keys");

    melody.notes.forEach(({ scale, length }) => {
      const scaleStr = SCALE_STRINGS[scale - 1];
      const lengthStr = LENGTH_STRINGS[length];
      if (!scaleStr || !lengthStr) {
        throw new Error(`Invalid Note: S${scale} L${length}`);
      }
      Keys.innerHTML += `<Key><Rank>${scaleStr}</Rank><Length>${lengthStr}</Length></Key>`;
    });

    const tempoIndex = xml.createElement("tempoIndex");
    tempoIndex.innerHTML = melody.bpmIndex;
    const ledFlag = xml.createElement("ledFlag");
    ledFlag.innerHTML = melody.isLEDLinked;
    const report = xml.createElement("Report");
    const reportGrade = xml.createElement("Grade");
    reportGrade.innerText = settings.grade ?? "";
    const reportClass = xml.createElement("Class");
    reportClass.innerText = settings.class ?? "";
    const reportNumber = xml.createElement("Number");
    reportNumber.innerText = settings.number ?? "";
    const reportComment = xml.createElement("Comment");
    reportComment.innerText = settings.comment ?? "";
    report.append(reportGrade, reportClass, reportNumber, reportComment);
    MelodyModule.append(report);

    MelodyModule.append(Keys, tempoIndex, ledFlag);
    root.append(MelodyModule);
    let text = root.innerHTML;
    text = `<?xml version="1.0" encoding="utf-8"?>` + text;
    return text;
  }
  /**
   * メロディーデータをWebアプリ v4.3 以前で用いられているXML形式にエクスポートする\
   * **NodeJS専用**
   * @param {Melody} melody
   * @param {import("fast-xml-parser")} fastXMLParser
   * @param {import("./MDPtypes.ts").MDPConvertSettings} settings
   */
  static _melodyToOldMDPInNode(melody, settings, fastXMLParser) {
    const builder = new fastXMLParser.XMLBuilder({ ignoreAttributes: false });
    /**@type {import("./MDPtypes.ts").MDPFastXMLParsed} */
    const xml = {
      "?xml": {
        "@_version": "1.0",
        "@_encoding": "utf-16",
      },
      MelodyModule: {
        "@_xmlns:xsd": "http://www.w3.org/2001/XMLSchema",
        "@_xmlns:xsi": "http://www.w3.org/2001/XMLSchema-instance",
        Report: {
          Class: settings.class ?? "",
          Grade: settings.grade ?? "",
          Comment: settings.comment ?? "",
          Name: settings.name ?? "",
          Number: settings.number ?? "",
        },
        ledFlag: melody.isLEDLinked,
        tempoIndex: melody.bpmIndex,
        Keys: {
          Key: melody.notes.map(({ length, scale }) => ({
            Rank: SCALE_STRINGS[scale - 1],
            Length: LENGTH_STRINGS[length],
          })),
        },
      },
    };
    return builder.build(xml);
  }
}

const SCALE_STRINGS = [
  "REST",
  "LOW_FA_SHARP",
  "LOW_SO",
  "LOW_SO_SHARP",
  "LOW_RA",
  "LOW_RA_SHARP",
  "LOW_SI",
  "DO",
  "DO_SHARP",
  "RE",
  "RE_SHARP",
  "MI",
  "FA",
  "FA_SHARP",
  "SO",
  "SO_SHARP",
  "RA",
  "RA_SHARP",
  "SI",
  "HIGH_DO",
  "HIGH_DO_SHARP",
  "HIGH_RE",
  "HIGH_RE_SHARP",
  "HIGH_MI",
  "HIGH_FA",
  "HIGH_FA_SHARP",
  "HIGH_SO",
  "HIGH_SO_SHARP",
  "HIGH_RA",
  "HIGH_RA_SHARP",
  "HIGH_SI",
];
const LENGTH_STRINGS = [
  "SIXTEEN",
  "EIGHT",
  "EIGHT_DOT",
  "FOUR",
  "FOUR_DOT",
  "TWO",
  "TWO_DOT",
  "ONE",
];

export { MDP };
