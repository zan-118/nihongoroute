"use client";

import { useState, useEffect } from "react";

export default function FlashcardEngine({ cards }: { cards: any[] }) {
  // State untuk menyimpan kartu yang sudah diacak
  const [shuffledCards, setShuffledCards] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  // Mengacak kartu saat komponen pertama kali dimuat
  useEffect(() => {
    if (cards && cards.length > 0) {
      const shuffled = [...cards].sort(() => Math.random() - 0.5);
      setShuffledCards(shuffled);
    }
  }, [cards]);

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
      {/* Progress Bar (Tema Ungu untuk Kanji) */}
      <div className="w-full flex justify-between text-xs font-bold uppercase tracking-widest text-purple-400 mb-3">
        <span>Set Kanji N5</span>
        <span>
          {currentIndex + 1} / {shuffledCards.length}
        </span>
      </div>
      <div className="w-full bg-white/5 h-1.5 rounded-full mb-10 overflow-hidden">
        <div
          className="bg-purple-500 h-full transition-all duration-300 ease-out"
          style={{
            width: `${((currentIndex + 1) / shuffledCards.length) * 100}%`,
          }}
        ></div>
      </div>

      <div
        onClick={() => setIsFlipped(!isFlipped)}
        className="relative w-full aspect-square md:aspect-[4/3] bg-gradient-to-br from-[#1e2024] to-[#15171a] rounded-[2.5rem] border border-white/5 shadow-2xl flex flex-col items-center justify-center p-8 cursor-pointer hover:border-purple-500/30 hover:shadow-[0_0_30px_rgba(168,85,247,0.15)] transition-all text-center group overflow-hidden"
      >
        {!isFlipped ? (
          // DEPAN KARTU: Kanji Raksasa
          <div className="flex flex-col items-center justify-center h-full w-full">
            <span className="text-[#c4cfde]/30 text-xs font-bold uppercase tracking-widest mb-8">
              Tebak Cara Baca & Arti
            </span>
            <h2 className="text-8xl md:text-9xl font-black text-white tracking-widest group-hover:scale-105 transition-transform duration-300">
              {card.word}
            </h2>
            <span className="absolute bottom-8 text-purple-400/50 text-[10px] uppercase font-bold tracking-widest opacity-70 group-hover:opacity-100 transition-opacity">
              Tap kartu untuk membalik
            </span>
          </div>
        ) : (
          // BELAKANG KARTU: Detail Kanji
          <div className="flex flex-col items-center justify-center h-full w-full">
            <h2 className="text-5xl md:text-6xl font-black text-white mb-4">
              {card.word}
            </h2>
            <h3 className="text-2xl md:text-3xl font-black text-green-400 tracking-tight mb-8">
              {card.meaning}
            </h3>

            {/* Kotak Onyomi & Kunyomi */}
            {(card.details?.onyomi || card.details?.kunyomi) && (
              <div className="grid grid-cols-2 gap-4 w-full max-w-xs border-t border-white/10 pt-6">
                {card.details?.onyomi && (
                  <div className="text-center">
                    <p className="text-[10px] text-purple-400 font-bold uppercase tracking-widest mb-1">
                      Onyomi
                    </p>
                    <p className="text-white font-mono text-sm md:text-base">
                      {card.details.onyomi}
                    </p>
                  </div>
                )}
                {card.details?.kunyomi && (
                  <div className="text-center">
                    <p className="text-[10px] text-purple-400 font-bold uppercase tracking-widest mb-1">
                      Kunyomi
                    </p>
                    <p className="text-white font-mono text-sm md:text-base">
                      {card.details.kunyomi}
                    </p>
                  </div>
                )}
              </div>
            )}
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
          className="flex-1 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 text-purple-400 py-4 md:py-5 rounded-2xl font-black tracking-wide transition-all active:scale-95 shadow-[0_0_20px_rgba(168,85,247,0.05)]"
        >
          Lanjut →
        </button>
      </div>
    </div>
  );
}
