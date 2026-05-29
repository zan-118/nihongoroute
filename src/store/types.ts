/**
 * @file types.ts
 * @description Deklarasi tipe data dan antarmuka model progres belajar pengguna terintegrasi (Zustand luring & Supabase). Menstandarkan struktur notifikasi, inventaris barang virtual, preferensi pengaturan, dan pelacakan pelajaran.
 */

import { SRSState } from "@/lib/srs";

// ==========================================
// DEKLARASI TIPE & ANTARMUKA STORE
// ==========================================
/**
 * Struktur data untuk notifikasi visual di dalam aplikasi (in-app notifications).
 */
export interface Notification {
  id: string;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "achievement";
  timestamp: number;
  read: boolean;
}

/**
 * Interface: UnlockedAchievement
 * 
 * Mencatat data pencapaian prestasi (lencana/badge) yang berhasil dibuka oleh pengguna secara offline.
 */
export interface UnlockedAchievement {
  id: string;
  unlockedAt: number;
}

/**
 * Interface: Inventory
 * 
 * Mengelola koleksi barang virtual (inventaris) milik pengguna, seperti pembeku rekor (Streak Freeze).
 */
export interface Inventory {
  // Jumlah item Streak Freeze yang dimiliki pengguna
  streakFreeze: number;
  
  // Quest harian yang telah diklaim luring (disimpan di client-side saja, bukan kolom DB)
  claimedQuests?: {
    date: string;
    quests: string[];
  };
  
  // Daftar prestasi (lencana) yang telah berhasil dibuka
  achievements?: UnlockedAchievement[];
}

/**
 * Interface: Settings
 * 
 * Menyimpan konfigurasi preferensi belajar dan opsi tampilan antarmuka pengguna.
 */
export interface Settings {
  // Status apakah notifikasi browser diaktifkan
  notificationsEnabled: boolean;
  
  // Target ulasan harian (disimpan luring di client-side)
  dailyReviewGoal?: number;
  
  // Target pelajaran harian (disimpan luring di client-side)
  dailyLessonGoal?: number;
  
  // Preferensi menampilkan Furigana di atas kanji (disimpan luring di client-side)
  showFurigana?: boolean;
  
  // Preferensi tata letak daftar pelajaran, antara kisi atau daftar (disimpan luring di client-side)
  layoutPreference?: "grid" | "list";
}

/**
 * Interface: LessonProgress
 * 
 * Melacak progres penyelesaian kuis mini pelajaran secara individual.
 */
export interface LessonProgress {
  // Timestamp ketika pelajaran diselesaikan
  completedAt: number;
  
  // Timestamp pembaruan progres terakhir kali
  updatedAt: number;
  
  // Status apakah progres pelajaran ini dihapus (untuk rekonsiliasi soft-delete)
  isDeleted?: boolean;
}

/**
 * Interface: UserProgress
 * 
 * Skema data progres belajar komprehensif terpadu milik pengguna.
 * Digunakan sebagai muatan (payload) saat melakukan sinkronisasi awan antara Zustand luring dan Supabase daring.
 */
export interface UserProgress {
  id: string;
  isGuest: boolean;
  name: string | null;
  xp: number;
  level: number;
  streak: number;
  todayReviewCount: number;
  lastStudyDate: string | null;
  studyDays: Record<string, number>;
  srs: Record<string, SRSState>;
  completedLessons: Record<string, LessonProgress>;
  notifications: Notification[];
  inventory: Inventory;
  settings: Settings;
}
