/**
 * @file useUserStore.ts
 * @description Zustand Store luring pengelola profil pengguna, data progres gamifikasi (XP, level, streak), data transaksi inventaris item virtual (Streak Freeze), log hari aktif belajar, serta riwayat penyelesaian pelajaran. Terhubung dengan IndexedDB via idb-keyval.
 */

// ==========================================
// IMPORT & DEPENDENSI
// ==========================================
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { get, set as idbSet, del } from "idb-keyval";
import { Inventory, LessonProgress, UserProgress } from "./types";
import { calculateLevel } from "@/lib/level";
import { useUIStore } from "./useUIStore";
import { ACHIEVEMENTS_LIST } from "@/lib/constants/gamification";

// ==========================================
// ANTARMUKA STATE STORE
// ==========================================
/**
 * User state interface. Track progress, XP, level, streak, inventory, lessons.
 */
interface UserState {
  /** User ID. */
  id: string;
  /** Guest flag. */
  isGuest: boolean;
  /** User display name. */
  name: string | null;
  /** Total experience points. */
  xp: number;
  /** Current level. */
  level: number;
  /** Daily streak count. */
  streak: number;
  /** Reviews done today. */
  todayReviewCount: number;
  /** Last active date. */
  lastStudyDate: string | null;
  /** Map of study dates to review counts. */
  studyDays: Record<string, number>;
  /** User items and achievements. */
  inventory: Inventory;
  /** Map of completed lesson progress. */
  completedLessons: Record<string, LessonProgress>;
  /** Unsynced lesson IDs. */
  dirtyLessons: Set<string>;

  /** Update profile name. */
  updateProfileName: (name: string) => void;
  /** Add XP. Level up if threshold met. */
  addXP: (amount: number) => void;
  /** Update gamification state. */
  setGamification: (data: Partial<UserState>) => void;
  /** Buy streak freeze item. Deduct XP. */
  buyStreakFreeze: () => boolean;
  /** Claim quest reward. */
  claimQuest: (questId: string, date: string, rewardXP: number) => void;
  /** Mark lesson completed. Add to dirty set. */
  completeLesson: (lessonId: string) => void;
  /** Update dirty lessons set. */
  setDirtyLessons: (updater: Set<string> | ((prev: Set<string>) => Set<string>)) => void;
  /** Remove synced IDs from dirty set. */
  clearDirtyLessons: (syncedIds?: string[]) => void;
  /** Sync user profile data. */
  syncUserData: (data: { id: string; isGuest: boolean; name?: string | null }) => void;
  /** Reset state to guest defaults. */
  resetUser: () => void;
  /** Evaluate achievements. Award XP. */
  checkAchievements: () => void;
  /** Lock flag for achievement check. */
  isCheckingAchievements?: boolean;
}

// ==========================================
// BIAYA ITEM & KONSTANTA
// ==========================================
/** XP cost for streak freeze. */
export const STREAK_FREEZE_COST = 500;

/**
 * Zustand store for user data.
 * Persisted to IndexedDB via idb-keyval.
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
      isCheckingAchievements: false,

      updateProfileName: (name) => set({ name }),

      addXP: (amount: number) => {
        const currentXp = get().xp;
        const newXp = currentXp + amount;
        const currentLevel = get().level;
        // Calculate new level from XP.
        const newLevel = calculateLevel(newXp);

        set({
          xp: newXp,
          level: newLevel,
        });

        // Notify user on level up.
        if (newLevel > currentLevel) {
          useUIStore.getState().addNotification({
            title: "Level Up!",
            message: `Selamat! Kamu sekarang berada di Level ${newLevel}. 🎉`,
            type: "achievement"
          });
        }

        // Check achievements after XP gain.
        get().checkAchievements();
      },

      setGamification: (data) => {
        set((state) => ({ ...state, ...data }));
        get().checkAchievements();
      },

      buyStreakFreeze: () => {
        const state = get();
        // Check XP balance.
        if (state.xp < STREAK_FREEZE_COST) return false;

        // Deduct XP. Increment item count.
        set({
          xp: state.xp - STREAK_FREEZE_COST,
          inventory: {
            ...state.inventory,
            streakFreeze: (state.inventory.streakFreeze || 0) + 1
          }
        });

        useUIStore.getState().addNotification({
          title: "Pembelian Berhasil!",
          message: "Streak Freeze udah masuk ke koleksimu!",
          type: "success"
        });

        return true;
      },

      claimQuest: (questId: string, date: string, rewardXP: number) => {
        const state = get();
        const currentClaimed = state.inventory.claimedQuests;
        
        let newQuests = [...(currentClaimed?.quests || [])];
        
        // Reset quests if new day.
        if (currentClaimed?.date !== date) {
          newQuests = [];
        }
        
        // Add quest if not claimed.
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
          
          // Add reward XP.
          state.addXP(rewardXP);
        }
      },

      completeLesson: (lessonId) => {
        const state = get();
        // Skip if already completed.
        if (state.completedLessons[lessonId] && !state.completedLessons[lessonId].isDeleted) return;

        const now = Date.now();
        const newCompleted = { ...state.completedLessons };
        newCompleted[lessonId] = {
          completedAt: state.completedLessons[lessonId]?.completedAt || now,
          updatedAt: now,
          isDeleted: false
        };

        // Mark dirty for sync.
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
        // Skip in Vitest environment.
        if (typeof process !== "undefined" && process.env?.VITEST) {
          return;
        }

        // Prevent concurrent checks.
        if (get().isCheckingAchievements) return;
        set({ isCheckingAchievements: true });

        try {

        const state = get();
        const achievements = state.inventory?.achievements || [];
        const unlockedIds = new Set(achievements.map((a) => a.id));

        // Get SRS store dynamically to avoid circular import.
        const srsStore = typeof window !== "undefined" ? (window as unknown as Record<string, { getState: () => { srs: Record<string, { isDeleted?: boolean; repetition?: number }> } }>).useSRSStore : null;
        const srsState = srsStore ? srsStore.getState().srs || {} : {};

        const completedLessonsKeysObj: Record<string, boolean> = {};
        if (state.completedLessons) {
          for (const key in state.completedLessons) {
            if (Object.prototype.hasOwnProperty.call(state.completedLessons, key)) {
              const lesson = state.completedLessons[key];
              if (lesson && !lesson.isDeleted) {
                completedLessonsKeysObj[key] = true;
              }
            }
          }
        }

        const srsKeysObj: Record<string, boolean> = {};
        if (srsState) {
          for (const key in srsState) {
            if (Object.prototype.hasOwnProperty.call(srsState, key)) {
              const card = srsState[key];
              if (card && !card.isDeleted) {
                srsKeysObj[key] = true;
              }
            }
          }
        }

        // Build payload for condition check.
        const progressPayload = {
          id: state.id,
          isGuest: state.isGuest,
          name: state.name,
          xp: state.xp,
          level: state.level,
          streak: state.streak,
          todayReviewCount: state.todayReviewCount,
          lastStudyDate: state.lastStudyDate,
          studyDays: state.studyDays,
          inventory: state.inventory,
          completedLessons: completedLessonsKeysObj,
          srs: srsKeysObj,
          notifications: [],
          settings: {}
        } as unknown as UserProgress;

        // XP rewards map.
        const ACHIEVEMENT_XP_REWARDS: Record<string, number> = {
          first_steps: 50,
          lesson_bronze: 50,
          xp_bronze: 50,
          streak_bronze: 50,
          vocab_explorer: 150,
          vocab_collector: 300,
          vocab_master: 500,
          streak_silver: 500,
          vocab_titan: 1000,
          streak_gold: 1000,
          lesson_gold: 1000,
          xp_gold: 1000,
          level_25: 1000,
          vocab_legend: 2000,
          streak_warrior: 250,
          lesson_silver: 250,
          xp_silver: 250,
          xp_master: 500,
          level_10: 500,
          perfect_review: 500,
        };

        const newlyUnlocked: Array<{ id: string; unlockedAt: number }> = [];
        let totalRewardXp = 0;

        // Check each locked achievement.
        for (const ach of ACHIEVEMENTS_LIST) {
          if (unlockedIds.has(ach.id)) continue;

          try {
            const pct = ach.condition(progressPayload);
            if (pct >= 100) {
              const rewardXp = ACHIEVEMENT_XP_REWARDS[ach.id] || 50;
              newlyUnlocked.push({ id: ach.id, unlockedAt: Date.now() });
              totalRewardXp += rewardXp;

              useUIStore.getState().addNotification({
                title: "Lencana Terbuka!",
                message: `Mantap! Kamu berhasil membuka lencana '${ach.title}': ${ach.description}. (+${rewardXp} XP)`,
                type: "achievement"
              });
            }
          } catch (err) {
            console.error(`Gagal memverifikasi pencapaian ${ach.id}:`, err);
          }
        }

        // Save unlocked achievements. Add XP.
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
        } finally {
          set({ isCheckingAchievements: false });
        }
      }
    }),
    {
      name: "nihongoroute_user_data",
      storage: {
        // Load state from IndexedDB. Parse Set.
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
            console.error("Gagal mengurai data user store:", e);
            return null;
          }
        },
        // Save state to IndexedDB. Stringify Set.
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
            console.error("Gagal menyimpan data user store:", e);
          }
        },
        // Delete state from IndexedDB.
        removeItem: async (name) => await del(name),
      },
    }
  )
);