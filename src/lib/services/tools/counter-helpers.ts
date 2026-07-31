/**
 * @file counter-helpers.ts
 * @description Pure domain helpers untuk Counter Trainer tool — deteksi counter berdasarkan kanji,
 * dan level casting khusus counter. 100% bebas dari I/O sehingga teruji murni via Vitest.
 */

import type { CounterWord } from "@/lib/counter-trainer";

// ======================================================
// CONSTANTS
// ======================================================

/** Valid JLPT levels for counter trainer. */
const COUNTER_LEVELS = ["N5", "N4"] as const;

// ======================================================
// TYPES
// ======================================================

/** Result dari deteksi counter pada sebuah kata. */
export interface CounterDetectionResult {
  answer: CounterWord;
  category: string;
  hint: string;
  explanation: string;
}

// ======================================================
// LEVEL CASTER
// ======================================================

/**
 * Cast string to Counter level. Fallback to N4.
 *
 * @param value - Raw level string
 * @returns Valid counter level
 */
export function asCounterLevel(value: string | null | undefined): "N5" | "N4" {
  const upper = String(value || "").toUpperCase();
  return COUNTER_LEVELS.includes(upper as "N5" | "N4") ? (upper as "N5" | "N4") : "N4";
}

// ======================================================
// COUNTER DETECTION
// ======================================================

/**
 * Detect counter category and metadata based on kanji characters in word.
 * Maps kanji patterns to their appropriate Japanese counter word.
 *
 * @param word - Japanese word containing kanji
 * @returns Counter detection result or null if no counter pattern matched
 */
export function detectCounter(word: string): CounterDetectionResult | null {
  if (/[人者員生師友客母父兄姉弟妹子]/.test(word)) {
    return {
      answer: "人",
      category: "orang",
      hint: "Dipakai untuk menghitung orang.",
      explanation: "人 adalah counter utama untuk orang. Bacaan bisa berubah pada angka tertentu seperti 一人 dan 二人.",
    };
  }
  if (/[本書冊辞典雑誌]/.test(word)) {
    return {
      answer: "冊",
      category: "buku/jilid",
      hint: "Untuk buku atau benda berjilid.",
      explanation: "冊 dipakai untuk buku, majalah, manga, kamus, dan benda berjilid.",
    };
  }
  if (/[本瓶傘鉛筆線道木]/.test(word)) {
    return {
      answer: "本",
      category: "benda panjang",
      hint: "Untuk benda panjang atau silinder.",
      explanation: "本 menghitung benda panjang seperti botol, pensil, payung, batang, dan jalur.",
    };
  }
  if (/[紙券皿写真服枚]/.test(word)) {
    return {
      answer: "枚",
      category: "benda tipis",
      hint: "Untuk benda tipis dan datar.",
      explanation: "枚 cocok untuk kertas, tiket, foto, piring, dan pakaian yang dihitung sebagai lembaran.",
    };
  }
  if (/[猫犬魚鳥虫馬]/.test(word)) {
    return {
      answer: "匹",
      category: "hewan kecil",
      hint: "Untuk banyak hewan kecil.",
      explanation: "匹 umum untuk hewan kecil. Untuk burung besar atau hewan besar, counter bisa berbeda.",
    };
  }
  if (/[車機電脳カメラテレビ]/.test(word)) {
    return {
      answer: "台",
      category: "mesin/kendaraan",
      hint: "Untuk kendaraan dan mesin.",
      explanation: "台 menghitung kendaraan, komputer, kamera, mesin, dan perangkat elektronik besar.",
    };
  }
  if (/[茶水酒汁杯]/.test(word)) {
    return {
      answer: "杯",
      category: "minuman",
      hint: "Untuk isi gelas, cangkir, atau mangkuk.",
      explanation: "杯 menghitung minuman atau cairan dalam wadah, seperti teh, kopi, air, atau sup.",
    };
  }

  return null;
}
