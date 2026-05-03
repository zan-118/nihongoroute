/**
 * @file srs.ts
 * @description Implementasi algoritma Spaced Repetition System (SRS) berbasis modifikasi SM-2.
 * Digunakan untuk menghitung interval peninjauan kartu berikutnya berdasarkan performa user.
 * @module SRS
 */

// ======================
// CONSTANTS / CONFIG
// ======================
const DAY = 24 * 60 * 60 * 1000;
const MIN_EASE_FACTOR = 1.3;
const MAX_EASE_FACTOR = 5.0; // Batas maksimal ease factor
const MAX_INTERVAL = 3650;   // Maksimal interval 10 tahun

export interface SRSState {
  interval: number; // Dalam satuan hari (days)
  repetition: number;
  easeFactor: number;
  nextReview: number; // Timestamp (ms)
  updatedAt: number; // Timestamp (ms) update terakhir
  isDeleted?: boolean; // Flag untuk sinkronisasi penghapusan
}

// ======================
// HELPER FUNCTIONS
// ======================

/**
 * Membuat state awal untuk kartu baru.
 * 
 * @returns {SRSState} Objek state SRS default.
 */
export function createNewCardState(): SRSState {
  return {
    interval: 1,
    repetition: 0,
    easeFactor: 2.5,
    nextReview: Date.now(),
    updatedAt: Date.now(),
  };
}

// ======================
// BUSINESS LOGIC
// ======================

/**
 * Menghitung status SRS baru berdasarkan apakah jawaban user benar atau salah.
 * Menggunakan logika Modern Halving untuk penalti guna menjaga retensi tanpa membuat frustrasi.
 * 
 * @param {SRSState} state - State kartu saat ini.
 * @param {boolean} correct - Apakah jawaban user benar.
 * @returns {SRSState} State kartu yang telah diperbarui.
 */
export function updateCardState(state: SRSState, correct: boolean): SRSState {
  let { repetition, interval, easeFactor } = state;

  if (!correct) {
    // Alih-alih mereset interval ke 1, kita bagi dua (halving).
    // Mencegah frustrasi jika user lupa kartu "Master" yang intervalnya sudah puluhan hari.
    interval = Math.max(1, Math.floor(interval / 2));

    // Repetition direset ke 0 agar combo terputus
    repetition = 0;

    // Penalti easeFactor (kartu akan muncul sedikit lebih sering dari biasanya)
    easeFactor = Math.max(MIN_EASE_FACTOR, easeFactor - 0.2);
  } else {
    repetition += 1;

    // Logika untuk kartu yang baru pertama kali dipelajari
    if (repetition === 1 && interval === 1) {
      interval = 1;
    } else if (repetition === 2 && interval === 1) {
      interval = 3;
    } else {
      // Pertumbuhan interval yang natural berdasarkan easeFactor
      // Gunakan Math.ceil agar interval minimal bertambah 1 jika easeFactor > 1.0
      // Ini mencegah kartu terjebak di interval 1 hari selamanya (Ease Hell)
      interval = Math.min(MAX_INTERVAL, Math.max(interval + 1, Math.ceil(interval * easeFactor)));
    }

    // Sedikit reward pada easeFactor karena menjawab benar
    easeFactor = Math.min(MAX_EASE_FACTOR, easeFactor + 0.05);
  }

  const nextReview = Date.now() + interval * DAY;

  return {
    repetition,
    interval,
    easeFactor,
    nextReview,
    updatedAt: Date.now(),
  };
}

