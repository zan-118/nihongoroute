"use client";

/**
 * @file useFlashcardSession.ts
 * @description Custom hook managing JLPT flashcard session initialization from URL search params (`?category=...&mode=...`) and fetching flashcard data asynchronously via Server Actions.
 */

// ==========================================
// Import & Dependencies
// ==========================================
import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getFlashcardsByMode } from "@/actions/flashcard.actions";
import { MasterCardData } from "./master/types";
import { toast } from "sonner";
import { shuffleArray } from "@/lib/utils";

// ==========================================
// Type Declarations
// ==========================================

/**
 * Supported flashcard practice modes.
 */
export type ModeLatihan = "vocab" | "kanji" | "survival" | "pronunciation" | "sentence";

// ==========================================
// CUSTOM HOOK UTAMA
// ==========================================

/**
 * Manage flashcard session state, URL query parameters, and data fetching.
 * 
 * @returns Session state and handler functions.
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
 // Sync level state when category slug changes in URL.
 if (categorySlug !== prevCategorySlug) {
 setPrevCategorySlug(categorySlug);
 setSelectedLevel(categorySlug ? categorySlug.toUpperCase() : null);
 }

 /**
 * Fetch flashcard data from server and initialize session.
 * 
 * @param level JLPT level.
 * @param mode Practice mode.
 * @param amount Number of cards to fetch.
 */
 const fetchCardsAndStart = useCallback(async (level: string, mode: ModeLatihan, amount: number) => {
 setIsFetchingCards(true);
 setSelectedLevel(level);
 setSelectedMode(mode);
 try {
 let combined: MasterCardData[] = [];
 // Pronunciation mode uses vocab data source.
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
 // Map kanji database schema to unified card structure.
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
 // Map sentence database schema to unified card structure.
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
 // Map vocabulary database schema to unified card structure.
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

 // Shuffle cards randomly.
 combined = shuffleArray(combined);

 if (combined.length === 0) {
 toast.error("Maaf ya, data kartu untuk mode ini belum tersedia.");
 setSelectedMode(null);
 } else {
 setCards(combined);
 }
 } catch (error) {
 console.error("Gagal memuat kartu:", error);
 toast.error("Gagal memuat kartu. Coba lagi sebentar lagi ya!");
 setSelectedMode(null);
 } finally {
 setIsFetchingCards(false);
 }
 }, []);

 // Auto-start session if valid category and mode present in URL.
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

 /**
 * Reset session state or navigate back to course page.
 */
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