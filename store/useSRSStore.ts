import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { get, set as idbSet, del } from "idb-keyval";
import { SRSState, createNewCardState } from "@/lib/srs";
import { getLocalDateString } from "@/lib/utils";
import { calculateLevel } from "@/lib/level";
import { useUserStore } from "./useUserStore";
import { useUIStore } from "./useUIStore";
import { UserProgress } from "./types";

interface SRSStateStore {
  srs: Record<string, SRSState>;
  dirtySrs: Set<string>;
  
  setSRS: (srs: Record<string, SRSState>) => void;
  setDirtySrs: (updater: Set<string> | ((prev: Set<string>) => Set<string>)) => void;
  clearDirtySrs: (syncedIds?: string[]) => void;
  
  updateProgress: (newXp: number, srsUpdates: Record<string, SRSState>) => void;
  addToSRS: (wordId: string) => void;
  removeFromSRS: (wordId: string) => void;
  mergeProgress: (cloudData: UserProgress) => void;
  resetSRS: () => void;
}

const idbStorage = {
  getItem: async (name: string) => (await get(name)) || null,
  setItem: async (name: string, value: string) => await idbSet(name, value),
  removeItem: async (name: string) => await del(name),
};

// Custom serialization for Set because JSON.stringify doesn't support it
const storageWrapper = {
  getItem: async (name: string) => {
    const data = await idbStorage.getItem(name);
    if (!data) return null;
    const parsed = JSON.parse(data);
    if (parsed.state && parsed.state.dirtySrs) {
      parsed.state.dirtySrs = new Set(parsed.state.dirtySrs);
    }
    return JSON.stringify(parsed);
  },
  setItem: async (name: string, value: string) => {
    const parsed = JSON.parse(value);
    if (parsed.state && parsed.state.dirtySrs) {
      parsed.state.dirtySrs = Array.from(parsed.state.dirtySrs);
    }
    await idbSet(name, JSON.stringify(parsed));
  },
  removeItem: async (name: string) => await del(name),
};

export const useSRSStore = create<SRSStateStore>()(
  persist(
    (set, get) => ({
      srs: {},
      dirtySrs: new Set(),

      setSRS: (srs) => set({ srs }),

      setDirtySrs: (updater) => set((state) => ({ 
        dirtySrs: typeof updater === 'function' ? updater(state.dirtySrs) : updater 
      })),

      clearDirtySrs: (syncedIds) => set((state) => {
        if (!syncedIds) return { dirtySrs: new Set() };
        const newDirty = new Set(state.dirtySrs);
        syncedIds.forEach(id => newDirty.delete(id));
        return { dirtySrs: newDirty };
      }),

      updateProgress: (newXp, srsUpdates) => {
        const today = getLocalDateString();
        const userState = useUserStore.getState();
        
        const newDirty = new Set(get().dirtySrs);
        const newSrs = { ...get().srs };
        let srsChanged = false;

        Object.keys(srsUpdates).forEach((id) => {
          newSrs[id] = srsUpdates[id];
          newDirty.add(id);
          srsChanged = true;
        });

        if (srsChanged) {
          let { streak, todayReviewCount, lastStudyDate } = userState;
          const { inventory, studyDays } = userState;
          const newStudyDays = { ...studyDays };
          let newStreakFreeze = inventory?.streakFreeze || 0;

          todayReviewCount += 1;

          if (lastStudyDate !== today) {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            const offset = yesterday.getTimezoneOffset() * 60000;
            const yesterdayStr = new Date(yesterday.getTime() - offset).toISOString().split("T")[0];

            if (lastStudyDate === yesterdayStr) {
              streak += 1;
            } else if (newStreakFreeze > 0 && lastStudyDate !== null) {
              newStreakFreeze -= 1;
              useUIStore.getState().addNotification({
                title: "Streak Freeze Digunakan!",
                message: "Streak Anda terselamatkan oleh item Streak Freeze.",
                type: "warning"
              });
              streak += 1;
            } else {
              streak = 1;
            }

            lastStudyDate = today;
            newStudyDays[today] = (newStudyDays[today] || 0) + 1;
          } else {
            newStudyDays[today] = (newStudyDays[today] || 0) + 1;
          }

          useUserStore.getState().setGamification({
            xp: newXp,
            level: calculateLevel(newXp),
            streak,
            todayReviewCount,
            lastStudyDate,
            studyDays: newStudyDays,
            inventory: { ...inventory, streakFreeze: newStreakFreeze }
          });
        } else {
          useUserStore.getState().addXP(newXp - userState.xp);
        }

        set({ srs: newSrs, dirtySrs: newDirty });
      },

      addToSRS: (wordId) => {
        if (get().srs[wordId]) return;
        get().updateProgress(useUserStore.getState().xp, {
          [wordId]: createNewCardState(),
        });
      },

      removeFromSRS: (wordId) => {
        if (!get().srs[wordId]) return;
        const newDirty = new Set(get().dirtySrs);
        newDirty.add(wordId);
        const newSrs = { ...get().srs };
        newSrs[wordId] = {
          ...newSrs[wordId],
          isDeleted: true,
          updatedAt: Date.now()
        };
        set({ srs: newSrs, dirtySrs: newDirty });
      },

      mergeProgress: (cloudData) => {
        const localSrs = get().srs;
        const userState = useUserStore.getState();
        const uiState = useUIStore.getState();
        
        // 1. Merge Gamification
        const mergedXP = Math.max(userState.xp, cloudData.xp);
        const mergedStreak = Math.max(userState.streak, cloudData.streak);
        
        // 2. Merge Study Days
        const mergedStudyDays = { ...cloudData.studyDays };
        Object.entries(userState.studyDays).forEach(([date, count]) => {
          mergedStudyDays[date] = Math.max(count, mergedStudyDays[date] || 0);
        });

        // 3. Merge SRS
        const mergedSrs = { ...cloudData.srs };
        const newDirty = new Set(get().dirtySrs);

        Object.entries(localSrs).forEach(([id, localState]) => {
          const cloudState = cloudData.srs[id];
          if (localState.isDeleted) {
            if (cloudState) {
              newDirty.add(id);
              delete mergedSrs[id];
            }
            return;
          }
          if (!cloudState) {
            mergedSrs[id] = localState;
            newDirty.add(id);
          } else {
            if (localState.updatedAt > cloudState.updatedAt) {
              mergedSrs[id] = localState;
              newDirty.add(id);
            } else {
              mergedSrs[id] = cloudState;
              newDirty.delete(id);
            }
          }
        });

        // 4. Update User Store
        useUserStore.getState().setGamification({
          name: cloudData.name || userState.name,
          xp: mergedXP,
          level: calculateLevel(mergedXP),
          streak: mergedStreak,
          studyDays: mergedStudyDays,
          inventory: {
            streakFreeze: Math.max(userState.inventory.streakFreeze, cloudData.inventory.streakFreeze)
          },
          todayReviewCount: userState.lastStudyDate === cloudData.lastStudyDate 
            ? Math.max(userState.todayReviewCount, cloudData.todayReviewCount)
            : (userState.lastStudyDate === getLocalDateString() ? userState.todayReviewCount : cloudData.todayReviewCount)
        });

        // 5. Update UI Store
        uiState.toggleNotifications(cloudData.settings.notificationsEnabled);
        // Notifications merge is omitted here for simplicity, or can be handled in UI store

        set({ srs: mergedSrs, dirtySrs: newDirty });
      },

      resetSRS: () => set({ srs: {}, dirtySrs: new Set() }),
    }),
    {
      name: "nihongoroute_srs_data",
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      storage: createJSONStorage(() => storageWrapper as unknown as any),
    }
  )
);
