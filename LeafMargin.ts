import vec2 from "./utils/tsm/vec2";
import * as P from "./utils/parameters";
import LeafVein from "./LeafVein";
import MarginVertex from "./MarginVertex";
import Morphogen from "./Morphogen";

export class LeafMargin {
  vertices: Array<MarginVertex> = []; // Linked list
  morphogens: Array<Morphogen> = [];
  tipVertex: MarginVertex;

  constructor() {
    // Generate tip vertex
    this.tipVertex = new MarginVertex();
    this.tipVertex.position = new vec2([0, P.NUM_INIT_SAMPLES - 1]);
    this.tipVertex.isTip = true;

    //Generates left and right margin
    let prevVertex = null;
    for (let i = 0; i < 2 * P.NUM_INIT_SAMPLES - 1; i++) {
      let vertex = new MarginVertex();

      if (i < P.NUM_INIT_SAMPLES - 1) {
        vertex.position = new vec2([1, i]);
      } else if (i == P.NUM_INIT_SAMPLES - 1) {
        vertex = this.tipVertex;
      } else {
        vertex.position = new vec2([-1, 2 * P.NUM_INIT_SAMPLES - i - 2]);
      }
      vertex.tipVertex = this.tipVertex;
      vertex.prevVertex = prevVertex;
      if (prevVertex) prevVertex.nextVertex = vertex;
      prevVertex = vertex;

      this.vertices.push(vertex);
    }

    // Initialize morphogens
    const petioleMorphogen = new Morphogen("petioleMorphogen");
    petioleMorphogen.addSegment(this.vertices[0], this.vertices[1]);
    petioleMorphogen.addSegment(
      this.vertices[2 * P.NUM_INIT_SAMPLES - 3],
      this.vertices[2 * P.NUM_INIT_SAMPLES - 2]
    );
    petioleMorphogen.growthMultiplier = 0;

    const tipGrowthMorphogen = new Morphogen("tipGrowthMorphogen");
    tipGrowthMorphogen.addSegment(this.vertices[0], this.vertices[2]);
    tipGrowthMorphogen.addSegment(
      this.vertices[2 * P.NUM_INIT_SAMPLES - 4],
      this.vertices[2 * P.NUM_INIT_SAMPLES - 2]
    );

    this.morphogens.push(tipGrowthMorphogen);
    this.morphogens.push(petioleMorphogen);
  }

  grow() {
    this.vertices.forEach((vertex) => {
      vertex.grow();
    });
  }

  calcNormals() {
    this.vertices.forEach((vertex, i) => {
      const prevVertex = this.vertices[i - 1];
      const nextVertex = this.vertices[i + 1];
    });
  }

  subdivide() {
    const newVertices = this.vertices.reduce((newVertices, currVertex, i) => {
      newVertices.push(currVertex);

      const { nextVertex } = currVertex;
      if (nextVertex != null) {
        if (
          vec2.distance(currVertex.position, nextVertex.position) >
          P.MARGIN_SUBDIV_THRESHOLD
        ) {
          const newVertex = currVertex.copy();
          newVertex.position = vec2
            .sum(currVertex.position, nextVertex.position)
            .multiply(0.5);
          newVertex.prevVertex = currVertex;
          newVertex.nextVertex = nextVertex;
          currVertex.nextVertex = newVertex;
          newVertices.push(newVertex);
        }
      }
      return newVertices;
    }, []);

    this.vertices = newVertices;
  }
}
