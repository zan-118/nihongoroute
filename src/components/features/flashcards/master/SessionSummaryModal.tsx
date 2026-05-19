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
  handleReviewMistakes: () => void;
  mistakeCount: number;
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
  handleReviewMistakes,
  mistakeCount,
  router,
}: SessionSummaryModalProps) {
  return (
    <Dialog open={isFinished} onOpenChange={setIsFinished}>
      <DialogContent className="max-w-md w-[90%] md:w-full p-0 border-none bg-transparent shadow-none mx-auto transition-colors duration-300">
        <Card className="w-full bg-card bg-card p-8 md:p-10 rounded-2xl border border-border text-center relative overflow-hidden shadow-2xl">
          <div className={`absolute top-0 left-0 right-0 h-1.5 ${themeBgColor} ${themeShadow}`} />

          <div className="w-16 h-16 md:w-20 md:h-20 mx-auto bg-[rgba(var(--muted-rgb),0.5)] dark:bg-[rgba(var(--background-rgb),0.04)] rounded-xl flex items-center justify-center border border-border mb-6 shadow-none">
            <Trophy
              size={32}
              aria-hidden="true"
              className="text-warning text-warning drop-shadow-sm dark:drop-shadow-[0_0_15px_rgba(var(--warning-rgb),0.4)]"
            />
          </div>

          <DialogHeader>
            <DialogTitle className="text-2xl md:text-3xl font-black text-foreground uppercase tracking-tight mb-2 text-center">
              Sesi Selesai
            </DialogTitle>
          </DialogHeader>
          <p className="text-muted-foreground text-xs md:text-xs mb-8 uppercase font-bold tracking-widest">
            {cardsCount} KARTU SELESAI DITINJAU
          </p>

          <div className="grid grid-cols-2 gap-4 mb-8">
            <Card className="bg-success/5 border border-success/20 p-5 rounded-xl flex flex-col items-center shadow-none">
              <span className="text-2xl md:text-3xl font-black text-success text-success">
                {sessionStats.known}
              </span>
              <span className="text-xs font-bold text-success/80 text-success/80 uppercase tracking-widest mt-2">
                Sudah Hafal
              </span>
            </Card>
            <Card className="bg-primary/5 border border-primary/20 p-5 rounded-xl flex flex-col items-center shadow-none">
              <span className="text-2xl md:text-3xl font-black text-primary">
                {sessionStats.learning}
              </span>
              <span className="text-xs font-bold text-primary/80 uppercase tracking-widest mt-2">
                Masih Lupa
              </span>
            </Card>
          </div>

          <Card className="bg-[rgba(var(--muted-rgb),0.5)] dark:bg-[rgba(var(--background-rgb),0.03)] py-4 rounded-xl border border-border mb-8 flex justify-center items-center gap-3 shadow-none">
            <Flame size={18} aria-hidden="true" className="text-primary" />
            <span className="text-foreground text-foreground font-mono font-black text-base md:text-lg">
              +{sessionStats.xpGained} XP
            </span>
          </Card>

          <div className="flex flex-col gap-3">
            {mistakeCount > 0 && (
              <Button
                onClick={handleReviewMistakes}
                className="w-full h-auto py-4 rounded-xl text-xs md:text-xs font-bold uppercase tracking-widest border border-primary/30 bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground transition-all shadow-lg"
              >
                Ulas {mistakeCount} Kesalahan
              </Button>
            )}
            <Button
              onClick={handleRestart}
              className={`w-full h-auto py-4 rounded-xl text-xs md:text-xs font-bold uppercase tracking-widest border-none bg-primary text-primary-foreground hover:bg-foreground hover:text-background transition-all shadow-lg`}
            >
              <RotateCcw size={16} aria-hidden="true" className="mr-2" /> Ulangi Semua
            </Button>
            <Button
              variant="ghost"
              onClick={() => router.push("/dashboard")}
              className="w-full h-auto py-4 text-muted-foreground hover:text-foreground font-bold uppercase tracking-widest text-xs md:text-xs border border-border bg-muted dark:bg-[rgba(var(--background-rgb),0.03)] rounded-xl transition-all"
            >
              Kembali ke Dashboard
            </Button>
          </div>
        </Card>
      </DialogContent>
    </Dialog>
  );
}
