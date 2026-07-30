/**
 * @file vocab.actions.ts
 * @description Server Actions untuk mengambil data kosakata (vocab) dari Supabase.
 * Menyediakan paginasi dengan pencarian teks, filter level JLPT, filter part-of-speech (hinshi),
 * serta dukungan tipe routing: vocab, verb, adjective, dan phrase.
 */

"use server";

// ======================
// IMPORTS
// ======================
import { PaginatedVocabResponse, LibraryItem } from "@/types/library";
import { VocabTable } from "@/types/database";
import { queryLexicalDomain } from "@/lib/services/lexical-content-engine";
import {
  getContentBySlugOrId,
  getStaticSlugs,
  getRelatedKanjis,
  getRelatedVocabByWords,
  getSentencesContainingWord
} from "@/lib/services/content-repository";

// ======================
// SERVER ACTIONS
// ======================

/**
 * Fetch paginated vocabulary items using LexicalContentEngine domain seam.
 * @param page Page number.
 * @param limit Items per page.
 * @param search Search query.
 * @param level JLPT level.
 * @param hinshi Part of speech.
 * @param type Route type.
 * @returns Paginated vocabulary response.
 */
export async function getPaginatedVocab(
  page: number,
  limit: number,
  search: string = "",
  level: string = "",
  hinshi: string = "",
  type: "vocab" | "verb" | "adjective" | "phrase" = "vocab"
): Promise<PaginatedVocabResponse> {
  try {
    const response = await queryLexicalDomain<VocabTable>({
      type,
      filters: { search, level, hinshi },
      pagination: { page, limit },
    });

    return {
      data: response.data.map((v) => ({ ...v, _id: v.id, meaning: v.meaning_id })),
      total: response.total,
    };
  } catch (error) {
    console.error("Gagal mengambil data paginasi vocab:", error);
    return { data: [], total: 0 };
  }
}

/**
 * Check if string is valid UUID.
 * @param s Input string.
 */
const isUUID = (s: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s);

/**
 * Fetch single vocabulary detail by slug or ID.
 * @param slugOrId Slug or UUID.
 * @returns Vocabulary detail or null.
 */
export async function getLibraryVocabDetail(slugOrId: string): Promise<LibraryItem | null> {
  try {
    const data = await getContentBySlugOrId<LibraryItem>("vocab", slugOrId);

    if (!data) return null;

    // Normalisasi bidang properti untuk frontend
    data.pitchAccent = data.pitch_accent;
    data.jlptLevel = data.jlpt_level;
    data.usageNotes = data.usage_notes;
    data.meaning = data.meaning_id;
    data._id = data.id;

    const rawRelatedKanji = Array.isArray(data.related_kanji) ? data.related_kanji : [];
    const rawSynonyms = Array.isArray(data.synonyms) ? data.synonyms : [];
    const rawAntonyms = Array.isArray(data.antonyms) ? data.antonyms : [];

    // Fetch detail related kanji
    if (rawRelatedKanji.length > 0) {
      const kanjis = await getRelatedKanjis(rawRelatedKanji);
      data.relatedKanji = rawRelatedKanji.map((char: string) => {
        const matched = (kanjis || []).find((k) => k.character === char);
        return matched ? { ...matched, _id: matched.id } : { character: char, meaning: "", onyomi: "", kunyomi: "", slug: "" };
      });
    } else {
      data.relatedKanji = [];
    }

    // Fetch detail synonyms
    if (rawSynonyms.length > 0) {
      const syns = await getRelatedVocabByWords(rawSynonyms);
      data.synonyms = rawSynonyms.map((word: string) => {
        const matched = (syns || []).find((v) => v.word === word);
        return matched ? { ...matched, _id: matched.id, meaning: matched.meaning_id } : { word, meaning: "", romaji: "", slug: "" };
      });
    } else {
      data.synonyms = [];
    }

    // Fetch detail antonyms
    if (rawAntonyms.length > 0) {
      const ants = await getRelatedVocabByWords(rawAntonyms);
      data.antonyms = rawAntonyms.map((word: string) => {
        const matched = (ants || []).find((v) => v.word === word);
        return matched ? { ...matched, _id: matched.id, meaning: matched.meaning_id } : { word, meaning: "", romaji: "", slug: "" };
      });
    } else {
      data.antonyms = [];
    }
    
    // Tangani contoh kalimat secara aman
    if (typeof data.examples === "string") {
      try {
        data.examples = JSON.parse(data.examples);
      } catch {
        data.examples = [];
      }
    }
    data.examples = Array.isArray(data.examples) ? data.examples : [];

    // Ambil kalimat contoh dinamis dari tabel public.sentences
    try {
      const dbSentences = await getSentencesContainingWord(data.word as string, 3);

      if (dbSentences && dbSentences.length > 0) {
        const dynamicExamples = dbSentences.map((s) => ({
          jp: s.japanese,
          meaning: s.indonesia || s.english || "",
          romaji: ""
        }));
        data.examples = [...(data.examples as Array<{ jp: string; meaning: string; romaji?: string }>), ...dynamicExamples];
      }
    } catch (sentenceErr) {
      console.error(`[getLibraryVocabDetail] gagal mengambil data kalimat dinamis untuk "${data.word}":`, sentenceErr);
    }

    // Tangani konjugasi kata
    let conj = typeof data.conjugations === "object" && data.conjugations !== null ? data.conjugations : {};
    if (conj.display_forms && typeof conj.display_forms === "object") {
      conj = conj.display_forms;
    } else if (conj.forms && typeof conj.forms === "object") {
      conj = conj.forms;
    } else if (conj.conjugations && typeof conj.conjugations === "object") {
      conj = conj.conjugations;
    }

    data.negative = conj.negative || conj.negative_form || conj.polite_negative || conj.polite_negative_form;
    data.past = conj.past || conj.past_form || conj.polite_past || conj.polite_past_form;
    data.pastNegative = conj.pastNegative || conj.past_negative_form || conj.polite_past_negative || conj.polite_past_negative_form;
    data.teForm = conj.te || conj.te_form || conj.teForm;
    data.adverbial = conj.adverb || conj.adverbial || conj.adverb_form || conj.adverbial_form;

    return data;
  } catch (error) {
    console.error("Gagal mengambil detail kosakata:", error);
    return null;
  }
}

/**
 * Fetch top vocabulary slugs for static build generation (ISR).
 * 
 * @param limit - Maximum number of slugs to pre-render.
 * @returns Array of object params with slug property.
 */
export async function getVocabStaticSlugs(limit: number = 200): Promise<{ slug: string }[]> {
  try {
    const data = await getStaticSlugs("vocab", {
      limit,
      orderBy: { column: "created_at", ascending: false },
      select: "slug",
    });
    return data.map((item) => ({ slug: String(item.slug) }));
  } catch (error) {
    console.error("Gagal mengambil static slugs vocab:", error);
    return [];
  }
}