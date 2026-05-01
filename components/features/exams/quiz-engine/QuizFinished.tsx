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
    <Card className="bg-cyber-surface p-10 md:p-16 rounded-[4rem] border-white/5 text-center relative overflow-hidden neo-card shadow-none">
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
                ? "bg-red-500/10 border-red-500/30 shadow-[0_0_40px_rgba(239,68,68,0.2)]"
                : "bg-amber-500/10 border-amber-500/30"
            }`}
          >
            {isPerfect ? <Trophy size={56} className="text-red-500" /> : <Target size={56} className="text-amber-500" />}
          </Card>
        </div>

        <Badge variant="outline" className="border-red-500/20 text-red-500 font-black text-[10px] uppercase tracking-[0.5em] mb-6 h-auto px-6 py-2 rounded-xl neo-inset bg-red-500/5">
          Mission Evaluation
        </Badge>
        
        <h2 className="text-5xl md:text-6xl font-black text-white italic uppercase tracking-tighter mb-4">
          {isPerfect ? "Operation Flawless" : "Mission Complete"}
        </h2>

        <div className="flex items-center justify-center gap-10 my-12">
          <div className="text-center">
            <p className="text-slate-500 text-[11px] font-black uppercase tracking-widest mb-2">
              Score Rank
            </p>
            <p className="text-5xl font-black text-white italic">
              {score}<span className="text-xl opacity-20 not-italic mx-1">/</span>{totalQuestions}
            </p>
          </div>
          <div className="w-px h-16 bg-white/5" />
          <div className="text-center">
            <p className="text-slate-500 text-[11px] font-black uppercase tracking-widest mb-2">
              Accuracy
            </p>
            <p className={`text-5xl font-black italic ${isPerfect ? "text-red-500 drop-shadow-[0_0_15px_rgba(239,68,68,0.5)]" : "text-amber-500"}`}>
              {percentage}%
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-5 mt-10">
          <Button
            onClick={resetQuiz}
            variant="ghost"
            className="w-full sm:w-auto h-auto px-10 py-5 bg-black/40 text-slate-400 font-black rounded-2xl hover:bg-white hover:text-black transition-all uppercase tracking-widest text-[10px] border border-white/5 neo-inset"
          >
            <RefreshCw size={18} className="mr-3" /> Re-Deploy
          </Button>
          <Button
            onClick={() => {
              const basePath = window.location.pathname.replace(/\/[^/]+$/, "");
              router.push(basePath || "/courses");
            }}
            className="w-full sm:w-auto h-auto px-10 py-5 bg-red-500 hover:bg-white text-black font-black rounded-2xl transition-all uppercase tracking-[0.2em] text-[10px] shadow-[0_0_25px_rgba(239,68,68,0.4)] border-none"
          >
            Next Module <ArrowRight size={18} className="ml-3" />
          </Button>
        </div>
      </motion.div>
    </Card>
  );
}
