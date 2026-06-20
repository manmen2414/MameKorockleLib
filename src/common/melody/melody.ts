import { Note } from "./note";
import { BPMS } from "./constants";

function isBPMIndex(n: number): n is (typeof BPMS)[keyof typeof BPMS] {
  switch (n) {
    case 0:
    case 1:
    case 2:
    case 3:
    case 4:
      return true;
    default:
      return false;
  }
}

class Melody {
  bpmIndex: (typeof BPMS)[keyof typeof BPMS];
  isLEDLinked: boolean;
  notes: Note[];
  constructor(bpmIndex: number = 0, isLEDLinked = false) {
    if (!isBPMIndex(bpmIndex))
      throw new RangeError(`${bpmIndex} is not vaild bpm.`);
    this.bpmIndex = bpmIndex;
    this.isLEDLinked = isLEDLinked;
    this.notes = [];
  }
  get bpm() {
    return 60 + this.bpmIndex * 30;
  }
  set bpm(n: number) {
    if (isBPMIndex(n)) this.bpmIndex = n;
    else {
      if (n > 180) n = 180;
      if (n < 60) n = 60;
      const calcBpmIndex = Math.round((n - 60) / 30);
      if (!isBPMIndex(calcBpmIndex)) throw new Error(`Unexpected bpm: ${n}`);
      this.bpmIndex = calcBpmIndex;
    }
  }
  setBPM(n: number) {
    this.bpm = n;
    return this;
  }
  setLEDLink(link: boolean = true) {
    this.isLEDLinked = link;
    return this;
  }
  addNote(scale: number, length: number): this;
  addNote(note: Note): this;
  addNote(arg1: Note | number, arg2?: number) {
    if (typeof arg1 === "number") {
      if (typeof arg2 !== "number") {
        throw new Error(`note length is not given`);
      }
      this.notes.push(new Note(arg1, arg2));
    } else this.notes.push(arg1);
    return this;
  }
  /** @deprecated Please use `Melody.addNote()` instead. */
  addNoteV(scale: number, length: number) {
    this.addNote(scale, length);
  }
  /** @deprecated Please use `Melody.addNote()` instead. */
  N(scale: number, length: number) {
    this.addNote(scale, length);
  }
  getUsedLength() {
    let length = 0;
    this.notes.forEach((v) => (length += v.length));
    return length;
  }
  build() {
    const data = [];
    data.push((this.bpmIndex << 1) + (this.isLEDLinked ? 1 : 0));
    this.notes.forEach((note) => {
      data.push(note.build());
    });
    data.push(0);
    return data;
  }
}

export { BPMS, Melody };
