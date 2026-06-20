const sharedUint8Array = new Uint8Array(1);
export function toUint8(value: number) {
  sharedUint8Array[0] = value;
  return sharedUint8Array[0];
}
export function dataViewToArray(dataView: DataView): number[] {
  return Array.from(
    new Uint8Array(dataView.buffer, dataView.byteOffset, dataView.byteLength),
  );
}
export function convertToLittleEndianBytes(value: number): number[] {
  const buffer = new ArrayBuffer(2);
  const view = new DataView(buffer);
  view.setUint16(0, value, true);
  return Array.from(new Uint8Array(buffer));
}

export function indexOf<T>(
  array: T[],
  item: T,
  throwOnMissing: boolean = true,
): number {
  const index = array.indexOf(item);
  if (throwOnMissing && index === -1) {
    const itemStr =
      typeof item === "object" ? JSON.stringify(item) : String(item);
    throw new Error(`Item ${itemStr} does not exist in the array.`);
  }
  return index;
}

export async function raceWithTimeout<T>(
  taskPromise: Promise<T>,
  timeoutMs: number,
  timeoutMessage: string = "Timed out",
): Promise<T> {
  let timerId: number | NodeJS.Timeout | null = null;

  const timeoutTask: Promise<T> = new Promise((_, rj) => {
    timerId = setTimeout(() => {
      rj(new Error(timeoutMessage));
    }, timeoutMs);
  });

  try {
    return await Promise.race([taskPromise, timeoutTask]);
  } finally {
    if (timerId !== null) clearTimeout(timerId);
  }
}
