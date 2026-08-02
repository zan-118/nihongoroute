/**
 * @file level.ts
 * @description Modul perhitungan sistem level dan scaling XP pengguna menggunakan algoritma scaling kuadratik offline-first untuk visualisasi linear progress bar.
 */

/**
 * Base XP scaling factor.
 */
const BASE_XP = 50; // Faktor penskalaan XP

/**
 * Maximum level cap.
 */
const MAX_LEVEL = 100; // Level maksimal yang bisa dicapai

// ==========================================
// LOGIKA BISNIS & SISTEM LEVEL
// ==========================================
/**
 * Calculate current level from total XP.
 * Uses quadratic scaling.
 * 
 * @param {number} xp - Total accumulated XP.
 * @returns {number} Current level.
 */
export function calculateLevel(xp: number): number {
 // Handle zero or negative XP.
 if (xp <= 0) return 1;

 // Inverse quadratic formula: L = sqrt(XP / BASE) + 1
 const level = Math.floor(Math.sqrt(xp / BASE_XP)) + 1;

 // Cap level at maximum.
 return Math.min(level, MAX_LEVEL);
}

/**
 * Calculate minimum XP required for specific level.
 * 
 * @param {number} level - Target level.
 * @returns {number} Minimum XP threshold.
 */
export function xpForLevel(level: number): number {
 // Level 1 starts at 0 XP.
 if (level <= 1) return 0;

 // Quadratic formula for level threshold.
 return Math.pow(level - 1, 2) * BASE_XP;
}

/**
 * Calculate XP required to reach next level.
 * 
 * @param {number} level - Current level.
 * @returns {number} Next level XP threshold.
 */
export function xpForNextLevel(level: number): number {
 // Calculate threshold using next level index.
 return Math.pow(level, 2) * BASE_XP;
}

/**
 * Get minimum XP threshold for current level.
 * 
 * @param {number} level - Current level.
 * @returns {number} Current level XP threshold.
 */
export function xpForCurrentLevel(level: number): number {
 // Alias for xpForLevel.
 return xpForLevel(level);
}

/**
 * Calculate progress percentage to next level.
 * Returns value between 0 and 100.
 * 
 * @param {number} xp - Current XP.
 * @param {number} level - Current level.
 * @returns {number} Progress percentage.
 */
export function getLevelProgressPercent(xp: number, level: number): number {
 const currentXP = xpForCurrentLevel(level);
 const nextXP = xpForNextLevel(level);

 // XP span for current level.
 const range = nextXP - currentXP;

 // Prevent division by zero.
 if (range <= 0) return 0;

 // Calculate percentage.
 const progress = ((xp - currentXP) / range) * 100;

 // Clamp value between 0 and 100.
 return Math.min(Math.max(progress, 0), 100);
}