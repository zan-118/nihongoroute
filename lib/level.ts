/* ============================= */
/* CONFIGURATION */
/* ============================= */

const BASE_XP = 50; // XP scaling factor
const MAX_LEVEL = 100; // optional cap

/* ============================= */
/* CALCULATE LEVEL FROM XP */
/* ============================= */

export function calculateLevel(xp: number): number {
  if (xp <= 0) return 1;

  const level = Math.floor(Math.sqrt(xp / BASE_XP)) + 1;

  return Math.min(level, MAX_LEVEL);
}

/* ============================= */
/* XP REQUIRED FOR LEVEL */
/* ============================= */

export function xpForLevel(level: number): number {
  if (level <= 1) return 0;

  return Math.pow(level - 1, 2) * BASE_XP;
}

/* XP required to reach next level */
export function xpForNextLevel(level: number): number {
  return Math.pow(level, 2) * BASE_XP;
}

/* XP floor of current level */
export function xpForCurrentLevel(level: number): number {
  return xpForLevel(level);
}

/* ============================= */
/* PROGRESS PERCENT */
/* ============================= */

export function getLevelProgressPercent(xp: number, level: number): number {
  const currentXP = xpForCurrentLevel(level);
  const nextXP = xpForNextLevel(level);

  const range = nextXP - currentXP;

  if (range <= 0) return 0;

  const progress = ((xp - currentXP) / range) * 100;

  return Math.min(Math.max(progress, 0), 100);
}
