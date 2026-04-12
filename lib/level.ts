/* ============================= */
/* CONFIGURATION */
/* ============================= */

const BASE_XP = 50; // XP scaling factor
const MAX_LEVEL = 100; // Level maksimal yang bisa dicapai

/* ============================= */
/* CALCULATE LEVEL FROM XP */
/* ============================= */

/**
 * Menghitung Level saat ini berdasarkan total XP pengguna
 */
export function calculateLevel(xp: number): number {
  if (xp <= 0) return 1;

  const level = Math.floor(Math.sqrt(xp / BASE_XP)) + 1;

  return Math.min(level, MAX_LEVEL);
}

/* ============================= */
/* XP REQUIRED FOR LEVEL */
/* ============================= */

/**
 * Menghitung total batas bawah XP yang dibutuhkan untuk berada di level tertentu
 */
export function xpForLevel(level: number): number {
  if (level <= 1) return 0;

  return Math.pow(level - 1, 2) * BASE_XP;
}

/**
 * Total XP yang dibutuhkan untuk naik ke level berikutnya
 */
export function xpForNextLevel(level: number): number {
  return Math.pow(level, 2) * BASE_XP;
}

/**
 * Batas bawah XP untuk level saat ini (Alias untuk xpForLevel)
 */
export function xpForCurrentLevel(level: number): number {
  return xpForLevel(level);
}

/* ============================= */
/* PROGRESS PERCENT */
/* ============================= */

/**
 * Menghitung persentase bar XP (0 - 100) di level saat ini
 */
export function getLevelProgressPercent(xp: number, level: number): number {
  const currentXP = xpForCurrentLevel(level);
  const nextXP = xpForNextLevel(level);

  const range = nextXP - currentXP;

  if (range <= 0) return 0;

  const progress = ((xp - currentXP) / range) * 100;

  return Math.min(Math.max(progress, 0), 100);
}
