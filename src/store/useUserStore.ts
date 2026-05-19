import { create } from "zustand";
import { persist } from "zustand/middleware";
import { get, set as idbSet, del } from "idb-keyval";
import { Inventory, LessonProgress } from "./types";
import { calculateLevel } from "@/lib/level";
import { useUIStore } from "./useUIStore";

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
}



/** Biaya XP untuk membeli Streak Freeze. Exported sebagai satu sumber kebenaran. */
export const STREAK_FREEZE_COST = 500;

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
        }
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
      },

      setGamification: (data) => set((state) => ({ ...state, ...data })),

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
          }
        },
        completedLessons: {},
        dirtyLessons: new Set<string>()
      }),
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
