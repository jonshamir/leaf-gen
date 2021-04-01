import vec2 from "./utils/tsm/vec2";
import * as P from "./utils/parameters";
import MarginVertex from "./MarginVertex";

export default class Morphogen {
  name: string;
  // Segments of margin containing this morphogen
  segments: Array<[MarginVertex, MarginVertex]> = [];

  // Parameters
  growthMultiplier: number = 1;
  tipGenerationLength: number = -1; // Length of segment that will induce a new tip to form

  // =================
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
  // =================

  constructor(name: string) {
    this.name = name;
  }

  addSegment(startVertex: MarginVertex, endVertex: MarginVertex) {
    this.segments.push([startVertex, endVertex]);
    let currVertex = startVertex;
    while (currVertex != endVertex) {
      currVertex.morphogens.push(this);
      currVertex = currVertex.nextVertex;
    }
    currVertex.morphogens.push(this);
  }

  getSegmentsVertices() {
    this.segments.map((segment, i) => {
      const startVertex = segment[0];
      const endVertex = segment[1];
      let segmentVertices = [];
      let currVertex = startVertex;
      while (currVertex != endVertex) {
        segmentVertices.push(currVertex);
        currVertex = currVertex.nextVertex;
      }
    });
  }
}
