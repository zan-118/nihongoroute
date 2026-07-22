/**
 * @file FlashcardActions.tsx
 * @description Komponen aksi kontrol interaktif untuk kartu pengingat (flashcard), mendukung navigasi, pemberian nilai SRS (Again, Hard, Good, Easy), dan tombol periksa jawaban.
 */

// ==========================================
// IMPORT & DEPENDENSI
// ==========================================
import { Button } from "@/components/ui/button";
import { m, AnimatePresence } from "framer-motion";
import { Check, X, Info, Search } from "@/components/ui/icons";
import { StudyMode } from "./types";

// ==========================================
// ANTARMUKA PROPS
// ==========================================
/**
 * Props for FlashcardActions component.
 */
interface FlashcardActionsProps {
  /** Current study mode. */
  studyMode: StudyMode;
  /** Card flip state. */
  isFlipped: boolean;
  /** Current card index. */
  currentIndex: number;
  /** Total cards count. */
  totalCards: number;
  /** Theme color class. */
  themeColor: string;
  /** Navigation handler. */
  handleNav: (dir: 1 | -1) => void;
  /** SRS grade handler. */
  handleAnswer: (grade: number) => void;
  /** Check state for challenge mode. */
  isAnswerChecked?: boolean;
  /** Check action for challenge mode. */
  onCheckAnswer?: () => void;
}

// ==========================================
// KOMPONEN UTAMA
// ==========================================
/**
 * Interactive control panel for flashcards.
 * Handles navigation, SRS grading, and answer checking.
 * 
 * @param props - Component properties.
 */
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
  // Check if mode is challenge.
  const isChallenge = studyMode === "tantangan";

  return (
    <div className="min-h-[70px] md:min-h-[80px]">
      {/* Practice mode: show simple prev/next navigation. */}
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
          {/* Card flipped: show SRS grading buttons. */}
          {isFlipped ? (
            <m.nav
              key="flipped-actions"
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -10, opacity: 0 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3"
            >
              {/* Grade 0: Again */}
              <Button
                variant="ghost"
                onClick={(e) => {
                  e.stopPropagation();
                  handleAnswer(0);
                }}
                className="flex flex-col h-auto py-3 border-destructive/20 bg-destructive/5 text-destructive hover:bg-destructive hover:text-destructive-foreground rounded-xl transition-all"
              >
                <X size={16} className="mb-1" />
                <span className="text-[10px] font-bold uppercase tracking-tight">Ulangi</span>
                <span className="text-[8px] opacity-60">Lagi</span>
              </Button>
              {/* Grade 1: Hard */}
              <Button
                variant="ghost"
                onClick={(e) => {
                  e.stopPropagation();
                  handleAnswer(1);
                }}
                className="flex flex-col h-auto py-3 border-warning/20 bg-warning/5 text-warning hover:bg-warning hover:text-warning-foreground rounded-xl transition-all"
              >
                <Info size={16} className="mb-1" />
                <span className="text-[10px] font-bold uppercase tracking-tight">Sulit</span>
                <span className="text-[8px] opacity-60">Susah</span>
              </Button>
              {/* Grade 2: Good */}
              <Button
                variant="ghost"
                onClick={(e) => {
                  e.stopPropagation();
                  handleAnswer(2);
                }}
                className="flex flex-col h-auto py-3 border-success/20 bg-success/5 text-success hover:bg-success hover:text-success-foreground rounded-xl transition-all"
              >
                <Check size={16} className="mb-1" />
                <span className="text-[10px] font-bold uppercase tracking-tight">Paham</span>
                <span className="text-[8px] opacity-60">Bagus</span>
              </Button>
              {/* Grade 3: Easy */}
              <Button
                variant="ghost"
                onClick={(e) => {
                  e.stopPropagation();
                  handleAnswer(3);
                }}
                className="flex flex-col h-auto py-3 border-primary/20 bg-primary/5 text-primary hover:bg-primary hover:text-primary-foreground rounded-xl transition-all"
              >
                <Check size={16} className="mb-1" />
                <span className="text-[10px] font-bold uppercase tracking-tight">Mudah</span>
                <span className="text-[8px] opacity-60">Gampang</span>
              </Button>
            </m.nav>
          ) : isChallenge ? (
            /* Challenge mode: show check answer button. */
            <m.div
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
            </m.div>
          ) : (
            /* Card not flipped: show hint to tap card. */
            <m.div
              key="standard-actions"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center justify-center gap-2 text-muted-foreground py-4 md:py-6"
            >
              <Info size={14} className="opacity-50" />
              <span className="text-xs md:text-xs font-bold uppercase tracking-widest opacity-60">
                Ketuk kartu untuk melihat jawaban
              </span>
            </m.div>
          )}
        </AnimatePresence>
      )}
    </div>
  );
}