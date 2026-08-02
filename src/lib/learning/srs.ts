/**
 * @file srs.ts
 * @description Modul orkestrator sistem pengulangan cerdas (Spaced Repetition System / SRS) berbasis modifikasi algoritma SM-2 dengan Modern Halving untuk penalti dan Due-Date Guard untuk mencegah inflasi interval belajar luring.
 */

// ==========================================
// KONFIGURASI & KONSTANTA
// ==========================================

/** One day in milliseconds. */
const DAY = 24 * 60 * 60 * 1000;

/** Minimum ease factor limit to prevent interval stagnation. */
const MIN_EASE_FACTOR = 1.3;

/** Maximum ease factor limit to prevent interval explosion. */
const MAX_EASE_FACTOR = 5.0; // Batas maksimal ease factor

/** Maximum interval limit in days (approx. 10 years). */
const MAX_INTERVAL = 3650; // Maksimal interval 10 tahun

// ==========================================
// ANTARMUKA STATE SRS
// ==========================================

/**
 * Represents the Spaced Repetition System (SRS) state for a flashcard.
 */
export interface SRSState {
 /** Current interval in days before the next review. */
 interval: number; // Dalam satuan hari (days)
 /** Number of consecutive successful reviews. */
 repetition: number;
 /** Difficulty multiplier used to calculate the next interval. */
 easeFactor: number;
 /** Epoch timestamp in milliseconds for the next scheduled review. */
 nextReview: number; // Timestamp (ms)
 /** Epoch timestamp in milliseconds of the last state update. */
 updatedAt: number; // Timestamp (ms) update terakhir
 /** Flag indicating if the card is marked for deletion during sync. */
 isDeleted?: boolean; // Flag untuk sinkronisasi penghapusan
 /** Optional custom mnemonic text provided by the user. */
 customMnemonic?: string; // Jembatan keledai kustom
}

// ==========================================
// FUNGSI PEMBANTU (HELPERS)
// ==========================================

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

// ==========================================
// LOGIKA BISNIS UTAMA SRS
// ==========================================

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
 
 // Card is due if current time is within 6 hours of next review time
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
 // First repetition interval adjustment
 interval = grade === 3 ? 2 : 1;
 } else if (repetition === 2 && interval <= 2) {
 // Second repetition interval adjustment
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

 const now = new Date();
 // Calculate next review date at midnight local time plus interval days
 const targetDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + interval);
 const newNextReview = targetDate.getTime();

 return {
 repetition,
 interval,
 easeFactor,
 nextReview: newNextReview,
 updatedAt: Date.now(),
 };
}