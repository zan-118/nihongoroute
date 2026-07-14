/**
 * @file SurvivalPlaying.tsx
 * @description Komponen visual area bermain aktif untuk mode bertahan hidup (Survival Mode).
 * Menampilkan status nyawa (HP), hitung mundur waktu yang berjalan, kata kosakata target (Kanji/Furigana), bilah progres waktu, serta empat opsi pilihan arti kosakata.
 */

// ======================
// IMPOR
// ======================
import { m, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Timer, Zap, ShieldAlert, AlertTriangle, Target, BatteryMedium } from "lucide-react";
import { CardData } from "./types";
import * as wanakana from "wanakana";
import { SmartJapanese } from "@/components/ui/SmartJapanese";

// ======================
// ANTARMUKA & TIPE
// ======================

/**
 * Props for SurvivalPlaying component.
 */
interface SurvivalPlayingProps {
  /** Current player health points. */
  hp: number;
  /** Maximum player health points. */
  MAX_HP: number;
  /** Current game score. */
  score: number;
  /** Seconds left for current question. */
  timeLeft: number;
  /** Max seconds allowed per question. */
  TIME_PER_QUESTION: number;
  /** Active question card data. */
  currentCard: CardData | null;
  /** Answer choices. */
  options: CardData[];
  /** Trigger shake animation on error. */
  isShaking: boolean;
  /** ID of selected wrong choice. */
  selectedWrongId: string | null;
  /** ID of chosen option. */
  selectedId: string | null;
  /** Block input during answer validation. */
  isCorrecting: boolean;
  /** Trigger on choice click. */
  handleAnswer: (option: CardData) => void;
}

// ======================
// EKSEKUSI UTAMA
// ======================

/**
 * Active gameplay UI for survival mode.
 * Shows health, timer, score, target word, and choices.
 */
export function SurvivalPlaying({
  hp,
  MAX_HP,
  score,
  timeLeft,
  TIME_PER_QUESTION,
  currentCard,
  options,
  isShaking,
  selectedWrongId,
  selectedId,
  isCorrecting,
  handleAnswer,
}: SurvivalPlayingProps) {
  // Danger state if time low
  const isDangerTime = timeLeft <= 3;
  // Critical state if one life left
  const isCriticalHp = hp === 1;

  return (
    <div className="w-full flex flex-col h-full min-h-[60vh] max-w-3xl mx-auto pb-6 px-4 md:px-0 transition-colors duration-300">
      <Card
        className={`flex justify-between items-center mb-4 md:mb-10 p-4 md:p-10 rounded-xl md:rounded-2xl border transition-all duration-200 neo-card shadow-lg ${isCriticalHp ? "border-destructive/60 bg-destructive/5 shadow-md" : "bg-card border-border"}`}
      >
        <div className="flex gap-1 md:gap-4 items-center">
          {/* Render health battery icons */}
          {[...Array(MAX_HP)].map((_, i) => (
            <BatteryMedium
              key={`hp-${i}`}
              size={18}
              aria-hidden="true"
              className={`transition-all duration-200 ${
                i < hp
                  ? isCriticalHp
                    ? "text-destructive drop-shadow-sm dark:drop-shadow-[0_0_6px_rgb(var(--destructive-rgb)/0.45)]"
                    : "text-primary drop-shadow-sm dark:drop-shadow-[0_0_6px_rgb(var(--primary-rgb)/0.45)]"
                  : "text-muted-foreground/20 scale-75 opacity-30"
              } md:w-8 md:h-8`}
            />
          ))}
        </div>

        <div
          className={`flex items-center gap-1.5 md:gap-4 font-mono text-xl md:text-4xl lg:text-5xl font-black tracking-tight transition-all ${isDangerTime ? "text-destructive drop-shadow-sm dark:drop-shadow-[0_0_8px_rgb(var(--destructive-rgb)/0.5)]" : "text-foreground opacity-80"}`}
        >
          <Timer size={18} aria-hidden="true" className="md:w-8 md:h-8 lg:w-10 lg:h-10" />
          {timeLeft.toString().padStart(2, "0")}s
        </div>

        <div className="flex items-center gap-1.5 md:gap-3 text-primary font-black text-xl md:text-3xl lg:text-4xl">
          <Zap size={18} aria-hidden="true" className="fill-primary md:w-7 md:h-7 lg:w-8 lg:h-8" /> {score}
        </div>
      </Card>

      <AnimatePresence mode="wait">
        <m.div
          key={currentCard?.id}
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{
            opacity: 1,
            scale: 1,
            y: 0,
            x: isShaking ? [-10, 10, -10, 10, 0] : 0, // Shake animation on wrong answer
          }}
          exit={{ opacity: 0, scale: 0.95, y: -20 }}
          transition={{ duration: 0.3, type: "spring", stiffness: 400, damping: 25 }}
          className="flex-1 flex flex-col mb-4 md:mb-10"
        >
          <Card
            className={`relative bg-card rounded-2xl md:rounded-3xl p-6 md:p-20 border text-center shadow-xl flex flex-col items-center justify-center flex-1 min-h-[220px] md:min-h-[400px] lg:min-h-[500px] neo-card transition-all duration-200 ${
              isShaking
                ? "border-primary shadow-xl"
                : "border-border"
            }`}
          >
            <div className="absolute inset-0 bg-[linear-gradient(rgb(var(--primary-rgb)/0.03)_1px,transparent_1px)] bg-[size:100%_4px] md:bg-[size:100%_6px] pointer-events-none opacity-40 rounded-2xl md:rounded-3xl" />

            <Badge
              variant="outline"
              className={`absolute top-4 md:top-10 left-1/2 -translate-x-1/2 text-[10px] md:text-xs font-bold uppercase tracking-widest border px-4 py-1 md:px-8 md:py-3 rounded-lg md:rounded-lg neo-inset h-auto transition-all duration-300 ${isDangerTime ? "text-destructive border-destructive/50 bg-destructive/10 shadow-sm" : "text-muted-foreground border-border bg-muted/50 dark:bg-[rgb(var(--background-rgb)/0.3)]"}`}
            >
              {isDangerTime ? (
                <span className="flex items-center gap-1">
                  <AlertTriangle size={12} aria-hidden="true" className="animate-premium-bounce md:w-4 md:h-4" /> KEJAR WAKTU!
                </span>
              ) : (
                <span className="flex items-center gap-1">
                  <Target size={12} aria-hidden="true" className="md:w-4 md:h-4" /> APA ARTINYA?
                </span>
              )}
            </Badge>

            <div className="flex flex-col items-center justify-center w-full min-h-[100px] md:min-h-[200px]">
               <h2
                className={`${(currentCard?.word?.length || 0) > 4 ? "text-4xl sm:text-6xl md:text-7xl lg:text-8xl" : "text-6xl sm:text-7xl md:text-7xl lg:text-8xl"} font-black text-foreground tracking-tight drop-shadow-sm font-japanese leading-none transition-all duration-200`}
               >
                 <SmartJapanese
                   word={currentCard?.word || ""}
                   furigana={
                     currentCard?.furigana && /^[a-zA-Z\s.,?!'-]+$/.test(currentCard.furigana)
                       ? wanakana.toHiragana(currentCard.furigana) // Convert romaji furigana to hiragana
                       : currentCard?.furigana || undefined
                   }
                   className="[&_rt]:text-primary/80"
                 />
               </h2>
            </div>
          </Card>
        </m.div>
      </AnimatePresence>

      <div className="mb-4 md:mb-10">
         <Progress
           value={(timeLeft / TIME_PER_QUESTION) * 100} // Calculate time progress percentage
           className="h-1.5 md:h-3 bg-muted border border-border rounded-full overflow-hidden"
           indicatorClassName={isDangerTime ? "bg-destructive shadow-sm transition-all duration-700" : "bg-primary transition-all duration-700"}
         />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-6 items-stretch">
        {options.map((option, idx) => {
          // Check if option matches correct answer
          const isCorrect = selectedId === option.id && option.id === currentCard?.id;
          // Check if option matches wrong selection
          const isWrong = selectedWrongId === option.id;

          return (
            <Button
              key={option.id}
              variant="ghost"
              onClick={() => handleAnswer(option)}
              disabled={isCorrecting}
              className={`group flex h-full w-full p-0 overflow-hidden rounded-xl md:rounded-2xl border transition-all duration-300 min-h-[64px] md:min-h-[100px] lg:min-h-[120px] shadow-none ${
                isWrong
                  ? "bg-destructive/20 border-destructive shadow-lg text-destructive"
                  : isCorrect
                  ? "bg-success/20 border-success shadow-lg text-success"
                  : "bg-[rgb(var(--muted-rgb)/0.5)] dark:bg-[rgb(var(--background-rgb)/0.4)] border-border md:hover:border-primary/50 md:hover:bg-primary md:hover:text-primary-foreground neo-card active:scale-[0.98] transition-transform"
              }`}
            >
              <div className="flex items-center justify-center w-full h-full p-4 md:p-8 relative">
                 <span className={`absolute top-2 left-3 md:top-4 md:left-6 text-[8px] md:text-xs font-bold uppercase tracking-widest transition-colors ${isWrong ? 'text-destructive/30' : 'text-muted-foreground/30 md:group-hover:text-foreground/30 dark:md:group-hover:text-foreground/30'}`}>
                   JAWABAN {idx+1}
                 </span>
                 <p className="font-bold text-sm md:text-xl lg:text-2xl text-center leading-tight w-full break-words text-foreground md:group-hover:text-primary-foreground">
                   {option.meaning}
                 </p>
                 {isWrong && (
                   <div className="absolute right-4 top-1/2 -translate-y-1/2">
                      <ShieldAlert aria-hidden="true" className="text-destructive" size={20} />
                   </div>
                 )}
              </div>
            </Button>
          );
        })}
      </div>
    </div>
  );
}