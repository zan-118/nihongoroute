"use client";

import { useState, useEffect } from "react";
import { useProgress } from "@/context/UserProgressContext";
import { motion, AnimatePresence } from "framer-motion";
import { loadProgress, ProgressState } from "@/lib/progress";

export interface Quest {
  id: string;
  title: string;
  type: "review" | "xp" | "streak";
  target: number;
  rewardXP: number;
  icon: string;
}

const DAILY_QUESTS: Quest[] = [
  {
    id: "q_review_10",
    title: "Pemanasan Otak",
    type: "review",
    target: 10,
    rewardXP: 20,
    icon: "🧠",
  },
  {
    id: "q_review_50",
    title: "Pejuang Memori",
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
  const [stats, setStats] = useState<ProgressState | null>(null);

  useEffect(() => {
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

    updateProgress(progress.xp + quest.rewardXP, progress.srs);

    const newClaimed = { ...claimedQuests, [quest.id]: true };
    saveClaimed(newClaimed);

    setJustClaimed(quest.id);
    setTimeout(() => setJustClaimed(null), 2000);
  };

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
    <section className="bg-cyber-surface p-6 md:p-8 rounded-[2.5rem] border border-white/5 h-full relative overflow-hidden shadow-[inset_0_0_20px_rgba(0,0,0,0.5)]">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:15px_15px] opacity-30 pointer-events-none" />

      <header className="flex items-center justify-between mb-8 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center shadow-[0_0_10px_rgba(16,185,129,0.2)]">
            <span className="text-emerald-400 text-sm">🎯</span>
          </div>
          <h3 className="text-white font-black uppercase tracking-widest text-sm md:text-base drop-shadow-md">
            Misi Harian
          </h3>
        </div>
        <span className="bg-cyber-bg border border-white/10 text-[#c4cfde] px-3 py-1.5 rounded-full text-[9px] font-black tracking-[0.2em] uppercase shadow-inner hidden md:block">
          Direset Tengah Malam
        </span>
      </header>

      <div className="space-y-5 relative z-10">
        {DAILY_QUESTS.map((quest) => {
          const current = getCurrentProgress(quest.type);
          const percent = Math.min((current / quest.target) * 100, 100);
          const isCompleted = current >= quest.target;
          const isClaimed = claimedQuests[quest.id];

          return (
            <article
              key={quest.id}
              className={`relative group p-4 rounded-2xl border transition-all duration-300 ${
                isClaimed
                  ? "bg-white/5 border-white/5 opacity-50 grayscale"
                  : isCompleted
                    ? "bg-emerald-500/10 border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.15)] hover:border-emerald-500/50"
                    : "bg-cyber-bg border-white/5 hover:border-white/10"
              }`}
            >
              <AnimatePresence>
                {justClaimed === quest.id && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.2 }}
                    className="absolute inset-0 flex items-center justify-center bg-emerald-500/20 backdrop-blur-sm rounded-2xl z-20"
                  >
                    <span className="text-emerald-400 font-black italic tracking-widest uppercase drop-shadow-[0_0_8px_rgba(16,185,129,0.8)]">
                      +{quest.rewardXP} XP DIAMBIL!
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-3">
                  <span className="text-xl opacity-80">{quest.icon}</span>
                  <div>
                    <h4
                      className={`text-xs font-black uppercase tracking-wide transition-colors ${
                        isCompleted && !isClaimed
                          ? "text-emerald-400"
                          : "text-white"
                      }`}
                    >
                      {quest.title}
                    </h4>
                    <p className="text-[10px] text-cyan-400 font-bold uppercase tracking-widest mt-0.5 opacity-80">
                      Hadiah: +{quest.rewardXP} XP
                    </p>
                  </div>
                </div>

                {isClaimed ? (
                  <span className="text-[10px] font-black text-white/20 uppercase tracking-widest bg-black/20 px-2 py-1 rounded">
                    Selesai
                  </span>
                ) : isCompleted ? (
                  <button
                    onClick={() => handleClaim(quest)}
                    aria-label={`Ambil hadiah ${quest.rewardXP} XP`}
                    className="text-[10px] font-black text-black bg-emerald-400 uppercase tracking-widest px-3 py-1.5 rounded-lg shadow-[0_0_10px_rgba(16,185,129,0.4)] hover:scale-105 active:scale-95 transition-all animate-pulse"
                  >
                    Ambil
                  </button>
                ) : (
                  <span className="text-[10px] font-black text-white/40 font-mono bg-black/30 px-2 py-1 rounded shadow-inner">
                    {current} / {quest.target}
                  </span>
                )}
              </div>

              <div className="w-full bg-black/40 h-2 rounded-full overflow-hidden shadow-[inset_0_1px_3px_rgba(0,0,0,0.8)] relative">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${percent}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className={`h-full relative ${
                    isCompleted
                      ? "bg-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.8)]"
                      : "bg-gradient-to-r from-cyan-400 to-blue-500 shadow-[0_0_10px_rgba(0,255,239,0.5)]"
                  }`}
                >
                  <div className="absolute top-0 left-0 right-0 h-[1px] bg-white/30" />
                </motion.div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
