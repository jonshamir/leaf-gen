import vec2 from "./tsm/vec2";
import * as P from "./parameters";
import * as utils from "./utils";
import { MarginVertex } from "./LeafMargin";

export default class LeafVein {
  origin: vec2; // Origin position
  tip: vec2; // Tip position
  tipVertex: MarginVertex;
  direction: vec2;
  growthVector: vec2 = new vec2([0, 0]); // Growth vector of vein origin
  distToBase: number = 0; // Distance from vein origin to leaf base
  age: number = 0;
  children: Array<LeafVein> = [];
  parent: LeafVein;

  constructor(origin: vec2, tipVertex: MarginVertex, parent: LeafVein) {
    this.origin = origin;
    this.tip = tipVertex.position;
    this.tipVertex = tipVertex;
    tipVertex.vein = this;
    this.direction = vec2.direction(tipVertex.position, origin);
    this.parent = parent;
  }

  updateChildDistToBase() {
    this.children.forEach((childVein) => {
      childVein.distToBase =
        this.distToBase + vec2.distance(this.origin, childVein.origin);
      childVein.updateChildDistToBase();
    });
  }

  updateChildGrowthVectors() {
    this.children.forEach((childVein) => {
      const growthAmount =
        utils.growthIntegralAtDist(childVein.distToBase) -
        utils.growthIntegralAtDist(this.distToBase);

      childVein.growthVector = this.direction
        .copy()
        .multiply(growthAmount)
        .add(this.growthVector);

      childVein.updateChildGrowthVectors();
    });
  }

  applyGrowth() {
    // Growth of parent veins causes whole vein to move
    this.origin.add(this.growthVector);
    this.tip.add(this.growthVector);
    // Growth of this vein causes tip to move
    const growthAmount =
      utils.growthIntegralAtDist(this.distToBase + this.length()) -
      utils.growthIntegralAtDist(this.distToBase);

    const tipGrowthVector = this.direction.copy().multiply(growthAmount);
    this.tip.add(tipGrowthVector);
  }

  // Get growth of margin point, as projected on to this vein
  getProjectedGrowthVector(marginPos: vec2) {
    const posVector = marginPos.copy().subtract(this.origin);
    const projectedLength = vec2.dot(posVector, this.direction);
    const growthAmount =
      utils.growthIntegralAtDist(this.distToBase + projectedLength) -
      utils.growthIntegralAtDist(this.distToBase);

    const projectedGrowthVector = this.direction
      .copy()
      .multiply(growthAmount)
      .add(this.growthVector);

    return projectedGrowthVector;
  }

  length() {
    return vec2.distance(this.origin, this.tip);
  }

  projectOnVein(pos: vec2) {
    return this.tip;
  }
}
