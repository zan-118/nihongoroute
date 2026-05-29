/**
 * @file constants.tsx
 * @description Konstanta daftar misi harian (Daily Quests) untuk gamifikasi NihongoRoute.
 * Menyediakan definisi ID misi, judul, tipe (review/XP), target kuantitas, hadiah XP, serta ikon Lucide.
 *
 * @package components/features/dashboard/quests
 * @project NihongoRoute
 */

// ==========================================
// IMPOR
// ==========================================
import { Brain, Flame, Zap } from "lucide-react";
import { Quest } from "./types";

// ==========================================
// KONSTANTA DAFTAR MISI
// ==========================================
export const DAILY_QUESTS: Quest[] = [
  {
    id: "q_review_10",
    title: "Pemanasan",
    type: "review",
    target: 10,
    rewardXP: 20,
    icon: <Brain size={18} className="text-primary" />,
  },
  {
    id: "q_review_50",
    title: "Ingatan Super",
    type: "review",
    target: 50,
    rewardXP: 100,
    icon: <Flame size={18} className="text-primary" />,
  },
  {
    id: "q_xp_500",
    title: "Kejar Progres",
    type: "xp",
    target: 500,
    rewardXP: 150,
    icon: <Zap size={18} className="text-primary" />,
  },
];

