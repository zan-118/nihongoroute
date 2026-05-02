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
      <DialogContent className="max-w-md w-[90%] md:w-full p-0 border-none bg-transparent shadow-none mx-auto transition-colors duration-300">
        <Card className="w-full bg-card dark:bg-[#0a0c10] p-8 md:p-10 rounded-2xl border border-border dark:border-white/[0.08] text-center relative overflow-hidden shadow-2xl">
          <div className={`absolute top-0 left-0 right-0 h-1.5 ${themeBgColor} ${themeShadow}`} />

          <div className="w-16 h-16 md:w-20 md:h-20 mx-auto bg-muted/50 dark:bg-white/[0.04] rounded-xl flex items-center justify-center border border-border dark:border-white/[0.08] mb-6 shadow-none">
            <Trophy
              size={32}
              className="text-amber-600 dark:text-amber-400 drop-shadow-sm dark:drop-shadow-[0_0_15px_rgba(245,158,11,0.4)]"
            />
          </div>

          <DialogHeader>
            <DialogTitle className="text-2xl md:text-3xl font-black text-foreground uppercase tracking-tight mb-2 text-center">
              Sesi Selesai
            </DialogTitle>
          </DialogHeader>
          <p className="text-muted-foreground text-[10px] md:text-xs mb-8 uppercase font-bold tracking-widest">
            {cardsCount} KARTU SELESAI DITINJAU
          </p>

          <div className="grid grid-cols-2 gap-4 mb-8">
            <Card className="bg-emerald-500/5 border border-emerald-500/20 p-5 rounded-xl flex flex-col items-center shadow-none">
              <span className="text-2xl md:text-3xl font-black text-emerald-600 dark:text-emerald-400">
                {sessionStats.known}
              </span>
              <span className="text-[9px] font-bold text-emerald-600/80 dark:text-emerald-400/80 uppercase tracking-widest mt-2">
                Sudah Hafal
              </span>
            </Card>
            <Card className="bg-primary/5 border border-primary/20 p-5 rounded-xl flex flex-col items-center shadow-none">
              <span className="text-2xl md:text-3xl font-black text-primary">
                {sessionStats.learning}
              </span>
              <span className="text-[9px] font-bold text-primary/80 uppercase tracking-widest mt-2">
                Masih Lupa
              </span>
            </Card>
          </div>

          <Card className="bg-muted/50 dark:bg-white/[0.03] py-4 rounded-xl border border-border dark:border-white/[0.08] mb-8 flex justify-center items-center gap-3 shadow-none">
            <Flame size={18} className="text-primary" />
            <span className="text-foreground dark:text-white font-mono font-black text-base md:text-lg">
              +{sessionStats.xpGained} XP
            </span>
          </Card>

          <div className="flex flex-col gap-3">
            <Button
              onClick={handleRestart}
              className={`w-full h-auto py-4 rounded-xl text-[10px] md:text-xs font-bold uppercase tracking-widest border-none bg-primary text-white dark:text-black hover:bg-foreground hover:text-background dark:hover:bg-white transition-all shadow-lg`}
            >
              <RotateCcw size={16} className="mr-2" /> Ulangi Sesi
            </Button>
            <Button
              variant="ghost"
              onClick={() => router.back()}
              className="w-full h-auto py-4 text-muted-foreground hover:text-foreground font-bold uppercase tracking-widest text-[10px] md:text-xs border-border dark:border-white/[0.08] bg-muted dark:bg-white/[0.03] rounded-xl transition-all"
            >
              Keluar
            </Button>
          </div>
        </Card>
      </DialogContent>
    </Dialog>
  );
}
