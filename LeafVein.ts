import vec2 from "./utils/tsm/vec2";
import * as utils from "./utils/utils";
import MarginVertex from "./MarginVertex";

export default class LeafVein {
  static counter: number = 0;

  id: number;
  origin: vec2; // Origin position
  tip: vec2; // Tip position
  tipVertex: MarginVertex;
  direction: vec2;
  growthVector: vec2 = new vec2([0, 0]); // Growth vector of vein origin
  distToBase: number = 0; // Distance from vein origin to leaf base
  age: number = 0;
  children: Array<LeafVein> = [];
  parent: LeafVein;

  constructor(origin: vec2, tipVertex: MarginVertex, parent: LeafVein = null) {
    this.id = LeafVein.counter++;
    this.origin = origin;
    this.tip = tipVertex.pos;
    this.tipVertex = tipVertex;
    tipVertex.vein = this;
    this.direction = vec2.direction(tipVertex.pos, origin);
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
    this.children.forEach((childVein) => childVein.applyGrowth());
  }

  // Get growth of margin point, as projected on to this vein
  getProjectedGrowthVector(marginPos: vec2) {
    const posVector = vec2.difference(marginPos, this.origin);
    let projectedLength = vec2.dot(posVector, this.direction);
    if (projectedLength > this.length()) projectedLength = 0;
    const growthAmount =
      utils.growthIntegralAtDist(this.distToBase + projectedLength) -
      utils.growthIntegralAtDist(this.distToBase);

    const projectedGrowthVector = this.direction
      .copy()
      .multiply(growthAmount)
      .add(this.growthVector);

    return projectedGrowthVector;
  }

  // Returns growth vector at a point on the vein
  // getGrowthVector(veinPos: vec2) {}

  length() {
    return vec2.distance(this.origin, this.tip);
  }

  projectOnVein(pos: vec2) {
    return this.tip;
  }

  getAllChildren() {
    let allChildren = [];

    this.children.forEach((child) => {
      allChildren = allChildren.concat(child.getAllChildren());
    });

    return allChildren.concat([this]);
  }
}
