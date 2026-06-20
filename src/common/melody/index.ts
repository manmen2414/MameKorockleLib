export * from "./melody";
export * from "./note";
import { Melody } from "./melody";
export {
  /**
   * @deprecated Please use `Melody` instead.\
   * This method includes all the features of the old MelodyBuilder.
   */
  Melody as MelodyBuilder,
};
