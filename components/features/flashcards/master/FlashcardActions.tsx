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
        <div className="flex justify-between gap-3 md:gap-5">
          <Button
            variant="ghost"
            onClick={() => handleNav(-1)}
            disabled={currentIndex === 0}
            className="flex-1 h-auto py-5 md:py-6 text-[9px] md:text-[10px] lg:text-xs font-bold uppercase tracking-widest neo-card bg-[#121620] border-white/5 disabled:opacity-20 rounded-xl md:rounded-2xl"
          >
            Sebelumnya
          </Button>
          <Button
            variant="ghost"
            onClick={() => handleNav(1)}
            disabled={currentIndex === totalCards - 1}
            className={`flex-1 h-auto py-5 md:py-6 text-[9px] md:text-[10px] lg:text-xs font-bold uppercase tracking-widest neo-card bg-[#121620] border-white/5 ${themeColor} disabled:opacity-20 rounded-xl md:rounded-2xl`}
          >
            Selanjutnya
          </Button>
        </div>
      ) : (
        <AnimatePresence>
          {isFlipped && (
            <motion.nav
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="grid grid-cols-2 gap-3 md:gap-5"
            >
              <Button
                variant="ghost"
                onClick={(e) => {
                  e.stopPropagation();
                  handleAnswer(false);
                }}
                className="h-auto py-5 md:py-6 border-cyber-neon/30 bg-cyber-neon/5 text-cyber-neon hover:bg-cyber-neon hover:text-black font-bold uppercase tracking-widest text-[9px] md:text-[10px] lg:text-xs rounded-xl md:rounded-2xl neo-card shadow-none transition-all"
              >
                <X size={14} className="mr-1.5 md:mr-2 md:w-4 md:h-4" /> Masih Lupa
              </Button>
              <Button
                variant="ghost"
                onClick={(e) => {
                  e.stopPropagation();
                  handleAnswer(true);
                }}
                className="h-auto py-5 md:py-6 border-emerald-500/30 bg-emerald-500/5 text-emerald-400 hover:bg-emerald-500 hover:text-black font-bold uppercase tracking-widest text-[9px] md:text-[10px] lg:text-xs rounded-xl md:rounded-2xl neo-card shadow-none transition-all"
              >
                <Check size={14} className="mr-1.5 md:mr-2 md:w-4 md:h-4" /> Sudah Hafal
              </Button>
            </motion.nav>
          )}
          {!isFlipped && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center justify-center gap-2 md:gap-3 text-slate-500 py-4 md:py-6"
            >
              <Info size={14} className="md:w-4 md:h-4" />
              <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest">
                Ketuk kartu untuk melihat jawaban
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </div>
  );
}
