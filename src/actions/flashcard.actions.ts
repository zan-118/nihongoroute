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

interface FormattedCard {
  _id: string;
  id: string;
  word: string;
  meaning: string;
  romaji?: string | null;
  furigana?: string | null;
  jlptLevel?: string | null;
  examples?: Array<{ japanese: string; indonesian: string }> | null;
  mnemonic?: string | null;
  usageNotes?: string | null;
  pitchAccent?: string | null;
  hinshi?: string | null;
  category: "vocab" | "kanji";
  docType: "vocab" | "kanji";
  kanjiDetails?: {
    onyomi?: string | null;
    kunyomi?: string | null;
  } | null;
}

/**
 * Fetch specific flashcards by list of IDs.
 * Matches logic from GET /api/cards route handler but as a Server Action.
 * 
 * @param ids - Array of ID strings.
 * @returns Array of formatted card data.
 */
export async function getFlashcardsByIds(ids: string[]): Promise<FormattedCard[]> {
  if (!ids || ids.length === 0) return [];

  const uuids: string[] = [];
  const slugs: string[] = [];
  const romajis: string[] = [];
  const kanjiChars: string[] = [];
  const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

  const posPrefixes = [
    "pre-noun-adjectival-",
    "adverbial-noun-",
    "temporal-noun-",
    "noun-",
    "pronoun-",
    "numeric-",
    "expression-",
    "conjunction-",
    "verb-"
  ];

  for (const id of ids) {
    if (UUID_REGEX.test(id)) {
      uuids.push(id);
    } else if (id.startsWith("n5-") || id.startsWith("n4-")) {
      const cleanId = id.slice(3);
      let romajiFound = cleanId;
      for (const prefix of posPrefixes) {
        if (cleanId.startsWith(prefix)) {
          romajiFound = cleanId.slice(prefix.length);
          break;
        }
      }
      romajis.push(romajiFound);
    } else if (id.length === 1) {
      kanjiChars.push(id);
    } else {
      slugs.push(id);
    }
  }

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
        ? supabase.from("vocab").select("id, word, meaning:meaning_id, romaji, furigana, jlpt_level, examples, mnemonic, usage_notes, pitch_accent, hinshi").in("id", uuids) 
        : Promise.resolve({ data: null, error: null }),
      slugs.length > 0 
        ? supabase.from("vocab").select("id, word, meaning:meaning_id, romaji, furigana, jlpt_level, examples, mnemonic, usage_notes, pitch_accent, hinshi").in("slug", slugs) 
        : Promise.resolve({ data: null, error: null }),
      romajis.length > 0 
        ? supabase.from("vocab").select("id, word, meaning:meaning_id, romaji, furigana, jlpt_level, examples, mnemonic, usage_notes, pitch_accent, hinshi").in("romaji", romajis) 
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

    const formattedVocabs = Array.from(uniqueVocabsMap.values()).map((v) => ({
      _id: v.id,
      id: v.id,
      word: v.word,
      meaning: v.meaning,
      romaji: v.romaji,
      furigana: v.furigana,
      jlptLevel: v.jlpt_level,
      examples: Array.isArray(v.examples) ? (v.examples as Array<{ japanese?: string; jp?: string; indonesian?: string; meaning?: string; id?: string }>).map((ex) => ({
        japanese: ex?.japanese || ex?.jp || "",
        indonesian: ex?.indonesian || ex?.meaning || ex?.id || ""
      })) : [],
      mnemonic: v.mnemonic,
      usageNotes: v.usage_notes,
      pitchAccent: v.pitch_accent,
      hinshi: v.hinshi,
      category: "vocab" as const,
      docType: "vocab" as const,
    }));

    const formattedRomajiVocabs: FormattedCard[] = [];
    if (vocabByRomajiRes.data) {
      vocabByRomajiRes.data.forEach((v) => {
        const matchingLegacyIds = ids.filter((id) => {
          if (!id.startsWith("n5-") && !id.startsWith("n4-")) return false;
          const cleanId = id.slice(3);
          let romajiFound = cleanId;
          for (const prefix of posPrefixes) {
            if (cleanId.startsWith(prefix)) {
              romajiFound = cleanId.slice(prefix.length);
              break;
            }
          }
          return romajiFound.toLowerCase() === v.romaji?.toLowerCase();
        });

        matchingLegacyIds.forEach((legacyId) => {
          formattedRomajiVocabs.push({
            _id: legacyId,
            id: legacyId,
            word: v.word,
            meaning: v.meaning,
            romaji: v.romaji,
            furigana: v.furigana,
            jlptLevel: v.jlpt_level,
            examples: Array.isArray(v.examples) ? (v.examples as Array<{ japanese?: string; jp?: string; indonesian?: string; meaning?: string; id?: string }>).map((ex) => ({
              japanese: ex?.japanese || ex?.jp || "",
              indonesian: ex?.indonesian || ex?.meaning || ex?.id || ""
            })) : [],
            mnemonic: v.mnemonic,
            usageNotes: v.usage_notes,
            pitchAccent: v.pitch_accent,
            hinshi: v.hinshi,
            category: "vocab" as const,
            docType: "vocab" as const,
          });
        });
      });
    }

    const formattedKanjis = Array.from(uniqueKanjisMap.values()).map((k) => {
      let formattedMnemonic = "";
      if (Array.isArray(k.mnemonics)) {
        formattedMnemonic = k.mnemonics.join("\n");
      } else if (typeof k.mnemonics === "string") {
        formattedMnemonic = k.mnemonics;
      }

      const formattedExamples = Array.isArray(k.examples) ? (k.examples as Array<{ japanese?: string; jp?: string; indonesian?: string; meaning?: string; id?: string }>).map((ex) => ({
        japanese: ex?.japanese || ex?.jp || "",
        indonesian: ex?.indonesian || ex?.meaning || ex?.id || ""
      })) : [];

      return {
        _id: k.id,
        id: k.id,
        word: k.character,
        meaning: k.meaning,
        romaji: null,
        furigana: k.kunyomi || k.onyomi || null,
        jlptLevel: k.jlpt_level,
        examples: formattedExamples,
        mnemonic: formattedMnemonic || null,
        category: "kanji" as const,
        docType: "kanji" as const,
        kanjiDetails: {
          onyomi: k.onyomi,
          kunyomi: k.kunyomi,
        }
      };
    });

    const uniqueFinalCardsMap = new Map<string, FormattedCard>();
    formattedVocabs.forEach(c => uniqueFinalCardsMap.set(c.id, c));
    formattedRomajiVocabs.forEach(c => uniqueFinalCardsMap.set(c.id, c));
    formattedKanjis.forEach(c => uniqueFinalCardsMap.set(c.id, c));

    const allCards = Array.from(uniqueFinalCardsMap.values());

    const requestedOrderMap = new Map<string, number>();
    ids.forEach((id, index) => {
      requestedOrderMap.set(id.toLowerCase(), index);
    });

    allCards.sort((a, b) => {
      const aKeys = [a.id.toLowerCase(), a.word.toLowerCase()];
      const bKeys = [b.id.toLowerCase(), b.word.toLowerCase()];
      
      let aIdx = 9999;
      let bIdx = 9999;
      
      for (const k of aKeys) {
        if (requestedOrderMap.has(k)) {
          aIdx = requestedOrderMap.get(k)!;
          break;
        }
      }
      for (const k of bKeys) {
        if (requestedOrderMap.has(k)) {
          bIdx = requestedOrderMap.get(k)!;
          break;
        }
      }
      
      return aIdx - bIdx;
    });

    return allCards;
  } catch (error) {
    console.error("[getFlashcardsByIds] Gagal mengambil data kartu:", error);
    return [];
  }
}