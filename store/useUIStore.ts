import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { get, set as idbSet, del } from "idb-keyval";
import { Notification, Settings } from "./types";

interface UIState {
  loading: boolean;
  isSyncing: boolean;
  notifications: Notification[];
  settings: Settings;
  
  setLoading: (loading: boolean) => void;
  setSyncing: (isSyncing: boolean) => void;
  addNotification: (notification: Omit<Notification, "id" | "timestamp" | "read">) => void;
  markNotificationAsRead: (id: string) => void;
  clearNotifications: () => void;
  toggleNotifications: (enabled: boolean) => void;
  exportData: () => void;
  importData: (jsonData: string) => boolean;
  resetUI: () => void;
}

const idbStorage = {
  getItem: async (name: string) => (await get(name)) || null,
  setItem: async (name: string, value: string) => await idbSet(name, value),
  removeItem: async (name: string) => await del(name),
};

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      loading: false,
      isSyncing: false,
      notifications: [],
      settings: {
        notificationsEnabled: false,
      },

      setLoading: (loading) => set({ loading }),
      setSyncing: (isSyncing) => set({ isSyncing }),
      
      addNotification: (n) => set((state) => ({
        notifications: [
          { 
            ...n, 
            id: Math.random().toString(36).substring(7), 
            timestamp: Date.now(), 
            read: false 
          },
          ...state.notifications
        ].slice(0, 50)
      })),

      markNotificationAsRead: (id) => set((state) => ({
        notifications: state.notifications.map(n => 
          n.id === id ? { ...n, read: true } : n
        )
      })),

      clearNotifications: () => set({ notifications: [] }),

      toggleNotifications: (enabled) => set((state) => ({
        settings: { ...state.settings, notificationsEnabled: enabled }
      })),

      exportData: () => {
        if (typeof window === "undefined") return;
        // Import stores dynamically to avoid circular dependencies if needed, 
        // but here they are used inside the function.
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const { useUserStore } = require("./useUserStore");
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const { useSRSStore } = require("./useSRSStore");
        
        const user = useUserStore.getState();
        const srs = useSRSStore.getState();
        const ui = useUIStore.getState();

        const data = {
          name: user.name,
          xp: user.xp,
          level: user.level,
          streak: user.streak,
          todayReviewCount: user.todayReviewCount,
          lastStudyDate: user.lastStudyDate,
          studyDays: user.studyDays,
          inventory: user.inventory,
          srs: srs.srs,
          notifications: ui.notifications,
          settings: ui.settings,
        };

        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data));
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
          if (typeof parsed !== 'object' || parsed === null) return false;
          
          // eslint-disable-next-line @typescript-eslint/no-require-imports
          const { useUserStore } = require("./useUserStore");
          // eslint-disable-next-line @typescript-eslint/no-require-imports
          const { useSRSStore } = require("./useSRSStore");

          // Basic validation
          if (typeof parsed.xp !== 'number' || typeof parsed.srs !== 'object') return false;

          useUserStore.getState().setGamification({
            name: parsed.name,
            xp: parsed.xp,
            level: parsed.level,
            streak: parsed.streak,
            todayReviewCount: parsed.todayReviewCount,
            lastStudyDate: parsed.lastStudyDate,
            studyDays: parsed.studyDays,
            inventory: parsed.inventory,
          });

          useSRSStore.getState().setSRS(parsed.srs);
          
          set({
            notifications: parsed.notifications || [],
            settings: parsed.settings || { notificationsEnabled: false }
          });

          return true;
        } catch (e) {
          console.error("Import error:", e);
          return false;
        }
      },

      resetUI: () => set({
        loading: false,
        isSyncing: false,
        notifications: [],
        settings: { notificationsEnabled: false }
      }),
    }),
    {
      name: "nihongoroute_ui_data",
      storage: createJSONStorage(() => idbStorage as unknown as unknown),
    }
  )
);

