import vec2 from "./tsm/vec2";
import * as P from "./parameters";
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
    this.veins.calcGrowthVectors();
    this.margin.grow();
    this.veins.applyGrowth();
    this.time++;
  }
}

module.exports = Leaf;
