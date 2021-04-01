import vec2 from "./utils/tsm/vec2";
import * as P from "./utils/parameters";
import LeafVein from "./LeafVein";
import MarginVertex from "./MarginVertex";
import Morphogen from "./Morphogen";

export class LeafMargin {
  vertices: Array<MarginVertex> = []; // TODO delete
  rootRight: MarginVertex; // Linked list
  rootLeft: MarginVertex; // Linked list

  morphogens: Array<Morphogen> = [];
  tipVertex: MarginVertex;

  constructor() {
    // Generate tip vertex
    this.tipVertex = new MarginVertex();
    this.tipVertex.position = new vec2([0, P.NUM_INIT_VERTICES - 1]);
    this.tipVertex.isTip = true;

    //Generates left and right margin
    let prevVertex = null;
    for (let i = 0; i < 2 * P.NUM_INIT_VERTICES - 1; i++) {
      let vertex = new MarginVertex();

      if (i < P.NUM_INIT_VERTICES - 1) {
        vertex.position = new vec2([1, i]);
      } else if (i == P.NUM_INIT_VERTICES - 1) {
        vertex = this.tipVertex;
      } else {
        vertex.position = new vec2([-1, 2 * P.NUM_INIT_VERTICES - i - 2]);
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
      this.vertices[2 * P.NUM_INIT_VERTICES - 3],
      this.vertices[2 * P.NUM_INIT_VERTICES - 2]
    );
    petioleMorphogen.growthMultiplier = 0;

    const tipGrowthMorphogen = new Morphogen("tipGrowthMorphogen");
    tipGrowthMorphogen.addSegment(this.vertices[0], this.vertices[3]);
    tipGrowthMorphogen.addSegment(
      this.vertices[2 * P.NUM_INIT_VERTICES - 5],
      this.vertices[2 * P.NUM_INIT_VERTICES - 2]
    );
    tipGrowthMorphogen.tipGenerationLength = P.TIP_GENERATION_LENGTH;
    this.morphogens.push(tipGrowthMorphogen);
    this.morphogens.push(petioleMorphogen);
  }

  getAllVertices() {
    let currVertex = this.rootRight;
    let vertexArray = [];
    let rightMarginComplete = false;
    while (currVertex != this.tipVertex) {
      vertexArray.push(currVertex);
      currVertex = currVertex.nextVertex;
    }
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

  generateTipVertices() {
    let newTipVertices = [];

    for (let i = 0; i < this.morphogens.length; i++) {
      const morphogen = this.morphogens[i];
      const { tipGenerationLength, segments } = morphogen;
      if (tipGenerationLength > 0) {
        // Iterate morphogens segments, generate new tips if needed
        segments.forEach((segment, segmentIndex) => {
          const startVertex = segment[0];
          const endVertex = segment[1];

          let segmentLength = 0;
          let currVertex = startVertex; // startVertex
          let midVertex: MarginVertex;

          while (currVertex != endVertex) {
            segmentLength += currVertex.length();
            if (!midVertex && segmentLength >= tipGenerationLength / 2)
              midVertex = currVertex;
            currVertex = currVertex.nextVertex;
          }
          if (segmentLength >= tipGenerationLength) {
            const insertIndex = this.vertices.indexOf(midVertex) + 1;
            // Add new tip vertex after midVertex
            const newTipVertex = midVertex.subdivide();
            // Add new vertex to this.vertices array
            this.vertices.splice(insertIndex, 0, newTipVertex);
            // Split segment
            segments.splice(segmentIndex, 1); // Remove old segment
            i--;
            morphogen.addSegment(startVertex, midVertex);
            morphogen.addSegment(newTipVertex.nextVertex, endVertex);
            newTipVertices.push(newTipVertex);

            // update tip vertex pointers
            newTipVertex.tipVertex = newTipVertex;
            // midVertex.tipVertex = newTipVertex;
            // newTipVertex.nextVertex.tipVertex = newTipVertex;
          }
        });
      }
    }

    return newTipVertices;
  }

  vetexArrayToString() {
    return this.vertices.map(
      ({ position }) => position.x.toFixed(2) + "," + position.y.toFixed(2)
    );
  }

  subdivide() {
    const newVertices = this.vertices.reduce((newVertices, currVertex, i) => {
      newVertices.push(currVertex);

      const { nextVertex } = currVertex;
      if (nextVertex != null) {
        if (currVertex.length() > P.MARGIN_SUBDIV_THRESHOLD) {
          const newVertex = currVertex.subdivide();
          newVertices.push(newVertex);
        }
      }
      return newVertices;
    }, []);

    this.vertices = newVertices;
  }
}
