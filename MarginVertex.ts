import vec2 from "./utils/tsm/vec2";
// import P from "./utils/parameters";
import LeafVein from "./LeafVein";
import Morphogen from "./Morphogen";

// Stores information about the edge beginning at the vertex
// the last MarginVertex has no edge information
export default class MarginVertex {
  static counter: number = 0;

  id: number;
  pos: vec2;
  normal: vec2;
  isTip: boolean = false;
  vein: LeafVein;
  morphogens: Array<Morphogen> = [];

  prev: MarginVertex | null; // Pointer to the next vertex in the margin
  next: MarginVertex | null; // Pointer to the previous vertex in the margin
  tipVertex: MarginVertex; // Pointer to the tip vertex asocciated with this vertex

  constructor(pos: vec2, tipVertex: MarginVertex = null) {
    this.id = MarginVertex.counter++;
    this.pos = pos;
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
    const veinGrowthVector = this.getVeinGrowthVector();
    const fairingVector = this.getFairingVector();

    const totalGrowthVector = vec2.sum(veinGrowthVector, fairingVector);

    const growthMultiplier = this.getGrowthMultiplier();

    this.pos.add(totalGrowthVector.multiply(growthMultiplier));
  }

  getGrowthMultiplier(): vec2 {
    let growthMultiplier = vec2.one;
    // Prev vertex morphogens affect the growth
    let morphogens = this.morphogens;
    if (this.prev) morphogens = this.prev.morphogens;
    morphogens.forEach((m) => {
      if (m.growthMultiplier) growthMultiplier = m.growthMultiplier;
    });
    return growthMultiplier;
  }

  getFairingVector(): vec2 {
    let fairingVector = new vec2([0, 0]);
    if (this.prev && !this.isTip) {
      // Normal
      // Growth in normal direction is proportional to average length of edges
      let normalGrowthScaler = vec2
        .difference(this.next.pos, this.pos)
        .length();
      normalGrowthScaler += vec2.difference(this.pos, this.prev.pos).length();
      normalGrowthScaler /= 2;

      const normalGrowthVector = this.normal.multiply(normalGrowthScaler);
      fairingVector.add(normalGrowthVector.multiply(P.ALPHA_N));

      // Streching
      // Compute direction minimizing stretching
      const doublePos = vec2.product(this.pos, 2);
      const strechVector = vec2
        .difference(this.prev.pos, doublePos)
        .add(this.next.pos);
      fairingVector.add(strechVector.multiply(P.ALPHA_S));

      // Curvature 1

      // Curvature 2
      if (this.prev.prev && this.next.next) {
        let Curvature2Vector = vec2.product(this.prev.prev.pos, -0.25);
        Curvature2Vector.add(this.prev.pos);
        Curvature2Vector.add(vec2.product(this.pos, -1.5));
        Curvature2Vector.add(this.next.pos);
        Curvature2Vector.add(vec2.product(this.next.next.pos, -0.25));

        fairingVector.add(Curvature2Vector.multiply(P.ALPHA_C2));
      }
    }
    return fairingVector.multiply(P.GROW_RATE);
  }

  getVeinGrowthVector(): vec2 {
    const { prev } = this;
    const tipVertex = this.getTipVertex();
    const prevTipVertex = prev ? prev.getTipVertex() : tipVertex;

    if (tipVertex == prevTipVertex) {
      // Mid-segment, project on asocciated vein
      return tipVertex.vein.getProjectedGrowthVector(this.pos);
    } else {
      // If this is a boundary vertex, use growth from branching point between veins
      if (tipVertex.vein.parent == prevTipVertex.vein)
        return tipVertex.vein.growthVector;
      else return prevTipVertex.vein.growthVector;
    }
  }

  length() {
    if (this.next != null) return vec2.distance(this.pos, this.next.pos);
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
    const newPosition = vec2.average(this.pos, this.next.pos);
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

  // TODO rotate direction based on side
  calcNormal(clockwise: boolean) {
    if (this.isTip) this.normal = this.vein.direction;
    else {
      this.normal = vec2
        .difference(this.pos, this.next.pos)
        .rotate90deg(clockwise)
        .normalize();
      if (this.prev) {
        const prevSegmentNormal = vec2
          .difference(this.prev.pos, this.pos)
          .rotate90deg(clockwise)
          .normalize();
        this.normal = vec2.average(this.normal, prevSegmentNormal).normalize();
      }
    }
  }
}
