import vec2 from "./tsm/vec2";
import P from "./parameters";

// what is the growth amount at the point, as a function of the distance from the base
export const growthIntegralAtDist = (distanceToBase: number) => {
  // Spatial integration of growth (closed form equation)
  let growth = distanceToBase;
  if (distanceToBase > P.GROW_END_DIST)
    growth = (P.GROW_FALLOFF_DIST + P.GROW_END_DIST) / 2;
  else if (distanceToBase > P.GROW_FALLOFF_DIST)
    growth =
      P.GROW_FALLOFF_DIST +
      (distanceToBase - P.GROW_FALLOFF_DIST) *
        (1 -
          (0.5 * (distanceToBase - P.GROW_FALLOFF_DIST)) /
            (P.GROW_END_DIST - P.GROW_FALLOFF_DIST));
  return P.GROW_RATE * growth;
};

// Returns a growth vector for a given segment
export const growthForSegment = (
  start: vec2,
  startDistToBase: number,
  end: vec2,
  endDistToBase: number
) => {
  let growthDirection = vec2.direction(end, start);
  const growthAmount =
    growthIntegralAtDist(endDistToBase) - growthIntegralAtDist(startDistToBase);

  return growthDirection.multiply(growthAmount);
};

export const linesIntersection = (p1: vec2, p2: vec2, p3: vec2, p4: vec2) => {
  // down part of intersection point formula
  var d1 = (p1.x - p2.x) * (p3.y - p4.y); // (x1 - x2) * (y3 - y4)
  var d2 = (p1.y - p2.y) * (p3.x - p4.x); // (y1 - y2) * (x3 - x4)
  var d = d1 - d2;

  if (d == 0) {
    throw new Error("Number of intersection points is zero or infinity.");
  }

  // upper part of intersection point formula
  var u1 = p1.x * p2.y - p1.y * p2.x; // (x1 * y2 - y1 * x2)
  var u4 = p3.x * p4.y - p3.y * p4.x; // (x3 * y4 - y3 * x4)

  var u2x = p3.x - p4.x; // (x3 - x4)
  var u3x = p1.x - p2.x; // (x1 - x2)
  var u2y = p3.y - p4.y; // (y3 - y4)
  var u3y = p1.y - p2.y; // (y1 - y2)

  // intersection point formula

  var px = (u1 * u2x - u3x * u4) / d;
  var py = (u1 * u2y - u3y * u4) / d;

  var p = { x: px, y: py };

  return new vec2([p.x, p.y]);
};
