/**
 * @file DailyQuests.tsx
 * @description Komponen Misi Harian yang memberikan XP kepada pengguna berdasarkan aktivitas (review, XP harian).
 * @module DailyQuests
 */

"use client";

// ======================
// IMPORTS
// ======================
import { useState, useEffect } from "react";
import { useProgress } from "@/context/UserProgressContext";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { Target, CheckCircle2, Zap, Brain, Flame, Lock, Sparkles } from "lucide-react";

// ======================
// CONSTANTS / CONFIG
// ======================
export interface Quest {
  id: string;
  title: string;
  type: "review" | "xp" | "streak";
  target: number;
  rewardXP: number;
  icon: React.ReactNode;
}

const DAILY_QUESTS: Quest[] = [
  {
    id: "q_review_10",
    title: "Pemanasan",
    type: "review",
    target: 10,
    rewardXP: 20,
    icon: <Brain size={18} className="text-cyber-neon" />,
  },
  {
    id: "q_review_50",
    title: "Ingatan Super",
    type: "review",
    target: 50,
    rewardXP: 100,
    icon: <Flame size={18} className="text-cyber-neon" />,
  },
  {
    id: "q_xp_500",
    title: "Kejar Progres",
    type: "xp",
    target: 500,
    rewardXP: 150,
    icon: <Zap size={18} className="text-cyber-neon" />,
  },
];

// ======================
// MAIN EXECUTION
// ======================

/**
 * Komponen DailyQuests: Menampilkan daftar misi harian dan menangani pengambilan hadiah.
 * 
 * @returns {JSX.Element} Panel misi harian.
 */
export default function DailyQuests() {
  const { progress, updateProgress } = useProgress();
  const [claimedQuests, setClaimedQuests] = useState<Record<string, boolean>>(
    {},
  );
  const [justClaimed, setJustClaimed] = useState<string | null>(null);

  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    const saved = localStorage.getItem(`nihongo-quests-${today}`);
    if (saved) {
      setClaimedQuests(JSON.parse(saved));
    }
  }, []);

  // ======================
  // HELPER FUNCTIONS
  // ======================

  /**
   * Menyimpan status misi yang sudah diklaim ke local storage.
   */
  const saveClaimed = (newClaimed: Record<string, boolean>) => {
    const today = new Date().toISOString().split("T")[0];
    localStorage.setItem(`nihongo-quests-${today}`, JSON.stringify(newClaimed));
    setClaimedQuests(newClaimed);
  };

  /**
   * Menangani aksi klaim hadiah misi.
   */
  const handleClaim = (quest: Quest) => {
    if (claimedQuests[quest.id]) return;

    updateProgress(progress.xp + quest.rewardXP, progress.srs);

    const newClaimed = { ...claimedQuests, [quest.id]: true };
    saveClaimed(newClaimed);

    toast.success("Misi Selesai!", {
      description: `Kamu mendapatkan +${quest.rewardXP} XP. Terus semangat belajarnya!`,
    });

    setJustClaimed(quest.id);
    setTimeout(() => setJustClaimed(null), 2000);
  };

  /**
   * Mendapatkan progres saat ini berdasarkan tipe misi.
   */
  const getCurrentProgress = (type: Quest["type"]) => {
    switch (type) {
      case "review":
        return progress.todayReviewCount || 0;
      case "xp":
        return progress.xp % 1000;
      case "streak":
        return progress.streak || 0;
      default:
        return 0;
    }
  };
  // ======================
  // RENDER
  // ======================
  return (
    <Card className="bg-[#0a0c10] p-6 md:p-8 lg:p-10 rounded-[2.5rem] md:rounded-[3rem] border-white/5 h-full relative overflow-hidden neo-card shadow-none flex flex-col">
      {/* Decorative scanline overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,238,255,0.02)_1px,transparent_1px)] bg-[size:100%_4px] opacity-40 pointer-events-none" />

      <header className="flex items-center justify-between mb-8 md:mb-10 relative z-10">
        <div className="flex items-center gap-3 md:gap-4">
          <Card className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-cyber-neon/10 border-cyber-neon/20 flex items-center justify-center neo-inset shadow-none shrink-0">
            <Target size={20} className="text-cyber-neon md:w-6 md:h-6" />
          </Card>
          <div className="text-left">
            <h3 className="text-white font-black uppercase tracking-widest text-xs md:text-sm drop-shadow-md">
              Target Hari Ini
            </h3>
            <span className="block text-[9px] md:text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">
              Yuk, kejar targetmu!
            </span>
          </div>
        </div>
        <Badge
          variant="outline"
          className="bg-[#121620] border-white/5 text-slate-500 px-3 py-1.5 md:px-4 md:py-2 rounded-xl text-[9px] md:text-[10px] font-bold tracking-widest uppercase neo-inset h-auto"
        >
          Reset 00:00
        </Badge>
      </header>

      <div className="space-y-4 md:space-y-6 relative z-10 flex-1 flex flex-col justify-center">
        {Object.keys(claimedQuests).length === DAILY_QUESTS.length ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex-1 flex flex-col items-center justify-center text-center p-8 relative"
          >
            <div className="absolute inset-0 bg-emerald-500/5 blur-3xl rounded-full animate-bloom pointer-events-none" />
            <div className="w-24 h-24 bg-emerald-500/10 rounded-[2rem] flex items-center justify-center mb-6 neo-inset border-emerald-500/20 relative z-10">
              <Sparkles size={48} className="text-emerald-400 drop-shadow-[0_0_15px_rgba(52,211,153,0.5)]" />
            </div>
            <h4 className="text-xl font-black text-white uppercase italic tracking-tighter mb-2 relative z-10">
              Target Tercapai!
            </h4>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest max-w-[200px] leading-relaxed relative z-10">
              Kamu luar biasa! Semua misi hari ini sudah beres. Istirahat yang cukup ya, esok misi baru menanti.
            </p>
          </motion.div>
        ) : (
          DAILY_QUESTS.map((quest) => {
            const current = getCurrentProgress(quest.type);
            const percent = Math.min((current / quest.target) * 100, 100);
            const isCompleted = current >= quest.target;
            const isClaimed = claimedQuests[quest.id];

            return (
              <Card
                key={quest.id}
                className={`relative group p-5 md:p-6 rounded-[1.5rem] md:rounded-[2rem] border transition-all duration-500 neo-card shadow-none ${
                  isClaimed
                    ? "bg-black/20 border-white/5 opacity-50 grayscale"
                    : isCompleted
                      ? "bg-emerald-500/5 border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.1)]"
                      : "bg-[#121620] border-white/5 hover:border-cyber-neon/30"
                }`}
              >
                <AnimatePresence mode="wait">
                  {justClaimed === quest.id && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 1.05 }}
                      className="absolute inset-0 flex items-center justify-center bg-emerald-500/10 backdrop-blur-md rounded-[1.5rem] md:rounded-[2rem] z-20"
                    >
                      <span className="text-emerald-400 font-black tracking-widest uppercase text-[10px] md:text-xs">
                        BERHASIL! +{quest.rewardXP} XP
                      </span>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="flex justify-between items-center mb-4 md:mb-5">
                  <div className="flex items-center gap-3 md:gap-4">
                    <Card className={`w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl flex items-center justify-center neo-inset shadow-none transition-all shrink-0 ${isCompleted && !isClaimed ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-black/40 border-white/5'}`}>
                      {isClaimed ? <CheckCircle2 size={18} className="text-emerald-500/60" /> : quest.icon}
                    </Card>
                    <div className="text-left">
                      <h4
                        className={`text-xs md:text-sm font-black uppercase tracking-widest transition-colors ${
                          isCompleted && !isClaimed
                            ? "text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.5)]"
                            : "text-white"
                        }`}
                      >
                        {quest.title}
                      </h4>
                      <p className={`text-[9px] md:text-[10px] font-bold uppercase tracking-widest mt-1 ${isCompleted ? 'text-emerald-400/70' : 'text-cyber-neon/70'}`}>
                        HADIAH: +{quest.rewardXP} XP
                      </p>
                    </div>
                  </div>

                  {isClaimed ? (
                    <div className="text-slate-600 font-bold text-[9px] md:text-[10px] uppercase tracking-widest flex items-center gap-1.5 shrink-0">
                      <Lock size={12} /> Diambil
                    </div>
                  ) : isCompleted ? (
                    <Button
                      onClick={() => handleClaim(quest)}
                      className="h-auto text-[9px] md:text-[10px] font-black text-black bg-emerald-400 hover:bg-white uppercase tracking-widest px-4 py-2 md:px-5 md:py-2.5 rounded-xl shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all animate-pulse border-none shrink-0"
                    >
                      Ambil
                    </Button>
                  ) : (
                    <Badge variant="outline" className="text-[9px] md:text-[10px] font-bold text-slate-400 font-mono bg-black/40 px-2 py-1 md:px-3 md:py-1.5 rounded-lg border-white/5 neo-inset h-auto shrink-0">
                      {current} / {quest.target}
                    </Badge>
                  )}
                </div>

                <Progress
                  value={percent}
                  className="h-1.5 md:h-2 bg-black/40"
                  indicatorClassName={
                    isClaimed 
                      ? "bg-slate-700" 
                      : isCompleted
                        ? "bg-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.8)]"
                        : "bg-cyber-neon shadow-[0_0_10px_rgba(0,238,255,0.5)]"
                  }
                />
              </Card>
            );
          })
        )}
      </div>
    </Card>
  );
}

