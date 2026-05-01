import { Activity } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface SurvivalIntroProps {
  startGame: () => void;
}

export function SurvivalIntro({ startGame }: SurvivalIntroProps) {
  return (
    <Card className="p-8 md:p-16 lg:p-20 rounded-[3rem] md:rounded-[4rem] border-white/5 bg-cyber-surface text-center relative overflow-hidden group max-w-2xl mx-auto my-8 md:my-10 neo-card shadow-none">
      <div className="absolute inset-0 bg-cyber-neon/5 opacity-0 group-hover:opacity-100 transition-all duration-1000 pointer-events-none" />
      <Card className="w-20 h-20 md:w-28 md:h-28 mx-auto bg-black/40 border-cyber-neon/20 rounded-[2rem] md:rounded-[2.5rem] flex items-center justify-center mb-8 md:mb-12 neo-inset shadow-none group-hover:border-cyber-neon/40 transition-all duration-500">
        <Activity
          size={40}
          className="text-cyber-neon drop-shadow-[0_0_15px_rgba(0,238,255,0.6)] animate-pulse md:w-12 md:h-12"
        />
      </Card>
      <h2 className="text-4xl md:text-6xl lg:text-7xl font-black text-white tracking-tight mb-6 md:mb-8 leading-none">
        Mode <span className="text-cyber-neon drop-shadow-[0_0_20px_rgba(0,238,255,0.4)]">Evaluasi</span>
      </h2>
      <p className="text-slate-400 mb-10 md:mb-14 max-w-md mx-auto text-xs md:text-sm leading-relaxed font-bold tracking-wide">
        Uji kecepatan dan ingatan Anda. Jawab sebelum waktu habis. 3 kesempatan. Buktikan penguasaan kosakata Anda.
      </p>
      <Button
        onClick={startGame}
        className="relative z-10 w-full sm:w-auto h-auto bg-cyber-neon hover:bg-white text-black font-bold uppercase tracking-widest py-6 px-12 md:py-7 md:px-16 rounded-[2rem] shadow-[0_0_30px_rgba(0,238,255,0.4)] transition-all border-none text-xs md:text-sm"
      >
        MULAI EVALUASI
      </Button>
    </Card>
  );
}
