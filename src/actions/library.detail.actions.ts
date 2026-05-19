"use server";

import { createClient } from "@/lib/supabase/server";
import { slugify } from "@/lib/utils";
import { getSanityLessonBySlug, getSanityReadingBySlug, getSanityListeningBySlug, getSanityExamBySlug } from "@/lib/queries";

// --- Types ---
type ContentBlock = {
  _type?: string;
  type?: string;
  children?: any[];
  [key: string]: any;
};

type ListeningTable = {
  id: string;
  audio_url?: string;
  image_url?: string;
  video_url?: string;
  body?: any;
  translation?: any;
  hiragana?: any;
  [key: string]: any;
};

export async function checkExistingContent(
  keyword: string,
  type: "kanji" | "vocab" | "verb" | "adjective" | "grammar" | "phrase" | "reading" | "listening" | "lessons" | "exams"
): Promise<{ data?: unknown; error?: string }> {
  const supabase = await createClient();
  const slug = slugify(keyword);

  try {
    let query;
    if (type === "kanji") {
      query = supabase.from("kanji").select("*").eq("character", keyword).single();
    } else if (type === "vocab" || type === "adjective" || type === "verb" || type === "phrase") {
      query = supabase.from("vocab").select("*, meaning:meaning_id").eq("word", keyword).single();
    } else if (type === "grammar") {
      query = supabase.from("grammar").select("*").eq("slug", slug).single();
    } else if (type === "reading") {
      query = supabase.from("reading_material").select("*").eq("slug", slug).single();
    } else if (type === "listening") {
      query = supabase.from("listening_material").select("*").eq("slug", slug).single();
    } else if (type === "lessons") {
      query = supabase.from("lessons").select("*, course_categories(title)").eq("slug", slug).single();
    } else if (type === "exams") {
      query = supabase.from("exams").select("*").eq("slug", slug).single();
    }

    const { data, error } = await query!;
    if (error && error.code !== "PGRST116") throw error; // Ignore not found error
    
    return { data: data || null };
  } catch (error) {
    console.error("Check existing error:", error);
    return { error: error instanceof Error ? error.message : "Unknown error" };
  }
}

/**
 * Mengambil satu item library berdasarkan slug atau identifier unik lainnya.
 */
export async function getLibraryItemBySlug(
  type: "kanji" | "vocab" | "verb" | "adjective" | "grammar" | "reading" | "listening" | "lessons" | "exams" | "phrase",
  slugOrId: string
): Promise<any | null> {
  const supabase = await createClient();
  
  try {
    let data: Record<string, any> | null = null;

    if (type === "kanji") {
      const { data: d, error } = await supabase.from("kanji").select("*").eq("character", slugOrId).single();
      if (error && error.code !== "PGRST116") console.error(`[getLibraryItemBySlug] kanji error:`, error.message, error.code);
      data = d ?? null;
    } else if (type === "vocab" || type === "verb" || type === "adjective" || type === "phrase") {
      // Try slug first, then fallback to id
      const { data: bySlug, error: slugErr } = await supabase.from("vocab").select("*").eq("slug", slugOrId).single();
      if (slugErr && slugErr.code !== "PGRST116") {
        console.error(`[getLibraryItemBySlug] vocab slug error:`, slugErr.message, slugErr.code);
      }
      if (bySlug) {
        data = bySlug;
      } else {
        // Fallback: try by id
        const { data: byId, error: idErr } = await supabase.from("vocab").select("*").eq("id", slugOrId).single();
        if (idErr && idErr.code !== "PGRST116") console.error(`[getLibraryItemBySlug] vocab id error:`, idErr.message);
        data = byId ?? null;
      }
    } else if (type === "lessons") {
      data = await getSanityLessonBySlug(slugOrId);
    } else if (type === "reading") {
      data = await getSanityReadingBySlug(slugOrId);
    } else if (type === "listening") {
      data = await getSanityListeningBySlug(slugOrId);
    } else if (type === "exams") {
      data = await getSanityExamBySlug(slugOrId);
    } else {
      const table = type;
      // Try slug first, then fallback to id
      const { data: bySlug, error: slugErr } = await supabase.from(table).select("*").eq("slug", slugOrId).single();
      if (slugErr && slugErr.code !== "PGRST116") {
        console.error(`[getLibraryItemBySlug] ${table} slug error:`, slugErr.message, slugErr.code);
      }
      if (bySlug) {
        data = bySlug;
      } else {
        const { data: byId, error: idErr } = await supabase.from(table).select("*").eq("id", slugOrId).single();
        if (idErr && idErr.code !== "PGRST116") console.error(`[getLibraryItemBySlug] ${table} id error:`, idErr.message);
        data = byId ?? null;
      }
    }

    if (!data) {
      console.warn(`[getLibraryItemBySlug] No data found for type="${type}" slugOrId="${slugOrId}"`);
      return null;
    }

    // Additional data fetching (e.g. related items) can be added here if needed
    if (type === "kanji" && data) {
      // Normalize fields for frontend
      data.jlptLevel = data.jlpt_level;
      data.strokeOrderSvg = data.stroke_order_svg;
      
      // Fetch related vocab — use text search on related_kanji jsonb array
      try {
        const { data: related } = await supabase
          .from("vocab")
          .select("*")
          .ilike("related_kanji::text", `%"${data.character}"%`)
          .limit(6);
        data.relatedVocab = (related || []).map((v: { id: string; word: string; furigana: string | null; meaning_id: string; slug: string }) => ({ ...v, _id: v.id, meaning: v.meaning_id }));
      } catch {
        data.relatedVocab = [];
      }
    }

    if ((type === "vocab" || type === "verb") && data) {
      try {
        // Normalize fields for frontend
        data.pitchAccent = data.pitch_accent;
        data.jlptLevel = data.jlpt_level;
        data.usageNotes = data.usage_notes;
        data.meaning = data.meaning_id;
        data._id = data.id;

        data.relatedKanji = Array.isArray(data.related_kanji) ? data.related_kanji : [];
        data.synonyms = Array.isArray(data.synonyms) ? data.synonyms : [];
        data.antonyms = Array.isArray(data.antonyms) ? data.antonyms : [];
        
        // Handle examples safely
        if (typeof data.examples === "string") {
          try {
            data.examples = JSON.parse(data.examples);
          } catch {
            data.examples = [];
          }
        }
        data.examples = Array.isArray(data.examples) ? data.examples : [];

        data.relatedKanji = data.relatedKanji.map((k: { id?: string; _id?: string }) => ({ ...k, _id: k.id || k._id }));
        data.synonyms = data.synonyms.map((s: { id?: string; _id?: string }) => ({ ...s, _id: s.id || s._id }));
        data.antonyms = data.antonyms.map((a: { id?: string; _id?: string }) => ({ ...a, _id: a.id || a._id }));

        // Handle conjugations
        const conj = typeof data.conjugations === "object" && data.conjugations !== null ? data.conjugations : {};
        data.negative = conj.negative;
        data.past = conj.past;
        data.pastNegative = conj.pastNegative;
        data.teForm = conj.te;
        data.adverbial = conj.adverb;
      } catch (normErr) {
        console.error(`[getLibraryItemBySlug] vocab normalization error:`, normErr);
        // Still return data even if normalization partially fails
        data.relatedKanji = data.relatedKanji || [];
        data.synonyms = data.synonyms || [];
        data.antonyms = data.antonyms || [];
      }
    }

    if (type === "grammar" && data) {
      data._id = data.id;
    }

    if (type === "lessons" && data) {
      // Ensure arrays are actual arrays (handle potential stringified JSON)
      const parseArray = (val: unknown) => {
        if (!val) return [];
        if (Array.isArray(val)) return val;
        try { return typeof val === "string" ? JSON.parse(val) : []; } catch { return []; }
      };

      const contentBlocks = parseArray(data.content_blocks);
      const vocabListRaw = parseArray(data.vocab_list);
      const kanjiListRaw = parseArray(data.kanji_list);
      const grammarListRaw = parseArray(data.grammar_list);
      const listeningListRaw = parseArray(data.listening_list);
      const readingListRaw = parseArray(data.reading_list);

      // Normalize blocks to ensure they have _type (handling legacy data with 'type' key)
      const articles = contentBlocks.map((block: ContentBlock | Record<string, unknown>) => {
        if (!block) return block;
        const normalized = { ...block };
        if (!normalized._type && (normalized as any).type) {
          normalized._type = (normalized as any).type;
        }
        if (!normalized._type) {
          normalized._type = 'block';
        }
        return normalized;
      });

      // Create a clean result object with initial data
      const result: Record<string, any> = {
        ...data,
        _id: data.id || data._id,
        articles: articles,
        quizzes: parseArray(data.quizzes).map((q: { id?: string; correct_answer?: string; correctAnswer?: string }, idx: number) => ({
          ...q,
          _id: q.id || `q-${idx}`,
          correctAnswer: q.correct_answer ?? q.correctAnswer
        })),
        vocabList: [],
        kanjiList: [],
        grammarList: [],
        listeningList: [],
        readingList: []
      };

      // Helper: detect apakah item adalah UUID
      const isUUID = (s: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s);

      // Fetch relationships in parallel to avoid waterfalls
      const fetchVocab = async () => {
        if (!vocabListRaw.length) return;
        const cleanList = vocabListRaw.map((s: unknown) => String(s).trim());
        const hasUUIDs = cleanList.some(isUUID);
        
        let vItems: any[] = [];
        if (hasUUIDs) {
          const { data } = await supabase.from("vocab").select("id, word, furigana, romaji, meaning_id, hinshi, pitch_accent, usage_notes, mnemonic").in("id", cleanList);
          vItems = data || [];
        } else {
          const [byWord, bySlug] = await Promise.all([
            supabase.from("vocab").select("id, word, furigana, romaji, meaning_id, hinshi, pitch_accent, usage_notes, mnemonic").in("word", cleanList),
            supabase.from("vocab").select("id, word, furigana, romaji, meaning_id, hinshi, pitch_accent, usage_notes, mnemonic").in("slug", cleanList)
          ]);
          vItems = [...(byWord.data || []), ...(bySlug.data || [])];
          vItems = Array.from(new Map(vItems.map(item => [item.id, item])).values());
        }
        
        result.vocabList = (vItems && vItems.length > 0) 
          ? vItems.map((v: { id: string; meaning_id: string }) => ({ ...v, _id: v.id, meaning: v.meaning_id }))
          : cleanList.map((w: string) => ({ _id: `temp-${w}`, word: w, meaning: "Detail pending..." }));
      };

      const fetchKanji = async () => {
        if (!kanjiListRaw.length) return;
        const cleanList = kanjiListRaw.map((s: unknown) => String(s).trim());
        const hasUUIDs = cleanList.some(isUUID);
        const { data: kItems } = await supabase
          .from("kanji")
          .select("id, character, meaning, onyomi, kunyomi, jlpt_level, stroke_order_svg")
          .in(hasUUIDs ? "id" : "character", cleanList);
        
        result.kanjiList = (kItems && kItems.length > 0)
          ? kItems.map((k: { id: string; jlpt_level: string | null }) => ({ ...k, _id: k.id, jlptLevel: k.jlpt_level }))
          : cleanList.map((c: string) => ({ _id: `temp-${c}`, character: c, meaning: "Detail pending..." }));
      };

      const fetchGrammar = async () => {
        if (!grammarListRaw.length) return;
        const cleanList = grammarListRaw.map((s: unknown) => String(s).trim());
        const hasUUIDs = cleanList.some(isUUID);
        
        let gItems: any[] = [];
        if (hasUUIDs) {
          const { data } = await supabase.from("grammar").select("id, title, meaning, formation, formation_furigana, slug, jlpt_level, examples, notes").in("id", cleanList);
          gItems = data || [];
        } else {
          const [byTitle, bySlug] = await Promise.all([
            supabase.from("grammar").select("id, title, meaning, formation, formation_furigana, slug, jlpt_level, examples, notes").in("title", cleanList),
            supabase.from("grammar").select("id, title, meaning, formation, formation_furigana, slug, jlpt_level, examples, notes").in("slug", cleanList)
          ]);
          gItems = [...(byTitle.data || []), ...(bySlug.data || [])];
          gItems = Array.from(new Map(gItems.map(item => [item.id, item])).values());
        }
        
        result.grammarList = (gItems && gItems.length > 0)
          ? gItems.map((g: { id: string; jlpt_level: string | null; examples: unknown }) => ({ ...g, _id: g.id, jlptLevel: g.jlpt_level, exampleSentences: g.examples }))
          : cleanList.map((t: string) => ({ _id: `temp-${t}`, title: t, meaning: "Detail pending..." }));
      };

      const fetchListening = async () => {
        if (!listeningListRaw.length) return;
        const cleanList = listeningListRaw.map((s: unknown) => String(s).trim());
        const hasUUIDs = cleanList.some(isUUID);
        
        let lItems: any[] = [];
        if (hasUUIDs) {
          const { data } = await supabase.from("listening_material").select("*").in("id", cleanList);
          lItems = data || [];
        } else {
          const [byTitle, bySlug] = await Promise.all([
            supabase.from("listening_material").select("*").in("title", cleanList),
            supabase.from("listening_material").select("*").in("slug", cleanList)
          ]);
          lItems = [...(byTitle.data || []), ...(bySlug.data || [])];
          lItems = Array.from(new Map(lItems.map(item => [item.id, item])).values());
        }
        
        if (lItems && lItems.length > 0) {
          result.listeningList = lItems.map((l: ListeningTable) => {
            // Robust Parser for Raw Text Dialogue
            let dialogue: Record<string, unknown>[] = [];
            if (typeof l.body === 'string') {
              const lines = l.body.split('\n').filter((line: string) => line.trim());
              const translations = typeof l.translation === 'string' ? l.translation.split('\n').filter((line: string) => line.trim()) : [];
              const readings = typeof l.hiragana === 'string' ? l.hiragana.split('\n').filter((line: string) => line.trim()) : [];
              
              dialogue = lines.map((line: string, idx: number) => {
                const parts = line.split(/[：:]/);
                const speaker = parts.length > 1 ? parts[0].trim() : "???";
                const text = parts.length > 1 ? parts.slice(1).join("：").trim() : line.trim();
                
                // Try to find matching translation
                let translation = translations[idx] || "";
                if (translation.includes("：") || translation.includes(":")) {
                   translation = translation.split(/[：:]/).slice(1).join("：").trim();
                }

                // Try to find matching reading (hiragana)
                let furigana = "";
                if (readings[idx]) {
                  const rLine = readings[idx];
                  if (rLine.includes("：") || rLine.includes(":")) {
                    furigana = rLine.split(/[：:]/).slice(1).join("：").trim();
                  } else {
                    furigana = rLine.trim();
                  }
                }

                return {
                  speaker,
                  text,
                  jp: text,
                  furigana: furigana,
                  translation: translation || text,
                  id: idx
                };
              });
            } else if (Array.isArray(l.body)) {
              dialogue = l.body;
            }

            return {
              ...l,
              _id: l.id,
              audioUrl: l.audio_url,
              imageUrl: l.image_url,
              videoUrl: l.video_url,
              transcript: dialogue
            };
          });
        }
      };

      const fetchReading = async () => {
        if (!readingListRaw.length) return;
        const cleanList = readingListRaw.map((s: any) => String(s).trim());
        const hasUUIDs = cleanList.some(isUUID);
        
        let rItems: any[] = [];
        if (hasUUIDs) {
          const { data } = await supabase.from("reading_material").select("*").in("id", cleanList);
          rItems = data || [];
        } else {
          const [byTitle, bySlug] = await Promise.all([
            supabase.from("reading_material").select("*").in("title", cleanList),
            supabase.from("reading_material").select("*").in("slug", cleanList)
          ]);
          rItems = [...(byTitle.data || []), ...(bySlug.data || [])];
          rItems = Array.from(new Map(rItems.map(item => [item.id, item])).values());
        }
        
        if (rItems && rItems.length > 0) {
          result.readingList = rItems.map(r => ({
            ...r,
            _id: r.id,
            audioUrl: r.audio_url,
            imageUrl: r.image_url,
            videoUrl: r.video_url,
            body: typeof r.body === 'string' ? [{ _type: 'block', children: [{ _type: 'span', text: r.body }] }] : r.body,
            translation: typeof r.translation === 'string' ? [{ _type: 'block', children: [{ _type: 'span', text: r.translation }] }] : r.translation
          }));
        }
      };

      await Promise.all([
        fetchVocab(),
        fetchKanji(),
        fetchGrammar(),
        fetchListening(),
        fetchReading()
      ]);

      // Add final check for articles
      if (!result.articles || result.articles.length === 0) {
        result.articles = articles.length > 0 ? articles : contentBlocks;
      }

      return result;
    }

    return data;
  } catch (error) {
    console.error(`Error fetching detail:`, error);
    return null;
  }
}

/**
 * Mengambil detail dari Supabase berdasarkan slug atau karakter/kata.
 */
export async function getLibraryDetail(
  type: "kanji" | "vocab" | "grammar" | "reading" | "listening" | "lessons" | "exams" | "phrase",
  slugOrId: string
): Promise<any | null> {
  return getLibraryItemBySlug(type, slugOrId);
}
