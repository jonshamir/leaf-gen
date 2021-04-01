import vec2 from "./utils/tsm/vec2";
import * as P from "./utils/parameters";
import LeafVein from "./LeafVein";
import MarginVertex from "./MarginVertex";
import Morphogen from "./Morphogen";

export class LeafMargin {
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
    let vertexRight, vertexLeft;
    let prevVertexRight = null;
    let prevVertexLeft = null;
    for (let i = 0; i < P.NUM_INIT_VERTICES - 1; i++) {
      vertexRight = new MarginVertex();
      vertexLeft = new MarginVertex();
      vertexRight.position = new vec2([-1, i]);
      vertexLeft.position = new vec2([1, i]);

      vertexRight.tipVertex = this.tipVertex;
      vertexLeft.tipVertex = this.tipVertex;
      vertexRight.prevVertex = prevVertexRight;
      vertexLeft.prevVertex = prevVertexLeft;
      if (i == 0) {
        this.rootRight = vertexRight;
        this.rootLeft = vertexLeft;
      } else {
        prevVertexRight.nextVertex = vertexRight;
        prevVertexLeft.nextVertex = vertexLeft;
      }

      prevVertexRight = vertexRight;
      prevVertexLeft = vertexLeft;
    }

    vertexRight.nextVertex = this.tipVertex;
    vertexLeft.nextVertex = this.tipVertex;

    console.log(this.rootRight);

    // Initialize morphogens

    const petioleMorphogen = new Morphogen("petioleMorphogen");
    petioleMorphogen.addSegment(this.rootRight, this.rootRight.nextVertex);
    petioleMorphogen.addSegment(this.rootLeft, this.rootLeft.nextVertex);
    petioleMorphogen.growthMultiplier = 0;

    const tipGrowthMorphogen = new Morphogen("tipGrowthMorphogen");
    tipGrowthMorphogen.addSegment(this.rootRight, vertexRight);
    tipGrowthMorphogen.addSegment(this.rootLeft, vertexLeft);

    tipGrowthMorphogen.tipGenerationLength = P.TIP_GENERATION_LENGTH;
    this.morphogens.push(tipGrowthMorphogen);
    this.morphogens.push(petioleMorphogen);
  }

  getRightVertices(includeTip = true) {
    return this.getVertexArray(this.rootRight, includeTip);
  }

  getLeftVertices(includeTip = true) {
    return this.getVertexArray(this.rootLeft, includeTip);
  }

  getVertexArray(rootVertex: MarginVertex, includeTip: boolean) {
    let currVertex = rootVertex;
    let vertexArray = [];
    while (currVertex != this.tipVertex) {
      vertexArray.push(currVertex);
      currVertex = currVertex.nextVertex;
    }
    if (includeTip) vertexArray.push(this.tipVertex);
    return vertexArray;
  }

  getAllVertices() {
    let currVertex = this.rootRight;
    let vertexArray = [];
    while (currVertex != this.tipVertex) {
      vertexArray.push(currVertex);
      currVertex = currVertex.nextVertex;
    }
  }

  forEachVertex(callback: any) {
    this.getRightVertices().forEach(callback);
    this.getLeftVertices(false).forEach(callback);
  }

  mapVertices(callback: any) {
    const rightArray = this.getRightVertices().map(callback);
    const leftArray = this.getLeftVertices(false).map(callback);
    return rightArray.concat(leftArray);
  }

  grow() {
    this.forEachVertex((vertex) => {
      vertex.grow();
    });
  }

  calcNormals() {}

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
            // Add new tip vertex after midVertex
            const newTipVertex = midVertex.subdivide();
            newTipVertex.isTip = true;
            // Split segment
            segments.splice(segmentIndex, 1); // Remove old segment
            i--;
            morphogen.addSegment(startVertex, midVertex);
            morphogen.addSegment(newTipVertex.nextVertex, endVertex);
            newTipVertices.push(newTipVertex);

            // update tip vertex pointers
            // midVertex.tipVertex = newTipVertex;
            // newTipVertex.nextVertex.tipVertex = newTipVertex;
          }
        });
      }
    }

    return newTipVertices;
  }

  vetexArrayToString() {
    return this.mapVertices(
      ({ position }) => position.x.toFixed(2) + "," + position.y.toFixed(2)
    );
  }

  subdivide() {
    this.subdivideSide(this.rootRight);
    this.subdivideSide(this.rootLeft);
  }

  subdivideSide(rootVertex: MarginVertex) {
    let currVertex = rootVertex;
    while (currVertex != this.tipVertex) {
      if (currVertex.length() > P.MARGIN_SUBDIV_THRESHOLD)
        currVertex.subdivide();

      currVertex = currVertex.nextVertex;
    }
  }
}
