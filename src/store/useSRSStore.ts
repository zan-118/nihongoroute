import { create } from "zustand";
import { persist } from "zustand/middleware";
import { get, set as idbSet, del } from "idb-keyval";
import { SRSState, createNewCardState } from "@/lib/srs";
import { getLocalDateString } from "@/lib/utils";
import { calculateLevel } from "@/lib/level";
import { calculateNewStreak, mergeGamification } from "@/lib/gamification";
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

// Custom storage handlers for IndexedDB persistence


export const useSRSStore = create<SRSStateStore>()(
  persist(
    (set, get) => ({
      srs: {},
      dirtySrs: new Set<string>(),

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
          const { streak, todayReviewCount, lastStudyDate, inventory, studyDays } = userState;
          
          const { streak: newStreak, streakFreezeUsed } = calculateNewStreak(
            streak,
            lastStudyDate,
            inventory,
            useUIStore.getState().addNotification
          );

          const newStudyDays = { ...studyDays };
          newStudyDays[today] = (newStudyDays[today] || 0) + 1;

          useUserStore.getState().setGamification({
            xp: newXp,
            level: calculateLevel(newXp),
            streak: newStreak,
            todayReviewCount: lastStudyDate === today ? todayReviewCount + 1 : 1,
            lastStudyDate: today,
            studyDays: newStudyDays,
            inventory: { 
              ...inventory, 
              streakFreeze: streakFreezeUsed ? inventory.streakFreeze - 1 : inventory.streakFreeze 
            }
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
        
        // 1. Merge Gamification (Extracted)
        const mergedGamification = mergeGamification(userState, cloudData);

        // 2. Merge SRS
        const mergedSrs = { ...cloudData.srs };
        
        let recoveredDirty: Set<string>;
        try {
          const rawDirty = get().dirtySrs;
          recoveredDirty = rawDirty instanceof Set 
            ? rawDirty 
            : new Set(Array.isArray(rawDirty) ? rawDirty : []);
        } catch {
          recoveredDirty = new Set();
        }
        
        const newDirty = new Set(recoveredDirty);

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

        // 3. Merge Lessons
        const localLessons = userState.completedLessons || {};
        const cloudLessons = cloudData.completedLessons || {};
        const mergedLessons = { ...cloudLessons };
        const newDirtyLessons = new Set(userState.dirtyLessons);

        Object.entries(localLessons).forEach(([id, localState]) => {
          const cloudState = cloudLessons[id];
          if (localState.isDeleted) {
            if (cloudState && !cloudState.isDeleted) {
              newDirtyLessons.add(id);
              // In cloud it's not deleted, but locally it is. We keep it deleted.
              mergedLessons[id] = localState;
            }
            return;
          }
          if (!cloudState) {
            mergedLessons[id] = localState;
            newDirtyLessons.add(id);
          } else {
            if (localState.updatedAt > cloudState.updatedAt) {
              mergedLessons[id] = localState;
              newDirtyLessons.add(id);
            } else {
              mergedLessons[id] = cloudState;
              newDirtyLessons.delete(id);
            }
          }
        });

        // 4. Update Stores
        useUserStore.getState().setGamification({
          ...mergedGamification,
          name: cloudData.name || userState.name,
          lastStudyDate: cloudData.lastStudyDate,
          completedLessons: mergedLessons,
        });

        useUserStore.getState().setDirtyLessons(newDirtyLessons);

        uiState.toggleNotifications(cloudData.settings.notificationsEnabled);

        set({ srs: mergedSrs, dirtySrs: newDirty });
      },

      resetSRS: () => set({ srs: {}, dirtySrs: new Set() }),
    }),
    {
      name: "nihongoroute_srs_data",
      storage: {
        getItem: async (name) => {
          const data = await get(name);
          if (!data) return null;
          
          try {
            // Manual parsing to handle Set reviver
            const parsed = JSON.parse(data, (key, value) => {
              if (key === 'dirtySrs' && Array.isArray(value)) {
                return new Set(value);
              }
              return value;
            });
            return parsed;
          } catch (e) {
            console.error("Failed to parse SRS store data:", e);
            return null;
          }
        },
        setItem: async (name, value) => {
          try {
            // Manual stringification to handle Set replacer
            const stringified = JSON.stringify(value, (key, val) => {
              if (val instanceof Set) {
                return Array.from(val);
              }
              return val;
            });
            await idbSet(name, stringified);
          } catch (e) {
            console.error("Failed to save SRS store data:", e);
          }
        },
        removeItem: async (name) => await del(name),
      },
    }
  )
);
