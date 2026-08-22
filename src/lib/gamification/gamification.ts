/**
 * @file gamification.ts
 * @description Offline-first gamification engine (streaks, XP calculation, daily quests, and achievement badges).
 * Contains streak increment logic and reconciliation algorithms for cloud and local state merging.
 */

// Import & Dependencies

import { calculateLevel } from "./level";
import { getLocalDateString } from "@/lib/utils";
import { Inventory } from "@/store/types";

// Gamification Data Interfaces

/**
 * Gamification state structure.
 */
export interface GamificationData {
 /** Total experience points accumulated. */
 xp: number;
 /** Current consecutive study streak in days. */
 streak: number;
 /** Record of study dates mapped to review counts. */
 studyDays: Record<string, number>;
 /** ISO date string of the last study session. */
 lastStudyDate: string | null;
 /** Number of reviews completed today. */
 todayReviewCount: number;
 /** User inventory containing items and achievements. */
 inventory: Inventory;
}

// FUNGSI UTILITAS & LOGIKA BISNIS

/**
 * Menghitung streak baru berdasarkan tanggal belajar terakhir.
 * Mempertimbangkan penggunaan Streak Freeze jika tersedia.
 * 
 * @param {number} currentStreak - Nilai streak pengguna aktif saat ini
 * @param {string | null} lastStudyDate - Tanggal aktivitas belajar terakhir kali
 * @param {Inventory} inventory - Status inventaris item milik pengguna
 * @param {Function} addNotification - Callback pemicu in-app notification
 * @returns {Object} Nilai streak baru dan status penggunaan item Streak Freeze
 */
export function calculateNewStreak(
 currentStreak: number,
 lastStudyDate: string | null,
 inventory: Inventory,
 addNotification: (notif: { title: string; message: string; type: "info" | "success" | "warning" | "achievement" }) => void
): { streak: number; streakFreezeUsed: boolean } {
 const today = getLocalDateString();
 // Already studied today, streak remains unchanged
 if (lastStudyDate === today) return { streak: currentStreak, streakFreezeUsed: false };

 const yesterday = new Date();
 yesterday.setDate(yesterday.getDate() - 1);
 // Adjust for local timezone offset to prevent date mismatch
 const offset = yesterday.getTimezoneOffset() * 60000;
 const yesterdayStr = new Date(yesterday.getTime() - offset).toISOString().split("T")[0];

 // Studied yesterday, increment streak
 if (lastStudyDate === yesterdayStr) {
 return { streak: currentStreak + 1, streakFreezeUsed: false };
 }

 // Jika bolos, cek apakah punya Streak Freeze
 if (inventory.streakFreeze > 0 && lastStudyDate !== null) {
 addNotification({
 title: "Streak Freeze Digunakan!",
 message: "Streak-mu berhasil diselamatkan oleh Streak Freeze!",
 type: "warning"
 });
 return { streak: currentStreak + 1, streakFreezeUsed: true };
 }

 // Streak reset to 1 if no freeze item is available
 return { streak: 1, streakFreezeUsed: false };
}

/**
 * Menggabungkan data study days dari lokal dan cloud.
 * 
 * @param localDays - Local study days record.
 * @param cloudDays - Cloud study days record.
 * @returns Merged study days record.
 */
export function mergeStudyDays(localDays: Record<string, number>, cloudDays: Record<string, number>): Record<string, number> {
 const merged = { ...cloudDays };
 Object.entries(localDays).forEach(([date, count]) => {
 // Keep the highest review count for each date
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
 * dan objek Inventory terdeduplikasi (streakFreeze, claimedQuests, achievements).
 * 
 * @effects
 * - Mengembalikan koleksi achievements hasil gabungan dengan mempertahankan stempel waktu (timestamp)
 * unlockedAt yang paling awal untuk setiap ID pencapaian yang berhasil dipecahkan.
 * - Mencegah terjadinya pengulangan pencapaian (infinite badge unlocking loop) di sisi client.
 */
export function mergeGamification(local: GamificationData, cloud: GamificationData) {
 // Resolve XP and streak conflicts by taking maximum values
 const mergedXP = Math.max(local.xp, cloud.xp);
 const mergedStreak = Math.max(local.streak, cloud.streak);
 const mergedStudyDays = mergeStudyDays(local.studyDays, cloud.studyDays);
 
 const today = getLocalDateString();
 // Resolve today's review count based on date match
 const todayReviewCount = local.lastStudyDate === cloud.lastStudyDate 
 ? Math.max(local.todayReviewCount, cloud.todayReviewCount)
 : (local.lastStudyDate === today ? local.todayReviewCount : cloud.todayReviewCount);

 // Logika penggabungan claimedQuests yang kokoh:
 // 1. Tanggal sama: gabungkan array quest dan lakukan deduplikasi.
 // 2. Tanggal berbeda: pilih tanggal terbaru (Last-Write-Wins secara leksikografis).
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

 // Gabungkan achievements dari lokal dan awan dengan mengambil gabungan ID mereka,
 // serta mempertahankan stempel waktu unlockedAt yang paling awal untuk masing-masing.
 const localAchievements = local.inventory?.achievements || [];
 const cloudAchievements = cloud.inventory?.achievements || [];
 const achievementMap = new Map<string, number>();

 // Map local achievements with unlock timestamps
 localAchievements.forEach((a) => {
 achievementMap.set(a.id, a.unlockedAt);
 });

 // Merge cloud achievements, keeping the earliest unlock timestamp
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