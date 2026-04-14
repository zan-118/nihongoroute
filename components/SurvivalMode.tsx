"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Timer, Zap, Trophy, Skull, RotateCcw } from "lucide-react";

// Interface diperbarui dengan menambahkan 'category'
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

  // Fungsi untuk mengacak array (Fisher-Yates Shuffle)
  const shuffleArray = (array: any[]) => {
    const newArr = [...array];
    for (let i = newArr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
    }
    return newArr;
  };

  const startGame = () => {
    if (cards.length < 4) {
      alert("Kamu butuh minimal 4 kosakata di daftar ini untuk mulai bermain!");
      return;
    }
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

    // 1. Kumpulkan semua opsi salah (kartu selain target)
    let wrongOptions = currentDeck.filter((c) => c._id !== targetCard._id);

    // 2. Filter Cerdas (Smart Distractor): Cari pengecoh dengan kategori yang sama
    if (targetCard.category) {
      const sameCategoryOptions = wrongOptions.filter(
        (c) => c.category === targetCard.category,
      );

      // Jika jumlah kata dengan kategori yang sama cukup (minimal 3), gunakan itu
      if (sameCategoryOptions.length >= 3) {
        wrongOptions = sameCategoryOptions;
      }
      // Jika kurang, tetap gunakan wrongOptions awal (semua kata sisa) agar game tidak error
    }

    // 3. Acak dan ambil 3 pengecoh
    const selectedWrongOptions = shuffleArray(wrongOptions).slice(0, 3);

    // 4. Gabungkan jawaban benar dan salah, lalu acak
    setOptions(shuffleArray([targetCard, ...selectedWrongOptions]));
  };

  // Timer Logic
  useEffect(() => {
    if (gameState !== "playing") return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleWrongAnswer(); // Waktu habis = Salah
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
        // Lanjut ke pertanyaan berikutnya jika masih punya nyawa
        const currentIndex = deck.findIndex((c) => c._id === currentCard?._id);
        loadNextQuestion(deck, currentIndex + 1);
      }
      return newHp;
    });
  }, [deck, currentCard]);

  const handleAnswer = (selectedOption: Card) => {
    if (selectedOption._id === currentCard?._id) {
      // Jawaban Benar
      setScore((prev) => prev + 1);
      const currentIndex = deck.findIndex((c) => c._id === currentCard?._id);
      loadNextQuestion(deck, currentIndex + 1);
    } else {
      // Jawaban Salah
      handleWrongAnswer();
    }
  };

  if (gameState === "idle") {
    return (
      <div className="bg-cyber-surface p-10 md:p-16 rounded-[3rem] border border-red-500/20 shadow-[0_0_40px_rgba(239,68,68,0.1)] text-center relative overflow-hidden group">
        <div className="absolute inset-0 bg-red-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
        <Timer
          size={64}
          className="mx-auto text-red-500 mb-6 drop-shadow-[0_0_15px_rgba(239,68,68,0.5)] animate-pulse"
        />
        <h2 className="text-5xl font-black text-white uppercase italic tracking-tighter mb-4">
          Tantangan <span className="text-red-500">Bertahan</span>
        </h2>
        <p className="text-[#c4cfde]/60 mb-8 max-w-md mx-auto text-sm leading-relaxed">
          Uji kecepatan ingatanmu! Kamu punya{" "}
          <strong className="text-red-400">3 Nyawa</strong> dan hanya{" "}
          <strong className="text-amber-400">10 Detik</strong> per kartu.
          Seberapa jauh kamu bisa bertahan?
        </p>
        <button
          onClick={startGame}
          className="relative z-10 bg-red-500 hover:bg-red-600 text-white font-black uppercase tracking-widest py-4 px-10 rounded-2xl transition-all shadow-[0_0_20px_rgba(239,68,68,0.4)] active:scale-95"
        >
          Mulai Bermain
        </button>
      </div>
    );
  }

  if (gameState === "gameover" || gameState === "victory") {
    const isVictory = gameState === "victory";
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`bg-cyber-surface p-10 md:p-16 rounded-[3rem] border shadow-[0_0_40px_rgba(0,0,0,0.5)] text-center ${
          isVictory
            ? "border-amber-500/30 shadow-[0_0_40px_rgba(245,158,11,0.2)]"
            : "border-red-500/30"
        }`}
      >
        {isVictory ? (
          <Trophy
            size={80}
            className="mx-auto text-amber-500 mb-6 drop-shadow-[0_0_20px_rgba(245,158,11,0.6)]"
          />
        ) : (
          <Skull
            size={80}
            className="mx-auto text-red-500 mb-6 drop-shadow-[0_0_20px_rgba(239,68,68,0.6)]"
          />
        )}

        <h2
          className={`text-5xl md:text-6xl font-black uppercase italic tracking-tighter mb-2 ${isVictory ? "text-amber-500" : "text-red-500"}`}
        >
          {isVictory ? "Berhasil Menang!" : "Kehabisan Nyawa"}
        </h2>
        <p className="text-white/50 font-bold uppercase tracking-widest text-sm mb-8">
          Skor Akhir:{" "}
          <span className="text-white text-2xl font-black ml-2">{score}</span>
        </p>

        <button
          onClick={startGame}
          className="flex items-center justify-center gap-3 w-full max-w-xs mx-auto bg-white/5 hover:bg-white/10 border border-white/10 text-white font-black uppercase tracking-widest py-4 rounded-2xl transition-all active:scale-95"
        >
          <RotateCcw size={18} /> Coba Lagi
        </button>
      </motion.div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto w-full">
      {/* HUD (Heads Up Display) */}
      <header className="flex justify-between items-center mb-8 bg-cyber-surface p-5 rounded-3xl border border-white/5 shadow-inner">
        <div className="flex gap-2">
          {[...Array(MAX_HP)].map((_, i) => (
            <Heart
              key={i}
              size={24}
              className={`transition-all duration-300 ${
                i < hp
                  ? "text-red-500 fill-red-500 drop-shadow-[0_0_8px_rgba(239,68,68,0.8)]"
                  : "text-white/10 fill-transparent"
              }`}
            />
          ))}
        </div>

        <div
          className={`flex items-center gap-2 font-mono text-2xl font-black ${timeLeft <= 3 ? "text-red-500 animate-pulse" : "text-cyber-neon"}`}
        >
          <Timer size={24} /> 00:{timeLeft.toString().padStart(2, "0")}
        </div>

        <div className="flex items-center gap-2 text-amber-500 font-black text-xl">
          <Zap size={20} className="fill-amber-500" /> {score}
        </div>
      </header>

      {/* Main Question Card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentCard?._id}
          initial={{ opacity: 0, y: 20 }}
          animate={{
            opacity: 1,
            y: 0,
            x: isShaking ? [-10, 10, -10, 10, 0] : 0,
          }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.3 }}
          className={`relative bg-cyber-surface rounded-[3rem] p-10 md:p-16 border text-center mb-8 shadow-xl flex flex-col items-center justify-center min-h-[250px] md:min-h-[300px] ${
            isShaking
              ? "border-red-500/50 shadow-[0_0_30px_rgba(239,68,68,0.2)]"
              : "border-white/5"
          }`}
        >
          {/* Petunjuk Visual Kecil */}
          <span className="absolute top-6 text-[10px] font-black uppercase tracking-[0.3em] text-white/20 border border-white/5 px-3 py-1 rounded-full">
            Pilih Arti yang Tepat
          </span>

          {/* KANJI / KANA ASLI */}
          <span className="text-7xl md:text-9xl font-black text-white tracking-wider drop-shadow-md font-japanese mt-6">
            {currentCard?.word}
          </span>
        </motion.div>
      </AnimatePresence>

      {/* Multiple Choice Options */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {options.map((option, idx) => (
          <button
            key={idx}
            onClick={() => handleAnswer(option)}
            className="bg-cyber-bg p-6 md:p-8 rounded-2xl border border-white/5 hover:border-cyber-neon/50 hover:bg-cyber-neon/5 transition-all flex items-center justify-center group active:scale-95 shadow-[inset_0_2px_5px_rgba(0,0,0,0.5)]"
          >
            {/* ARTI BAHASA INDONESIA */}
            <p className="text-white font-bold text-lg md:text-xl text-center group-hover:text-cyber-neon transition-colors">
              {option.meaning}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
}
