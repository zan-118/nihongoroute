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

/**
 * Alias untuk getLocalDateString.
 */
export const getTodayDateString = getLocalDateString;

/**
 * Memformat jumlah detik menjadi string waktu MM:SS.
 */
export const formatTime = (seconds: number): string => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
};

/**
 * Mengacak urutan elemen dalam sebuah array.
 */
export const shuffleArray = <T,>(array: T[]): T[] => {
  const newArr = [...array];
  for (let i = newArr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
  }
  return newArr;
};

/**
 * Membuat string menjadi format slug (URL-friendly).
 */
export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')     // Ganti spasi dengan -
    .replace(/[^\w\u3040-\u309f\u30a0-\u30ff\u4e00-\u9faf-]+/g, '') // Simpan karakter Jepang & alphanumeric
    .replace(/--+/g, '-');    // Hapus double dash
}
