/**
 * @file SurvivalMode.tsx
 * @description Komponen Mode Survival (Evaluasi Kecepatan) untuk menguji ingatan kosakata pengguna dalam batas waktu tertentu.
 * @module SurvivalMode
 */

"use client";

// ======================
// IMPORTS
// ======================
import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Timer, Zap, Trophy, ShieldAlert, RotateCcw, AlertTriangle, Target, Activity, BatteryMedium } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

// ======================
// TYPES
// ======================
interface CardData {
  _id: string;
  word: string;
  meaning: string;
  romaji: string;
  furigana?: string;
  category?: string;
}

interface SurvivalModeProps {
  cards: CardData[];
}

// ======================
// MAIN EXECUTION
// ======================

/**
 * Komponen SurvivalMode: Menangani logika permainan evaluasi kosakata cepat.
 * 
 * @param {SurvivalModeProps} props - Daftar kartu kosakata.
 * @returns {JSX.Element} Antarmuka permainan mode survival.
 */
export default function SurvivalMode({ cards }: SurvivalModeProps) {
  // Config
  const MAX_HP = 3;
  const TIME_PER_QUESTION = 10;

  // State Management
  const [gameState, setGameState] = useState<
    "idle" | "playing" | "gameover" | "victory"
  >("idle");
  const [hp, setHp] = useState(MAX_HP);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(TIME_PER_QUESTION);

  const [deck, setDeck] = useState<CardData[]>([]);
  const [currentCard, setCurrentCard] = useState<CardData | null>(null);
  const [options, setOptions] = useState<CardData[]>([]);
  const [isShaking, setIsShaking] = useState(false);

  // ======================
  // HELPER FUNCTIONS
  // ======================

  /**
   * Mengacak urutan array.
   */
  const shuffleArray = (array: any[]) => {
    const newArr = [...array];
    for (let i = newArr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
    }
    return newArr;
  };

  /**
   * Memulai permainan baru.
   */
  const startGame = () => {
    if (cards.length < 4) return;
    const shuffledDeck = shuffleArray(cards);
    setDeck(shuffledDeck);
    setHp(MAX_HP);
    setScore(0);
    setGameState("playing");
    loadNextQuestion(shuffledDeck, 0);
  };

  /**
   * Memuat pertanyaan berikutnya dan menghasilkan opsi jawaban acak.
   */
  const loadNextQuestion = (currentDeck: CardData[], index: number) => {
    if (index >= currentDeck.length) {
      setGameState("victory");
      return;
    }

    const targetCard = currentDeck[index];
    setCurrentCard(targetCard);
    setTimeLeft(TIME_PER_QUESTION);

    let wrongOptions = currentDeck.filter((c) => c._id !== targetCard._id);

    // Prioritaskan distraktor dari kategori yang sama jika memungkinkan
    if (targetCard.category) {
      const sameCategoryOptions = wrongOptions.filter(
        (c) => c.category === targetCard.category,
      );
      if (sameCategoryOptions.length >= 3) {
        wrongOptions = sameCategoryOptions;
      }
    }

    const selectedWrongOptions = shuffleArray(wrongOptions).slice(0, 3);
    setOptions(shuffleArray([targetCard, ...selectedWrongOptions]));
  };

  /**
   * Menangani jawaban salah atau waktu habis.
   */
  const handleWrongAnswer = useCallback(() => {
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 500);

    setHp((prevHp) => {
      const newHp = prevHp - 1;
      if (newHp <= 0) {
        setGameState("gameover");
      } else {
        const currentIndex = deck.findIndex((c) => c._id === currentCard?._id);
        loadNextQuestion(deck, currentIndex + 1);
      }
      return newHp;
    });
  }, [deck, currentCard]);

  /**
   * Validasi jawaban pengguna.
   */
  const handleAnswer = (selectedOption: CardData) => {
    if (selectedOption._id === currentCard?._id) {
      setScore((prev) => prev + 1);
      const currentIndex = deck.findIndex((c) => c._id === currentCard?._id);
      loadNextQuestion(deck, currentIndex + 1);
    } else {
      handleWrongAnswer();
    }
  };

  // ======================
  // EFFECTS
  // ======================

  useEffect(() => {
    if (gameState !== "playing") return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleWrongAnswer();
          return TIME_PER_QUESTION;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameState, currentCard, handleWrongAnswer]);

  // ======================
  // RENDER: LAYAR AWAL
  // ======================
  if (gameState === "idle") {
    return (
      <Card className="p-8 md:p-16 lg:p-20 rounded-[3rem] md:rounded-[4rem] border-white/5 bg-cyber-surface text-center relative overflow-hidden group max-w-2xl mx-auto my-8 md:my-10 neo-card shadow-none">
        <div className="absolute inset-0 bg-cyber-neon/5 opacity-0 group-hover:opacity-100 transition-all duration-1000 pointer-events-none" />
        <Card className="w-20 h-20 md:w-28 md:h-28 mx-auto bg-black/40 border-cyber-neon/20 rounded-[2rem] md:rounded-[2.5rem] flex items-center justify-center mb-8 md:mb-12 neo-inset shadow-none group-hover:border-cyber-neon/40 transition-all duration-500">
          <Activity
            size={40}
            className="text-cyber-neon drop-shadow-[0_0_15px_rgba(0,238,255,0.6)] animate-pulse md:w-12 md:h-12"
          />
        </Card>
        <h2 className="text-4xl md:text-6xl lg:text-7xl font-black text-white tracking-tight mb-6 md:mb-8 leading-none">
          Mode <span className="text-cyber-neon drop-shadow-[0_0_20px_rgba(0,238,255,0.4)]">Evaluasi</span>
        </h2>
        <p className="text-slate-400 mb-10 md:mb-14 max-w-md mx-auto text-xs md:text-sm leading-relaxed font-bold tracking-wide">
          Uji kecepatan dan ingatan Anda. Jawab sebelum waktu habis. 3 kesempatan. Buktikan penguasaan kosakata Anda.
        </p>
        <Button
          onClick={startGame}
          className="relative z-10 w-full sm:w-auto h-auto bg-cyber-neon hover:bg-white text-black font-bold uppercase tracking-widest py-6 px-12 md:py-7 md:px-16 rounded-[2rem] shadow-[0_0_30px_rgba(0,238,255,0.4)] transition-all border-none text-xs md:text-sm"
        >
          MULAI EVALUASI
        </Button>
      </Card>
    );
  }

  // ======================
  // RENDER: LAYAR AKHIR
  // ======================
  if (gameState === "gameover" || gameState === "victory") {
    const isVictory = gameState === "victory";
    const accentColor = isVictory ? "text-amber-400" : "text-cyber-neon";
    const shadowColor = isVictory ? "rgba(251,191,36,0.3)" : "rgba(0,238,255,0.3)";
    const bgGlowColor = isVictory ? "bg-amber-500/10" : "bg-cyber-neon/10";
    const borderColor = isVictory ? "border-amber-500/40" : "border-cyber-neon/40";

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full px-4"
      >
        <Card
          className={`p-10 md:p-16 lg:p-24 rounded-[3rem] md:rounded-[4rem] text-center max-w-2xl mx-auto my-8 md:my-10 relative overflow-hidden border neo-card shadow-none bg-cyber-surface ${borderColor}`}
          style={{ boxShadow: `0 0 60px ${shadowColor}` }}
        >
          <div className={`absolute inset-0 ${bgGlowColor} pointer-events-none opacity-50`} />

          <Card className={`w-24 h-24 md:w-32 md:h-32 mx-auto rounded-[2rem] md:rounded-[3rem] flex items-center justify-center mb-8 md:mb-12 neo-inset shadow-none border-white/5 bg-black/40 relative z-10`}>
            {isVictory ? (
              <Trophy
                size={48}
                className="text-amber-400 drop-shadow-[0_0_20px_rgba(251,191,36,0.7)] md:w-16 md:h-16"
              />
            ) : (
              <ShieldAlert
                size={48}
                className="text-cyber-neon drop-shadow-[0_0_20px_rgba(0,238,255,0.7)] md:w-16 md:h-16"
              />
            )}
          </Card>

          <h2 className={`text-4xl md:text-6xl lg:text-7xl font-black tracking-tight mb-6 md:mb-8 relative z-10 leading-none ${accentColor}`}>
            {isVictory ? "Luar Biasa!" : "Evaluasi Selesai"}
          </h2>
          
          <div className="flex flex-col items-center gap-3 md:gap-4 mb-10 md:mb-14 relative z-10">
            <Badge variant="outline" className="text-slate-500 font-bold uppercase tracking-widest text-[9px] md:text-[10px] h-auto border-white/10 neo-inset px-6 py-2 md:px-8 md:py-3 rounded-2xl bg-black/30">
              SKOR AKHIR
            </Badge>
            <div className="flex flex-col">
               <span className="text-white text-7xl md:text-8xl lg:text-9xl font-black drop-shadow-[0_0_20px_rgba(255,255,255,0.3)] leading-none">{score}</span>
               <span className="text-slate-500 font-bold text-[9px] md:text-[10px] uppercase tracking-widest mt-3 md:mt-4">KATA TERJAWAB</span>
            </div>
          </div>

          <Button
            onClick={startGame}
            variant="ghost"
            className="flex items-center justify-center gap-4 md:gap-6 w-full h-auto py-6 md:py-8 relative z-10 font-bold uppercase tracking-widest text-[10px] md:text-xs border-white/5 neo-card shadow-none bg-black/40 hover:bg-cyber-neon hover:text-black transition-all rounded-[2rem] group"
          >
            <RotateCcw size={20} className="group-hover:-rotate-180 transition-transform duration-700 md:w-6 md:h-6" /> ULANGI EVALUASI
          </Button>
        </Card>
      </motion.div>
    );
  }

  // ======================
  // RENDER: IN-GAME
  // ======================
  const isDangerTime = timeLeft <= 3;
  const isCriticalHp = hp === 1;

  return (
    <div className="w-full flex flex-col h-full min-h-[60vh] max-w-3xl mx-auto pb-10 px-4 md:px-0">
      {/* HUD Bar */}
      <Card
        className={`flex justify-between items-center mb-8 md:mb-10 p-6 md:p-10 rounded-[2.5rem] md:rounded-[3rem] border transition-all duration-500 neo-card shadow-none ${isCriticalHp ? "border-cyber-neon/60 bg-cyber-neon/10 shadow-[0_0_30px_rgba(0,238,255,0.15)]" : "bg-cyber-surface border-white/5"}`}
      >
        <div className="flex gap-2 md:gap-4 items-center">
          {[...Array(MAX_HP)].map((_, i) => (
            <BatteryMedium
              key={i}
              size={24}
              className={`transition-all duration-500 ${
                i < hp
                  ? "text-cyber-neon drop-shadow-[0_0_10px_rgba(0,238,255,0.8)]"
                  : "text-white/10 scale-75 opacity-30"
              } md:w-8 md:h-8`}
            />
          ))}
        </div>

        <div
          className={`flex items-center gap-2 md:gap-4 font-mono text-2xl md:text-4xl lg:text-5xl font-black tracking-tight transition-all ${isDangerTime ? "text-cyber-neon animate-pulse drop-shadow-[0_0_15px_rgba(0,238,255,0.8)]" : "text-white opacity-80"}`}
        >
          <Timer size={24} className="md:w-8 md:h-8 lg:w-10 lg:h-10" /> 00:
          {timeLeft.toString().padStart(2, "0")}
        </div>

        <div className="flex items-center gap-2 md:gap-3 text-cyber-neon font-black text-2xl md:text-3xl lg:text-4xl">
          <Zap size={22} className="fill-cyber-neon md:w-7 md:h-7 lg:w-8 lg:h-8" /> {score}
        </div>
      </Card>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentCard?._id}
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{
            opacity: 1,
            scale: 1,
            y: 0,
            x: isShaking ? [-10, 10, -10, 10, 0] : 0,
          }}
          exit={{ opacity: 0, scale: 0.95, y: -20 }}
          transition={{ duration: 0.3, type: "spring", stiffness: 400, damping: 25 }}
          className="flex-1 flex flex-col mb-8 md:mb-10"
        >
          <Card
            className={`relative bg-cyber-surface rounded-[3rem] md:rounded-[4rem] p-10 md:p-20 border text-center shadow-none flex flex-col items-center justify-center flex-1 min-h-[300px] md:min-h-[400px] lg:min-h-[500px] neo-card transition-all duration-300 ${
              isShaking
                ? "border-cyber-neon shadow-[0_0_60px_rgba(0,238,255,0.3)]"
                : "border-white/5"
            }`}
          >
            <div className="absolute inset-0 bg-[linear-gradient(rgba(0,238,255,0.03)_1px,transparent_1px)] bg-[size:100%_4px] md:bg-[size:100%_6px] pointer-events-none opacity-40 rounded-[3rem] md:rounded-[4rem]" />

            <Badge
              variant="outline"
              className={`absolute top-6 md:top-10 left-1/2 -translate-x-1/2 text-[9px] md:text-[10px] lg:text-[11px] font-bold uppercase tracking-widest border px-6 py-2 md:px-8 md:py-3 rounded-xl md:rounded-2xl neo-inset h-auto transition-all duration-300 ${isDangerTime ? "text-cyber-neon border-cyber-neon/50 bg-cyber-neon/10 shadow-[0_0_15px_rgba(0,238,255,0.2)]" : "text-slate-500 border-white/10 bg-black/30"}`}
            >
              {isDangerTime ? (
                <span className="flex items-center gap-2">
                  <AlertTriangle size={14} className="animate-bounce md:w-4 md:h-4" /> WAKTU KRITIS
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Target size={14} className="animate-pulse md:w-4 md:h-4" /> KATA TARGET
                </span>
              )}
            </Badge>

            <div className="flex flex-col items-center justify-center w-full min-h-[150px] md:min-h-[200px]">
               <h2
                 className={`${(currentCard?.word?.length || 0) > 4 ? "text-5xl sm:text-6xl md:text-7xl lg:text-8xl" : "text-7xl sm:text-8xl md:text-9xl lg:text-[11rem]"} font-black text-white tracking-tight drop-shadow-lg font-japanese leading-none transition-all duration-500`}
               >
                 {currentCard?.word}
               </h2>
               {currentCard?.furigana && (
                  <span className="text-sm md:text-lg lg:text-xl text-cyber-neon font-bold uppercase tracking-widest mt-6 md:mt-8 opacity-60">
                     {currentCard.furigana}
                  </span>
               )}
            </div>
          </Card>
        </motion.div>
      </AnimatePresence>

      <div className="mb-8 md:mb-10">
         <Progress 
           value={(timeLeft / TIME_PER_QUESTION) * 100} 
           className="h-2 md:h-3 bg-black/50 border border-white/10 rounded-full overflow-hidden"
           indicatorClassName={isDangerTime ? "bg-cyber-neon shadow-[0_0_15px_rgba(0,238,255,0.8)] transition-all duration-1000" : "bg-white opacity-40 transition-all duration-1000"}
         />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6 items-stretch">
        {options.map((option, idx) => (
          <Button
            key={idx}
            variant="ghost"
            onClick={() => handleAnswer(option)}
            className="group flex h-full w-full p-0 overflow-hidden rounded-3xl md:rounded-[2.5rem] border border-white/5 bg-black/40 hover:border-cyber-neon/50 hover:bg-cyber-neon hover:text-black neo-card shadow-none transition-all duration-500 min-h-[80px] md:min-h-[100px] lg:min-h-[120px]"
          >
            <div className="flex items-center justify-center w-full h-full p-6 md:p-8 relative">
               <span className="absolute top-3 left-4 md:top-4 md:left-6 text-[9px] md:text-[10px] font-bold text-white/10 group-hover:text-black/30 transition-colors uppercase tracking-widest">OPSI {idx+1}</span>
               <p className="font-bold text-base md:text-xl lg:text-2xl text-center leading-tight w-full break-words">
                 {option.meaning}
               </p>
            </div>
          </Button>
        ))}
      </div>
    </div>
  );
}

