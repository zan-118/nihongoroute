/**
 * @file useUIStore.ts
 * @description Zustand Store luring pengelola preferensi antarmuka pengguna (UI), sistem notifikasi in-app, status pemuatan data global, preferensi furigana, serta koordinasi state pemahaman membaca (reading) dan mendengarkan (listening).
 */

// ==========================================
// IMPORT & DEPENDENSI
// ==========================================
import { create } from "zustand";
import { persist, createJSONStorage, StateStorage } from "zustand/middleware";
import { get, set as idbSet, del } from "idb-keyval";
import { Notification, Settings } from "./types";

import { ReadingState } from "@/components/features/reading/types";
import { ListeningState } from "@/components/features/listening/types";

// ==========================================
// ANTARMUKA STATE
// ==========================================
/**
 * Mengelola status antarmuka pengguna global, preferensi tampilan, dan state sesi belajar terpadu.
 */
interface UIState {
  loading: boolean;
  isSyncing: boolean;
  syncError: boolean;
  notifications: Notification[];
  settings: Settings;

  // State Sesi Membaca (Disinkronkan untuk akses tombol aksi melayang / FAB)
  readingState: ReadingState;
  // State Sesi Menyimak (Menyimpan posisi audio aktif dan teks bacaan bersuara)
  listeningState: ListeningState & { audioUrl?: string; textToSpeak?: string };

  setLoading: (loading: boolean) => void;
  setSyncing: (isSyncing: boolean) => void;
  setSyncError: (hasError: boolean) => void;
  addNotification: (notification: Omit<Notification, "id" | "timestamp" | "read">) => void;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  clearNotifications: () => void;
  toggleNotifications: (enabled: boolean) => void;
  toggleFurigana: (enabled: boolean) => void;
  setLayoutPreference: (layout: "grid" | "list") => void;
  exportData: () => Promise<void>;
  importData: (jsonData: string) => Promise<boolean>;
  setReadingState: (state: Partial<UIState['readingState']>) => void;
  setListeningState: (state: Partial<UIState['listeningState']>) => void;

  resetUI: () => void;
}

/** Adapter penyimpanan StateStorage khusus untuk IndexedDB menggunakan idb-keyval */
const idbStorage: StateStorage = {
  getItem: async (name: string) => (await get(name)) || null,
  setItem: async (name: string, value: string) => await idbSet(name, value),
  removeItem: async (name: string) => await del(name),
};

/**
 * Zustand Store: useUIStore
 * 
 * Store global untuk mengelola visual UI, notifikasi in-app, setting pengguna,
 * serta koordinasi status pemuatan (loading) dan sinkronisasi cloud.
 * State di-persist secara luring menggunakan IndexedDB.
 */
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
        layoutPreference: "grid",
      },

      readingState: {
        mode: "furigana",
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

      markAllNotificationsAsRead: () => set((state) => ({
        notifications: state.notifications.map(n =>
          n.read ? n : { ...n, read: true }
        )
      })),

      clearNotifications: () => set({ notifications: [] }),

      toggleNotifications: (enabled) => set((state) => ({
        settings: { ...state.settings, notificationsEnabled: enabled }
      })),

      toggleFurigana: (enabled) => set((state) => ({
        settings: { ...state.settings, showFurigana: enabled }
      })),

      setLayoutPreference: (layout) => set((state) => ({
        settings: { ...state.settings, layoutPreference: layout }
      })),

      exportData: async () => {
        if (typeof window === "undefined") return;
        // Impor store lainnya secara dinamis untuk mencegah circular dependencies
        const { useUserStore } = await import("./useUserStore");
        const { useSRSStore } = await import("./useSRSStore");

        const user = useUserStore.getState();
        const srs = useSRSStore.getState();
        const ui = useUIStore.getState();

        // 1. Kumpulkan seluruh status data progres belajar untuk dipaketkan ke berkas JSON
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

        // 2. Buat elemen jangkar luring buatan untuk memicu pengunduhan berkas JSON otomatis di browser
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

          // 1. Validasi struktur berkas data untuk memastikan integritas
          if (typeof parsed.xp !== 'number' || typeof parsed.srs !== 'object') return false;

          // 2. Masukkan data cadangan profil dan XP ke dalam UserStore
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

          // 3. Masukkan basis data kartu SRS luring ke dalam SRSStore
          useSRSStore.getState().setSRS(parsed.srs);

          // 4. Perbarui status preferensi antarmuka pengguna
          set({
            notifications: parsed.notifications || [],
            settings: parsed.settings || { notificationsEnabled: false }
          });

          return true;
        } catch (e) {
          console.error("Gagal mengimpor berkas cadangan data:", e);
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
          layoutPreference: "grid",
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

