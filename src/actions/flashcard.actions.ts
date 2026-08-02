/**
 * @file flashcard.actions.ts
 * @description Server Actions to fetch flashcards based on study mode, JLPT level, and requested quantity.
 * Supports vocabulary, kanji, and survival flashcard modes.
 */

"use server";

// ==========================================
// Imports & Dependencies
// ==========================================
import { createClient } from "@/lib/supabase/server";

// ==========================================
// Server Actions
// ==========================================

/**
 * Fetch flashcards from database.
 * Filter by mode, JLPT level, and limit count.
 * 
 * @param mode - Flashcard type (vocab, kanji, survival, sentence).
 * @param level - JLPT level filter or "all".
 * @param amount - Max items to return. Default 20.
 * @returns Array of flashcard items.
 */
export async function getFlashcardsByMode(
 mode: "vocab" | "kanji" | "survival" | "sentence", 
 level: string | "all", 
 amount: number = 20
) {
 const supabase = await createClient();
 // Refresh session to keep user authenticated.
 await supabase.auth.getSession();
 
 if (mode === "kanji") {
 let query = supabase
 .from("kanji")
 .select("id, character, meaning, onyomi, kunyomi, examples")
 // Exclude items hidden from flashcards.
 .neq("show_in_flashcard", false)
 .limit(amount); // Ambil tepat sejumlah kuantitas yang diminta oleh pengguna

 if (level && level !== "all") {
 query = query.eq("jlpt_level", level.toUpperCase());
 }

 const { data, error } = await query;
 if (error) {
 console.error("Gagal mengambil kartu flash kanji:", error);
 return [];
 }
 
 return data || [];
 } else if (mode === "sentence") {
 let query = supabase
 .from("sentences")
 .select("id, japanese, english, indonesia, jlpt_level")
 // Require Japanese text.
 .not("japanese", "is", null)
 // Require at least one translation.
 .or("indonesia.neq.null,english.neq.null")
 .limit(amount);

 if (level && level !== "all") {
 query = query.eq("jlpt_level", level.toUpperCase());
 }

 const { data, error } = await query;
 if (error) {
 console.error("Gagal mengambil kartu flash kalimat:", error);
 return [];
 }
 return data || [];
 } else {
 // vocab atau survival
 let query = supabase
 .from("vocab")
 .select("id, word, meaning_id, romaji, furigana, slug")
 // Exclude items hidden from flashcards.
 .neq("show_in_flashcard", false)
 .limit(amount); // Ambil tepat sejumlah kuantitas yang diminta oleh pengguna

 if (level && level !== "all") {
 query = query.eq("jlpt_level", level.toUpperCase());
 }

 const { data, error } = await query;
 if (error) {
 console.error("Gagal mengambil kartu flash kosakata:", error);
 return [];
 }
 return data || [];
 }
}

import {
 classifyFlashcardIds,
 formatVocabCards,
 formatRomajiVocabs,
 formatKanjiCards,
 sortCardsByRequestedOrder,
 type FormattedCard,
} from "@/lib/learning/flashcard-resolver";

/**
 * Fetch specific flashcards by list of IDs.
 * Matches logic from GET /api/cards route handler but as a Server Action.
 * 
 * @param ids - Array of ID strings.
 * @returns Array of formatted card data.
 */
export async function getFlashcardsByIds(ids: string[]): Promise<FormattedCard[]> {
 if (!ids || ids.length === 0) return [];

 const { uuids, slugs, romajis, kanjiChars } = classifyFlashcardIds(ids);

 try {
 const supabase = await createClient();
 await supabase.auth.getSession();

 const [
 vocabByUuidRes,
 vocabBySlugRes,
 vocabByRomajiRes,
 kanjiByUuidRes,
 kanjiByCharRes
 ] = await Promise.all([
 uuids.length > 0 
 ? supabase.from("vocab").select("id, word, meaning_id, romaji, furigana, jlpt_level, examples, mnemonic, usage_notes, pitch_accent, hinshi").in("id", uuids) 
 : Promise.resolve({ data: null, error: null }),
 slugs.length > 0 
 ? supabase.from("vocab").select("id, word, meaning_id, romaji, furigana, jlpt_level, examples, mnemonic, usage_notes, pitch_accent, hinshi").in("slug", slugs) 
 : Promise.resolve({ data: null, error: null }),
 romajis.length > 0 
 ? supabase.from("vocab").select("id, word, meaning_id, romaji, furigana, jlpt_level, examples, mnemonic, usage_notes, pitch_accent, hinshi").in("romaji", romajis) 
 : Promise.resolve({ data: null, error: null }),
 uuids.length > 0 
 ? supabase.from("kanji").select("id, character, meaning, onyomi, kunyomi, jlpt_level, stroke_order_svg, mnemonics, examples").in("id", uuids) 
 : Promise.resolve({ data: null, error: null }),
 kanjiChars.length > 0 
 ? supabase.from("kanji").select("id, character, meaning, onyomi, kunyomi, jlpt_level, stroke_order_svg, mnemonics, examples").in("character", kanjiChars) 
 : Promise.resolve({ data: null, error: null }),
 ]);

 if (vocabByUuidRes.error) throw vocabByUuidRes.error;
 if (vocabBySlugRes.error) throw vocabBySlugRes.error;
 if (vocabByRomajiRes.error) throw vocabByRomajiRes.error;
 if (kanjiByUuidRes.error) throw kanjiByUuidRes.error;
 if (kanjiByCharRes.error) throw kanjiByCharRes.error;

 const rawVocabs = [
 ...(vocabByUuidRes.data || []),
 ...(vocabBySlugRes.data || [])
 ];
 const uniqueVocabsMap = new Map<string, typeof rawVocabs[number]>();
 rawVocabs.forEach(v => uniqueVocabsMap.set(v.id, v));

 const rawKanjis = [
 ...(kanjiByUuidRes.data || []),
 ...(kanjiByCharRes.data || [])
 ];
 const uniqueKanjisMap = new Map<string, typeof rawKanjis[number]>();
 rawKanjis.forEach(k => uniqueKanjisMap.set(k.id, k));

 const formattedVocabs = formatVocabCards(Array.from(uniqueVocabsMap.values()));
 const formattedRomajiVocabs = formatRomajiVocabs(vocabByRomajiRes.data || [], ids);
 const formattedKanjis = formatKanjiCards(Array.from(uniqueKanjisMap.values()));

 const uniqueFinalCardsMap = new Map<string, FormattedCard>();
 formattedVocabs.forEach(c => uniqueFinalCardsMap.set(c.id, c));
 formattedRomajiVocabs.forEach(c => uniqueFinalCardsMap.set(c.id, c));
 formattedKanjis.forEach(c => uniqueFinalCardsMap.set(c.id, c));

 const allCards = Array.from(uniqueFinalCardsMap.values());
 return sortCardsByRequestedOrder(allCards, ids);
 } catch (error) {
 console.error("[getFlashcardsByIds] Gagal mengambil data kartu:", error);
 return [];
 }
}