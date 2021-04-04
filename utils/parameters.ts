export default {
  // Initial parameters
  NUM_INIT_VERTICES: 5,
  MARGIN_SUBDIV_THRESHOLD: 1.5,

  // Nutrient transport resistance parameters B > V > 0 used to calculate branching angle
  B: 1.2, // Blade resistance
  V: 1, // Vein resistance
  MIN_BRANCH_ANGLE: 0,
  MAX_BRANCH_ANGLE: 4,

  // Growth parameters
  GROW_RATE: 0.01,
  GROWTH_DIST_FALLOFF: 7,
  GROWTH_DIST_END: 8,

  TIP_GENERATION_LENGTH: 5.5,
  NEW_TIP_SEGMENT_DELTA: 1.5,

  // Geometric fairing parameters
  ALPHA_S: 0.5, // Streching
  ALPHA_C1: 1, // Curvature 1
  ALPHA_C2: 1, // Curvature 2
  ALPHA_N: 0.5, // Normal direction
};
