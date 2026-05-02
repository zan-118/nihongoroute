import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import XPPop from "@/components/XPPop";
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
    <Card className="bg-card dark:bg-cyber-surface p-10 md:p-16 rounded-[4rem] border border-border dark:border-white/5 text-center relative overflow-hidden neo-card shadow-2xl transition-colors duration-300">
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
                ? "bg-red-500/10 border-red-500/30 shadow-lg dark:shadow-[0_0_40px_rgba(239,68,68,0.2)]"
                : "bg-amber-500/10 border-amber-500/30"
            }`}
          >
            {isPerfect ? <Trophy size={56} className="text-red-600 dark:text-red-500" /> : <Target size={56} className="text-amber-600 dark:text-amber-500" />}
          </Card>
        </div>

        <Badge variant="outline" className="border-red-500/20 text-red-600 dark:text-red-500 font-bold text-[9px] uppercase tracking-widest mb-6 h-auto px-6 py-2 rounded-xl neo-inset bg-red-500/5">
          Evaluasi Latihan
        </Badge>
        
        <h2 className="text-5xl md:text-6xl font-black text-foreground uppercase tracking-tighter mb-4">
          {isPerfect ? "Latihan Sempurna!" : "Latihan Selesai"}
        </h2>

        <div className="flex items-center justify-center gap-10 my-12">
          <div className="text-center">
            <p className="text-muted-foreground text-[10px] font-bold uppercase tracking-widest mb-2">
              Skor Akhir
            </p>
            <p className="text-5xl font-black text-foreground tracking-tight">
              {score}<span className="text-xl opacity-10 mx-1">/</span>{totalQuestions}
            </p>
          </div>
          <div className="w-px h-16 bg-border dark:bg-white/5" />
          <div className="text-center">
            <p className="text-muted-foreground text-[10px] font-bold uppercase tracking-widest mb-2">
              Akurasi
            </p>
            <p className={`text-5xl font-black tracking-tight ${isPerfect ? "text-red-600 dark:text-red-500 drop-shadow-sm dark:drop-shadow-[0_0_15px_rgba(239,68,68,0.4)]" : "text-amber-600 dark:text-amber-500"}`}>
              {percentage}%
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-5 mt-10">
          <Button
            onClick={resetQuiz}
            variant="ghost"
            className="w-full sm:w-auto h-auto px-10 py-5 bg-muted dark:bg-black/40 text-muted-foreground font-bold rounded-2xl hover:bg-foreground hover:text-background dark:hover:bg-white dark:hover:text-black transition-all uppercase tracking-widest text-[10px] border border-border dark:border-white/5 neo-inset shadow-none"
          >
            <RefreshCw size={18} className="mr-3" /> Ulangi Latihan
          </Button>
          <Button
            onClick={() => {
              const basePath = window.location.pathname.replace(/\/[^/]+$/, "");
              router.push(basePath || "/courses");
            }}
            className="w-full sm:w-auto h-auto px-10 py-5 bg-red-600 dark:bg-red-500 hover:bg-foreground dark:hover:bg-white text-white dark:text-black font-black rounded-2xl transition-all uppercase tracking-widest text-[10px] shadow-xl border-none"
          >
            Materi Selanjutnya <ArrowRight size={18} className="ml-3" />
          </Button>
        </div>
      </motion.div>
    </Card>
  );
}
