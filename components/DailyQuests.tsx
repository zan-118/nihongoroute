"use client";

import { useState, useEffect } from "react";
import { useProgress } from "@/context/UserProgressContext";
import { motion, AnimatePresence } from "framer-motion";
import { loadProgress, ProgressState } from "@/lib/progress"; // ✨ IMPORT BARU

// --- TYPES ---
interface Quest {
  id: string;
  title: string;
  type: "review" | "xp" | "streak";
  target: number;
  rewardXP: number;
  icon: string;
}

// --- CONSTANTS ---
const DAILY_QUESTS: Quest[] = [
  {
    id: "q_review_10",
    title: "Pemanasan Memori",
    type: "review",
    target: 10,
    rewardXP: 20,
    icon: "🧠",
  },
  {
    id: "q_review_50",
    title: "Ahli Flashcard",
    type: "review",
    target: 50,
    rewardXP: 100,
    icon: "🔥",
  },
  {
    id: "q_xp_500",
    title: "Pemburu XP",
    type: "xp",
    target: 500,
    rewardXP: 150,
    icon: "⚡",
  },
];

export default function DailyQuests() {
  const { progress, updateProgress } = useProgress();
  const [claimedQuests, setClaimedQuests] = useState<Record<string, boolean>>(
    {},
  );
  const [justClaimed, setJustClaimed] = useState<string | null>(null);

  // ✨ STATE BARU UNTUK STATISTIK ✨
  const [stats, setStats] = useState<ProgressState | null>(null);

  useEffect(() => {
    // Memuat data streak & review harian dengan aman di sisi klien
    setStats(loadProgress());

    const today = new Date().toISOString().split("T")[0];
    const saved = localStorage.getItem(`nihongo-quests-${today}`);
    if (saved) {
      setClaimedQuests(JSON.parse(saved));
    }
  }, []);

  const saveClaimed = (newClaimed: Record<string, boolean>) => {
    const today = new Date().toISOString().split("T")[0];
    localStorage.setItem(`nihongo-quests-${today}`, JSON.stringify(newClaimed));
    setClaimedQuests(newClaimed);
  };

  const handleClaim = (quest: Quest) => {
    if (claimedQuests[quest.id]) return;

    // Grant XP
    updateProgress(progress.xp + quest.rewardXP, progress.srs);

    // Mark as claimed
    const newClaimed = { ...claimedQuests, [quest.id]: true };
    saveClaimed(newClaimed);

    // Trigger animation
    setJustClaimed(quest.id);
    setTimeout(() => setJustClaimed(null), 2000);
  };

  // ✨ FIX: Membaca dari `stats` bukan dari `progress` Context ✨
  const getCurrentProgress = (type: Quest["type"]) => {
    switch (type) {
      case "review":
        return stats?.todayReviewCount || 0;
      case "xp":
        return progress.xp % 1000;
      case "streak":
        return stats?.streak || 0;
      default:
        return 0;
    }
  };

  return (
    <div className="bg-[#1e2024] p-6 md:p-8 rounded-[2.5rem] border border-white/5 h-full relative overflow-hidden shadow-[inset_0_0_20px_rgba(0,0,0,0.5)]">
      {/* Cyber Grid Background */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:15px_15px] opacity-30 pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between mb-8 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#0ef]/10 border border-[#0ef]/30 flex items-center justify-center shadow-[0_0_10px_rgba(0,255,239,0.2)]">
            <span className="text-[#0ef] text-sm">🎯</span>
          </div>
          <h3 className="text-white font-black uppercase tracking-widest text-sm md:text-base drop-shadow-md">
            Daily Quests
          </h3>
        </div>
        <span className="bg-[#15171a] border border-white/10 text-[#c4cfde] px-3 py-1.5 rounded-full text-[9px] font-black tracking-[0.2em] uppercase shadow-inner">
          Resets at Midnight
        </span>
      </div>

      {/* Quests List */}
      <div className="space-y-5 relative z-10">
        {DAILY_QUESTS.map((quest) => {
          const current = getCurrentProgress(quest.type);
          const percent = Math.min((current / quest.target) * 100, 100);
          const isCompleted = current >= quest.target;
          const isClaimed = claimedQuests[quest.id];

          return (
            <div
              key={quest.id}
              className={`relative group p-4 rounded-2xl border transition-all duration-300 ${
                isClaimed
                  ? "bg-white/5 border-white/5 opacity-50 grayscale"
                  : isCompleted
                    ? "bg-green-500/10 border-green-500/30 shadow-[0_0_15px_rgba(34,197,94,0.15)] hover:border-green-500/50"
                    : "bg-[#15171a] border-white/5 hover:border-white/10"
              }`}
            >
              {/* Claim Animation Overlay */}
              <AnimatePresence>
                {justClaimed === quest.id && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.2 }}
                    className="absolute inset-0 flex items-center justify-center bg-green-500/20 backdrop-blur-sm rounded-2xl z-20"
                  >
                    <span className="text-green-400 font-black italic tracking-widest uppercase drop-shadow-[0_0_8px_rgba(34,197,94,0.8)]">
                      +{quest.rewardXP} XP CLAIMED!
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-3">
                  <span className="text-xl opacity-80">{quest.icon}</span>
                  <div>
                    <p
                      className={`text-xs font-black uppercase tracking-wide transition-colors ${
                        isCompleted && !isClaimed
                          ? "text-green-400"
                          : "text-white"
                      }`}
                    >
                      {quest.title}
                    </p>
                    <p className="text-[10px] text-[#0ef] font-bold uppercase tracking-widest mt-0.5 opacity-80">
                      Reward: +{quest.rewardXP} XP
                    </p>
                  </div>
                </div>

                {/* Status / Claim Button */}
                {isClaimed ? (
                  <span className="text-[10px] font-black text-white/20 uppercase tracking-widest bg-black/20 px-2 py-1 rounded">
                    Claimed
                  </span>
                ) : isCompleted ? (
                  <button
                    onClick={() => handleClaim(quest)}
                    className="text-[10px] font-black text-[#1f242d] bg-green-400 uppercase tracking-widest px-3 py-1.5 rounded-lg shadow-[0_0_10px_rgba(34,197,94,0.4)] hover:scale-105 active:scale-95 transition-all animate-pulse"
                  >
                    Claim
                  </button>
                ) : (
                  <span className="text-[10px] font-black text-white/40 font-mono bg-black/30 px-2 py-1 rounded shadow-inner">
                    {current} / {quest.target}
                  </span>
                )}
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-black/40 h-2 rounded-full overflow-hidden shadow-[inset_0_1px_3px_rgba(0,0,0,0.8)] relative">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${percent}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className={`h-full relative ${
                    isCompleted
                      ? "bg-green-400 shadow-[0_0_10px_rgba(34,197,94,0.8)]"
                      : "bg-gradient-to-r from-[#0ef] to-blue-500 shadow-[0_0_10px_rgba(0,255,239,0.5)]"
                  }`}
                >
                  <div className="absolute top-0 left-0 right-0 h-[1px] bg-white/30" />
                </motion.div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
