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

function getYesterdayString(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return formatLocalDate(d);
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

    return {
      ...getDefaultProgress(),
      ...parsed,
      studyDays: parsed.studyDays ?? {},
    };
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
  const yesterday = getYesterdayString();

  let newStreak = progress.streak;
  let newTodayCount = progress.todayReviewCount;

  // New day detected
  if (progress.lastStudyDate !== today) {
    newStreak = progress.lastStudyDate === yesterday ? progress.streak + 1 : 1;

    newTodayCount = 1;
  } else {
    newTodayCount += 1;
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
