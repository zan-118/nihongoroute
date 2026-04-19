/**
 * @file progress.ts
 * @description Modul manajemen statistik progres pengguna (Streak, Heatmap, Review Count).
 * Menangani logika persistensi data statistik ke LocalStorage secara terpisah dari data SRS.
 * @module lib/progress
 */

// ======================
// TYPES
// ======================

/**
 * Representasi state statistik progres belajar pengguna.
 */
export interface ProgressState {
  lastStudyDate: string;        // Tanggal terakhir belajar (YYYY-MM-DD)
  streak: number;               // Jumlah hari beruntun belajar
  todayReviewCount: number;     // Jumlah kartu yang direview hari ini
  dailyGoal: number;            // Target review harian
  totalReviews: number;         // Akumulasi total review selamanya
  studyDays: Record<string, number>; // Data log harian untuk Heatmap { "date": count }
}

// ======================
// CONFIG / CONSTANTS
// ======================
const STORAGE_KEY = "nihongo-progress";

// ======================
// DATE HELPERS
// ======================

/**
 * Memformat objek Date menjadi string ISO lokal YYYY-MM-DD.
 * 
 * @param {Date} date - Objek tanggal.
 * @returns {string} String tanggal terformat.
 */
function formatLocalDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

/**
 * Mendapatkan string tanggal hari ini.
 * 
 * @returns {string} Tanggal hari ini (YYYY-MM-DD).
 */
export function getTodayString(): string {
  return formatLocalDate(new Date());
}

/**
 * Menghitung selisih hari antar dua tanggal ISO.
 * Digunakan untuk validasi streak (berkelanjutan atau terputus).
 * 
 * @param {string} dateString1 - Tanggal awal.
 * @param {string} dateString2 - Tanggal akhir.
 * @returns {number} Selisih jumlah hari.
 */
function calculateDaysBetween(
  dateString1: string,
  dateString2: string,
): number {
  const [y1, m1, d1] = dateString1.split("-").map(Number);
  const [y2, m2, d2] = dateString2.split("-").map(Number);

  const date1 = new Date(y1, m1 - 1, d1);
  const date2 = new Date(y2, m2 - 1, d2);

  const diffTime = Math.abs(date2.getTime() - date1.getTime());
  return Math.round(diffTime / (1000 * 60 * 60 * 24));
}

// ======================
// BUSINESS LOGIC
// ======================

/**
 * Menghasilkan objek progres default.
 */
function getDefaultProgress(): ProgressState {
  return {
    lastStudyDate: getTodayString(),
    streak: 0,
    todayReviewCount: 0,
    dailyGoal: 20,
    totalReviews: 0,
    studyDays: {},
  };
}

/**
 * Memuat statistik progres dari LocalStorage.
 * Melakukan validasi streak saat pemuatan data.
 * 
 * @returns {ProgressState} State progres saat ini.
 */
export function loadProgress(): ProgressState {
  if (typeof window === "undefined") {
    return getDefaultProgress();
  }

  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return getDefaultProgress();

    const parsed = JSON.parse(saved);
    const state: ProgressState = {
      ...getDefaultProgress(),
      ...parsed,
      studyDays: parsed.studyDays ?? {},
    };

    // Deteksi Streak Putus: Jika absen belajar lebih dari 1 hari
    const today = getTodayString();
    if (
      state.lastStudyDate !== today &&
      calculateDaysBetween(state.lastStudyDate, today) > 1
    ) {
      state.streak = 0;
    }

    return state;
  } catch (err) {
    console.warn("Progress save corrupted, loading default:", err);
    return getDefaultProgress();
  }
}

/**
 * Menyimpan statistik progres ke LocalStorage.
 * 
 * @param {ProgressState} state - State progres terbaru.
 */
export function saveProgress(state: ProgressState): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

/**
 * Memperbarui data statistik setiap kali user menyelesaikan sebuah review kartu.
 * Menangani penambahan streak dan penghitungan log harian.
 * 
 * @returns {ProgressState} State progres yang telah diperbarui.
 */
export function updateProgressOnReview(): ProgressState {
  const progress = loadProgress();
  const today = getTodayString();

  let newStreak = progress.streak;
  let newTodayCount = progress.todayReviewCount;

  // Logika Pembaruan Streak & Daily Count
  if (progress.lastStudyDate !== today) {
    const daysMissed = calculateDaysBetween(progress.lastStudyDate, today);

    if (daysMissed === 1) {
      // Belajar di hari berikutnya (streak berlanjut)
      newStreak = progress.streak + 1;
    } else if (daysMissed > 1) {
      // Absen belajar (streak mulai dari 1 lagi)
      newStreak = 1;
    }

    newTodayCount = 1;
  } else {
    // Masih di hari yang sama
    newTodayCount += 1;
    if (newStreak === 0) newStreak = 1;
  }

  // Update data log harian untuk Heatmap
  const updatedStudyDays = {
    ...progress.studyDays,
    [today]: (progress.studyDays[today] ?? 0) + 1,
  };

  const updated: ProgressState = {
    ...progress,
    lastStudyDate: today,
    streak: newStreak,
    todayReviewCount: newTodayCount,
    totalReviews: progress.totalReviews + 1,
    studyDays: updatedStudyDays,
  };

  saveProgress(updated);
  return updated;
}
