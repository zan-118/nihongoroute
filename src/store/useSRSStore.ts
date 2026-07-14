/**
 * @file useSRSStore.ts
 * @description Zustand Store luring pengelola basis data lokal sistem Spaced Repetition (SRS) belajar bahasa Jepang. Di-persist otomatis ke IndexedDB peramban via idb-keyval. Menyimpan kartu lokal beserta metadata interval, kemudahan (e-factor), status repetisi, dan melacak data kotor (dirtySrs) untuk disinkronkan ke cloud.
 */

// ==========================================
// IMPORT & DEPENDENSI
// ==========================================
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

// ==========================================
// ANTARMUKA STATE STORE
// ==========================================
/**
 * SRS store state and actions. Manage local cards and sync status.
 */
interface SRSStateStore {
  /** Map of word ID to SRS state. */
  srs: Record<string, SRSState>;
  /** Set of unsynced word IDs. */
  dirtySrs: Set<string>;
  
  /** Set SRS state map. */
  setSRS: (srs: Record<string, SRSState>) => void;
  /** Update dirty SRS set. */
  setDirtySrs: (updater: Set<string> | ((prev: Set<string>) => Set<string>)) => void;
  /** Clear dirty IDs. Remove synced IDs if provided. */
  clearDirtySrs: (syncedIds?: string[]) => void;
  
  /** Update XP and SRS card states. Trigger gamification updates. */
  updateProgress: (newXp: number, srsUpdates: Record<string, SRSState>) => void;
  /** Add new word to SRS. */
  addToSRS: (wordId: string) => void;
  /** Mark word as deleted. Keep tombstone for sync. */
  removeFromSRS: (wordId: string) => void;
  /** Update custom mnemonic text for word. */
  updateCustomMnemonic: (wordId: string, text: string) => void;
  /** Merge cloud progress with local state. Resolve conflicts via timestamp. */
  mergeProgress: (cloudData: UserProgress) => void;
  /** Reset SRS state to empty. */
  resetSRS: () => void;
}

// ==========================================
// ZUSTAND STORE UTAMA
// ==========================================
/**
 * Zustand store for SRS data. Persist to IndexedDB.
 */
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
        // Clear all if no IDs provided.
        if (!syncedIds) return { dirtySrs: new Set() };
        // Remove specific synced IDs.
        const newDirty = new Set(state.dirtySrs);
        syncedIds.forEach(id => newDirty.delete(id));
        return { dirtySrs: newDirty };
      }),

      updateProgress: (newXp, srsUpdates) => {
        // Get local date string. Track daily reviews.
        const today = getLocalDateString();
        const userState = useUserStore.getState();
        
        // Clone dirty set. Avoid direct mutation.
        const newDirty = new Set(get().dirtySrs);
        const newSrs = { ...get().srs };
        let srsChanged = false;

        // Apply updates. Mark IDs dirty.
        Object.keys(srsUpdates).forEach((id) => {
          newSrs[id] = srsUpdates[id];
          newDirty.add(id);
          srsChanged = true;
        });

        // SRS changed. Recalculate streak and gamification.
        if (srsChanged) {
          const { streak, todayReviewCount, lastStudyDate, inventory, studyDays } = userState;
          
          // Calculate new streak. Check streak freeze usage.
          const { streak: newStreak, streakFreezeUsed } = calculateNewStreak(
            streak,
            lastStudyDate,
            inventory,
            useUIStore.getState().addNotification
          );

          const newStudyDays = { ...studyDays };
          newStudyDays[today] = (newStudyDays[today] || 0) + 1;

          // Update user store gamification data.
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
          // No SRS change. Add XP only.
          useUserStore.getState().addXP(newXp - userState.xp);
        }

        set({ srs: newSrs, dirtySrs: newDirty });
      },

      addToSRS: (wordId) => {
        // Skip if word exists.
        if (get().srs[wordId]) return;
        
        // Add new card. Set initial learning state.
        get().updateProgress(useUserStore.getState().xp, {
          [wordId]: createNewCardState(),
        });
      },

      removeFromSRS: (wordId) => {
        // Skip if word missing.
        if (!get().srs[wordId]) return;
        
        const newDirty = new Set(get().dirtySrs);
        newDirty.add(wordId);
        
        // Set tombstone. Sync will delete from cloud.
        const newSrs = { ...get().srs };
        newSrs[wordId] = {
          ...newSrs[wordId],
          isDeleted: true, 
          updatedAt: Date.now()
        };
        set({ srs: newSrs, dirtySrs: newDirty });
      },

      updateCustomMnemonic: (wordId, text) => {
        const newSrs = { ...get().srs };
        // Get existing card or create new.
        const existing = newSrs[wordId] || createNewCardState();
        newSrs[wordId] = {
          ...existing,
          customMnemonic: text, 
          updatedAt: Date.now()
        };
        
        const newDirty = new Set(get().dirtySrs);
        newDirty.add(wordId);
        set({ srs: newSrs, dirtySrs: newDirty });
      },

      mergeProgress: (cloudData) => {
        const localSrs = get().srs;
        const userState = useUserStore.getState();
        const uiState = useUIStore.getState();
        
        // Merge gamification data.
        const mergedGamification = mergeGamification(userState, cloudData);

        const mergedSrs = { ...cloudData.srs };
        
        // Recover Set type. Handle IndexedDB serialization loss.
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

        // Merge SRS cards. Resolve conflicts.
        Object.entries(localSrs).forEach(([id, localState]) => {
          const cloudState = cloudData.srs[id];
          
          // Handle deleted cards. Keep tombstone if cloud has it.
          if (localState.isDeleted) {
            if (cloudState) {
              newDirty.add(id);
              mergedSrs[id] = localState;
            } else {
              newDirty.delete(id);
              delete mergedSrs[id];
            }
            return;
          }
          
          // Local card only. Keep and mark dirty.
          if (!cloudState) {
            mergedSrs[id] = localState;
            newDirty.add(id);
          } else {
            // Compare timestamps. Keep newest.
            if (localState.updatedAt > cloudState.updatedAt) {
              mergedSrs[id] = localState;
              newDirty.add(id);
            } else {
              mergedSrs[id] = cloudState;
              newDirty.delete(id); 
            }
          }
        });

        // Merge completed lessons.
        const localLessons = userState.completedLessons || {};
        const cloudLessons = cloudData.completedLessons || {};
        const mergedLessons = { ...cloudLessons };
        const newDirtyLessons = new Set(userState.dirtyLessons);

        Object.entries(localLessons).forEach(([id, localState]) => {
          const cloudState = cloudLessons[id];
          if (localState.isDeleted) {
            if (cloudState && !cloudState.isDeleted) {
              newDirtyLessons.add(id);
              mergedLessons[id] = localState;
            }
            return;
          }
          if (!cloudState) {
            mergedLessons[id] = localState;
            newDirtyLessons.add(id);
          } else {
            // Compare lesson timestamps.
            if (localState.updatedAt > cloudState.updatedAt) {
              mergedLessons[id] = localState;
              newDirtyLessons.add(id);
            } else {
              mergedLessons[id] = cloudState;
              newDirtyLessons.delete(id);
            }
          }
        });

        // Update user store with merged data.
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
            // Parse JSON. Restore Set type.
            const parsed = JSON.parse(data, (key, value) => {
              if (key === 'dirtySrs' && Array.isArray(value)) {
                return new Set(value);
              }
              return value;
            });
            return parsed;
          } catch (e) {
            console.error("Gagal mengurai data SRS store:", e);
            return null;
          }
        },
        setItem: async (name, value) => {
          try {
            // Serialize to JSON. Convert Set to Array.
            const stringified = JSON.stringify(value, (key, val) => {
              if (val instanceof Set) {
                return Array.from(val);
              }
              return val;
            });
            await idbSet(name, stringified);
          } catch (e) {
            console.error("Gagal menyimpan data SRS store:", e);
          }
        },
        removeItem: async (name) => await del(name),
      },
    }
  )
);

// Expose store to window. Debugging helper.
if (typeof window !== "undefined") {
  (window as unknown as Record<string, typeof useSRSStore>).useSRSStore = useSRSStore;
}