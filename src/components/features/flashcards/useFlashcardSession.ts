"use client";

/**
 * @file useFlashcardSession.ts
 * @description Custom Hook pengelola inisialisasi sesi flashcard JLPT dari parameter query URL (?category=...&mode=...), serta penarikan data kartu kosakata/kanji secara asinkron dari Server Actions.
 */

// ==========================================
// IMPORT & DEPENDENSI
// ==========================================
import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getFlashcardsByMode } from "@/actions/flashcard.actions";
import { MasterCardData } from "./master/types";
import { toast } from "sonner";

// ==========================================
// DEKLARASI TIPE
// ==========================================
export type ModeLatihan = "vocab" | "kanji" | "survival" | "pronunciation" | "sentence";

// ==========================================
// CUSTOM HOOK UTAMA
// ==========================================

/**
 * Custom Hook: useFlashcardSession
 * 
 * Mengelola state sesi belajar kartu pengingat (flashcard), mencakup inisialisasi parameter query
 * URL (?category=...&mode=...), pemanggilan asinkron data kosakata/kanji JLPT via `getFlashcardsByMode`
 * Server Action, serta pengubahan layout berdasarkan tingkat JLPT dan mode latihan terpilih.
 * 
 * @returns {Object} State sesi flashcard dan callback handler pendukung
 * @returns {string | null} categorySlug - Slug kategori kursus aktif yang dideteksi dari URL
 * @returns {ModeLatihan | null} modeParam - Mode latihan terdeteksi dari parameter query URL
 * @returns {string | null} selectedLevel - Tingkat JLPT aktif yang terpilih
 * @returns {ModeLatihan | null} selectedMode - Mode latihan aktif yang sedang berjalan
 * @returns {Function} setSelectedMode - Setter mode latihan aktif
 * @returns {MasterCardData[]} cards - Daftar kartu pengingat acak terformat yang siap dipelajari
 * @returns {boolean} isFetchingCards - Status tunggu pengambilan data dari Server Actions
 * @returns {Function} fetchCardsAndStart - Callback asinkron untuk mengambil kartu dan memulai sesi
 * @returns {Function} handleBackFromMode - Callback untuk membatalkan mode latihan dan mereset layout/halaman
 */
export function useFlashcardSession() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const categorySlug = searchParams.get("category");
  const modeParam = searchParams.get("mode") as ModeLatihan | null;

  const [selectedLevel, setSelectedLevel] = useState<string | "all" | null>(() => {
    return categorySlug ? categorySlug.toUpperCase() : null;
  });
  const [selectedMode, setSelectedMode] = useState<ModeLatihan | null>(null);
  const [cards, setCards] = useState<MasterCardData[]>([]);
  const [isFetchingCards, setIsFetchingCards] = useState(false);
  const hasAutoFetchedRef = useRef(false);

  const [prevCategorySlug, setPrevCategorySlug] = useState(categorySlug);
  if (categorySlug !== prevCategorySlug) {
    setPrevCategorySlug(categorySlug);
    setSelectedLevel(categorySlug ? categorySlug.toUpperCase() : null);
  }

  const fetchCardsAndStart = useCallback(async (level: string, mode: ModeLatihan, amount: number) => {
    setIsFetchingCards(true);
    setSelectedLevel(level);
    setSelectedMode(mode);
    try {
      let combined: MasterCardData[] = [];
      const fetchMode = mode === "pronunciation" ? "vocab" : mode;
      const data = await getFlashcardsByMode(fetchMode, level, amount);

      if (mode === "kanji") {
        const kanjiData = data as unknown as Array<{
          id: string;
          character: string;
          meaning: string;
          onyomi?: string | null;
          kunyomi?: string | null;
        }>;
        combined = kanjiData.map((k) => ({
          id: k.id,
          docType: "kanji" as const,
          word: k.character,
          meaning: k.meaning,
          details: { onyomi: k.onyomi || undefined, kunyomi: k.kunyomi || undefined },
          slug: k.character,
        }));
      } else if (mode === "sentence") {
        const sentenceData = data as unknown as Array<{
          id: string;
          japanese: string;
          english?: string | null;
          indonesia?: string | null;
          jlpt_level?: string | null;
        }>;
        combined = sentenceData.map((s) => ({
          id: s.id,
          docType: "sentence" as const,
          word: s.japanese,
          meaning: s.indonesia || s.english || "",
          slug: s.id,
        }));
      } else {
        const vocabData = data as unknown as Array<{
          id: string;
          word: string;
          meaning_id?: string | null;
          romaji?: string | null;
          furigana?: string | null;
          slug?: string | null;
        }>;
        combined = vocabData.map((v) => ({
          id: v.id,
          docType: "vocab" as const,
          word: v.word,
          meaning: v.meaning_id || "",
          romaji: v.romaji || undefined,
          furigana: v.furigana || undefined,
          slug: v.slug || undefined,
        }));
      }

      combined = combined.sort(() => Math.random() - 0.5);

      if (combined.length === 0) {
        toast.error("Moushiwake arimasen - Data kartu untuk mode ini belum tersedia.");
        setSelectedMode(null);
      } else {
        setCards(combined);
      }
    } catch (error) {
      console.error("Gagal memuat kartu:", error);
      toast.error("Terjadi kendala saat memuat kartu.");
      setSelectedMode(null);
    } finally {
      setIsFetchingCards(false);
    }
  }, []);

  // Trigger otomatis jika masuk via URL ?category=slug
  useEffect(() => {
    if (categorySlug && !hasAutoFetchedRef.current) {
      const modeParamLower = modeParam?.toLowerCase();
      const isValidMode = modeParamLower === "vocab" || modeParamLower === "kanji" || modeParamLower === "survival" || modeParamLower === "pronunciation" || modeParamLower === "sentence";
      
      if (isValidMode && modeParam) {
        hasAutoFetchedRef.current = true;
        const amountParam = searchParams.get("amount");
        const amountVal = amountParam ? parseInt(amountParam, 10) : 20;
        const finalAmount = [10, 20, 50, 100].includes(amountVal) ? amountVal : 20;
        
        // eslint-disable-next-line react-hooks/set-state-in-effect
        fetchCardsAndStart(categorySlug.toUpperCase(), modeParam, finalAmount);
      } else {
        hasAutoFetchedRef.current = true;
      }
    }
  }, [categorySlug, modeParam, searchParams, fetchCardsAndStart]);

  const handleBackFromMode = useCallback(() => {
    if (categorySlug) {
      router.push(`/courses/${categorySlug}`);
    } else {
      setSelectedLevel(null);
      setSelectedMode(null);
    }
  }, [categorySlug, router]);

  return {
    categorySlug,
    modeParam,
    selectedLevel,
    selectedMode,
    setSelectedMode,
    cards,
    isFetchingCards,
    fetchCardsAndStart,
    handleBackFromMode,
  };
}
