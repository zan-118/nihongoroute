import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { Check, X, Info, Search } from "lucide-react";
import { StudyMode } from "./types";

interface FlashcardActionsProps {
  studyMode: StudyMode;
  isFlipped: boolean;
  currentIndex: number;
  totalCards: number;
  themeColor: string;
  handleNav: (dir: 1 | -1) => void;
  handleAnswer: (grade: number) => void;
  isAnswerChecked?: boolean;
  onCheckAnswer?: () => void;
}

export function FlashcardActions({
  studyMode,
  isFlipped,
  currentIndex,
  totalCards,
  themeColor,
  handleNav,
  handleAnswer,
  isAnswerChecked,
  onCheckAnswer,
}: FlashcardActionsProps) {
  const isChallenge = studyMode === "tantangan";

  return (
    <div className="min-h-[70px] md:min-h-[80px]">
      {studyMode === "latihan" ? (
        <div className="flex justify-between gap-3 md:gap-4">
            <Button
              variant="ghost"
              onClick={() => handleNav(-1)}
              disabled={currentIndex === 0}
              className="flex-1 h-auto py-4 md:py-5 text-xs md:text-xs font-bold uppercase tracking-widest bg-muted/50 border border-border disabled:opacity-20 rounded-xl transition-all shadow-sm"
            >
              Sebelumnya
            </Button>
            <Button
              variant="ghost"
              onClick={() => handleNav(1)}
              disabled={currentIndex === totalCards - 1}
              className={`flex-1 h-auto py-4 md:py-5 text-xs md:text-xs font-bold uppercase tracking-widest bg-muted/50 border border-border ${themeColor} disabled:opacity-20 rounded-xl transition-all shadow-sm`}
            >
              Selanjutnya
            </Button>
        </div>
      ) : (
        <AnimatePresence mode="wait">
          {isFlipped ? (
            <motion.nav
              key="flipped-actions"
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -10, opacity: 0 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3"
            >
              <Button
                variant="ghost"
                onClick={(e) => {
                  e.stopPropagation();
                  handleAnswer(0);
                }}
                className="flex flex-col h-auto py-3 border-rose-500/20 bg-rose-500/5 text-rose-500 hover:bg-rose-500 hover:text-white rounded-xl transition-all"
              >
                <X size={16} className="mb-1" />
                <span className="text-[10px] font-bold uppercase tracking-tight">Lupa</span>
                <span className="text-[8px] opacity-60">Again</span>
              </Button>
              <Button
                variant="ghost"
                onClick={(e) => {
                  e.stopPropagation();
                  handleAnswer(1);
                }}
                className="flex flex-col h-auto py-3 border-amber-500/20 bg-amber-500/5 text-amber-500 hover:bg-amber-500 hover:text-white rounded-xl transition-all"
              >
                <Info size={16} className="mb-1" />
                <span className="text-[10px] font-bold uppercase tracking-tight">Sulit</span>
                <span className="text-[8px] opacity-60">Hard</span>
              </Button>
              <Button
                variant="ghost"
                onClick={(e) => {
                  e.stopPropagation();
                  handleAnswer(2);
                }}
                className="flex flex-col h-auto py-3 border-emerald-500/20 bg-emerald-500/5 text-emerald-400 hover:bg-emerald-500 hover:text-white rounded-xl transition-all"
              >
                <Check size={16} className="mb-1" />
                <span className="text-[10px] font-bold uppercase tracking-tight">Bisa</span>
                <span className="text-[8px] opacity-60">Good</span>
              </Button>
              <Button
                variant="ghost"
                onClick={(e) => {
                  e.stopPropagation();
                  handleAnswer(3);
                }}
                className="flex flex-col h-auto py-3 border-sky-500/20 bg-sky-500/5 text-sky-400 hover:bg-sky-500 hover:text-white rounded-xl transition-all"
              >
                <Check size={16} className="mb-1" />
                <span className="text-[10px] font-bold uppercase tracking-tight">Mudah</span>
                <span className="text-[8px] opacity-60">Easy</span>
              </Button>
            </motion.nav>
          ) : isChallenge ? (
            <motion.div
              key="challenge-actions"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full"
            >
              <Button
                onClick={onCheckAnswer}
                disabled={isAnswerChecked}
                className="w-full h-auto py-4 md:py-5 bg-primary hover:bg-primary/90 text-primary-foreground font-bold uppercase tracking-widest text-xs md:text-xs rounded-xl transition-all shadow-lg shadow-primary/20"
              >
                <Search size={16} className="mr-2" /> Periksa Jawaban
              </Button>
            </motion.div>
          ) : (
            <motion.div
              key="standard-actions"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center justify-center gap-2 text-slate-500 py-4 md:py-6"
            >
              <Info size={14} className="opacity-50" />
              <span className="text-xs md:text-xs font-bold uppercase tracking-widest opacity-60">
                Ketuk kartu untuk melihat jawaban
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </div>
  );
}
