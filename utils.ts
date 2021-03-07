import vec2 from "./tsm/vec2";
import * as P from "./parameters";

// what is the growth amount at the point, as a function of the distance from the base
export const growthIntegralAtDist = (distanceToBase: number) => {
  // Spatial integration of growth (closed form equation)
  let growth = distanceToBase;
  if (distanceToBase > P.GROWTH_DIST_END)
    growth = (P.GROWTH_DIST_FALLOFF + P.GROWTH_DIST_END) / 2;
  else if (distanceToBase > P.GROWTH_DIST_FALLOFF)
    growth =
      P.GROWTH_DIST_FALLOFF +
      (distanceToBase - P.GROWTH_DIST_FALLOFF) *
        (1 -
          (0.5 * (distanceToBase - P.GROWTH_DIST_FALLOFF)) /
            (P.GROWTH_DIST_END - P.GROWTH_DIST_FALLOFF));
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
