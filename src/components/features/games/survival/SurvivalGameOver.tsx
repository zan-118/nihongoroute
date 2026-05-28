import { m } from "framer-motion";
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
  const earnedXp = isVictory ? (score * 2 + 10) : (score * 2);
  const accentColor = isVictory ? "text-warning" : "text-destructive";
  const bgGlowColor = isVictory ? "bg-warning/10" : "bg-destructive/10";
  const borderColor = isVictory ? "border-warning/40" : "border-destructive/40";

  return (
    <m.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full px-4 transition-colors duration-300"
    >
      <Card
        className={`p-10 md:p-16 lg:p-24 rounded-[3rem] md:rounded-[4rem] text-center max-w-2xl mx-auto my-8 md:my-10 relative overflow-hidden border neo-card shadow-2xl bg-card bg-background ${borderColor}`}
      >
        <div className={`absolute inset-0 ${bgGlowColor} pointer-events-none opacity-50`} />

        <Card className={`w-24 h-24 md:w-32 md:h-32 mx-auto rounded-[2rem] md:rounded-[3rem] flex items-center justify-center mb-8 md:mb-12 neo-inset shadow-none border border-border bg-[rgba(var(--muted-rgb),0.5)] dark:bg-[rgba(var(--background-rgb),0.4)] relative z-10`}>
          {isVictory ? (
            <Trophy
              size={48}
              aria-hidden="true"
              className="text-warning drop-shadow-sm dark:drop-shadow-[0_0_20px_rgba(var(--warning-rgb),0.7)] md:w-16 md:h-16"
            />
          ) : (
            <ShieldAlert
              size={48}
              aria-hidden="true"
              className="text-destructive drop-shadow-sm dark:drop-shadow-[0_0_20px_rgba(var(--destructive-rgb),0.7)] md:w-16 md:h-16"
            />
          )}
        </Card>

        <h2 className={`text-4xl md:text-6xl lg:text-7xl font-black tracking-tight mb-6 md:mb-8 relative z-10 leading-none ${accentColor}`}>
          {isVictory ? "Luar Biasa!" : "Yah, Tereliminasi"}
        </h2>
        
        <div className="flex flex-col items-center gap-3 md:gap-4 mb-10 md:mb-14 relative z-10">
          <Badge variant="outline" className="text-muted-foreground font-bold uppercase tracking-widest text-xs md:text-xs h-auto border border-border neo-inset px-6 py-2 md:px-8 md:py-3 rounded-2xl bg-[rgba(var(--muted-rgb),0.5)] dark:bg-[rgba(var(--background-rgb),0.3)]">
            SKOR AKHIR
          </Badge>
          <div className="flex flex-col">
             <span className="text-foreground text-7xl md:text-7xl lg:text-7xl font-black drop-shadow-sm leading-none">{score}</span>
             <span className="text-muted-foreground font-bold text-xs md:text-xs uppercase tracking-widest mt-3 md:mt-4">KATA BERHASIL DITEBAK</span>
             {earnedXp > 0 && (
               <Badge className="bg-success/15 border border-success/30 text-success shadow-[0_0_15px_rgba(var(--success-rgb),0.2)] text-[10px] sm:text-xs font-black uppercase tracking-widest px-4 py-2 rounded-xl mt-6 w-fit mx-auto animate-premium-bounce shrink-0">
                 + {earnedXp} Poin XP Didapatkan
               </Badge>
             )}
          </div>
        </div>

        <Button
          onClick={startGame}
          variant="ghost"
          className="flex items-center justify-center gap-4 md:gap-6 w-full h-auto py-6 md:py-8 relative z-10 font-bold uppercase tracking-widest text-xs md:text-xs border border-border neo-card shadow-none bg-[rgba(var(--muted-rgb),0.5)] dark:bg-[rgba(var(--background-rgb),0.4)] hover:bg-primary hover:text-primary-foreground transition-all rounded-[2rem] group"
        >
          <RotateCcw size={20} aria-hidden="true" className="group-hover:-rotate-180 transition-transform duration-700 md:w-6 md:h-6" /> COBA LAGI
        </Button>
      </Card>
    </m.div>
  );
}
