import { SRSState } from "@/lib/srs";

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "achievement";
  timestamp: number;
  read: boolean;
}

export interface Inventory {
  streakFreeze: number;
  /** claimedQuests disimpan di client-side / local state, bukan kolom DB */
  claimedQuests?: {
    date: string;
    quests: string[];
  };
}

export interface Settings {
  notificationsEnabled: boolean;
  /** Field berikut disimpan di client-side / local state, bukan kolom DB */
  dailyReviewGoal?: number;
  dailyLessonGoal?: number;
  showFurigana?: boolean;
}

export interface LessonProgress {
  completedAt: number;
  updatedAt: number;
  isDeleted?: boolean;
}

export interface UserProgress {
  id: string;
  isGuest: boolean;
  name: string | null;
  xp: number;
  level: number;
  streak: number;
  todayReviewCount: number;
  lastStudyDate: string | null;
  studyDays: Record<string, number>;
  srs: Record<string, SRSState>;
  completedLessons: Record<string, LessonProgress>;
  notifications: Notification[];
  inventory: Inventory;
  settings: Settings;
}
