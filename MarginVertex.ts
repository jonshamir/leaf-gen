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
    newVertex.morphogens = this.morphogens;
    return newVertex;
  }

  grow() {
    const tipVertex = this.isTip ? this : this.tipVertex;
    const growthVector = tipVertex.vein.getProjectedGrowthVector(this.position);
    let growthMultiplier = 1;
    // Prev vertex morphogens affect the growth
    if (this.prevVertex && this.prevVertex.morphogens.length > 0) {
      growthMultiplier = Math.min(
        ...this.prevVertex.morphogens.map(
          (morphogen) => morphogen.growthMultiplier
        )
      );
    }
    this.position.add(growthVector.multiply(growthMultiplier));
  }

  length() {
    if (this.nextVertex != null)
      return vec2.distance(this.position, this.nextVertex.position);
    return 0;
  }

  // Duplicates this vertex and appends it midway to nextVertex
  subdivide() {
    const newVertex = this.copy();
    newVertex.position = vec2
      .sum(this.position, this.nextVertex.position)
      .multiply(0.5);
    newVertex.prevVertex = this;
    newVertex.nextVertex = this.nextVertex;
    this.nextVertex = newVertex;
    return newVertex;
  }
}
