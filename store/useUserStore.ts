import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { get, set as idbSet, del } from "idb-keyval";
import { Inventory } from "./types";
import { calculateLevel } from "@/lib/level";
import { useUIStore } from "./useUIStore";

interface UserState {
  name: string | null;
  xp: number;
  level: number;
  streak: number;
  todayReviewCount: number;
  lastStudyDate: string | null;
  studyDays: Record<string, number>;
  inventory: Inventory;

  updateProfileName: (name: string) => void;
  addXP: (amount: number) => void;
  setGamification: (data: Partial<UserState>) => void;
  buyStreakFreeze: () => boolean;
  resetUser: () => void;
}

const idbStorage = {
  getItem: async (name: string) => (await get(name)) || null,
  setItem: async (name: string, value: string) => await idbSet(name, value),
  removeItem: async (name: string) => await del(name),
};

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      name: null,
      xp: 0,
      level: 1,
      streak: 0,
      todayReviewCount: 0,
      lastStudyDate: null,
      studyDays: {},
      inventory: {
        streakFreeze: 0
      },

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
        const COST = 500;
        if (state.xp < COST) return false;

        set({
          xp: state.xp - COST,
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

      resetUser: () => set({
        name: null,
        xp: 0,
        level: 1,
        streak: 0,
        todayReviewCount: 0,
        lastStudyDate: null,
        studyDays: {},
        inventory: { streakFreeze: 0 }
      }),
    }),
    {
      name: "nihongoroute_user_data",
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      storage: createJSONStorage(() => idbStorage as unknown as any),
    }
  )
);
