import { create } from "zustand";
import { persist } from "zustand/middleware";
import { get, set as idbSet, del } from "idb-keyval";
import { Inventory, LessonProgress } from "./types";
import { calculateLevel } from "@/lib/level";
import { useUIStore } from "./useUIStore";

/**
 * Interface: UserState
 * 
 * Mendefinisikan struktur data progres belajar dan aksi gamifikasi milik pengguna.
 * Mengelola XP, level, rekor hari beruntun (streak), inventarisasi item,
 * riwayat pelajaran yang telah diselesaikan, serta penandaan pelajaran kotor (dirtyLessons).
 */
interface UserState {
  id: string;
  isGuest: boolean;
  name: string | null;
  xp: number;
  level: number;
  streak: number;
  todayReviewCount: number;
  lastStudyDate: string | null;
  studyDays: Record<string, number>;
  inventory: Inventory;
  completedLessons: Record<string, LessonProgress>;
  dirtyLessons: Set<string>;

  updateProfileName: (name: string) => void;
  addXP: (amount: number) => void;
  setGamification: (data: Partial<UserState>) => void;
  buyStreakFreeze: () => boolean;
  claimQuest: (questId: string, date: string, rewardXP: number) => void;
  completeLesson: (lessonId: string) => void;
  setDirtyLessons: (updater: Set<string> | ((prev: Set<string>) => Set<string>)) => void;
  clearDirtyLessons: (syncedIds?: string[]) => void;
  syncUserData: (data: { id: string; isGuest: boolean; name?: string | null }) => void;
  resetUser: () => void;
  checkAchievements: () => void;
}

/** Biaya XP untuk membeli Streak Freeze. Exported sebagai satu sumber kebenaran. */
export const STREAK_FREEZE_COST = 500;

/**
 * Zustand Store: useUserStore
 * 
 * Mengelola status utama gamifikasi, pencapaian prestasi (achievements), riwayat harian belajar,
 * penyelesaian kuis mini pelajaran, serta data inventarisasi (seperti item Streak Freeze).
 * State store ini di-persist otomatis ke IndexedDB peramban via `idb-keyval`.
 */
export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      id: "guest",
      isGuest: true,
      name: null,
      xp: 0,
      level: 1,
      streak: 0,
      todayReviewCount: 0,
      lastStudyDate: null,
      studyDays: {},
      inventory: {
        streakFreeze: 0,
        claimedQuests: {
          date: "",
          quests: []
        },
        achievements: []
      },
      completedLessons: {},
      dirtyLessons: new Set<string>(),

      updateProfileName: (name) => set({ name }),

      addXP: (amount: number) => {
        const currentXp = get().xp;
        const newXp = currentXp + amount;
        const currentLevel = get().level;
        const newLevel = calculateLevel(newXp);

        set({
          xp: newXp,
          level: newLevel,
        });

        if (newLevel > currentLevel) {
          useUIStore.getState().addNotification({
            title: "Level Up!",
            message: `Selamat! Anda sekarang berada di Level ${newLevel}.`,
            type: "achievement"
          });
        }

        get().checkAchievements();
      },

      setGamification: (data) => {
        set((state) => ({ ...state, ...data }));
        get().checkAchievements();
      },

      buyStreakFreeze: () => {
        const state = get();
        if (state.xp < STREAK_FREEZE_COST) return false;

        set({
          xp: state.xp - STREAK_FREEZE_COST,
          inventory: {
            ...state.inventory,
            streakFreeze: (state.inventory.streakFreeze || 0) + 1
          }
        });

        useUIStore.getState().addNotification({
          title: "Pembelian Berhasil!",
          message: "Streak Freeze telah ditambahkan ke koleksi Anda.",
          type: "success"
        });

        return true;
      },

      claimQuest: (questId: string, date: string, rewardXP: number) => {
        const state = get();
        const currentClaimed = state.inventory.claimedQuests;
        
        let newQuests = [...(currentClaimed?.quests || [])];
        
        // Reset if date is different
        if (currentClaimed?.date !== date) {
          newQuests = [];
        }
        
        if (!newQuests.includes(questId)) {
          newQuests.push(questId);
          
          set({
            inventory: {
              ...state.inventory,
              claimedQuests: {
                date,
                quests: newQuests
              }
            }
          });
          
          // Add the XP reward locally (will be validated and synced by backend)
          state.addXP(rewardXP);
        }
      },

      completeLesson: (lessonId) => {
        const state = get();
        if (state.completedLessons[lessonId] && !state.completedLessons[lessonId].isDeleted) return;

        const now = Date.now();
        const newCompleted = { ...state.completedLessons };
        newCompleted[lessonId] = {
          completedAt: state.completedLessons[lessonId]?.completedAt || now,
          updatedAt: now,
          isDeleted: false
        };

        const newDirty = new Set(state.dirtyLessons);
        newDirty.add(lessonId);

        set({
          completedLessons: newCompleted,
          dirtyLessons: newDirty
        });

        get().checkAchievements();
      },

      setDirtyLessons: (updater) => set((state) => ({ 
        dirtyLessons: typeof updater === 'function' ? updater(state.dirtyLessons) : updater 
      })),

      clearDirtyLessons: (syncedIds) => set((state) => {
        if (!syncedIds) return { dirtyLessons: new Set() };
        const newDirty = new Set(state.dirtyLessons);
        syncedIds.forEach(id => newDirty.delete(id));
        return { dirtyLessons: newDirty };
      }),
      
      syncUserData: (data) => set((state) => ({ 
        ...state, 
        id: data.id, 
        isGuest: data.isGuest,
        name: data.name !== undefined ? data.name : state.name
      })),

      resetUser: () => set({
        id: "guest",
        isGuest: true,
        name: null,
        xp: 0,
        level: 1,
        streak: 0,
        todayReviewCount: 0,
        lastStudyDate: null,
        studyDays: {},
        inventory: { 
          streakFreeze: 0,
          claimedQuests: {
            date: "",
            quests: []
          },
          achievements: []
        },
        completedLessons: {},
        dirtyLessons: new Set<string>()
      }),

      checkAchievements: () => {
        if (typeof process !== "undefined" && process.env?.VITEST) {
          return;
        }

        const state = get();
        const achievements = state.inventory?.achievements || [];
        const unlockedIds = new Set(achievements.map((a) => a.id));

        const lessonsCompleted = Object.values(state.completedLessons || {}).filter((l) => !l.isDeleted).length;
        const currentXp = state.xp;
        const currentStreak = state.streak;

        // Dapatkan data SRS secara aman dan sinkron dari global window untuk menghindari circular dependency
        const srsStore = typeof window !== "undefined" ? (window as unknown as Record<string, { getState: () => { srs: Record<string, { isDeleted?: boolean; repetition?: number }> } }>).useSRSStore : null;
        const srsState = srsStore ? srsStore.getState().srs || {} : {};
        const totalReviews = Object.values(srsState).reduce(
          (sum: number, card: { isDeleted?: boolean; repetition?: number }) => sum + (card.isDeleted ? 0 : card.repetition || 0),
          0
        );

        const targets = [
          // Lessons
          { id: "lesson_bronze", check: lessonsCompleted >= 1, xp: 50, title: "Pahlawan Belajar (Bronze)", msg: "Menyelesaikan 1 Pelajaran" },
          { id: "lesson_silver", check: lessonsCompleted >= 5, xp: 250, title: "Pahlawan Belajar (Silver)", msg: "Menyelesaikan 5 Pelajaran" },
          { id: "lesson_gold", check: lessonsCompleted >= 20, xp: 1000, title: "Pahlawan Belajar (Gold)", msg: "Menyelesaikan 20 Pelajaran" },

          // XP
          { id: "xp_bronze", check: currentXp >= 500, xp: 50, title: "Prajurit XP (Bronze)", msg: "Mengumpulkan 500 XP" },
          { id: "xp_silver", check: currentXp >= 2500, xp: 250, title: "Prajurit XP (Silver)", msg: "Mengumpulkan 2500 XP" },
          { id: "xp_gold", check: currentXp >= 10000, xp: 1000, title: "Prajurit XP (Gold)", msg: "Mengumpulkan 10000 XP" },

          // Streak
          { id: "streak_bronze", check: currentStreak >= 3, xp: 50, title: "Pendekar Streak (Bronze)", msg: "Mencapai 3 Hari Streak" },
          { id: "streak_silver", check: currentStreak >= 7, xp: 250, title: "Pendekar Streak (Silver)", msg: "Mencapai 7 Hari Streak" },
          { id: "streak_gold", check: currentStreak >= 30, xp: 1000, title: "Pendekar Streak (Gold)", msg: "Mencapai 30 Hari Streak" },

          // SRS Reviews
          { id: "srs_bronze", check: totalReviews >= 10, xp: 50, title: "Ahli Ulasan (Bronze)", msg: "Menyelesaikan 10 Ulasan Kartu" },
          { id: "srs_silver", check: totalReviews >= 100, xp: 250, title: "Ahli Ulasan (Silver)", msg: "Menyelesaikan 100 Ulasan Kartu" },
          { id: "srs_gold", check: totalReviews >= 500, xp: 1000, title: "Ahli Ulasan (Gold)", msg: "Menyelesaikan 500 Ulasan Kartu" }
        ];

        const newlyUnlocked: Array<{ id: string; unlockedAt: number }> = [];
        let totalRewardXp = 0;

        for (const t of targets) {
          if (t.check && !unlockedIds.has(t.id)) {
            newlyUnlocked.push({ id: t.id, unlockedAt: Date.now() });
            totalRewardXp += t.xp;

            useUIStore.getState().addNotification({
              title: "Lencana Terbuka!",
              message: `Selamat! Anda berhasil membuka lencana '${t.title}': ${t.msg}. (+${t.xp} XP)`,
              type: "achievement"
            });
          }
        }

        if (newlyUnlocked.length > 0) {
          const updatedAchievements = [...achievements, ...newlyUnlocked];
          set({
            inventory: {
              ...state.inventory,
              achievements: updatedAchievements
            }
          });

          if (totalRewardXp > 0) {
            get().addXP(totalRewardXp);
          }
        }
      }
    }),
    {
      name: "nihongoroute_user_data",
      storage: {
        getItem: async (name) => {
          const data = await get(name);
          if (!data) return null;
          
          try {
            const parsed = JSON.parse(data, (key, value) => {
              if (key === 'dirtyLessons' && Array.isArray(value)) {
                return new Set(value);
              }
              return value;
            });
            return { state: parsed.state, version: parsed.version };
          } catch (e) {
            console.error("Failed to parse user store data:", e);
            return null;
          }
        },
        setItem: async (name, value) => {
          try {
            const stringified = JSON.stringify(value, (key, val) => {
              if (val instanceof Set) {
                return Array.from(val);
              }
              return val;
            });
            await idbSet(name, stringified);
          } catch (e) {
            console.error("Failed to save user store data:", e);
          }
        },
        removeItem: async (name) => await del(name),
      },
    }
  )
);
