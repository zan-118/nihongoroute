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

// ✨ BARU: Menghitung selisih hari dengan aman mengabaikan zona waktu jam ✨
function calculateDaysBetween(
  dateString1: string,
  dateString2: string,
): number {
  // Kita split 'YYYY-MM-DD' untuk menghindari timezone offset issues saat new Date()
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

export function loadProgress(): ProgressState {
  if (typeof window === "undefined") {
    return getDefaultProgress();
  }

  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return getDefaultProgress();

    const parsed = JSON.parse(saved);
    const state = {
      ...getDefaultProgress(),
      ...parsed,
      studyDays: parsed.studyDays ?? {},
    };

    // ✨ FIX: Deteksi Streak Putus Saat Aplikasi Dimuat ✨
    // Jika user membuka aplikasi dan sudah terlewat lebih dari 1 hari sejak lastStudyDate,
    // kita biarkan lastStudyDate tetap (agar tidak false-positive 'sudah belajar hari ini'),
    // TETAPI kita reset streak-nya menjadi 0 untuk UI.
    const today = getTodayString();
    if (
      state.lastStudyDate !== today &&
      calculateDaysBetween(state.lastStudyDate, today) > 1
    ) {
      state.streak = 0;
    }

    return state;
  } catch {
    return getDefaultProgress();
  }
}

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

  // ✨ FIX: Logika Streak yang Lebih Akurat ✨
  if (progress.lastStudyDate !== today) {
    const daysMissed = calculateDaysBetween(progress.lastStudyDate, today);

    if (daysMissed === 1) {
      // User belajar kemarin, lanjut streak
      newStreak = progress.streak + 1;
    } else if (daysMissed > 1) {
      // User bolos lebih dari sehari, RESET streak
      newStreak = 1;
    }
    // (Note: jika daysMissed === 0, berarti ini review kedua di hari yang sama, streak tetap)

    // Karena ini hari baru, reset hitungan harian
    newTodayCount = 1;
  } else {
    // Review tambahan di hari yang sama
    newTodayCount += 1;
    // Khusus untuk user baru yang belum punya streak sama sekali
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
