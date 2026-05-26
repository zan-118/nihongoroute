"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { getFlashcardsByMode } from "@/actions/flashcard.actions";
import { CardData } from "./types";
import { toast } from "sonner";

/**
 * Custom Hook: useSurvivalSetup
 * 
 * Mengelola state inisialisasi dan pengaturan permainan mini-game "Survival" (Kelangsungan Hidup).
 * Hook ini mendeteksi kategori rute dinamis dari URL, memanggil Server Action `getFlashcardsByMode`
 * untuk mengambil kosakata tantangan, serta mengontrol pergantian status layar bermain (playing vs setup).
 * 
 * @returns {Object} State pengaturan game dan callback pengendali
 * @returns {string} level - Tingkat JLPT terpilih ("all", "N5", "N4", dsb.)
 * @returns {Function} setLevel - Setter level JLPT
 * @returns {number} amount - Jumlah soal/kosakata yang akan dimainkan
 * @returns {Function} setAmount - Setter jumlah kosakata
 * @returns {CardData[]} cards - Daftar kosakata terformat yang siap dimainkan
 * @returns {boolean} isFetchingCards - Menandakan apakah pemanggilan API kosakata sedang berjalan
 * @returns {boolean} isPlaying - Menunjukkan apakah mode bermain game survival sedang aktif
 * @returns {Function} handleStartGame - Callback asinkron untuk mengambil kosakata dan memulai game
 * @returns {Function} handleExitGame - Callback untuk keluar dari game dan mereset state kartu
 */
export function useSurvivalSetup() {
  const searchParams = useSearchParams();
  const categorySlug = searchParams.get("category");

  const [level, setLevel] = useState<string>("all");
  const [amount, setAmount] = useState<number>(20);
  const [cards, setCards] = useState<CardData[]>([]);
  const [isFetchingCards, setIsFetchingCards] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasAutoFetched, setHasAutoFetched] = useState(false);

  // Trigger otomatis jika masuk via URL ?category=slug (misal dari halaman pelajaran)
  useEffect(() => {
    if (categorySlug && !hasAutoFetched) {
      requestAnimationFrame(() => {
        setHasAutoFetched(true);
        setLevel(categorySlug.toUpperCase());
      });
    }
  }, [categorySlug, hasAutoFetched]);

  const handleStartGame = useCallback(async () => {
    setIsFetchingCards(true);
    try {
      const data = await getFlashcardsByMode("survival", level, amount);
      
      const vocabData = data as unknown as Array<{
        id: string;
        word: string;
        meaning_id?: string | null;
        romaji?: string | null;
        furigana?: string | null;
        slug?: string | null;
        jlpt_level?: string | null;
      }>;

      if (!vocabData || vocabData.length < 4) {
        toast.error("Moushiwake arimasen - Data kosakata tidak cukup untuk memulai permainan (minimal 4 kata).");
        return;
      }

      const formatted = vocabData.map((v) => ({
        id: v.id,
        word: v.word,
        meaning: v.meaning_id || "",
        romaji: v.romaji || undefined,
        furigana: v.furigana || undefined,
        jlpt_level: v.jlpt_level || level,
        type: "vocab" as const
      }));

      setCards(formatted);
      setIsPlaying(true);
      toast.success(`Berhasil memuat ${formatted.length} kata JLPT ${level === "all" ? "Campuran" : level}!`);
    } catch (error) {
      console.error("Gagal memuat kartu survival:", error);
      toast.error("Terjadi kendala saat memuat kosakata tantangan.");
    } finally {
      setIsFetchingCards(false);
    }
  }, [level, amount]);

  const handleExitGame = useCallback(() => {
    setIsPlaying(false);
    setCards([]);
  }, []);

  return {
    level,
    setLevel,
    amount,
    setAmount,
    cards,
    isFetchingCards,
    isPlaying,
    handleStartGame,
    handleExitGame,
  };
}
