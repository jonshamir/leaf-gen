import vec2 from "./tsm/vec2";
import * as P from "./parameters";
import LeafVein from "./LeafVein";

export class LeafMargin {
  vertices: Array<MarginVertex> = [];
  tipVertex: MarginVertex;

  constructor() {
    // Generate tip vertex
    this.tipVertex = new MarginVertex();
    this.tipVertex.position = new vec2([0, P.NUM_INIT_SAMPLES]);

    //Generates left and right margin
    for (let i = 0; i < 2 * P.NUM_INIT_SAMPLES - 1; i++) {
      let vertex = new MarginVertex();

      if (i < P.NUM_INIT_SAMPLES - 1) {
        vertex.position = new vec2([1.1, i]);
        vertex.tipVertex = this.tipVertex;
      } else if (i == P.NUM_INIT_SAMPLES - 1) {
        vertex = this.tipVertex;
      } else {
        vertex.position = new vec2([-1.1, 2 * P.NUM_INIT_SAMPLES - i - 2]);
        vertex.tipVertex = this.tipVertex;
      }

      this.vertices.push(vertex);
    }
  }

  grow() {
    this.vertices.forEach((vertex) => {
      vertex.grow();
    });
  }
}

// Also stores information about the edge beginning at the vertex
// the last MarginVertex has no edge information
export class MarginVertex {
  position: vec2;
  normal: vec2;
  tipVertex: MarginVertex;
  vascularProjection: vec2;
  vein: LeafVein;

  constructor() {}

  grow() {
    // Tip vertices grow automatically, they are bound to vein tips
    if (this.tipVertex) {
      const growthVector = this.tipVertex.vein.getProjectedGrowthVector(
        this.position
      );
      this.position.add(growthVector);
    }
  }
}

export class Morphogen {
  origin: vec2;

  // Parameters
  mindist: number;
  maxdist: number;
  cpdist: number; // Convergance point distance?

  // local growth
  tipGrowth: number;
  fairing: number;
  curvature: number;
  stretch: number;
  cflow: number;
  normal: number;
}
