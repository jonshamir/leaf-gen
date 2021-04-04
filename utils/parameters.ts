// Initial parameters
export const NUM_INIT_VERTICES: number = 5;
export const MARGIN_SUBDIV_THRESHOLD = 1.5;

// Nutrient transport resistance parameters B > V > 0 used to calculate branching angle
export const B = 1.2; // Blade resistance
export const V = 1; // Vein resistance
export const MIN_BRANCH_ANGLE = 0;
export const MAX_BRANCH_ANGLE = 4;

// Growth parameters
export const GROW_RATE: number = 0.01;
export const GROWTH_DIST_FALLOFF = 7;
export const GROWTH_DIST_END = 8;

export const TIP_GENERATION_LENGTH = 5.5;
export const NEW_TIP_SEGMENT_DELTA = 1.5;

// Geometric fairing parameters
export const ALPHA_S = 1; // Streching
export const ALPHA_K1 = 1; // Curvature 1
export const ALPHA_K2 = 1; // Curvature 2
export const ALPHA_N = 1; // Normal direction
