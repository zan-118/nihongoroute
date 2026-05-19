"use server";

import { createClient } from "@/lib/supabase/server";

export async function getFlashcardsByMode(
  mode: "vocab" | "kanji" | "survival", 
  level: string | "all", 
  amount: number = 20
) {
  const supabase = await createClient();
  
  if (mode === "kanji") {
    let query = supabase
      .from("kanji")
      .select("id, character, meaning, onyomi, kunyomi, examples")
      .neq("show_in_flashcard", false)
      .limit(amount); // Fetch exactly the amount requested by the user

    if (level && level !== "all") {
      query = query.eq("jlpt_level", level.toUpperCase());
    }

    const { data, error } = await query;
    if (error) {
      console.error("Error fetching kanji flashcards:", error);
      return [];
    }
    
    return data || [];
  } else {
    // vocab atau survival
    let query = supabase
      .from("vocab")
      .select("id, word, meaning_id, romaji, furigana, slug")
      .neq("show_in_flashcard", false)
      .limit(amount); // Fetch exactly the amount requested by the user

    if (level && level !== "all") {
      query = query.eq("jlpt_level", level.toUpperCase());
    }

    const { data, error } = await query;
    if (error) {
      console.error("Error fetching vocab flashcards:", error);
      return [];
    }
    return data || [];
  }
}
