/**
 * @file useUIStore.ts
 * @description Offline-first Zustand store managing UI preferences, in-app notification queue, global loading states, furigana preferences, and reading/listening comprehension states. Persisted via IndexedDB.
 */

import { create } from "zustand";
import { persist, createJSONStorage, StateStorage } from "zustand/middleware";
import { get, set as idbSet, del } from "idb-keyval";
import { Notification, Settings } from "./types";

import { ReadingState } from "@/features/library/reading/types";
import { ListeningState } from "@/features/library/listening/types";
import {
 createLearningEvent,
 type LearningEvent,
 type LearningEventInput,
} from "@/lib/learning-events";

/**
 * Vocabulary entry saved from reading session.
 */
export interface ReadingVocabularyBankEntry {
 id: string;
 word: string;
 reading?: string;
 meaning?: string;
 slug?: string;
 jlpt?: string;
 sourceId?: string;
 sourceTitle?: string;
 sourceHref?: string;
 addedAt: number;
 hitCount: number;
}

/**
 * Input type for creating vocabulary entry. Excludes auto-generated fields.
 */
export type ReadingVocabularyBankInput = Omit<
 ReadingVocabularyBankEntry,
 "id" | "addedAt" | "hitCount"
>;

/**
 * Reading progress tracking per article.
 */
export interface ReadingProgressEntry {
 sourceId: string;
 sourceTitle?: string;
 lastParagraphIndex: number;
 totalParagraphs: number;
 elapsedSeconds: number;
 completedAt?: number;
 updatedAt: number;
}

/**
 * Generate unique ID for vocabulary entry.
 * Combine source, word, reading. Lowercase result.
 */
function createVocabularyBankId(entry: ReadingVocabularyBankInput) {
 return [
 entry.sourceId || "reading",
 entry.word,
 entry.reading || "",
 ]
 .join("|")
 .toLowerCase();
}

/**
 * UI store state and actions.
 * Manage global UI, notifications, settings, reading/listening states, and learning events.
 */
interface UIState {
 loading: boolean;
 isSyncing: boolean;
 syncError: boolean;
 notifications: Notification[];
 settings: Settings;

 // State Sesi Membaca (Disinkronkan untuk akses tombol aksi melayang / FAB)
 readingState: ReadingState;
 // Bank kosakata yang dikoleksi dari sesi membaca.
 readingVocabularyBank: Record<string, ReadingVocabularyBankEntry>;
 // Progres baca lokal per artikel untuk timer dan lanjut posisi terakhir.
 readingProgressMap: Record<string, ReadingProgressEntry>;
 // State Sesi Menyimak (Menyimpan posisi audio aktif dan teks bacaan bersuara)
 listeningState: ListeningState & { audioUrl?: string; textToSpeak?: string };
 // Timeline aktivitas lintas-library/tools untuk membentuk rekomendasi ekosistem.
 learningEvents: LearningEvent[];

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
 updateSettings: (newSettings: Partial<Settings>) => void;
 exportData: () => Promise<void>;
 importData: (jsonData: string) => Promise<boolean>;
 setReadingState: (state: Partial<UIState['readingState']>) => void;
 addReadingVocabulary: (entry: ReadingVocabularyBankInput) => string;
 removeReadingVocabulary: (id: string) => void;
 clearReadingVocabulary: (sourceId?: string) => void;
 updateReadingProgress: (
 sourceId: string,
 progress: Partial<Omit<ReadingProgressEntry, "sourceId" | "updatedAt">>
 ) => void;
 clearReadingProgress: (sourceId?: string) => void;
 setListeningState: (state: Partial<UIState['listeningState']>) => void;
 recordLearningEvent: (event: LearningEventInput) => string;
 clearLearningEvents: () => void;

 resetUI: () => void;
}

/** 
 * IndexedDB storage adapter.
 * Save state to browser database via idb-keyval.
 */
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
 },  readingState: {
    mode: "furigana",
    showTranslation: false,
  },

 readingVocabularyBank: {},
 readingProgressMap: {},

 listeningState: {
 currentTime: 0,
 activeIndex: -1,
 isScrolling: false,
 activeTab: "transcript" as const,
 },

 learningEvents: [],

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
 ].slice(0, 50) // Keep last 50 notifications.
 })),

 markNotificationAsRead: (id) => {
 set((state) => ({
 notifications: state.notifications.map(n =>
 n.id === id ? { ...n, read: true } : n
 )
 }));

 // Sync read status to server if ID is database-backed.
 if (id.includes("-")) {
 import("@/actions/community.actions").then(({ markNotificationRead }) => {
 markNotificationRead(id).catch(err => console.error("Gagal sinkronisasi baca notifikasi:", err));
 });
 }
 },

 markAllNotificationsAsRead: () => {
 set((state) => ({
 notifications: state.notifications.map(n =>
 n.read ? n : { ...n, read: true }
 )
 }));

 // Sync all read status to server.
 import("@/actions/community.actions").then(({ markAllNotificationsRead }) => {
 markAllNotificationsRead().catch(err => console.error("Gagal sinkronisasi baca semua notifikasi:", err));
 });
 },

 clearNotifications: () => {
 set({ notifications: [] });

 // Sync clear action to server.
 import("@/actions/community.actions").then(({ clearAllNotifications }) => {
 clearAllNotifications().catch(err => console.error("Gagal sinkronisasi hapus semua notifikasi:", err));
 });
 },

 toggleNotifications: (enabled) => set((state) => ({
 settings: { ...state.settings, notificationsEnabled: enabled }
 })),

 toggleFurigana: (enabled) => set((state) => ({
 settings: { ...state.settings, showFurigana: enabled }
 })),

 setLayoutPreference: (layout) => set((state) => ({
 settings: { ...state.settings, layoutPreference: layout }
 })),

 updateSettings: (newSettings) => set((state) => ({
 settings: { ...state.settings, ...newSettings }
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
 readingVocabularyBank: ui.readingVocabularyBank,
 readingProgressMap: ui.readingProgressMap,
 learningEvents: ui.learningEvents,
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
 settings: parsed.settings || { notificationsEnabled: false },
 readingVocabularyBank: parsed.readingVocabularyBank || {},
 readingProgressMap: parsed.readingProgressMap || {},
 learningEvents: parsed.learningEvents || [],
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

 addReadingVocabulary: (entry) => {
 const id = createVocabularyBankId(entry);
 set((state) => {
 const existing = state.readingVocabularyBank[id];
 return {
 readingVocabularyBank: {
 ...state.readingVocabularyBank,
 [id]: {
 ...existing,
 ...entry,
 id,
 addedAt: existing?.addedAt || Date.now(),
 hitCount: (existing?.hitCount || 0) + 1, // Increment hit count on duplicate add.
 },
 },
 };
 });
 return id;
 },

 removeReadingVocabulary: (id) => set((state) => {
 const nextBank = { ...state.readingVocabularyBank };
 delete nextBank[id];
 return { readingVocabularyBank: nextBank };
 }),

 clearReadingVocabulary: (sourceId) => set((state) => {
 if (!sourceId) return { readingVocabularyBank: {} };

 // Filter out vocabulary entries matching sourceId.
 return {
 readingVocabularyBank: Object.fromEntries(
 Object.entries(state.readingVocabularyBank).filter(
 ([_, entry]) => entry.sourceId !== sourceId
 )
 ),
 };
 }),

 updateReadingProgress: (sourceId, progress) => set((state) => {
 if (!sourceId) return {};

 const existing = state.readingProgressMap[sourceId];
 // Prevent timer rollback.
 const elapsedSeconds = Math.max(
 progress.elapsedSeconds ?? existing?.elapsedSeconds ?? 0,
 existing?.elapsedSeconds ?? 0
 );

 return {
 readingProgressMap: {
 ...state.readingProgressMap,
 [sourceId]: {
 sourceId,
 sourceTitle: progress.sourceTitle ?? existing?.sourceTitle,
 lastParagraphIndex:
 progress.lastParagraphIndex ?? existing?.lastParagraphIndex ?? 0,
 totalParagraphs: progress.totalParagraphs ?? existing?.totalParagraphs ?? 0,
 elapsedSeconds,
 completedAt: progress.completedAt ?? existing?.completedAt,
 updatedAt: Date.now(),
 },
 },
 };
 }),

 clearReadingProgress: (sourceId) => set((state) => {
 if (!sourceId) return { readingProgressMap: {} };

 const nextProgress = { ...state.readingProgressMap };
 delete nextProgress[sourceId];
 return { readingProgressMap: nextProgress };
 }),

 setListeningState: (newState) => set((state) => ({
 listeningState: { ...state.listeningState, ...newState }
 })),

 recordLearningEvent: (input) => {
 const event = createLearningEvent(input);
 set((state) => ({
 learningEvents: [event, ...state.learningEvents].slice(0, 100), // Keep last 100 events.
 }));
 return event.id;
 },

 clearLearningEvents: () => set({ learningEvents: [] }),

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
 },  readingState: { mode: "kanji", showTranslation: false },
  readingVocabularyBank: {},
  readingProgressMap: {},
  learningEvents: [],
 listeningState: {
 currentTime: 0,
 activeIndex: -1,
 isScrolling: false,
 activeTab: "transcript" as const,
 },
 }),
 }),
 {
 name: "nihongoroute_ui_data",
 storage: createJSONStorage(() => idbStorage),
      // Hanya persist preferensi user: session state (audioUrl, textToSpeak, activeTab, dsb.)
 // tidak disimpan karena bersifat sementara dan spesifik per halaman
 partialize: (state) => ({
 notifications: state.notifications,
 settings: state.settings,    // Dari readingState: hanya mode dan showTranslation yang perlu diingat
    readingState: {
      mode: state.readingState.mode,
      showTranslation: state.readingState.showTranslation,
    },
 readingVocabularyBank: state.readingVocabularyBank,
 readingProgressMap: state.readingProgressMap,
 learningEvents: state.learningEvents,
 // Dari listeningState: hanya tab terakhir yang perlu diingat
 listeningState: {
 currentTime: 0,
 activeIndex: -1,
 isScrolling: false,
 activeTab: "transcript" as const,
 },
 }),
 }
 )
);