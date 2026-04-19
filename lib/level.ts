/**
 * @file level.ts
 * @description Modul perhitungan sistem level dan XP pengguna menggunakan algoritma scaling kuadratik.
 * @module lib/level
 */

// ======================
// CONFIGURATION
// ======================
const BASE_XP = 50;   // Faktor penskalaan XP
const MAX_LEVEL = 100; // Level maksimal yang bisa dicapai

// ======================
// BUSINESS LOGIC
// ======================

/**
 * Menghitung Level saat ini berdasarkan total XP pengguna menggunakan akar kuadrat.
 * 
 * @param {number} xp - Total akumulasi XP pengguna.
 * @returns {number} Level saat ini.
 */
export function calculateLevel(xp: number): number {
  if (xp <= 0) return 1;

  // Formula: L = sqrt(XP / BASE) + 1
  const level = Math.floor(Math.sqrt(xp / BASE_XP)) + 1;

  return Math.min(level, MAX_LEVEL);
}

/**
 * Menghitung total batas bawah XP yang dibutuhkan untuk berada di level tertentu.
 * 
 * @param {number} level - Target level.
 * @returns {number} Nilai XP minimum.
 */
export function xpForLevel(level: number): number {
  if (level <= 1) return 0;

  return Math.pow(level - 1, 2) * BASE_XP;
}

/**
 * Menghitung total XP yang dibutuhkan untuk mencapai level berikutnya.
 * 
 * @param {number} level - Level saat ini.
 * @returns {number} Target XP level berikutnya.
 */
export function xpForNextLevel(level: number): number {
  return Math.pow(level, 2) * BASE_XP;
}

/**
 * Batas bawah XP untuk level saat ini.
 * 
 * @param {number} level - Level saat ini.
 * @returns {number} XP awal level ini.
 */
export function xpForCurrentLevel(level: number): number {
  return xpForLevel(level);
}

/**
 * Menghitung persentase progres bar XP (0 - 100) di level saat ini.
 * Digunakan untuk visualisasi linear progress bar.
 * 
 * @param {number} xp - XP pengguna saat ini.
 * @param {number} level - Level pengguna saat ini.
 * @returns {number} Persentase progres (0-100).
 */
export function getLevelProgressPercent(xp: number, level: number): number {
  const currentXP = xpForCurrentLevel(level);
  const nextXP = xpForNextLevel(level);

  const range = nextXP - currentXP;

  if (range <= 0) return 0;

  const progress = ((xp - currentXP) / range) * 100;

  return Math.min(Math.max(progress, 0), 100);
}
