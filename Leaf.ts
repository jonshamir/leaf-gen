import vec2 from "./utils/tsm/vec2";
import * as P from "./utils/parameters";
import { VascularSystem } from "./VascularSystem";
import { LeafLamina } from "./LeafLamina";
import { LeafMargin } from "./LeafMargin";

export class Leaf {
  margin: LeafMargin;
  veins: VascularSystem;
  lamina: LeafLamina;
  time: number = 0;

  constructor() {
    this.margin = new LeafMargin();
    this.veins = new VascularSystem(this.margin.tipVertex);

    // this.veins.addVein(this.margin.vertices[P.NUM_INIT_SAMPLES - 3]);
    // this.veins.addVein(this.margin.vertices[P.NUM_INIT_SAMPLES + 1]);
  }

  step() {
    console.log("time: " + this.time);
    // Growth is led by vein elongation
    this.veins.calcGrowthVectors();
    // Margin points grows according to their projections on the veins
    this.margin.grow();
    // Vein are displaced in response to parent veins' growth
    this.veins.applyGrowth();
    // Convergance points (vein tips) might be created
    const newTipVertices = this.margin.generateTipVertices();
    // New veins are added connecting the new tips
    newTipVertices.forEach((tipVertex) => this.veins.addVein(tipVertex));
    // Margin is subdivided if needed
    this.margin.subdivide();

    this.time++;
  }
}

module.exports = Leaf;
