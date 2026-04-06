export interface DailyMission {
  date: string;
  reviewGoal: number;
  lessonGoal: number;
  reviewProgress: number;
  lessonProgress: number;
  completed: boolean;
  rewardXP: number;
}

function getTodayString() {
  return new Date().toISOString().split("T")[0];
}

export function loadDailyMission(): DailyMission {
  const saved = localStorage.getItem("nihongo-daily");
  const today = getTodayString();

  if (!saved) {
    const mission = createNewMission(today);
    saveDailyMission(mission);
    return mission;
  }

  const parsed: DailyMission = JSON.parse(saved);

  if (parsed.date !== today) {
    const mission = createNewMission(today);
    saveDailyMission(mission);
    return mission;
  }

  return parsed;
}

export function saveDailyMission(mission: DailyMission) {
  localStorage.setItem("nihongo-daily", JSON.stringify(mission));
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
