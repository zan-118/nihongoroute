export interface DailyMission {
  date: string;
  reviewGoal: number;
  lessonGoal: number;
  reviewProgress: number;
  lessonProgress: number;
  completed: boolean;
  rewardXP: number;
}

const STORAGE_KEY = "nihongo-daily";

function getTodayString() {
  return new Date().toISOString().split("T")[0];
}

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

export function saveDailyMission(mission: DailyMission) {
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(mission));
  }
}

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

export function updateReviewMission(): DailyMission {
  const mission = loadDailyMission();

  if (!mission.completed) {
    mission.reviewProgress += 1;

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

export function updateLessonMission(): DailyMission {
  const mission = loadDailyMission();

  if (!mission.completed) {
    mission.lessonProgress += 1;

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
