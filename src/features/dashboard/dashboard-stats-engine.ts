/**
 * @file dashboard-stats-engine.ts
 * @description Domain module for formatting and calculating dashboard statistics, progress summaries, and level calculations.
 * @module features/dashboard
 */

import { calculateLevel, xpForCurrentLevel, xpForNextLevel, getLevelProgressPercent } from "@/lib/gamification/level";

export interface UserStatsInput {
 id?: string | null;
 isGuest?: boolean;
 name?: string | null;
 xp?: number;
 level?: number;
 streak?: number;
 todayReviewCount?: number;
 lastStudyDate?: string | null;
 studyDays?: Record<string, number>;
 inventory?: { streakFreeze?: number; claimedQuests?: { date: string; quests: string[] } };
 settings?: { notificationsEnabled?: boolean };
}

export interface ProgressSummary {
 id: string;
 isGuest: boolean;
 name: string;
 xp: number;
 level: number;
 streak: number;
 todayReviewCount: number;
 lastStudyDate: string | null;
 studyDays: Record<string, number>;
 inventory: { streakFreeze: number; claimedQuests: { date: string; quests: string[] } };
 settings: { notificationsEnabled: boolean };
 completedLessons: Record<string, boolean>;
}

export interface DashboardLevelMetrics {
 currentLevel: number;
 currentLevelXp: number;
 nextLevelXp: number;
 progressPercent: number;
}

export interface DashboardStreakMetrics {
 streak: number;
 hasStudiedToday: boolean;
 streakFreezeCount: number;
}

export interface DashboardGoalMetrics {
 todayReviewCount: number;
 dailyTarget: number;
 goalPercent: number;
 isTargetReached: boolean;
}

/**
 * Format ID pengguna untuk tampilan dasbor (format ST- untuk auth, NP- untuk guest).
 */
export function formatUserIdentifier(rawId?: string | null, isAuthenticated?: boolean): string {
 if (isAuthenticated && rawId) {
 return "ST-" + rawId.substring(0, 8).toUpperCase();
 }
 if (rawId) {
 return rawId;
 }
 return "NP-" + Math.random().toString(36).substring(2, 8).toUpperCase();
}

/**
 * Membangun struktur data ringkasan progres pengguna secara konsisten.
 */
export function buildProgressSummary(input: UserStatsInput): ProgressSummary {
 return {
 id: input.id || "guest",
 isGuest: !!input.isGuest,
 name: input.name || "Pelajar",
 xp: input.xp || 0,
 level: input.level || calculateLevel(input.xp || 0),
 streak: input.streak || 0,
 todayReviewCount: input.todayReviewCount || 0,
 lastStudyDate: input.lastStudyDate || null,
 studyDays: input.studyDays || {},
 inventory: {
 streakFreeze: input.inventory?.streakFreeze || 0,
 claimedQuests: input.inventory?.claimedQuests || { date: "", quests: [] },
 },
 settings: {
 notificationsEnabled: input.settings?.notificationsEnabled ?? true,
 },
 completedLessons: {},
 };
}

/**
 * Calculates level progress metrics for dashboard display.
 */
export function calculateDashboardLevelMetrics(xp: number): DashboardLevelMetrics {
 const currentLevel = calculateLevel(xp);
 const currentLevelXp = xpForCurrentLevel(currentLevel);
 const nextLevelXp = xpForNextLevel(currentLevel);
 const progressPercent = getLevelProgressPercent(xp, currentLevel);

 return {
 currentLevel,
 currentLevelXp,
 nextLevelXp,
 progressPercent: Math.round(progressPercent),
 };
}

/**
 * Calculates streak status for dashboard.
 */
export function calculateDashboardStreakMetrics(
 streak: number,
 lastStudyDate: string | null,
 streakFreezeCount: number = 0
): DashboardStreakMetrics {
 const todayStr = new Date().toISOString().split("T")[0];
 const hasStudiedToday = lastStudyDate === todayStr;

 return {
 streak: Math.max(0, streak),
 hasStudiedToday,
 streakFreezeCount: Math.max(0, streakFreezeCount),
 };
}

/**
 * Calculates daily review goal metrics.
 */
export function calculateDashboardGoalMetrics(
 todayReviewCount: number,
 dailyTarget: number = 20
): DashboardGoalMetrics {
 const safeTarget = Math.max(1, dailyTarget);
 const safeCount = Math.max(0, todayReviewCount);
 const goalPercent = Math.min(100, Math.round((safeCount / safeTarget) * 100));

 return {
 todayReviewCount: safeCount,
 dailyTarget: safeTarget,
 goalPercent,
 isTargetReached: safeCount >= safeTarget,
 };
}
