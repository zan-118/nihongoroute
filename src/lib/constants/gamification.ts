/**
 * @file gamification.ts
 * @description Konstanta terpusat untuk data gamifikasi NihongoRoute (Pool Misi Harian & 20 Lencana Prestasi).
 * Didesain tanpa markup JSX untuk mematuhi kaidah isolasi kode di direktori src/lib/.
 *
 * @package lib/constants
 * @project NihongoRoute
 */

import React from "react";
import { 
 Brain, 
 Fire, 
 Zap, 
 BookOpen, 
 Trophy, 
 VipCrown, 
 Target, 
 Award, 
 Book, 
 GraduationCap, 
 Star,
 Pulse,
 Heart
} from "@/components/ui/icons";
import { UserProgress } from "@/store/types";

// ==========================================
// TIPE DATA & ANTARMUKA
// ==========================================

/**
 * Quest structure. Define daily task parameters.
 */
export interface Quest {
 id: string;
 title: string;
 type: "review" | "xp" | "streak";
 target: number;
 rewardXP: number;
 icon: React.ComponentType<{ size?: number; className?: string }>;
}

/**
 * Achievement structure. Track user milestones.
 */
export interface Achievement {
 id: string;
 title: string;
 description: string;
 icon: React.ComponentType<{ size?: number; className?: string }>;
 condition: (progress: UserProgress) => number; // Mengembalikan persentase progres 0-100
 threshold: number;
}

// ==========================================
// POOL 15 MISI HARIAN (DAILY QUESTS POOL)
// ==========================================

/**
 * Pool of daily quests. System select subset daily.
 */
export const DAILY_QUESTS_POOL: Quest[] = [
 {
 id: "q_review_10",
 title: "Pemanasan",
 type: "review",
 target: 10,
 rewardXP: 20,
 icon: Brain,
 },
 {
 id: "q_review_25",
 title: "Latihan Rutin",
 type: "review",
 target: 25,
 rewardXP: 50,
 icon: BookOpen,
 },
 {
 id: "q_review_50",
 title: "Ingatan Super",
 type: "review",
 target: 50,
 rewardXP: 100,
 icon: Fire,
 },
 {
 id: "q_review_100",
 title: "Master Memori",
 type: "review",
 target: 100,
 rewardXP: 250,
 icon: Award,
 },
 {
 id: "q_xp_100",
 title: "Langkah Ringan",
 type: "xp",
 target: 100,
 rewardXP: 30,
 icon: Zap,
 },
 {
 id: "q_xp_250",
 title: "Fokus Berlanjut",
 type: "xp",
 target: 250,
 rewardXP: 80,
 icon: Zap,
 },
 {
 id: "q_xp_500",
 title: "Kejar Progres",
 type: "xp",
 target: 500,
 rewardXP: 150,
 icon: Zap,
 },
 {
 id: "q_xp_1000",
 title: "Ambisi Membara",
 type: "xp",
 target: 1000,
 rewardXP: 300,
 icon: Trophy,
 },
 {
 id: "q_streak_3",
 title: "Konsistensi Awal",
 type: "streak",
 target: 3,
 rewardXP: 50,
 icon: Fire,
 },
 {
 id: "q_streak_7",
 title: "Pejuang Streak",
 type: "streak",
 target: 7,
 rewardXP: 150,
 icon: Fire,
 },
 {
 id: "q_review_5",
 title: "Sedikit Tapi Rutin",
 type: "review",
 target: 5,
 rewardXP: 10,
 icon: Brain,
 },
 {
 id: "q_xp_50",
 title: "Pijakan Pertama",
 type: "xp",
 target: 50,
 rewardXP: 15,
 icon: Zap,
 },
 {
 id: "q_review_15",
 title: "Fokus Harian",
 type: "review",
 target: 15,
 rewardXP: 30,
 icon: Brain,
 },
 {
 id: "q_xp_300",
 title: "Progres Cepat",
 type: "xp",
 target: 300,
 rewardXP: 100,
 icon: Trophy,
 },
 {
 id: "q_streak_5",
 title: "Disiplin Pekan",
 type: "streak",
 target: 5,
 rewardXP: 100,
 icon: Fire,
 },
];

// ==========================================
// DAFTAR 20 LENCANA PRESTASI (ACHIEVEMENTS LIST)
// ==========================================

/**
 * List of achievements. Evaluate progress against thresholds.
 */
export const ACHIEVEMENTS_LIST: Achievement[] = [
 // 1. Kosakata dipelajari (SRS card count)
 {
 id: "first_steps",
 title: "Langkah Pertama",
 description: "Pelajari 5 kosakata pertama kamu",
 icon: Star,
 condition: (p) => (Object.keys(p.srs || {}).length / 5) * 100,
 threshold: 5
 },
 {
 id: "vocab_explorer",
 title: "Penjelajah Kata",
 description: "Mempelajari 20 kosakata di kamus",
 icon: BookOpen,
 condition: (p) => (Object.keys(p.srs || {}).length / 20) * 100,
 threshold: 20
 },
 {
 id: "vocab_collector",
 title: "Kolektor Kata",
 description: "Pelajari 50 kosakata kamu",
 icon: BookOpen,
 condition: (p) => (Object.keys(p.srs || {}).length / 50) * 100,
 threshold: 50
 },
 {
 id: "vocab_master",
 title: "Master Leksikal",
 description: "Mempelajari 100 kosakata di kamus",
 icon: Book,
 condition: (p) => (Object.keys(p.srs || {}).length / 100) * 100,
 threshold: 100
 },
 {
 id: "vocab_titan",
 title: "Raja Leksikal",
 description: "Mempelajari 250 kosakata di kamus",
 icon: VipCrown,
 condition: (p) => (Object.keys(p.srs || {}).length / 250) * 100,
 threshold: 250
 },
 {
 id: "vocab_legend",
 title: "Dewa Kosakata",
 description: "Mempelajari 500 kosakata di kamus",
 icon: Trophy,
 condition: (p) => (Object.keys(p.srs || {}).length / 500) * 100,
 threshold: 500
 },
 
 // 2. Rekor Hari Berturut-turut (Streak)
 {
 id: "streak_bronze",
 title: "Korekan Api",
 description: "Pertahankan streak selama 3 hari",
 icon: Fire,
 condition: (p) => ((p.streak || 0) / 3) * 100,
 threshold: 3
 },
 {
 id: "streak_warrior",
 title: "Pejuang Streak",
 description: "Pertahankan streak selama 7 hari",
 icon: Fire,
 condition: (p) => ((p.streak || 0) / 7) * 100,
 threshold: 7
 },
 {
 id: "streak_silver",
 title: "Ksatria Rutin",
 description: "Pertahankan streak selama 15 hari",
 icon: Fire,
 condition: (p) => ((p.streak || 0) / 15) * 100,
 threshold: 15
 },
 {
 id: "streak_gold",
 title: "Legenda Abadi",
 description: "Pertahankan streak belajarmu selama 30 hari",
 icon: VipCrown,
 condition: (p) => ((p.streak || 0) / 30) * 100,
 threshold: 30
 },

 // 3. Pelajaran Selesai
 {
 id: "lesson_bronze",
 title: "Langkah Akademik",
 description: "Selesaikan 1 Pelajaran pertama kamu",
 icon: GraduationCap,
 condition: (p) => (Object.keys(p.completedLessons || {}).length / 1) * 100,
 threshold: 1
 },
 {
 id: "lesson_silver",
 title: "Akademisi Muda",
 description: "Menyelesaikan 5 Pelajaran di silabus",
 icon: Award,
 condition: (p) => (Object.keys(p.completedLessons || {}).length / 5) * 100,
 threshold: 5
 },
 {
 id: "lesson_gold",
 title: "Begawan Bahasa",
 description: "Menyelesaikan 20 Pelajaran di silabus",
 icon: Trophy,
 condition: (p) => (Object.keys(p.completedLessons || {}).length / 20) * 100,
 threshold: 20
 },

 // 4. Total Poin XP
 {
 id: "xp_bronze",
 title: "Prajurit XP",
 description: "Mengumpulkan total 500 XP",
 icon: Zap,
 condition: (p) => ((p.xp || 0) / 500) * 100,
 threshold: 500
 },
 {
 id: "xp_silver",
 title: "Pengumpul Bintang",
 description: "Mengumpulkan total 2.500 XP",
 icon: Zap,
 condition: (p) => ((p.xp || 0) / 2500) * 100,
 threshold: 2500
 },
 {
 id: "xp_master",
 title: "Pakar XP",
 description: "Kumpulkan total 5.000 XP",
 icon: Zap,
 condition: (p) => ((p.xp || 0) / 5000) * 100,
 threshold: 5000
 },
 {
 id: "xp_gold",
 title: "Konglomerat XP",
 description: "Kumpulkan total 10.000 XP",
 icon: VipCrown,
 condition: (p) => ((p.xp || 0) / 10000) * 100,
 threshold: 10000
 },

 // 5. Level
 {
 id: "level_10",
 title: "Elit Nihongo",
 description: "Capai Level 10",
 icon: VipCrown,
 condition: (p) => ((p.level || 0) / 10) * 100,
 threshold: 10
 },
 {
 id: "level_25",
 title: "Master Nihongo",
 description: "Capai Level 25",
 icon: Trophy,
 condition: (p) => ((p.level || 0) / 25) * 100,
 threshold: 25
 },

 // 6. Ulasan Harian
 {
 id: "perfect_review",
 title: "Fokus Maksimal",
 description: "Selesaikan 100 review hari ini",
 icon: Target,
 condition: (p) => ((p.todayReviewCount || 0) / 100) * 100,
 threshold: 100
 }
];

// ==========================================
// SEEDED RANDOM SELECTION HELPER (PRNG)
// ==========================================

/**
 * Seeded pseudo-random number generator. Ensure same seed yield same sequence.
 * @param seedStr Input string for seed.
 */
function getSeededRandom(seedStr: string) {
 let h = 0;
 // Generate hash from seed string.
 for (let i = 0; i < seedStr.length; i++) {
 h = Math.imul(31, h) + seedStr.charCodeAt(i) | 0;
 }
 // Mulberry32 algorithm. Return float 0 to 1.
 return function() {
 let t = h += 0x6D2B79F5;
 t = Math.imul(t ^ (t >>> 15), t | 1);
 t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
 return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
 }
}

/**
 * Select 3 daily quests. Use date string as seed for consistency.
 * @param quests Quest pool.
 * @param dateStr Date string key.
 */
export function getTodayQuests(quests: Quest[], dateStr: string): Quest[] {
 if (quests.length <= 3) return quests;
 const rand = getSeededRandom(dateStr);
 const shuffled = [...quests];
 
 // Fisher-Yates Shuffle menggunakan generator acak seeded
 for (let i = shuffled.length - 1; i > 0; i--) {
 const j = Math.floor(rand() * (i + 1));
 [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
 }
 
 return shuffled.slice(0, 3);
}