import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trophy, ShieldAlert, RotateCcw } from "lucide-react";
import { SurvivalGameState } from "./types";

interface SurvivalGameOverProps {
  gameState: SurvivalGameState;
  score: number;
  startGame: () => void;
}

export function SurvivalGameOver({ gameState, score, startGame }: SurvivalGameOverProps) {
  const isVictory = gameState === "victory";
  const accentColor = isVictory ? "text-amber-400" : "text-cyber-neon";
  const shadowColor = isVictory ? "rgba(251,191,36,0.3)" : "rgba(0,238,255,0.3)";
  const bgGlowColor = isVictory ? "bg-amber-500/10" : "bg-cyber-neon/10";
  const borderColor = isVictory ? "border-amber-500/40" : "border-cyber-neon/40";

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full px-4"
    >
      <Card
        className={`p-10 md:p-16 lg:p-24 rounded-[3rem] md:rounded-[4rem] text-center max-w-2xl mx-auto my-8 md:my-10 relative overflow-hidden border neo-card shadow-none bg-cyber-surface ${borderColor}`}
        style={{ boxShadow: `0 0 60px ${shadowColor}` }}
      >
        <div className={`absolute inset-0 ${bgGlowColor} pointer-events-none opacity-50`} />

        <Card className={`w-24 h-24 md:w-32 md:h-32 mx-auto rounded-[2rem] md:rounded-[3rem] flex items-center justify-center mb-8 md:mb-12 neo-inset shadow-none border-white/5 bg-black/40 relative z-10`}>
          {isVictory ? (
            <Trophy
              size={48}
              className="text-amber-400 drop-shadow-[0_0_20px_rgba(251,191,36,0.7)] md:w-16 md:h-16"
            />
          ) : (
            <ShieldAlert
              size={48}
              className="text-cyber-neon drop-shadow-[0_0_20px_rgba(0,238,255,0.7)] md:w-16 md:h-16"
            />
          )}
        </Card>

        <h2 className={`text-4xl md:text-6xl lg:text-7xl font-black tracking-tight mb-6 md:mb-8 relative z-10 leading-none ${accentColor}`}>
          {isVictory ? "Luar Biasa!" : "Evaluasi Selesai"}
        </h2>
        
        <div className="flex flex-col items-center gap-3 md:gap-4 mb-10 md:mb-14 relative z-10">
          <Badge variant="outline" className="text-slate-500 font-bold uppercase tracking-widest text-[9px] md:text-[10px] h-auto border-white/10 neo-inset px-6 py-2 md:px-8 md:py-3 rounded-2xl bg-black/30">
            SKOR AKHIR
          </Badge>
          <div className="flex flex-col">
             <span className="text-white text-7xl md:text-8xl lg:text-9xl font-black drop-shadow-[0_0_20px_rgba(255,255,255,0.3)] leading-none">{score}</span>
             <span className="text-slate-500 font-bold text-[9px] md:text-[10px] uppercase tracking-widest mt-3 md:mt-4">KATA TERJAWAB</span>
          </div>
        </div>

        <Button
          onClick={startGame}
          variant="ghost"
          className="flex items-center justify-center gap-4 md:gap-6 w-full h-auto py-6 md:py-8 relative z-10 font-bold uppercase tracking-widest text-[10px] md:text-xs border-white/5 neo-card shadow-none bg-black/40 hover:bg-cyber-neon hover:text-black transition-all rounded-[2rem] group"
        >
          <RotateCcw size={20} className="group-hover:-rotate-180 transition-transform duration-700 md:w-6 md:h-6" /> ULANGI EVALUASI
        </Button>
      </Card>
    </motion.div>
  );
}
