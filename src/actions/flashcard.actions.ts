/**
 * @file flashcard.actions.ts
 * @description Server Actions untuk mengambil data kartu flash (flashcards) berdasarkan mode,
 * level JLPT, dan jumlah yang diminta. Mendukung mode kosakata, kanji, maupun survival.
 */

"use server";

// ======================
// IMPORTS
// ======================
import { createClient } from "@/lib/supabase/server";

// ======================
// SERVER ACTIONS
// ======================

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