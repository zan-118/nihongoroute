import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import XPPop from "@/components/features/gamification/XPPop";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trophy, Target, RefreshCw, ArrowRight } from "lucide-react";

interface QuizFinishedProps {
  score: number;
  totalQuestions: number;
  showXP: boolean;
  xpGained: number;
  resetQuiz: () => void;
}

export function QuizFinished({
  score,
  totalQuestions,
  showXP,
  xpGained,
  resetQuiz,
}: QuizFinishedProps) {
  const router = useRouter();
  const percentage = Math.round((score / totalQuestions) * 100);
  const isPerfect = percentage === 100;

  return (
    <Card className="bg-card p-10 md:p-16 rounded-[4rem] border border-border text-center relative overflow-hidden neo-card shadow-2xl transition-colors duration-300">
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-50">
        <XPPop show={showXP} amount={xpGained} />
      </div>

      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="relative z-10"
      >
        <div className="mb-8 inline-block">
          <Card
            className={`w-28 h-28 rounded-[2.5rem] border flex items-center justify-center text-4xl neo-inset shadow-none ${
              isPerfect
                ? "bg-destructive/10 border-destructive/30 shadow-lg dark:shadow-[0_0_40px_rgba(var(--destructive-rgb),0.2)]"
                : "bg-warning/10 border-warning/30"
            }`}
          >
            {isPerfect ? <Trophy size={56} className="text-destructive text-destructive" /> : <Target size={56} className="text-warning text-warning" />}
          </Card>
        </div>

        <Badge variant="outline" className="border-destructive/20 text-destructive text-destructive font-bold text-xs uppercase tracking-widest mb-6 h-auto px-6 py-2 rounded-xl neo-inset bg-destructive/5">
          Rangkuman Latihan
        </Badge>
        
        <h2 className="text-5xl md:text-6xl font-black text-foreground uppercase tracking-tighter mb-4">
          {isPerfect ? "Penguasaan Mutlak!" : "Latihan Tuntas"}
        </h2>

        <div className="flex items-center justify-center gap-10 my-12">
          <div className="text-center">
            <p className="text-muted-foreground text-xs font-bold uppercase tracking-widest mb-2">
              Skor Benar
            </p>
            <p className="text-5xl font-black text-foreground tracking-tight">
              {score}<span className="text-xl opacity-10 mx-1">/</span>{totalQuestions}
            </p>
          </div>
          <div className="w-px h-16 bg-border dark:bg-background/5" />
          <div className="text-center">
            <p className="text-muted-foreground text-xs font-bold uppercase tracking-widest mb-2">
              Persentase
            </p>
            <p className={`text-5xl font-black tracking-tight ${isPerfect ? "text-destructive text-destructive drop-shadow-sm dark:drop-shadow-[0_0_15px_rgba(var(--destructive-rgb),0.4)]" : "text-warning text-warning"}`}>
              {percentage}%
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-5 mt-10">
          <Button
            onClick={resetQuiz}
            variant="ghost"
            className="w-full sm:w-auto h-auto px-10 py-5 bg-muted dark:bg-background/40 text-muted-foreground font-bold rounded-2xl hover:bg-foreground hover:text-background dark:hover:bg-background dark:hover:text-foreground transition-all uppercase tracking-widest text-xs border border-border neo-inset shadow-none"
          >
            <RefreshCw size={18} className="mr-3" /> Ulangi Latihan
          </Button>
          <Button
            onClick={() => {
              const basePath = window.location.pathname.replace(/\/[^/]+$/, "");
              router.push(basePath || "/courses");
            }}
            className="w-full sm:w-auto h-auto px-10 py-5 bg-destructive hover:bg-destructive/90 text-destructive-foreground font-black rounded-2xl transition-all uppercase tracking-widest text-xs shadow-xl border-none"
          >
            Materi Berikutnya <ArrowRight size={18} className="ml-3" />
          </Button>
        </div>
      </motion.div>
    </Card>
  );
}
