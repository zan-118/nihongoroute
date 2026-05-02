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
      className={`relative group p-4 md:p-5 rounded-2xl border transition-all duration-300 shadow-none ${
        isClaimed
          ? "bg-white/[0.01] border-white/[0.04] opacity-50 grayscale"
          : isCompleted
            ? "bg-emerald-500/[0.03] border-emerald-500/30"
            : "bg-white/[0.03] border-white/[0.08] hover:border-cyber-neon/30"
      }`}
    >
      <AnimatePresence mode="wait">
        {justClaimed && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            className="absolute inset-0 flex items-center justify-center bg-emerald-500/10 backdrop-blur-md rounded-2xl z-20"
          >
            <span className="text-emerald-400 font-black tracking-widest uppercase text-[10px]">
              BERHASIL! +{quest.rewardXP} XP
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-3">
          <Card className={`w-10 h-10 md:w-11 md:h-11 rounded-xl flex items-center justify-center shadow-none transition-all shrink-0 ${isCompleted && !isClaimed ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-white/[0.04] border-white/[0.08]'}`}>
            {isClaimed ? <CheckCircle2 size={18} className="text-emerald-500/60" /> : quest.icon}
          </Card>
          <div className="text-left">
            <h4
              className={`text-xs md:text-[13px] font-black uppercase tracking-tight transition-colors ${
                isCompleted && !isClaimed
                  ? "text-emerald-400"
                  : "text-white"
              }`}
            >
              {quest.title}
            </h4>
            <p className={`text-[9px] font-bold uppercase tracking-widest mt-1 ${isCompleted ? 'text-emerald-400/70' : 'text-cyber-neon/60'}`}>
              +{quest.rewardXP} XP
            </p>
          </div>
        </div>

        {isClaimed ? (
          <div className="text-slate-600 font-bold text-[9px] uppercase tracking-widest flex items-center gap-1.5 shrink-0">
            <Lock size={12} /> Diambil
          </div>
        ) : isCompleted ? (
          <Button
            onClick={() => onClaim(quest)}
            className="h-auto text-[9px] font-black text-black bg-emerald-400 hover:bg-white uppercase tracking-widest px-4 py-2 rounded-xl transition-all border-none shrink-0"
          >
            Ambil
          </Button>
        ) : (
          <Badge variant="ghost" className="text-[10px] font-bold text-slate-500 font-mono bg-white/[0.03] px-2.5 py-1 rounded-lg border border-white/[0.08] shadow-none h-auto shrink-0">
            {current} / {quest.target}
          </Badge>
        )}
      </div>

      <Progress
        value={percent}
        className="h-1 bg-black/40 border-none overflow-hidden rounded-full"
        indicatorClassName={
          isClaimed 
            ? "bg-slate-800" 
            : isCompleted
              ? "bg-emerald-400"
              : "bg-cyber-neon"
        }
      />
    </Card>
  );
}
