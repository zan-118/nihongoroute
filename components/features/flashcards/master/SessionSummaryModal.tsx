import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Trophy, Flame, RotateCcw } from "lucide-react";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

interface SessionSummaryModalProps {
  isFinished: boolean;
  setIsFinished: (val: boolean) => void;
  cardsCount: number;
  sessionStats: { known: number; learning: number; xpGained: number };
  themeBgColor: string;
  themeShadow: string;
  handleRestart: () => void;
  router: AppRouterInstance;
}

export function SessionSummaryModal({
  isFinished,
  setIsFinished,
  cardsCount,
  sessionStats,
  themeBgColor,
  themeShadow,
  handleRestart,
  router,
}: SessionSummaryModalProps) {
  return (
    <Dialog open={isFinished} onOpenChange={setIsFinished}>
      <DialogContent className="max-w-md w-[90%] md:w-full p-0 border-none bg-transparent shadow-none mx-auto">
        <Card className="w-full bg-[#0a0c10] p-8 md:p-14 rounded-[2.5rem] md:rounded-[3.5rem] border border-white/5 text-center relative overflow-hidden neo-card shadow-none">
          <div className={`absolute top-0 left-0 right-0 h-2 ${themeBgColor} ${themeShadow}`} />

          <div className="w-20 h-20 md:w-24 md:h-24 mx-auto bg-black/40 rounded-2xl md:rounded-[2rem] flex items-center justify-center border border-white/5 mb-6 md:mb-8 neo-inset shadow-none">
            <Trophy
              size={36}
              className="text-amber-400 drop-shadow-[0_0_15px_rgba(245,158,11,0.6)] md:w-10 md:h-10"
            />
          </div>

          <DialogHeader>
            <DialogTitle className="text-3xl md:text-4xl font-black text-white tracking-tight mb-3 md:mb-4 text-center">
              Sesi Selesai
            </DialogTitle>
          </DialogHeader>
          <p className="text-slate-400 text-[10px] md:text-xs mb-8 md:mb-10 uppercase font-bold tracking-widest">
            {cardsCount} KARTU SELESAI DITINJAU
          </p>

          <div className="grid grid-cols-2 gap-4 md:gap-5 mb-8 md:mb-10">
            <Card className="bg-emerald-500/5 border border-emerald-500/20 p-5 md:p-6 rounded-2xl md:rounded-[2rem] flex flex-col items-center neo-inset shadow-none">
              <span className="text-3xl md:text-4xl font-black text-emerald-400 drop-shadow-[0_0_10px_rgba(52,211,153,0.3)]">
                {sessionStats.known}
              </span>
              <span className="text-[9px] md:text-[10px] font-bold text-emerald-400/80 uppercase tracking-widest mt-2">
                Sudah Hafal
              </span>
            </Card>
            <Card className="bg-cyber-neon/5 border border-cyber-neon/20 p-5 md:p-6 rounded-2xl md:rounded-[2rem] flex flex-col items-center neo-inset shadow-none">
              <span className="text-3xl md:text-4xl font-black text-cyber-neon drop-shadow-[0_0_10px_rgba(0,238,255,0.3)]">
                {sessionStats.learning}
              </span>
              <span className="text-[9px] md:text-[10px] font-bold text-cyber-neon/80 uppercase tracking-widest mt-2">
                Masih Lupa
              </span>
            </Card>
          </div>

          <Card className="bg-[#121620] py-4 md:py-5 rounded-xl md:rounded-2xl border border-white/5 mb-8 md:mb-10 flex justify-center items-center gap-3 neo-inset shadow-none">
            <Flame size={18} className="text-cyber-neon md:w-5 md:h-5" />
            <span className="text-white font-mono font-black text-base md:text-lg">
              +{sessionStats.xpGained} XP
            </span>
          </Card>

          <div className="flex flex-col gap-3 md:gap-4">
            <Button
              onClick={handleRestart}
              className={`w-full h-auto py-4 md:py-5 rounded-xl md:rounded-2xl text-[10px] md:text-xs font-bold uppercase tracking-widest border-none shadow-[0_0_20px_rgba(0,238,255,0.3)] bg-cyber-neon text-black hover:bg-white transition-all`}
            >
              <RotateCcw size={16} className="mr-2 md:w-4 md:h-4" /> Ulangi Sesi
            </Button>
            <Button
              variant="ghost"
              onClick={() => router.back()}
              className="w-full h-auto py-4 md:py-5 text-slate-400 hover:text-white font-bold uppercase tracking-widest text-[10px] md:text-xs border-white/5 neo-card bg-black/20 rounded-xl md:rounded-2xl"
            >
              Keluar
            </Button>
          </div>
        </Card>
      </DialogContent>
    </Dialog>
  );
}
