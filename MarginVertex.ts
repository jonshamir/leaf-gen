import vec2 from "./utils/tsm/vec2";
import * as P from "./utils/parameters";
import LeafVein from "./LeafVein";
import Morphogen from "./Morphogen";

// Stores information about the edge beginning at the vertex
// the last MarginVertex has no edge information
export default class MarginVertex {
  static counter: number = 0;

  id: number;
  position: vec2;
  normal: vec2;
  isTip: boolean = false;
  vein: LeafVein;
  morphogens: Array<Morphogen> = [];

  prev: MarginVertex | null; // Pointer to the next vertex in the margin
  next: MarginVertex | null; // Pointer to the previous vertex in the margin
  tipVertex: MarginVertex; // Pointer to the tip vertex asocciated with this vertex

  constructor(position: vec2, tipVertex: MarginVertex = null) {
    this.id = MarginVertex.counter++;
    this.position = position;
    this.tipVertex = tipVertex;
  }

  copy(newPosition: vec2) {
    const newVertex = new MarginVertex(newPosition, this.getTipVertex());
    newVertex.morphogens = this.morphogens;
    return newVertex;
  }

  getTipVertex() {
    return this.isTip ? this : this.tipVertex;
  }

  grow() {
    const growthVector = this.getGrowthVector();
    const growthMultiplier = this.getGrowthMultiplier();
    this.position.add(growthVector.multiply(growthMultiplier));
  }

  getGrowthMultiplier(): number {
    let growthMultiplier = 1;
    // Prev vertex morphogens affect the growth
    if (this.prev && this.prev.morphogens.length > 0) {
      growthMultiplier = Math.min(
        ...this.prev.morphogens.map((morphogen) => morphogen.growthMultiplier)
      );
    }
    return growthMultiplier;
  }

  getGrowthVector(): vec2 {
    const { prev } = this;
    const tipVertex = this.getTipVertex();
    const prevTipVertex = prev ? prev.getTipVertex() : tipVertex;

    if (tipVertex == prevTipVertex) {
      // Mid-segment, project on asocciated vein
      return tipVertex.vein.getProjectedGrowthVector(this.position);
    } else {
      // If this is a boundary vertex, use growth from branching point between veins
      if (tipVertex.vein.parent == prevTipVertex.vein)
        return tipVertex.vein.growthVector;
      else return prevTipVertex.vein.growthVector;
    }
  }

  length() {
    if (this.next != null)
      return vec2.distance(this.position, this.next.position);
    return 0;
  }

  // Returns the distance from this vertex to a given vertex
  dist(endVertex: MarginVertex) {
    let dist = 0;
    let currVertex = this;
    while (currVertex != endVertex) dist += currVertex.length();
    return dist;
  }

  // Duplicates this vertex and appends it midway to next
  subdivide() {
    const newPosition = vec2
      .sum(this.position, this.next.position)
      .multiply(0.5);
    const newVertex = this.copy(newPosition);
    newVertex.prev = this;
    this.next.prev = newVertex;
    newVertex.next = this.next;
    this.next = newVertex;
    return newVertex;
  }

  removeMorphogen(morphogen: Morphogen) {
    this.morphogens = this.morphogens.filter((m) => m != morphogen);
  }
}
