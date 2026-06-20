import { NOTE_SCALES, NOTE_LENGTHS } from "./constants";

class Note {
  scale: number;
  length: number;
  constructor(scale: number, length: number) {
    if (1 > scale || 31 < scale || scale % 1 !== 0)
      throw new RangeError(`${scale} is not vaild note scale.`);
    if (0 > length || 7 < length || length % 1 !== 0)
      throw new RangeError(`${length} is not vaild note length.`);
    this.scale = scale;
    this.length = length;
  }
  build() {
    return (this.scale << 3) + this.length;
  }
}

export { Note, NOTE_SCALES, NOTE_LENGTHS };
