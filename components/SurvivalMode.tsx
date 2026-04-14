"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Timer, Zap, Trophy, Skull, RotateCcw } from "lucide-react";

interface Card {
  _id: string;
  word: string;
  meaning: string;
  romaji: string;
  furigana?: string;
  category?: string;
}

interface SurvivalModeProps {
  cards: Card[];
}

export default function SurvivalMode({ cards }: SurvivalModeProps) {
  const MAX_HP = 3;
  const TIME_PER_QUESTION = 10;

  const [gameState, setGameState] = useState<
    "idle" | "playing" | "gameover" | "victory"
  >("idle");
  const [hp, setHp] = useState(MAX_HP);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(TIME_PER_QUESTION);

  const [deck, setDeck] = useState<Card[]>([]);
  const [currentCard, setCurrentCard] = useState<Card | null>(null);
  const [options, setOptions] = useState<Card[]>([]);
  const [isShaking, setIsShaking] = useState(false);

  const shuffleArray = (array: any[]) => {
    const newArr = [...array];
    for (let i = newArr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
    }
    return newArr;
  };

  const startGame = () => {
    if (cards.length < 4) return;
    const shuffledDeck = shuffleArray(cards);
    setDeck(shuffledDeck);
    setHp(MAX_HP);
    setScore(0);
    setGameState("playing");
    loadNextQuestion(shuffledDeck, 0);
  };

  const loadNextQuestion = (currentDeck: Card[], index: number) => {
    if (index >= currentDeck.length) {
      setGameState("victory");
      return;
    }

    const targetCard = currentDeck[index];
    setCurrentCard(targetCard);
    setTimeLeft(TIME_PER_QUESTION);

    let wrongOptions = currentDeck.filter((c) => c._id !== targetCard._id);

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
  }, [gameState, currentCard]);

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

  const handleAnswer = (selectedOption: Card) => {
    if (selectedOption._id === currentCard?._id) {
      setScore((prev) => prev + 1);
      const currentIndex = deck.findIndex((c) => c._id === currentCard?._id);
      loadNextQuestion(deck, currentIndex + 1);
    } else {
      handleWrongAnswer();
    }
  };

  // =====================================
  // RENDER: LAYAR AWAL
  // =====================================
  if (gameState === "idle") {
    return (
      <div className="bg-cyber-surface p-10 md:p-16 rounded-[3rem] border border-red-500/20 shadow-[0_0_40px_rgba(239,68,68,0.1)] text-center relative overflow-hidden group max-w-xl mx-auto my-10">
        <div className="absolute inset-0 bg-red-500/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
        <Timer
          size={64}
          className="mx-auto text-red-500 mb-6 drop-shadow-[0_0_15px_rgba(239,68,68,0.5)] animate-pulse"
        />
        <h2 className="text-4xl md:text-5xl font-black text-white uppercase italic tracking-tighter mb-4">
          Tantangan{" "}
          <span className="text-red-500 drop-shadow-[0_0_10px_rgba(239,68,68,0.5)]">
            Bertahan
          </span>
        </h2>
        <p className="text-[#c4cfde]/60 mb-10 max-w-sm mx-auto text-xs md:text-sm leading-relaxed">
          Uji kecepatan ingatanmu! Kamu punya{" "}
          <strong className="text-red-400">3 Nyawa</strong> dan hanya{" "}
          <strong className="text-amber-400">10 Detik</strong> per kartu.
          Seberapa jauh kamu bisa bertahan tanpa ampun?
        </p>
        <button
          onClick={startGame}
          className="relative z-10 w-full sm:w-auto bg-red-500 hover:bg-red-600 text-white font-black uppercase tracking-widest py-4 px-12 rounded-2xl transition-all shadow-[0_0_20px_rgba(239,68,68,0.4)] hover:shadow-[0_0_30px_rgba(239,68,68,0.6)] active:scale-95 text-xs"
        >
          Mulai Simulasi
        </button>
      </div>
    );
  }

  // =====================================
  // RENDER: LAYAR AKHIR (MENANG/KALAH)
  // =====================================
  if (gameState === "gameover" || gameState === "victory") {
    const isVictory = gameState === "victory";
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`bg-cyber-surface p-10 md:p-16 rounded-[3rem] border shadow-[0_0_50px_rgba(0,0,0,0.5)] text-center max-w-xl mx-auto my-10 relative overflow-hidden ${
          isVictory
            ? "border-amber-500/30 shadow-[0_0_40px_rgba(245,158,11,0.2)]"
            : "border-red-500/30"
        }`}
      >
        <div
          className={`absolute inset-0 ${isVictory ? "bg-amber-500/5" : "bg-red-500/5"} pointer-events-none`}
        />

        {isVictory ? (
          <Trophy
            size={80}
            className="mx-auto text-amber-400 mb-6 drop-shadow-[0_0_20px_rgba(251,191,36,0.6)] relative z-10"
          />
        ) : (
          <Skull
            size={80}
            className="mx-auto text-red-500 mb-6 drop-shadow-[0_0_20px_rgba(239,68,68,0.6)] relative z-10"
          />
        )}

        <h2
          className={`text-4xl md:text-6xl font-black uppercase italic tracking-tighter mb-4 relative z-10 ${isVictory ? "text-amber-400" : "text-red-500"}`}
        >
          {isVictory ? "Misi Selesai!" : "Gagal Bertahan"}
        </h2>
        <p className="text-white/50 font-bold uppercase tracking-widest text-[10px] md:text-xs mb-8 relative z-10 flex items-center justify-center gap-2">
          Skor Akhir:{" "}
          <span className="text-white text-3xl font-black">{score}</span>
        </p>

        <button
          onClick={startGame}
          className={`flex items-center justify-center gap-3 w-full sm:max-w-xs mx-auto bg-white/5 hover:bg-white/10 border border-white/10 text-white font-black uppercase tracking-widest py-4 rounded-2xl transition-all active:scale-95 text-[10px] md:text-xs relative z-10`}
        >
          <RotateCcw size={16} /> Main Lagi
        </button>
      </motion.div>
    );
  }

  // =====================================
  // RENDER: LAYAR BERMAIN (IN-GAME)
  // =====================================
  // Efek UI Adrenalin: Layar merah kalau waktu <= 3 atau HP = 1
  const isDangerTime = timeLeft <= 3;
  const isCriticalHp = hp === 1;

  return (
    <div className="w-full flex flex-col h-full min-h-[60vh]">
      {/* HUD (Heads Up Display) */}
      <header
        className={`flex justify-between items-center mb-6 md:mb-8 bg-cyber-surface p-4 md:p-6 rounded-[2rem] border transition-colors duration-500 shadow-inner ${isCriticalHp ? "border-red-500/50 bg-red-500/5" : "border-white/5"}`}
      >
        <div className="flex gap-1.5 md:gap-2">
          {[...Array(MAX_HP)].map((_, i) => (
            <Heart
              key={i}
              size={20}
              className={`transition-all duration-300 ${
                i < hp
                  ? "text-red-500 fill-red-500 drop-shadow-[0_0_8px_rgba(239,68,68,0.8)]"
                  : "text-white/10 fill-transparent scale-75 opacity-50"
              } md:w-6 md:h-6`}
            />
          ))}
        </div>

        <div
          className={`flex items-center gap-2 font-mono text-xl md:text-3xl font-black tracking-tighter ${isDangerTime ? "text-red-500 animate-pulse drop-shadow-[0_0_10px_rgba(239,68,68,0.8)]" : "text-cyan-400"}`}
        >
          <Timer size={20} className="md:w-6 md:h-6" /> 00:
          {timeLeft.toString().padStart(2, "0")}
        </div>

        <div className="flex items-center gap-1.5 md:gap-2 text-amber-400 font-black text-lg md:text-xl">
          <Zap size={18} className="fill-amber-400 md:w-5 md:h-5" /> {score}
        </div>
      </header>

      {/* Main Question Card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentCard?._id}
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{
            opacity: 1,
            scale: 1,
            y: 0,
            x: isShaking ? [-10, 10, -10, 10, 0] : 0,
          }}
          exit={{ opacity: 0, scale: 0.95, y: -10 }}
          transition={{ duration: 0.2 }}
          className={`relative bg-[#0a0c10] rounded-[2.5rem] md:rounded-[3rem] p-10 md:p-16 border text-center mb-6 md:mb-8 shadow-2xl flex flex-col items-center justify-center flex-1 min-h-[300px] sm:min-h-[350px] ${
            isShaking
              ? "border-red-500 shadow-[0_0_50px_rgba(239,68,68,0.4)]"
              : "border-white/10"
          }`}
        >
          <span
            className={`absolute top-6 text-[9px] md:text-[10px] font-black uppercase tracking-[0.3em] border px-4 py-1.5 rounded-full ${isDangerTime ? "text-red-400 border-red-500/30 bg-red-500/10" : "text-white/30 border-white/5 bg-white/5"}`}
          >
            {isDangerTime ? "CEPAT!" : "Pilih Arti yang Tepat"}
          </span>

          {/* FONT RAKSASA DINAMIS SEPERTI FLASHCARD */}
          <span
            className={`${(currentCard?.word?.length || 0) > 4 ? "text-6xl sm:text-7xl lg:text-8xl" : "text-[5rem] sm:text-[7rem] lg:text-[9rem]"} font-black text-white tracking-tighter drop-shadow-2xl font-japanese mt-4 leading-none`}
          >
            {currentCard?.word}
          </span>
        </motion.div>
      </AnimatePresence>

      {/* Multiple Choice Options */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4 mt-auto">
        {options.map((option, idx) => (
          <button
            key={idx}
            onClick={() => handleAnswer(option)}
            className="bg-cyber-surface p-5 md:p-8 rounded-2xl md:rounded-[2rem] border border-white/5 hover:border-cyan-400/50 hover:bg-cyan-400/5 transition-all flex items-center justify-center group active:scale-95 shadow-[10px_10px_20px_rgba(0,0,0,0.3)] hover:shadow-[0_0_20px_rgba(34,211,238,0.15)] min-h-[80px]"
          >
            <p className="text-white/80 font-bold text-sm md:text-lg text-center group-hover:text-cyan-400 transition-colors uppercase tracking-tight">
              {option.meaning}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
}
