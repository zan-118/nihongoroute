/**
 * @file daily.ts
 * @description Modul manajemen misi harian (Daily Missions). 
 * Mengatur target harian untuk ulasan (review) dan materi baru (lessons).
 * @module lib/daily
 */

import { getLocalDateString } from "./utils";

// ======================
// TYPES
// ======================
export interface DailyMission {
  date: string;
  reviewGoal: number;
  lessonGoal: number;
  reviewProgress: number;
  lessonProgress: number;
  completed: boolean;
  rewardXP: number;
}

// ======================
// CONFIG / CONSTANTS
// ======================
const STORAGE_KEY = "nihongo-daily";

// ======================
// HELPER FUNCTIONS
// ======================

/**
 * Mendapatkan string tanggal hari ini dalam format YYYY-MM-DD (LOKAL).
 */
function getTodayString() {
  return getLocalDateString();
}

/**
 * Membuat objek misi harian baru dengan nilai default.
 * 
 * @param {string} date - Tanggal berlakunya misi.
 * @returns {DailyMission} Objek misi baru.
 */
function createNewMission(date: string): DailyMission {
  return {
    date,
    reviewGoal: 20,
    lessonGoal: 1,
    reviewProgress: 0,
    lessonProgress: 0,
    completed: false,
    rewardXP: 50,
  };
}

// ======================
// BUSINESS LOGIC
// ======================

/**
 * Menyimpan data misi harian ke LocalStorage.
 * 
 * @param {DailyMission} mission - Objek misi yang akan disimpan.
 */
export function saveDailyMission(mission: DailyMission) {
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(mission));
  }
}

/**
 * Memuat data misi harian dari LocalStorage.
 * Melakukan reset otomatis jika tanggal telah berganti.
 * 
 * @returns {DailyMission} Data misi harian yang aktif.
 */
export function loadDailyMission(): DailyMission {
  const today = getTodayString();

  if (typeof window === "undefined") {
    return createNewMission(today);
  }

  const saved = localStorage.getItem(STORAGE_KEY);

  if (!saved) {
    const mission = createNewMission(today);
    saveDailyMission(mission);
    return mission;
  }

  try {
    const parsed: DailyMission = JSON.parse(saved);

    // Reset misi jika harinya sudah berganti
    if (parsed.date !== today) {
      const mission = createNewMission(today);
      saveDailyMission(mission);
      return mission;
    }

    return parsed;
  } catch (error) {
    console.warn("Corrupted daily mission data, resetting...", error);
    const mission = createNewMission(today);
    saveDailyMission(mission);
    return mission;
  }
}

/**
 * Memperbarui progres ulasan (review) pada misi harian.
 * 
 * @returns {DailyMission} Data misi yang diperbarui.
 */
export function updateReviewMission(): DailyMission {
  const mission = loadDailyMission();

  if (!mission.completed) {
    mission.reviewProgress += 1;

    // Cek syarat penyelesaian misi
    if (
      mission.reviewProgress >= mission.reviewGoal &&
      mission.lessonProgress >= mission.lessonGoal
    ) {
      mission.completed = true;
    }

    saveDailyMission(mission);
  }

  return mission;
}

/**
 * Memperbarui progres materi (lesson) pada misi harian.
 * 
 * @returns {DailyMission} Data misi yang diperbarui.
 */
export function updateLessonMission(): DailyMission {
  const mission = loadDailyMission();

  if (!mission.completed) {
    mission.lessonProgress += 1;

    // Cek syarat penyelesaian misi
    if (
      mission.reviewProgress >= mission.reviewGoal &&
      mission.lessonProgress >= mission.lessonGoal
    ) {
      mission.completed = true;
    }

    saveDailyMission(mission);
  }

  return mission;
}
