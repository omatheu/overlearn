/**
 * SM-2 Spaced Repetition Algorithm Constants
 *
 * The SM-2 algorithm is used for calculating optimal review intervals for flashcards.
 * These constants define the behavior of the algorithm.
 *
 * Reference: https://www.supermemo.com/en/archives1990-2015/english/ol/sm2
 */

/**
 * Minimum ease factor allowed in SM-2 algorithm
 * Default: 1.3 (prevents cards from becoming too difficult to review)
 */
export const SM2_MIN_EASE_FACTOR = 1.3;

/**
 * Default ease factor for new cards
 * Default: 2.5 (neutral difficulty)
 */
export const SM2_DEFAULT_EASE_FACTOR = 2.5;

/**
 * Maximum ease factor (optional limit to prevent extreme intervals)
 * Default: 3.0 (reasonable upper bound)
 */
export const SM2_MAX_EASE_FACTOR = 3.0;

/**
 * Interval for first repetition (in days)
 * Default: 1 day
 */
export const SM2_FIRST_INTERVAL = 1;

/**
 * Interval for second repetition (in days)
 * Default: 6 days
 */
export const SM2_SECOND_INTERVAL = 6;

/**
 * Ease factor adjustment for quality >= 3
 * Formula component: 0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)
 */
export const SM2_EASE_FACTOR_ADJUSTMENT = 0.1;

/**
 * Penalty base for incorrect answers
 * Used in formula: (5 - quality) * (0.08 + (5 - quality) * 0.02)
 */
export const SM2_EASE_PENALTY_BASE = 0.08;

/**
 * Penalty multiplier for incorrect answers
 * Used in formula: (5 - quality) * (0.08 + (5 - quality) * 0.02)
 */
export const SM2_EASE_PENALTY_MULTIPLIER = 0.02;

/**
 * Quality score thresholds
 */
export const SM2_QUALITY = {
  /** Perfect response (5) */
  PERFECT: 5,
  /** Correct with hesitation (4) */
  CORRECT_HESITATION: 4,
  /** Correct with difficulty (3) - minimum to increase interval */
  CORRECT_DIFFICULT: 3,
  /** Incorrect but remembered (2) */
  INCORRECT_REMEMBERED: 2,
  /** Incorrect, barely remembered (1) */
  INCORRECT_BARELY: 1,
  /** Complete blackout (0) */
  BLACKOUT: 0,
} as const;

/**
 * Helper function to validate quality score
 */
export function isValidQuality(quality: number): boolean {
  return quality >= SM2_QUALITY.BLACKOUT && quality <= SM2_QUALITY.PERFECT;
}

/**
 * Helper function to calculate new ease factor
 */
export function calculateEaseFactor(currentEase: number, quality: number): number {
  if (!isValidQuality(quality)) {
    throw new Error(`Invalid quality score: ${quality}. Must be between 0-5.`);
  }

  const newEase = currentEase + (
    SM2_EASE_FACTOR_ADJUSTMENT -
    (5 - quality) * (SM2_EASE_PENALTY_BASE + (5 - quality) * SM2_EASE_PENALTY_MULTIPLIER)
  );

  // Clamp between min and max
  return Math.max(SM2_MIN_EASE_FACTOR, Math.min(SM2_MAX_EASE_FACTOR, newEase));
}

/**
 * Helper function to calculate next interval
 */
export function calculateInterval(
  currentInterval: number,
  repetitions: number,
  easeFactor: number,
  quality: number
): number {
  // If quality < 3, reset to first interval
  if (quality < SM2_QUALITY.CORRECT_DIFFICULT) {
    return SM2_FIRST_INTERVAL;
  }

  // First repetition
  if (repetitions === 0) {
    return SM2_FIRST_INTERVAL;
  }

  // Second repetition
  if (repetitions === 1) {
    return SM2_SECOND_INTERVAL;
  }

  // Subsequent repetitions
  return Math.round(currentInterval * easeFactor);
}
