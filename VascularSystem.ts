import vec2 from "./tsm/vec2";
import * as P from "./parameters";
import * as utils from "./utils";
import LeafVein from "./LeafVein";
import { MarginVertex } from "./LeafMargin";

export class VascularSystem {
  veins: Array<LeafVein> = [];

  maxAngle: number;
  axisAngle: number;

  constructor(tipVertex: MarginVertex) {
    this.addVein(tipVertex);
  }

  addVein(tipVertex: MarginVertex) {
    if (!this.veins.length) {
      // base case
      const vein = new LeafVein(new vec2([0, 0]), tipVertex, null);
      this.veins.push(vein);
    } else {
      // temp - first subveins
      const vein = new LeafVein(new vec2([0, 1]), tipVertex, null);
      vein.parent = this.veins[0];
      this.veins[0].children.push(vein);
      this.veins.push(vein);
    }
  }

  calcGrowthVectors() {
    this.veins[0].updateChildDistToBase();
    this.veins[0].updateChildGrowthVectors();
  }

  applyGrowth() {
    this.veins.forEach((vein) => {
      vein.applyGrowth();
    });
  }
}
