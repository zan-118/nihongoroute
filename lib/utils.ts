/**
 * @file utils.ts
 * @description Koleksi fungsi utilitas umum untuk pengembangan antarmuka.
 * @module lib/utils
 */

// ======================
// IMPORTS
// ======================
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

// ======================
// MAIN EXECUTION
// ======================

/**
 * Menggabungkan class Tailwind CSS dengan cerdas, menangani konflik class secara otomatis.
 * 
 * @param {...ClassValue[]} inputs - Daftar class atau objek class.
 * @returns {string} String class yang telah digabungkan.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Mengambil tanggal "YYYY-MM-DD" dalam zona waktu LOKAL perangkat user.
 * 
 * @returns {string} String format tanggal.
 */
export function getLocalDateString(): string {
  const now = new Date();
  const offset = now.getTimezoneOffset() * 60000;
  const localISOTime = (new Date(now.getTime() - offset)).toISOString().split('T')[0];
  return localISOTime;
}
