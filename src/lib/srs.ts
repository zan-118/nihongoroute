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
 * Menghitung status SRS baru berdasarkan kualitas jawaban user (grade 0-3).
 * Menggunakan logika Modern Halving untuk penalti dan Due-Date Guard untuk mencegah inflasi.
 * 
 * @param {SRSState} state - State kartu saat ini.
 * @param {number} grade - Kualitas jawaban (0: Lupa, 1: Sulit, 2: Bisa, 3: Mudah).
 * @returns {SRSState} State kartu yang telah diperbarui.
 */
export function updateCardState(state: SRSState, grade: number): SRSState {
  let { repetition, interval, easeFactor } = state;
  const { nextReview } = state;
  const isDue = Date.now() >= nextReview - (DAY / 4); // Toleransi 6 jam untuk fleksibilitas

  if (grade < 2) {
    // ======================
    // LOGIKA PENALTI (Lupa/Sulit)
    // ======================
    if (grade === 0) {
      // Lupa Total: Halving interval & Reset repetition
      interval = Math.max(1, Math.floor(interval / 2));
      repetition = 0;
      easeFactor = Math.max(MIN_EASE_FACTOR, easeFactor - 0.2);
    } else {
      // Sulit: Sedikit pengurangan interval untuk penguatan kembali
      interval = Math.max(1, Math.ceil(interval * 0.7));
      easeFactor = Math.max(MIN_EASE_FACTOR, easeFactor - 0.15);
    }
  } else {
    // ======================
    // LOGIKA PERTUMBUHAN (Bisa/Mudah)
    // ======================
    
    // Hanya naikkan interval jika kartu memang sudah waktunya diulas (Due-Date Guard)
    if (isDue) {
      repetition += 1;

      if (repetition === 1 && interval === 1) {
        interval = grade === 3 ? 2 : 1;
      } else if (repetition === 2 && interval <= 2) {
        interval = grade === 3 ? 5 : 3;
      } else {
        // Multiplier bonus untuk jawaban "Sangat Mudah"
        const multiplier = grade === 3 ? 1.3 : 1.0;
        interval = Math.min(MAX_INTERVAL, Math.max(interval + 1, Math.ceil(interval * easeFactor * multiplier)));
      }

      // Penyesuaian Ease Factor
      if (grade === 3) {
        easeFactor = Math.min(MAX_EASE_FACTOR, easeFactor + 0.15);
      } else {
        easeFactor = Math.min(MAX_EASE_FACTOR, easeFactor + 0.05);
      }
    } else {
      // Belajar awal (Early Study): Tidak menambah interval untuk mencegah Mastery palsu.
      // Hanya memberikan sedikit bonus pada easeFactor sebagai reward ketekunan.
      easeFactor = Math.min(MAX_EASE_FACTOR, easeFactor + 0.02);
    }
  }

  const newNextReview = Date.now() + interval * DAY;

  return {
    repetition,
    interval,
    easeFactor,
    nextReview: newNextReview,
    updatedAt: Date.now(),
  };
}

