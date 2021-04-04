import vec2 from "./utils/tsm/vec2";
import * as P from "./utils/parameters";
import MarginVertex from "./MarginVertex";

export default class Morphogen {
  name: string;
  // Segments of margin containing this morphogen
  segments: Array<[MarginVertex, MarginVertex]> = [];

  // Parameters
  growthMultiplier: vec2 = null;
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
      currVertex = currVertex.next;
    }
  }

  // Splits the given segment at midVertex, returns new segments
  // Does not update segment array!
  // TODO make radius exact
  splitSegment(
    startVertex: MarginVertex,
    endVertex: MarginVertex,
    newVertex: MarginVertex,
    radius: number
  ) {
    let currVertex = newVertex;
    let counter = 0;
    while (currVertex.next && currVertex != endVertex && counter <= radius) {
      currVertex.removeMorphogen(this);
      currVertex = currVertex.next;
      counter++;
    }
    const newSegment1 = [currVertex, endVertex];
    currVertex = newVertex;
    counter = 0;
    while (currVertex.prev && currVertex != startVertex && counter <= radius) {
      currVertex.removeMorphogen(this);
      currVertex = currVertex.prev;
      counter++;
    }
    const newSegment2 = [startVertex, currVertex];

    return [newSegment1, newSegment2];
  }

  getSegmentsVertices() {
    this.segments.map((segment, i) => {
      const startVertex = segment[0];
      const endVertex = segment[1];
      let segmentVertices = [];
      let currVertex = startVertex;
      while (currVertex != endVertex) {
        segmentVertices.push(currVertex);
        currVertex = currVertex.next;
      }
    });
  }
}
