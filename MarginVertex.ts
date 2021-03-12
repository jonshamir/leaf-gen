import vec2 from "./utils/tsm/vec2";
import * as P from "./utils/parameters";
import LeafVein from "./LeafVein";
import Morphogen from "./Morphogen";

// Stores information about the edge beginning at the vertex
// the last MarginVertex has no edge information
export default class MarginVertex {
  position: vec2;
  normal: vec2;
  isTip: boolean = false;
  vein: LeafVein;
  morphogens: Array<Morphogen> = [];

  prevVertex: MarginVertex | null; // Pointer to the next vertex in the margin
  nextVertex: MarginVertex | null; // Pointer to the previous vertex in the margin
  tipVertex: MarginVertex; // Pointer to the tip vertex asocciated with this vertex

  constructor() {}

  copy() {
    const newVertex = new MarginVertex();
    newVertex.tipVertex = this.tipVertex;
    return newVertex;
  }

  grow() {
    const growthVector = this.tipVertex.vein.getProjectedGrowthVector(
      this.position
    );
    let growthMultiplier = 1;
    if (this.morphogens.length > 0) {
      growthMultiplier = Math.min(
        ...this.morphogens.map((morphogen) => morphogen.growthMultiplier)
      );
    }
    this.position.add(growthVector.multiply(growthMultiplier));
  }
}
