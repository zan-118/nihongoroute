/* ============================= */
/* TYPES */
/* ============================= */

export interface ProgressState {
  lastStudyDate: string;
  streak: number;
  todayReviewCount: number;
  dailyGoal: number;
  totalReviews: number;
  studyDays: Record<string, number>;
}

/* ============================= */
/* CONSTANTS */
/* ============================= */

const STORAGE_KEY = "nihongo-progress";

/* ============================= */
/* DATE HELPERS (LOCAL SAFE) */
/* ============================= */

function formatLocalDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function getTodayString(): string {
  return formatLocalDate(new Date());
}

/**
 * Menghitung selisih hari dengan aman mengabaikan zona waktu jam
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

/* ============================= */
/* LOAD */
/* ============================= */

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

    // Deteksi Streak Putus Saat Aplikasi Dimuat
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

/* ============================= */
/* SAVE */
/* ============================= */

export function saveProgress(state: ProgressState): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

/* ============================= */
/* UPDATE ON REVIEW */
/* ============================= */

export function updateProgressOnReview(): ProgressState {
  const progress = loadProgress();
  const today = getTodayString();

  let newStreak = progress.streak;
  let newTodayCount = progress.todayReviewCount;

  // Logika Streak yang Lebih Akurat
  if (progress.lastStudyDate !== today) {
    const daysMissed = calculateDaysBetween(progress.lastStudyDate, today);

    if (daysMissed === 1) {
      newStreak = progress.streak + 1;
    } else if (daysMissed > 1) {
      newStreak = 1;
    }

    newTodayCount = 1;
  } else {
    newTodayCount += 1;
    if (newStreak === 0) newStreak = 1;
  }

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
