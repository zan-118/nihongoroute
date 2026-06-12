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

export async function getFlashcardsByMode(
  mode: "vocab" | "kanji" | "survival" | "sentence", 
  level: string | "all", 
  amount: number = 20
) {
  const supabase = await createClient();
  await supabase.auth.getSession();
  
  if (mode === "kanji") {
    let query = supabase
      .from("kanji")
      .select("id, character, meaning, onyomi, kunyomi, examples")
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
      .not("japanese", "is", null)
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
