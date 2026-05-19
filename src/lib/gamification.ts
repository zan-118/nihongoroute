import { calculateLevel } from "./level";
import { getLocalDateString } from "./utils";
import { Inventory } from "@/store/types";

export interface GamificationData {
  xp: number;
  streak: number;
  studyDays: Record<string, number>;
  lastStudyDate: string | null;
  todayReviewCount: number;
  inventory: Inventory;
}

/**
 * Menghitung streak baru berdasarkan tanggal belajar terakhir.
 * Mempertimbangkan penggunaan Streak Freeze jika tersedia.
 */
export function calculateNewStreak(
  currentStreak: number,
  lastStudyDate: string | null,
  inventory: Inventory,
  addNotification: (notif: { title: string; message: string; type: "info" | "success" | "warning" | "achievement" }) => void
): { streak: number; streakFreezeUsed: boolean } {
  const today = getLocalDateString();
  if (lastStudyDate === today) return { streak: currentStreak, streakFreezeUsed: false };

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const offset = yesterday.getTimezoneOffset() * 60000;
  const yesterdayStr = new Date(yesterday.getTime() - offset).toISOString().split("T")[0];

  if (lastStudyDate === yesterdayStr) {
    return { streak: currentStreak + 1, streakFreezeUsed: false };
  }

  // Jika bolos, cek apakah punya Streak Freeze
  if (inventory.streakFreeze > 0 && lastStudyDate !== null) {
    addNotification({
      title: "Streak Freeze Digunakan!",
      message: "Streak Anda terselamatkan oleh item Streak Freeze.",
      type: "warning"
    });
    return { streak: currentStreak + 1, streakFreezeUsed: true };
  }

  return { streak: 1, streakFreezeUsed: false };
}

/**
 * Menggabungkan data study days dari lokal dan cloud.
 */
export function mergeStudyDays(localDays: Record<string, number>, cloudDays: Record<string, number>): Record<string, number> {
  const merged = { ...cloudDays };
  Object.entries(localDays).forEach(([date, count]) => {
    merged[date] = Math.max(count, merged[date] || 0);
  });
  return merged;
}

/**
 * Menggabungkan progres gamifikasi secara keseluruhan.
 */
export function mergeGamification(local: GamificationData, cloud: GamificationData) {
  const mergedXP = Math.max(local.xp, cloud.xp);
  const mergedStreak = Math.max(local.streak, cloud.streak);
  const mergedStudyDays = mergeStudyDays(local.studyDays, cloud.studyDays);
  
  const today = getLocalDateString();
  const todayReviewCount = local.lastStudyDate === cloud.lastStudyDate 
    ? Math.max(local.todayReviewCount, cloud.todayReviewCount)
    : (local.lastStudyDate === today ? local.todayReviewCount : cloud.todayReviewCount);

  return {
    xp: mergedXP,
    level: calculateLevel(mergedXP),
    streak: mergedStreak,
    studyDays: mergedStudyDays,
    todayReviewCount,
    inventory: {
      streakFreeze: Math.max(local.inventory.streakFreeze, cloud.inventory.streakFreeze),
      claimedQuests: local.inventory.claimedQuests
    }
  };
}
