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
  userFullName: string | null;
  
  // Actions
  setProgress: (progress: UserProgress) => void;
  setLoading: (loading: boolean) => void;
  setAuth: (isAuthenticated: boolean, userFullName: string | null) => void;
  setDirtySrs: (dirtySrs: Set<string> | ((prev: Set<string>) => Set<string>)) => void;
  
  updateProgress: (newXp: number, newSrs: Record<string, SRSState>) => void;
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
}

const defaultProgress: UserProgress = {
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
      userFullName: null,

      setProgress: (progress) => set({ progress }),
      setLoading: (loading) => set({ loading }),
      setAuth: (isAuthenticated, userFullName) => set({ isAuthenticated, userFullName }),
      
      setDirtySrs: (updater) => set((state) => ({ 
        dirtySrs: typeof updater === 'function' ? updater(state.dirtySrs) : updater 
      })),
      
      clearDirtySrs: (syncedIds?: string[]) => set((state) => {
        if (!syncedIds) return { dirtySrs: new Set() };
        const newDirty = new Set(state.dirtySrs);
        syncedIds.forEach(id => newDirty.delete(id));
        return { dirtySrs: newDirty };
      }),

      updateProgress: (newXp, newSrs) => {
        const state = get();
        const today = getLocalDateString();
        
        const newDirty = new Set(state.dirtySrs);
        let srsChanged = false;

        Object.keys(newSrs).forEach((id) => {
          if (JSON.stringify(newSrs[id]) !== JSON.stringify(state.progress.srs[id])) {
            newDirty.add(id);
            srsChanged = true;
          }
        });

        let { streak, todayReviewCount, lastStudyDate } = state.progress;
        const { studyDays } = state.progress;
        const newStudyDays = { ...studyDays };

        if (srsChanged) {
          todayReviewCount += 1;

          if (lastStudyDate !== today) {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            const offset = yesterday.getTimezoneOffset() * 60000;
            const yesterdayStr = new Date(yesterday.getTime() - offset).toISOString().split("T")[0];

            if (lastStudyDate === yesterdayStr) {
              streak += 1;
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
          },
        });
      },
      
      updateProfileName: (name) => set({ userFullName: name }),

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
          ...state.progress.srs,
          [wordId]: createNewCardState(),
        });
        
        set({ dirtySrs: newDirty });
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
    }),
    {
      name: "nihongoroute_save_data",
      storage: createJSONStorage(() => idbStorage),
      partialize: (state) => ({ progress: state.progress }),
    }
  )
);

export const useProgress = useProgressStore;
