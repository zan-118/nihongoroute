import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, Lock } from "lucide-react";
import { Quest } from "./types";

interface QuestItemProps {
  quest: Quest;
  current: number;
  isClaimed: boolean;
  justClaimed: boolean;
  onClaim: (quest: Quest) => void;
}

export function QuestItem({
  quest,
  current,
  isClaimed,
  justClaimed,
  onClaim,
}: QuestItemProps) {
  const percent = Math.min((current / quest.target) * 100, 100);
  const isCompleted = current >= quest.target;

  return (
    <Card
      className={`relative group p-5 md:p-6 rounded-[1.5rem] md:rounded-[2rem] border transition-all duration-500 neo-card shadow-none ${
        isClaimed
          ? "bg-black/20 border-white/5 opacity-50 grayscale"
          : isCompleted
            ? "bg-emerald-500/5 border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.1)]"
            : "bg-[#121620] border-white/5 hover:border-cyber-neon/30"
      }`}
    >
      <AnimatePresence mode="wait">
        {justClaimed && (
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
            onClick={() => onClaim(quest)}
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
}
