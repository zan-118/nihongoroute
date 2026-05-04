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
}

export interface Settings {
  notificationsEnabled: boolean;
}

export interface UserProgress {
  name: string | null;
  xp: number;
  level: number;
  streak: number;
  todayReviewCount: number;
  lastStudyDate: string | null;
  studyDays: Record<string, number>;
  srs: Record<string, SRSState>;
  notifications: Notification[];
  inventory: Inventory;
  settings: Settings;
}
