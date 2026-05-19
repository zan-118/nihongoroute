import { create } from "zustand";
import { persist, createJSONStorage, StateStorage } from "zustand/middleware";
import { get, set as idbSet, del } from "idb-keyval";
import { Notification, Settings } from "./types";

import { ReadingState } from "@/components/features/reading/types";
import { ListeningState } from "@/components/features/listening/types";


interface UIState {
  loading: boolean;
  isSyncing: boolean;
  syncError: boolean;
  notifications: Notification[];
  settings: Settings;
  
  // Reading Session State (Synced for FAB access)
  readingState: ReadingState;
  listeningState: ListeningState & { audioUrl?: string; textToSpeak?: string };

  
  setLoading: (loading: boolean) => void;
  setSyncing: (isSyncing: boolean) => void;
  setSyncError: (hasError: boolean) => void;
  addNotification: (notification: Omit<Notification, "id" | "timestamp" | "read">) => void;
  markNotificationAsRead: (id: string) => void;
  clearNotifications: () => void;
  toggleNotifications: (enabled: boolean) => void;
  toggleFurigana: (enabled: boolean) => void;
  exportData: () => Promise<void>;
  importData: (jsonData: string) => Promise<boolean>;
  setReadingState: (state: Partial<UIState['readingState']>) => void;
  setListeningState: (state: Partial<UIState['listeningState']>) => void;

  resetUI: () => void;
}

const idbStorage: StateStorage = {
  getItem: async (name: string) => (await get(name)) || null,
  setItem: async (name: string, value: string) => await idbSet(name, value),
  removeItem: async (name: string) => await del(name),
};

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      loading: false,
      isSyncing: false,
      syncError: false,
      notifications: [],
      settings: {
        dailyReviewGoal: 50,
        dailyLessonGoal: 10,
        notificationsEnabled: false,
        showFurigana: true,
      },

      readingState: {
        mode: "kanji",
        showTranslation: false,
      },

      listeningState: {
        currentTime: 0,
        activeIndex: -1,
        isScrolling: false,
        activeTab: "transcript",
      },



      setLoading: (loading) => set({ loading }),
      setSyncing: (isSyncing) => set({ isSyncing }),
      setSyncError: (hasError) => set({ syncError: hasError }),
      
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

      toggleFurigana: (enabled) => set((state) => ({
        settings: { ...state.settings, showFurigana: enabled }
      })),

      exportData: async () => {
        if (typeof window === "undefined") return;
        const { useUserStore } = await import("./useUserStore");
        const { useSRSStore } = await import("./useSRSStore");
        
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

      importData: async (jsonData) => {
        try {
          const parsed = JSON.parse(jsonData);
          if (typeof parsed !== 'object' || parsed === null) return false;
          
          const { useUserStore } = await import("./useUserStore");
          const { useSRSStore } = await import("./useSRSStore");

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

      setReadingState: (newState) => set((state) => ({
        readingState: { ...state.readingState, ...newState }
      })),

      setListeningState: (newState) => set((state) => ({
        listeningState: { ...state.listeningState, ...newState }
      })),


      resetUI: () => set({
        loading: false,
        isSyncing: false,
        notifications: [],
        settings: {
          dailyReviewGoal: 50,
          dailyLessonGoal: 10,
          notificationsEnabled: false,
          showFurigana: true,
        },
        readingState: { mode: "kanji", showTranslation: false }
      }),
    }),
    {
      name: "nihongoroute_ui_data",
      storage: createJSONStorage(() => idbStorage),
    }
  )
);

