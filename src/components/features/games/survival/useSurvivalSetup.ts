"use client";

/**
 * @file useSurvivalSetup.ts
 * @description Hook kustom (Custom Hook) untuk inisialisasi pengaturan permainan (Setup) pada Survival Mode.
 * Mengambil parameter pencarian URL, memanggil Server Action `getFlashcardsByMode` untuk memuat data kosakata, 
 * dan memformat kartu kosakata sebelum permainan dimulai.
 */

// ======================
// IMPOR
// ======================
import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { getFlashcardsByMode } from "@/actions/flashcard.actions";
import { CardData } from "./types";
import { toast } from "sonner";

// ======================
// HOOK UTAMA
// ======================
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
