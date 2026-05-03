import { create } from "zustand";
import { persist, createJSONStorage, StateStorage } from "zustand/middleware";
import { get, set as idbSet, del } from "idb-keyval";
import { SRSState, createNewCardState } from "@/lib/srs";
import { calculateLevel } from "@/lib/level";
import { getLocalDateString } from "@/lib/utils";

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "achievement";
  timestamp: number;
  read: boolean;
}

export interface UserProgress {
  name: string | null;
  xp: number;
  level: number;
  streak: number;
  todayReviewCount: number;
  lastStudyDate: string | null;
  studyDays: Record<string, number>;
  srs: Record<string, SRSState>;
  notifications: Notification[];
  inventory: {
    streakFreeze: number;
  };
  settings: {
    notificationsEnabled: boolean;
  };
}

export interface ProgressState {
  progress: UserProgress;
  loading: boolean;
  dirtySrs: Set<string>;
  isAuthenticated: boolean;
  
  // Actions
  setProgress: (progress: UserProgress) => void;
  setLoading: (loading: boolean) => void;
  setAuth: (isAuthenticated: boolean, userFullName: string | null) => void;
  setDirtySrs: (dirtySrs: Set<string> | ((prev: Set<string>) => Set<string>)) => void;
  
  updateProgress: (newXp: number, srsUpdates: Record<string, SRSState>) => void;
  updateProfileName: (name: string) => void;
  addXP: (amount: number) => void;
  addToSRS: (wordId: string) => void;
  addNotification: (notification: Omit<Notification, "id" | "timestamp" | "read">) => void;
  markNotificationAsRead: (id: string) => void;
  clearNotifications: () => void;
  exportData: () => void;
  importData: (jsonData: string) => boolean;
  clearDirtySrs: (syncedIds?: string[]) => void;
  buyStreakFreeze: () => boolean;
  toggleNotifications: (enabled: boolean) => void;
  mergeProgress: (cloudData: UserProgress) => void;
  removeFromSRS: (wordId: string) => void;
  resetProgress: () => void;
}

const defaultProgress: UserProgress = {
  name: null,
  xp: 0,
  level: 1,
  streak: 0,
  todayReviewCount: 0,
  lastStudyDate: null,
  studyDays: {},
  srs: {},
  notifications: [
    {
      id: "welcome",
      title: "Selamat Datang!",
      message: "Selamat bergabung di NihongoRoute. Mari mulai perjalanan belajar Anda hari ini!",
      type: "info",
      timestamp: Date.now(),
      read: false
    }
  ],
  inventory: {
    streakFreeze: 0
  },
  settings: {
    notificationsEnabled: false
  }
};

const idbStorage: StateStorage = {
  getItem: async (name: string): Promise<string | null> => {
    return (await get(name)) || null;
  },
  setItem: async (name: string, value: string): Promise<void> => {
    await idbSet(name, value);
  },
  removeItem: async (name: string): Promise<void> => {
    await del(name);
  },
};

export const useProgressStore = create<ProgressState>()(
  persist(
    (set, get) => ({
      progress: defaultProgress,
      loading: true,
      dirtySrs: new Set(),
      isAuthenticated: false,

      setProgress: (progress) => set({ progress }),
      setLoading: (loading) => set({ loading }),
      setAuth: (isAuthenticated, userFullName) => set((state) => ({ 
        isAuthenticated, 
        progress: { 
          ...state.progress, 
          // Prioritaskan nama yang sudah ada di profil daripada nama Google
          name: state.progress.name || userFullName 
        } 
      })),
      
      setDirtySrs: (updater) => set((state) => ({ 
        dirtySrs: typeof updater === 'function' ? updater(state.dirtySrs) : updater 
      })),
      
      clearDirtySrs: (syncedIds?: string[]) => set((state) => {
        if (!syncedIds) return { dirtySrs: new Set() };
        const newDirty = new Set(state.dirtySrs);
        syncedIds.forEach(id => newDirty.delete(id));
        return { dirtySrs: newDirty };
      }),

      updateProgress: (newXp, srsUpdates) => {
        const state = get();
        const today = getLocalDateString();
        
        const newDirty = new Set(state.dirtySrs);
        const newSrs = { ...state.progress.srs };
        let srsChanged = false;

        Object.keys(srsUpdates).forEach((id) => {
          newSrs[id] = srsUpdates[id];
          newDirty.add(id);
          srsChanged = true;
        });

        let { streak, todayReviewCount, lastStudyDate } = state.progress;
        const { studyDays, inventory } = state.progress;
        const newStudyDays = { ...studyDays };
        let newStreakFreeze = inventory?.streakFreeze || 0;

        if (srsChanged) {
          todayReviewCount += 1;

          if (lastStudyDate !== today) {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            const offset = yesterday.getTimezoneOffset() * 60000;
            const yesterdayStr = new Date(yesterday.getTime() - offset).toISOString().split("T")[0];

            if (lastStudyDate === yesterdayStr) {
              streak += 1;
            } else if (newStreakFreeze > 0 && lastStudyDate !== null) {
              // Gunakan Streak Freeze
              newStreakFreeze -= 1;
              get().addNotification({
                title: "Streak Freeze Digunakan!",
                message: "Streak Anda terselamatkan oleh item Streak Freeze.",
                type: "warning"
              });
              // Streak tetap, tidak berubah
              streak += 1; // Anggap hari yang bolong ditutup oleh freeze
            } else {
              streak = 1;
            }

            lastStudyDate = today;
            newStudyDays[today] = (newStudyDays[today] || 0) + 1;
          } else {
            newStudyDays[today] = (newStudyDays[today] || 0) + 1;
          }
        }

        set({
          dirtySrs: newDirty,
          progress: {
            ...state.progress,
            xp: newXp,
            level: calculateLevel(newXp),
            srs: newSrs,
            streak,
            todayReviewCount,
            lastStudyDate,
            studyDays: newStudyDays,
            inventory: {
              ...state.progress.inventory,
              streakFreeze: newStreakFreeze
            }
          },
        });
      },
      
      updateProfileName: (name) => set((state) => ({ 
        progress: { ...state.progress, name } 
      })),

      addXP: (amount: number) => {
        const state = get();
        const newXp = state.progress.xp + amount;
        set({
          progress: {
            ...state.progress,
            xp: newXp,
            level: calculateLevel(newXp),
          },
        });
        
        const newLevel = calculateLevel(newXp);
        if (newLevel > state.progress.level) {
          get().addNotification({
            title: "Level Up!",
            message: `Selamat! Anda sekarang berada di Level ${newLevel}.`,
            type: "achievement"
          });
        }
      },

      addToSRS: (wordId) => {
        const state = get();
        if (state.progress.srs[wordId]) return;

        const newDirty = new Set(state.dirtySrs);
        newDirty.add(wordId);

        state.updateProgress(state.progress.xp, {
          [wordId]: createNewCardState(),
        });
        
        set({ dirtySrs: newDirty });
      },

      removeFromSRS: (wordId) => {
        const state = get();
        if (!state.progress.srs[wordId]) return;

        const newDirty = new Set(state.dirtySrs);
        newDirty.add(wordId);

        const newSrs = { ...state.progress.srs };
        newSrs[wordId] = {
          ...newSrs[wordId],
          isDeleted: true,
          updatedAt: Date.now()
        };

        set({
          dirtySrs: newDirty,
          progress: {
            ...state.progress,
            srs: newSrs
          }
        });
      },

      addNotification: (n) => set((state) => ({
        progress: {
          ...state.progress,
          notifications: [
            { ...n, id: Math.random().toString(36).substring(7), timestamp: Date.now(), read: false },
            ...state.progress.notifications
          ]
        }
      })),

      markNotificationAsRead: (id) => set((state) => ({
        progress: {
          ...state.progress,
          notifications: state.progress.notifications.map(n => 
            n.id === id ? { ...n, read: true } : n
          )
        }
      })),

      clearNotifications: () => set((state) => ({
        progress: {
          ...state.progress,
          notifications: []
        }
      })),

      exportData: () => {
        if (typeof window === "undefined") return;
        const state = get();
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(state.progress));
        const downloadAnchorNode = document.createElement("a");
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", `nihongoroute-save-${new Date().toISOString().split("T")[0]}.json`);
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
      },

      importData: (jsonData) => {
        try {
          const parsed = JSON.parse(jsonData);
          if (
            typeof parsed === 'object' && parsed !== null &&
            typeof parsed.xp === "number" &&
            typeof parsed.level === "number" &&
            typeof parsed.srs === "object" && !Array.isArray(parsed.srs) &&
            Array.isArray(parsed.notifications) &&
            typeof parsed.studyDays === "object"
          ) {
            set({ progress: parsed as UserProgress });
            return true;
          }
          console.error("Format data tidak valid.");
          return false;
        } catch (e) {
          console.error("Gagal mengurai file data import:", e);
          return false;
        }
      },

      buyStreakFreeze: () => {
        const state = get();
        const COST = 500;
        if (state.progress.xp < COST) return false;

        set({
          progress: {
            ...state.progress,
            xp: state.progress.xp - COST,
            inventory: {
              ...state.progress.inventory,
              streakFreeze: (state.progress.inventory?.streakFreeze || 0) + 1
            }
          }
        });

        get().addNotification({
          title: "Pembelian Berhasil!",
          message: "Streak Freeze telah ditambahkan ke koleksi Anda.",
          type: "success"
        });

        return true;
      },

      toggleNotifications: (enabled: boolean) => set((state) => ({ 
        progress: { 
          ...state.progress, 
          settings: { 
            ...(state.progress.settings || { notificationsEnabled: false }), 
            notificationsEnabled: enabled 
          } 
        } 
      })),

      mergeProgress: (cloudData) => {
        const state = get();
        const local = state.progress;
        
        // 1. Merge Gamification (Ambil yang tertinggi/terbaru)
        const mergedXP = Math.max(local.xp, cloudData.xp);
        const mergedStreak = Math.max(local.streak, cloudData.streak);
        
        // 2. Merge Study Days (Heatmap)
        const mergedStudyDays = { ...cloudData.studyDays };
        Object.entries(local.studyDays).forEach(([date, count]) => {
          mergedStudyDays[date] = Math.max(count, mergedStudyDays[date] || 0);
        });

        // 3. Merge SRS (Conflict Resolution LWW)
        const mergedSrs = { ...cloudData.srs };
        const newDirty = new Set(state.dirtySrs);

        Object.entries(local.srs).forEach(([id, localState]) => {
          const cloudState = cloudData.srs[id];
          
          if (localState.isDeleted) {
            // Jika lokal sudah dihapus, tetap hapus dan tandai dirty jika cloud masih punya
            if (cloudState) {
              newDirty.add(id);
              delete mergedSrs[id]; // Jangan tampilkan di UI
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

        // 4. Merge Inventory & Settings
        const mergedInventory = {
          streakFreeze: Math.max(local.inventory?.streakFreeze || 0, cloudData.inventory?.streakFreeze || 0)
        };

        const mergedSettings = {
          ...cloudData.settings,
          ...local.settings,
        };

        // 5. Merge Notifications (Deduplicate by ID)
        const allNotifications = [...local.notifications, ...cloudData.notifications];
        const uniqueNotifications = Array.from(new Map(allNotifications.map(n => [n.id, n])).values())
          .sort((a, b) => b.timestamp - a.timestamp)
          .slice(0, 50); // Batasi 50 terakhir agar tidak bengkak

        set({
          dirtySrs: newDirty,
          progress: {
            ...local,
            xp: mergedXP,
            level: calculateLevel(mergedXP),
            streak: mergedStreak,
            studyDays: mergedStudyDays,
            srs: mergedSrs,
            inventory: mergedInventory,
            settings: mergedSettings,
            notifications: uniqueNotifications,
            // Prioritaskan nama dari cloud jika ada perubahan
            name: cloudData.name || local.name,
            // Gunakan review count terbaru jika tanggalnya sama
            todayReviewCount: local.lastStudyDate === cloudData.lastStudyDate 
              ? Math.max(local.todayReviewCount, cloudData.todayReviewCount)
              : (local.lastStudyDate === getLocalDateString() ? local.todayReviewCount : cloudData.todayReviewCount)
          }
        });
      },

      resetProgress: () => set({ progress: defaultProgress, dirtySrs: new Set() }),
    }),
    {
      name: "nihongoroute_save_data",
      storage: createJSONStorage(() => idbStorage),
      partialize: (state) => ({ progress: state.progress }),
    }
  )
);

export const useProgress = useProgressStore;
