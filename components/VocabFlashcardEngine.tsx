"use client";

import { useState, useEffect } from "react";

export default function VocabFlashcardEngine({ cards }: { cards: any[] }) {
  // Tambahkan state baru untuk menyimpan kartu yang sudah diacak
  const [shuffledCards, setShuffledCards] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  // Gunakan useEffect untuk mengacak kartu hanya sekali saat komponen dimuat
  useEffect(() => {
    if (cards && cards.length > 0) {
      const shuffled = [...cards].sort(() => Math.random() - 0.5);
      setShuffledCards(shuffled);
    }
  }, [cards]);

  // Jika kartu belum siap (masih kosong), jangan tampilkan apa-apa
  if (!shuffledCards || shuffledCards.length === 0) return null;

  const card = shuffledCards[currentIndex];

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsFlipped(false);
    setTimeout(
      () => setCurrentIndex((prev) => (prev + 1) % shuffledCards.length),
      150,
    );
  };

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsFlipped(false);
    setTimeout(
      () =>
        setCurrentIndex(
          (prev) => (prev - 1 + shuffledCards.length) % shuffledCards.length,
        ),
      150,
    );
  };

  return (
    <div className="flex flex-col items-center w-full max-w-xl mx-auto">
      <div className="w-full flex justify-between text-xs font-bold uppercase tracking-widest text-[#0ef] mb-3">
        <span>Set Kosakata N5</span>
        <span>
          {currentIndex + 1} / {shuffledCards.length}
        </span>
      </div>
      <div className="w-full bg-white/5 h-1.5 rounded-full mb-10 overflow-hidden">
        <div
          className="bg-[#0ef] h-full transition-all duration-300 ease-out"
          style={{
            width: `${((currentIndex + 1) / shuffledCards.length) * 100}%`,
          }}
        ></div>
      </div>

      <div
        onClick={() => setIsFlipped(!isFlipped)}
        className="relative w-full aspect-square md:aspect-[4/3] bg-gradient-to-br from-[#1e2024] to-[#15171a] rounded-[2.5rem] border border-white/5 shadow-2xl flex flex-col items-center justify-center p-8 cursor-pointer hover:border-[#0ef]/30 hover:shadow-[0_0_30px_rgba(0,238,255,0.1)] transition-all text-center group"
      >
        {!isFlipped ? (
          <div className="flex flex-col items-center justify-center h-full w-full">
            <span className="text-[#c4cfde]/30 text-xs font-bold uppercase tracking-widest mb-8">
              Tebak Arti & Bacaan
            </span>
            <h2
              className={`${card.word.length > 6 ? "text-4xl md:text-5xl" : "text-6xl md:text-7xl"} font-black text-white tracking-widest group-hover:scale-105 transition-transform duration-300`}
            >
              {card.word}
            </h2>
            <span className="absolute bottom-8 text-[#0ef]/50 text-[10px] uppercase font-bold tracking-widest opacity-70 group-hover:opacity-100 transition-opacity">
              Tap kartu untuk membalik
            </span>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full w-full">
            <ruby className="text-4xl md:text-5xl font-black text-white mb-3">
              {card.word}
              <rt className="text-sm md:text-base text-[#0ef] mb-2">
                {card.furigana}
              </rt>
            </ruby>
            <p className="text-[#c4cfde]/80 font-mono text-sm md:text-base mb-6 border-b border-white/10 pb-4 px-12 inline-block">
              {card.romaji}
            </p>
            <h3 className="text-3xl md:text-4xl font-black text-green-400 tracking-tight">
              {card.meaning}
            </h3>
          </div>
        )}
      </div>

      <div className="flex justify-between w-full mt-8 gap-4">
        <button
          onClick={handlePrev}
          className="flex-1 bg-[#1e2024] hover:bg-[#23272b] border border-white/5 text-[#c4cfde] py-4 md:py-5 rounded-2xl font-bold tracking-wide transition-all active:scale-95"
        >
          ← Mundur
        </button>
        <button
          onClick={handleNext}
          className="flex-1 bg-[#0ef]/10 hover:bg-[#0ef]/20 border border-[#0ef]/30 text-[#0ef] py-4 md:py-5 rounded-2xl font-black tracking-wide transition-all active:scale-95 shadow-[0_0_20px_rgba(0,238,255,0.05)]"
        >
          Lanjut →
        </button>
      </div>
    </div>
  );
}
