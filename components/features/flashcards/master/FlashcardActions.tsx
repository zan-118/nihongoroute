import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { Check, X, Info } from "lucide-react";
import { StudyMode } from "./types";

interface FlashcardActionsProps {
  studyMode: StudyMode;
  isFlipped: boolean;
  currentIndex: number;
  totalCards: number;
  themeColor: string;
  handleNav: (dir: 1 | -1) => void;
  handleAnswer: (correct: boolean) => void;
}

export function FlashcardActions({
  studyMode,
  isFlipped,
  currentIndex,
  totalCards,
  themeColor,
  handleNav,
  handleAnswer,
}: FlashcardActionsProps) {
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
        <AnimatePresence>
          {isFlipped && (
            <motion.nav
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="grid grid-cols-2 gap-3 md:gap-4"
            >
              <Button
                variant="ghost"
                onClick={(e) => {
                  e.stopPropagation();
                  handleAnswer(false);
                }}
                className="h-auto py-4 md:py-5 border-cyber-neon/20 bg-cyber-neon/5 text-cyber-neon hover:bg-cyber-neon hover:text-black font-bold uppercase tracking-widest text-xs md:text-xs rounded-xl transition-all"
              >
                <X size={16} className="mr-2" /> Masih Lupa
              </Button>
              <Button
                variant="ghost"
                onClick={(e) => {
                  e.stopPropagation();
                  handleAnswer(true);
                }}
                className="h-auto py-4 md:py-5 border-emerald-500/20 bg-emerald-500/5 text-emerald-400 hover:bg-emerald-500 hover:text-black font-bold uppercase tracking-widest text-xs md:text-xs rounded-xl transition-all"
              >
                <Check size={16} className="mr-2" /> Sudah Hafal
              </Button>
            </motion.nav>
          )}
          {!isFlipped && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
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
