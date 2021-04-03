import vec2 from "./utils/tsm/vec2";
import * as P from "./utils/parameters";
import * as utils from "./utils/utils";
import LeafVein from "./LeafVein";
import MarginVertex from "./MarginVertex";

export class VascularSystem {
  rootVein: LeafVein;

  maxAngle: number;
  axisAngle: number;

  constructor(tipVertex: MarginVertex) {
    this.addVein(tipVertex);
  }

  addVein(tipVertex: MarginVertex) {
    if (!this.rootVein) {
      // First main vein
      const vein = new LeafVein(new vec2([0, 0]), tipVertex);
      this.rootVein = vein;
    } else {
      const theta = Math.acos(P.V / P.B);
      const thetaComp = 0.5 * Math.PI - theta;
      const newVeinDir = new vec2([
        -Math.sign(tipVertex.position.x),
        -thetaComp,
      ]).normalize();

      const p1 = tipVertex.position;
      const p2 = vec2.sum(tipVertex.position, newVeinDir);
      const p3 = this.rootVein.origin;
      const p4 = vec2.sum(this.rootVein.origin, this.rootVein.direction);

      const newVeinOrigin = utils.linesIntersection(p1, p2, p3, p4);

      // console.log(p1.xy, p2.xy, p3.xy, p4.xy);
      // console.log(newVeinOrigin.xy);

      const vein = new LeafVein(newVeinOrigin, tipVertex, this.rootVein);
      tipVertex.vein = vein;
      this.rootVein.children.push(vein);
    }
  }

  getAllVeins() {
    return this.rootVein.getAllChildren();
  }

  calcGrowthVectors() {
    this.rootVein.updateChildDistToBase();
    this.rootVein.updateChildGrowthVectors();
  }

  applyGrowth() {
    this.rootVein.applyGrowth();
  }
}
