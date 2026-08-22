/**
 * @file types.ts
 * @description TypeScript type declarations and model interfaces for integrated user learning progress (offline Zustand & Supabase). Standardizes notifications, virtual inventory, settings, and lesson tracking structures.
 */

import { SRSState } from "@/lib/srs";

// Store Types & Interfaces

/**
 * Visual in-app notification data structure.
 */
export interface Notification {
 /** Unique notification ID */
 id: string;
 /** Notification title */
 title: string;
 /** Notification message content */
 message: string;
 /** Visual notification variant type */
 type: "info" | "success" | "warning" | "achievement";
 /** Creation timestamp in epoch ms */
 timestamp: number;
 /** Status keterbacaan notifikasi */
 read: boolean;
}

/**
 * Interface: UnlockedAchievement
 * 
 * Mencatat data pencapaian prestasi (lencana/badge) yang berhasil dibuka oleh pengguna secara offline.
 */
export interface UnlockedAchievement {
 /** ID unik pencapaian */
 id: string;
 /** Waktu pencapaian dibuka (epoch ms) */
 unlockedAt: number;
}

/**
 * Interface: Inventory
 * 
 * Mengelola koleksi barang virtual (inventaris) milik pengguna, seperti pembeku rekor (Streak Freeze).
 */
export interface Inventory {
 /** Jumlah item Streak Freeze yang dimiliki pengguna */
 streakFreeze: number;
 
 /** Quest harian yang telah diklaim luring (disimpan di client-side saja, bukan kolom DB) */
 claimedQuests?: {
 /** Tanggal klaim quest (format YYYY-MM-DD) */
 date: string;
 /** Daftar ID quest yang telah diklaim */
 quests: string[];
 };
 
 /** Daftar prestasi (lencana) yang telah berhasil dibuka */
 achievements?: UnlockedAchievement[];
}

/**
 * Interface: Settings
 * 
 * Menyimpan konfigurasi preferensi belajar dan opsi tampilan antarmuka pengguna.
 */
export interface Settings {
 /** Status apakah notifikasi browser diaktifkan */
 notificationsEnabled: boolean;
 
 /** Target ulasan harian (disimpan luring di client-side) */
 dailyReviewGoal?: number;
 
 /** Target pelajaran harian (disimpan luring di client-side) */
 dailyLessonGoal?: number;
 
 /** Preferensi menampilkan Furigana di atas kanji (disimpan luring di client-side) */
 showFurigana?: boolean;
 
 /** Preferensi tata letak daftar pelajaran, antara kisi atau daftar (disimpan luring di client-side) */
 layoutPreference?: "grid" | "list";
}

/**
 * Interface: LessonProgress
 * 
 * Melacak progres penyelesaian kuis mini pelajaran secara individual.
 */
export interface LessonProgress {
 /** Timestamp ketika pelajaran diselesaikan */
 completedAt: number;
 
 /** Timestamp pembaruan progres terakhir kali */
 updatedAt: number;
 
 /** Status apakah progres pelajaran ini dihapus (untuk rekonsiliasi soft-delete) */
 isDeleted?: boolean;
}

/**
 * Interface: UserProgress
 * 
 * Skema data progres belajar komprehensif terpadu milik pengguna.
 * Digunakan sebagai muatan (payload) saat melakukan sinkronisasi awan antara Zustand luring dan Supabase daring.
 */
export interface UserProgress {
 /** ID unik pengguna (UUID dari auth atau ID tamu lokal) */
 id: string;
 /** Status apakah pengguna menggunakan akun tamu */
 isGuest: boolean;
 /** Nama tampilan pengguna */
 name: string | null;
 /** Total poin pengalaman (XP) yang dikumpulkan */
 xp: number;
 /** Level belajar pengguna saat ini */
 level: number;
 /** Jumlah hari belajar beruntun (streak) aktif */
 streak: number;
 /** Jumlah ulasan yang telah diselesaikan hari ini */
 todayReviewCount: number;
 /** Tanggal terakhir kali pengguna belajar (format YYYY-MM-DD) */
 lastStudyDate: string | null;
 /** Rekam jejak aktivitas belajar harian (key: tanggal YYYY-MM-DD, value: jumlah aktivitas/XP) */
 studyDays: Record<string, number>;
 /** Data status Spaced Repetition System untuk setiap item kartu memori (key: item ID) */
 srs: Record<string, SRSState>;
 /** Daftar pelajaran yang telah diselesaikan (key: lesson ID) */
 completedLessons: Record<string, LessonProgress>;
 /** Riwayat notifikasi pengguna */
 notifications: Notification[];
 /** Inventaris barang virtual pengguna */
 inventory: Inventory;
 /** Pengaturan preferensi pengguna */
 settings: Settings;
}