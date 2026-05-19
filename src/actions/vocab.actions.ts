"use server";

import { createClient } from "@/lib/supabase/server";
import { PaginatedVocabResponse } from "@/types/library";

function getHinshiFilters(hinshi: string): string[] {
  const lower = hinshi.toLowerCase();
  if (lower === "noun" || lower === "n") {
    return ["Noun"];
  }
  if (lower === "verb" || lower === "v") {
    return ["Verb", "Verb (Group 1)", "Verb (Group 2)", "Verb (Group 3)"];
  }
  if (lower === "i-adjective" || lower === "adj-i") {
    return ["I-Adjective"];
  }
  if (lower === "na-adjective" || lower === "adj-na") {
    return ["Na-Adjective"];
  }
  if (lower === "adverb" || lower === "adv") {
    return ["Adverb"];
  }
  if (lower === "particle") {
    return ["Particle"];
  }
  if (lower === "conjunction" || lower === "conj") {
    return ["Conjunction"];
  }
  if (lower === "pronoun" || lower === "pn") {
    return ["Pronoun"];
  }
  if (lower === "expression" || lower === "exp") {
    return ["Expression"];
  }
  return [hinshi];
}

/**
 * Mengambil kosakata dengan paginasi, pencarian, filter level, dan part of speech.
 */
export async function getPaginatedVocab(
  page: number,
  limit: number,
  search: string = "",
  level: string = "",
  hinshi: string = "",
  type: "vocab" | "verb" | "adjective" | "phrase" = "vocab"
): Promise<PaginatedVocabResponse> {
  const supabase = await createClient();
  const offset = (page - 1) * limit;

  try {
    let query = supabase.from("vocab").select("*", { count: "exact" });

    if (search) {
      const safeSearch = search.replace(/"/g, '');
      query = query.or(`word.ilike."%${safeSearch}%",meaning_id.ilike."%${safeSearch}%",furigana.ilike."%${safeSearch}%",romaji.ilike."%${safeSearch}%"`);
    }

    if (level && level !== "all") {
      if (level.toLowerCase() === "umum" || level.toLowerCase() === "other" || level.toLowerCase() === "non-jlpt") {
        query = query.is("jlpt_level", null);
      } else {
        query = query.eq("jlpt_level", level.toUpperCase());
      }
    }

    if (hinshi && hinshi !== "all") {
      const targets = getHinshiFilters(hinshi);
      if (targets.length === 1) {
        query = query.contains("hinshi", JSON.stringify([targets[0]]));
      } else {
        const orStr = targets.map(val => `hinshi.cs."${JSON.stringify([val]).replace(/"/g, '\\"')}"`).join(",");
        query = query.or(orStr);
      }
    }

    // Terapkan filter khusus berdasarkan 'type' routing jika tidak ada hinshi manual yang dipilih
    if (!hinshi || hinshi === "all") {
      if (type === "verb") {
        const verbTypes = [
          "Verb", "Verb (Group 1)", "Verb (Group 2)", "Verb (Group 3)"
        ];
        const orStr = verbTypes.map(v => `hinshi.cs."${JSON.stringify([v]).replace(/"/g, '\\"')}"`).join(",");
        query = query.or(orStr);
      } else if (type === "adjective") {
        const adjTypes = [
          "Na-Adjective", "I-Adjective"
        ];
        const orStr = adjTypes.map(a => `hinshi.cs."${JSON.stringify([a]).replace(/"/g, '\\"')}"`).join(",");
        query = query.or(orStr);
      }
    }

    const { data, count, error } = await query
      .order("word", { ascending: true })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    return {
      data: (data || []).map(v => ({ ...v, _id: v.id, meaning: v.meaning_id })),
      total: count || 0,
    };
  } catch (error) {
    console.error(`Failed to fetch paginated ${type}:`, error);
    return { data: [], total: 0 };
  }
}
