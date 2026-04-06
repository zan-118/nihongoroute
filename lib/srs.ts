/* ============================= */
/* TYPES */
/* ============================= */

export interface SRSState {
  interval: number; // in days
  repetition: number;
  easeFactor: number;
  nextReview: number; // timestamp (ms)
}

/* ============================= */
/* CONSTANTS */
/* ============================= */

const DAY = 24 * 60 * 60 * 1000;
const MIN_EASE_FACTOR = 1.3;

/* ============================= */
/* CREATE NEW CARD */
/* ============================= */

export function createNewCardState(): SRSState {
  return {
    interval: 1,
    repetition: 0,
    easeFactor: 2.5,
    nextReview: Date.now(),
  };
}

/* ============================= */
/* UPDATE CARD STATE (SM-2 Lite) */
/* ============================= */

export function updateCardState(state: SRSState, correct: boolean): SRSState {
  let { repetition, interval, easeFactor } = state;

  if (!correct) {
    // Reset repetition
    repetition = 0;
    interval = 1;

    // Slight penalty to ease factor
    easeFactor = Math.max(MIN_EASE_FACTOR, easeFactor - 0.2);
  } else {
    repetition += 1;

    if (repetition === 1) {
      interval = 1;
    } else if (repetition === 2) {
      interval = 3;
    } else {
      interval = Math.round(interval * easeFactor);
    }

    // Slight improvement
    easeFactor += 0.05;
  }

  const nextReview = Date.now() + interval * DAY;

  return {
    repetition,
    interval,
    easeFactor,
    nextReview,
  };
}
