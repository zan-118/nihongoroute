/**
 * @file dashboard-stats-engine.ts
 * @description Modul domain untuk format dan pengolahan data statistik dasbor.
 * @module features/dashboard
 */

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

/**
 * Format ID pengguna untuk tampilan dasbor (format ST- untuk auth, NP- untuk guest).
 *
 * @param {string | null | undefined} rawId ID asli dari Supabase atau lokal
 * @param {boolean} isAuthenticated Status autentikasi pengguna
 * @returns {string} ID yang terformat
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
 *
 * @param {UserStatsInput} input Data mentah dari store
 * @returns {ProgressSummary} Objek ringkasan progres
 */
export function buildProgressSummary(input: UserStatsInput): ProgressSummary {
  return {
    id: input.id || "guest",
    isGuest: !!input.isGuest,
    name: input.name || "Pelajar",
    xp: input.xp || 0,
    level: input.level || 1,
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
