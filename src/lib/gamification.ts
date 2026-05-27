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
 * Menggabungkan progres gamifikasi secara keseluruhan antara data lokal dan data cloud.
 * Menghasilkan satu objek terpadu yang memprioritaskan nilai tertinggi untuk XP/Streak,
 * menggabungkan studyDays, melakukan deduplikasi pada quest harian yang diklaim, serta
 * menyatukan pencapaian/lencana (achievements) secara aman dari kedua sumber.
 * 
 * @function mergeGamification
 * @param {GamificationData} local - Progres gamifikasi aktif yang tersimpan di client-side store lokal.
 * @param {GamificationData} cloud - Progres gamifikasi terbaru yang ditarik dari database Supabase cloud.
 * @returns {object} Objek gamifikasi hasil penggabungan yang menyatukan XP, Level, Streak, Study Days,
 *                   dan objek Inventory terdeduplikasi (streakFreeze, claimedQuests, achievements).
 * 
 * @effects
 * - Mengembalikan koleksi achievements hasil gabungan dengan mempertahankan stempel waktu (timestamp)
 *   unlockedAt yang paling awal untuk setiap ID pencapaian yang berhasil dipecahkan.
 * - Mencegah terjadinya pengulangan pencapaian (infinite badge unlocking loop) di sisi client.
 */
export function mergeGamification(local: GamificationData, cloud: GamificationData) {
  const mergedXP = Math.max(local.xp, cloud.xp);
  const mergedStreak = Math.max(local.streak, cloud.streak);
  const mergedStudyDays = mergeStudyDays(local.studyDays, cloud.studyDays);
  
  const today = getLocalDateString();
  const todayReviewCount = local.lastStudyDate === cloud.lastStudyDate 
    ? Math.max(local.todayReviewCount, cloud.todayReviewCount)
    : (local.lastStudyDate === today ? local.todayReviewCount : cloud.todayReviewCount);

  // Robust claimedQuests merging logic:
  // 1. Same date: merge quest arrays and deduplicate.
  // 2. Different dates: choose latest date (Last-Write-Wins lexicographically).
  const localClaimed = local.inventory?.claimedQuests || { date: "", quests: [] };
  const cloudClaimed = cloud.inventory?.claimedQuests || { date: "", quests: [] };
  let mergedQuests = { date: "", quests: [] as string[] };

  if (localClaimed.date === cloudClaimed.date) {
    mergedQuests = {
      date: localClaimed.date || today,
      quests: Array.from(new Set([
        ...(localClaimed.quests || []),
        ...(cloudClaimed.quests || [])
      ]))
    };
  } else {
    mergedQuests = localClaimed.date > cloudClaimed.date ? localClaimed : cloudClaimed;
  }

  // Merge achievements from local and cloud by taking the union of their IDs,
  // keeping the earliest unlockedAt timestamp for each.
  const localAchievements = local.inventory?.achievements || [];
  const cloudAchievements = cloud.inventory?.achievements || [];
  const achievementMap = new Map<string, number>();

  localAchievements.forEach((a) => {
    achievementMap.set(a.id, a.unlockedAt);
  });

  cloudAchievements.forEach((a) => {
    const existing = achievementMap.get(a.id);
    if (existing === undefined || a.unlockedAt < existing) {
      achievementMap.set(a.id, a.unlockedAt);
    }
  });

  const mergedAchievements = Array.from(achievementMap.entries()).map(([id, unlockedAt]) => ({
    id,
    unlockedAt
  }));

  return {
    xp: mergedXP,
    level: calculateLevel(mergedXP),
    streak: mergedStreak,
    studyDays: mergedStudyDays,
    todayReviewCount,
    inventory: {
      streakFreeze: Math.max(local.inventory?.streakFreeze || 0, cloud.inventory?.streakFreeze || 0),
      claimedQuests: mergedQuests,
      achievements: mergedAchievements
    }
  };
}
