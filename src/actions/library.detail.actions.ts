/**
 * @file library.detail.actions.ts
 * @description Server Actions untuk mengambil detail item pustaka (library) secara individual.
 * Mendukung berbagai tipe konten: kanji, vocab, grammar, reading, listening, lessons, dan exams.
 * Mengintegrasikan data dari Supabase (leksikal) dan Sanity CMS (editorial) sesuai arsitektur split-source.
 */

"use server";

// ======================
// IMPORTS
// ======================
import { createClient, createStaticClient } from "@/lib/supabase/server";
import { slugify } from "@/lib/utils";
import { getSanityLessonBySlug, getSanityReadingBySlug, getSanityListeningBySlug, getSanityExamBySlug } from "@/lib/queries";

// ======================
// HELPERS
// ======================

// Helper: detect apakah string adalah UUID yang valid
const isUUID = (s: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s);

// ======================
// TYPES
// ======================
export interface LibraryItem {
  id?: string;
  _id?: string;
  character?: string;
  word?: string;
  meaning?: string;
  meaning_id?: string;
  title?: string | null;
  summary?: string | null;
  jlptLevel?: string | null;
  jlpt_level?: string | null;
  strokeOrderSvg?: string | null;
  stroke_order_svg?: string | null;
  onyomi?: string | null;
  kunyomi?: string | null;
  radicals?: string[] | null;
  mnemonics?: import("@/types/database").MnemonicBlock[] | string[] | null;
  relatedVocab?: {
    id: string;
    _id?: string;
    word: string;
    furigana: string;
    meaning: string;
    romaji?: string;
    slug?: string;
  }[] | null;
  pitchAccent?: string | null;
  pitch_accent?: string | null;
  usageNotes?: string | null;
  usage_notes?: string | null;
  notes?: string | null;
  formation?: string | null;
  relatedKanji?: unknown;
  synonyms?: unknown;
  antonyms?: unknown;
  examples?: unknown[] | null;
  conjugations?: Record<string, string | null>;
  negative?: string | null;
  past?: string | null;
  pastNegative?: string | null;
  teForm?: string | null;
  adverbial?: string | null;
  content_blocks?: unknown;
  vocab_list?: unknown;
  kanji_list?: unknown;
  grammar_list?: unknown;
  listening_list?: unknown;
  reading_list?: unknown;
  articles?: unknown;
  quizzes?: import("@/lib/utils/lesson-utils").RawQuizItem[] | null;
  questions?: import("@/lib/utils/lesson-utils").RawQuizItem[] | null;
  vocabList?: unknown[];
  kanjiList?: unknown[];
  grammarList?: unknown[];
  listeningList?: unknown[];
  readingList?: unknown[];
  seoTitle?: string | null;
  seoDescription?: string | null;
  levelCode?: string | null;
  grammar_family?: string | null;
  related_grammar?: string[] | null;
  familyGrammarList?: any[] | null;
  relatedGrammarList?: any[] | null;
  [key: string]: unknown;
}

type ContentBlock = {
  _type?: string;
  type?: string;
  children?: unknown[];
  [key: string]: unknown;
};

type ListeningTable = {
  id: string;
  audio_url?: string;
  image_url?: string;
  video_url?: string;
  body?: unknown;
  translation?: unknown;
  hiragana?: unknown;
  [key: string]: unknown;
};

interface VocabRow {
  id: string;
  word: string;
  furigana: string | null;
  romaji: string | null;
  meaning_id: string;
  hinshi: string | null;
  pitch_accent: string | null;
  usage_notes: string | null;
  mnemonic: string | null;
  slug: string | null;
}

interface GrammarRow {
  id: string;
  title: string;
  meaning: string;
  formation: string | null;
  formation_furigana: string | null;
  slug: string;
  jlpt_level: string | null;
  examples: unknown;
  notes: string | null;
}

interface ListeningMaterialRow {
  id: string;
  title: string;
  slug: string;
  audio_url?: string;
  image_url?: string;
  video_url?: string;
  body?: unknown;
  translation?: unknown;
  hiragana?: unknown;
  [key: string]: unknown;
}

interface ReadingMaterialRow {
  id: string;
  title: string;
  slug: string;
  audio_url?: string;
  image_url?: string;
  video_url?: string;
  body?: unknown;
  translation?: unknown;
  [key: string]: unknown;
}

// ======================
// SERVER ACTIONS
// ======================

export async function checkExistingContent(
  keyword: string,
  type: "kanji" | "vocab" | "verb" | "adjective" | "grammar" | "phrase" | "reading" | "listening" | "lessons" | "exams"
): Promise<{ data?: unknown; error?: string }> {
  const supabase = await createClient();
  await supabase.auth.getSession();
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
    if (error && error.code !== "PGRST116") throw error; // Abaikan galat jika data tidak ditemukan (PGRST116)
    
    return { data: data || null };
  } catch (error) {
    console.error("Gagal memeriksa konten yang sudah ada:", error);
    return { error: error instanceof Error ? error.message : "Terjadi kesalahan yang tidak diketahui" };
  }
}

/**
 * Mengambil satu item library berdasarkan slug atau identifier unik lainnya.
 */
export async function getLibraryItemBySlug(
  type: "kanji" | "vocab" | "verb" | "adjective" | "grammar" | "reading" | "listening" | "lessons" | "exams" | "phrase",
  slugOrId: string
): Promise<LibraryItem | null> {
  const supabase = createStaticClient();
  
  try {
    let data: LibraryItem | null = null;

    if (type === "kanji") {
      if (isUUID(slugOrId)) {
        const { data: d, error } = await supabase.from("kanji").select("*").eq("id", slugOrId).single();
        if (error && error.code !== "PGRST116") console.error(`[getLibraryItemBySlug] Galat pengambilan data kanji ID:`, error.message, error.code);
        data = d ?? null;
      } else {
        // Coba cari berdasarkan kolom slug ASCII terlebih dahulu
        const { data: bySlug, error: slugErr } = await supabase.from("kanji").select("*").eq("slug", slugOrId).single();
        if (bySlug) {
          data = bySlug;
        } else {
          // Fallback ke kolom character untuk backward compatibility
          const { data: d, error } = await supabase.from("kanji").select("*").eq("character", slugOrId).single();
          if (error && error.code !== "PGRST116") console.error(`[getLibraryItemBySlug] Galat pengambilan data kanji:`, error.message, error.code);
          data = d ?? null;
        }
      }
    } else if (type === "vocab" || type === "verb" || type === "adjective" || type === "phrase") {
      // Coba slug terlebih dahulu, lalu kembali ke id sebagai fallback
      const { data: bySlug, error: slugErr } = await supabase.from("vocab").select("*").eq("slug", slugOrId).single();
      if (slugErr && slugErr.code !== "PGRST116") {
        console.error(`[getLibraryItemBySlug] Galat pengambilan slug kosakata:`, slugErr.message, slugErr.code);
      }
      if (bySlug) {
        data = bySlug;
      } else if (isUUID(slugOrId)) {
        // Fallback: coba berdasarkan id
        const { data: byId, error: idErr } = await supabase.from("vocab").select("*").eq("id", slugOrId).single();
        if (idErr && idErr.code !== "PGRST116") console.error(`[getLibraryItemBySlug] Galat pengambilan ID kosakata:`, idErr.message);
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
      // Coba slug terlebih dahulu, lalu kembali ke id sebagai fallback
      const { data: bySlug, error: slugErr } = await supabase.from(table).select("*").eq("slug", slugOrId).single();
      if (slugErr && slugErr.code !== "PGRST116") {
        console.error(`[getLibraryItemBySlug] Galat pengambilan slug ${table}:`, slugErr.message, slugErr.code);
      }
      if (bySlug) {
        data = bySlug;
      } else if (isUUID(slugOrId)) {
        const { data: byId, error: idErr } = await supabase.from(table).select("*").eq("id", slugOrId).single();
        if (idErr && idErr.code !== "PGRST116") console.error(`[getLibraryItemBySlug] Galat pengambilan ID ${table}:`, idErr.message);
        data = byId ?? null;
      }
    }

    if (!data) {
      console.warn(`[getLibraryItemBySlug] Data tidak ditemukan untuk type="${type}" slugOrId="${slugOrId}"`);
      return null;
    }

    // Pengambilan data tambahan (misalnya item terkait) dapat ditambahkan di sini jika diperlukan
    if (type === "kanji" && data) {
      // Normalisasi bidang properti untuk frontend
      data.jlptLevel = data.jlpt_level;
      data.strokeOrderSvg = data.stroke_order_svg;
      
      // Ambil kosakata terkait — cari kata yang mengandung karakter kanji ini
      try {
        const { data: related } = await supabase
          .from("vocab")
          .select("id, word, furigana, meaning_id, slug")
          .like("word", `%${data.character}%`)
          .limit(6);
        data.relatedVocab = (related || []).map((v: { id: string; word: string; furigana: string | null; meaning_id: string; slug: string }) => ({ ...v, _id: v.id, meaning: v.meaning_id, furigana: v.furigana || "" }));
      } catch {
        data.relatedVocab = [];
      }
    }

    if ((type === "vocab" || type === "verb") && data) {
      try {
        // Normalisasi bidang properti untuk frontend
        data.pitchAccent = data.pitch_accent;
        data.jlptLevel = data.jlpt_level;
        data.usageNotes = data.usage_notes;
        data.meaning = data.meaning_id;
        data._id = data.id;

        data.relatedKanji = Array.isArray(data.related_kanji) ? data.related_kanji : [];
        data.synonyms = Array.isArray(data.synonyms) ? data.synonyms : [];
        data.antonyms = Array.isArray(data.antonyms) ? data.antonyms : [];
        
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
          const { data: dbSentences } = await supabase
            .from("sentences")
            .select("japanese, indonesia, english")
            .like("japanese", `%${data.word}%`)
            .limit(3);

          if (dbSentences && dbSentences.length > 0) {
            const dynamicExamples = dbSentences.map((s) => ({
              jp: s.japanese,
              meaning: s.indonesia || s.english || "",
              romaji: ""
            }));
            data.examples = [...(data.examples as Array<{ jp: string; meaning: string; romaji?: string }>), ...dynamicExamples];
          }
        } catch (sentenceErr) {
          console.error(`[getLibraryItemBySlug] gagal mengambil data kalimat dinamis untuk "${data.word}":`, sentenceErr);
        }

        data.relatedKanji = ((data.relatedKanji as Array<{ id?: string; _id?: string }>) || []).map((k) => ({ ...k, _id: k.id || k._id }));
        data.synonyms = ((data.synonyms as Array<{ id?: string; _id?: string }>) || []).map((s) => ({ ...s, _id: s.id || s._id }));
        data.antonyms = ((data.antonyms as Array<{ id?: string; _id?: string }>) || []).map((a) => ({ ...a, _id: a.id || a._id }));

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
      } catch (normErr) {
        console.error(`[getLibraryItemBySlug] Galat normalisasi kosakata:`, normErr);
        // Tetap kembalikan data meskipun normalisasi sebagian gagal
        data.relatedKanji = data.relatedKanji || [];
        data.synonyms = data.synonyms || [];
        data.antonyms = data.antonyms || [];
      }
    }

    if (type === "grammar" && data) {
      data._id = data.id;

      // Tangani contoh kalimat secara aman
      if (typeof data.examples === "string") {
        try {
          data.examples = JSON.parse(data.examples);
        } catch {
          data.examples = [];
        }
      }
      data.examples = Array.isArray(data.examples) ? data.examples : [];
      
      // Ambil daftar grammar terkait jika ada
      if (Array.isArray(data.related_grammar) && data.related_grammar.length > 0) {
        const { data: related } = await supabase
          .from("grammar")
          .select("id, title, slug, jlpt_level, meaning")
          .in("slug", data.related_grammar);
        data.relatedGrammarList = related || [];
      } else {
        data.relatedGrammarList = [];
      }

      // Ambil anggota keluarga grammar jika ada
      if (data.grammar_family) {
        const { data: family } = await supabase
          .from("grammar")
          .select("id, title, slug, jlpt_level, meaning")
          .eq("grammar_family", data.grammar_family)
          .neq("id", data.id); // Kecualikan item saat ini
        data.familyGrammarList = family || [];
      } else {
        data.familyGrammarList = [];
      }
    }

    if (type === "reading" && data) {
      data.audioUrl = data.audio_url;
      data.imageUrl = data.image_url;
      data.videoUrl = data.video_url;
    }

    if (type === "listening" && data) {
      data.audioUrl = data.audio_url;
      data.imageUrl = data.image_url;
      data.videoUrl = data.video_url;

      // Parser yang kuat untuk Teks Dialog Mentah (Transcript)
      let dialogue: import("@/components/features/listening/types").TranscriptLine[] = [];
      if (typeof data.body === "string") {
        const lines = data.body.split("\n").filter((line: string) => line.trim());
        const translations = typeof data.translation === "string" ? data.translation.split("\n").filter((line: string) => line.trim()) : [];
        const readings = typeof data.hiragana === "string" ? data.hiragana.split("\n").filter((line: string) => line.trim()) : [];

        // Parse timestamps nyata dari field 'timestamps' (format: "startDetik,endDetik" per baris)
        // Fallback ke pembagian merata kalau tidak ada timestamp
        let parsedTimestamps: { start: number; end: number }[] = [];
        if (typeof data.timestamps === "string" && data.timestamps.trim()) {
          parsedTimestamps = data.timestamps
            .split("\n")
            .filter((t: string) => t.trim())
            .map((t: string) => {
              const [start, end] = t.trim().split(",").map(Number);
              return { start: isNaN(start) ? 0 : start, end: isNaN(end) ? 0 : end };
            });
        }

        dialogue = lines.map((line: string, idx: number) => {
          const parts = line.split(/[：:]/);
          const speaker = parts.length > 1 ? parts[0].trim() : "???";
          const text = parts.length > 1 ? parts.slice(1).join("：").trim() : line.trim();
          
          // Coba temukan terjemahan yang cocok
          let translation = translations[idx] || "";
          if (translation.includes("：") || translation.includes(":")) {
             translation = translation.split(/[：:]/).slice(1).join("：").trim();
          }

          // Coba temukan bacaan (hiragana) yang cocok
          let furigana = "";
          if (readings[idx]) {
            const rLine = readings[idx];
            if (rLine.includes("：") || rLine.includes(":")) {
              furigana = rLine.split(/[：:]/).slice(1).join("：").trim();
            } else {
              furigana = rLine.trim();
            }
          }

          // Gunakan timestamp nyata bila tersedia, fallback ke 5 detik per baris
          const ts = parsedTimestamps[idx];
          const startTime = ts ? ts.start : idx * 5;
          const endTime = ts ? ts.end : (idx + 1) * 5;

          return {
            _key: `line-${idx}`,
            speaker,
            text,
            jp: text,
            furigana: furigana,
            translation: translation || text,
            startTime,
            endTime,
            id: idx
          };
        });
      } else if (Array.isArray(data.body)) {
        dialogue = data.body as import("@/components/features/listening/types").TranscriptLine[];
      }
      data.transcript = dialogue;

      const rawQuizzes = data.quizzes || [];
      data.quiz = rawQuizzes.map((q, idx: number) => {
        const correctAns = q.correct_answer ?? q.correctAnswer ?? "";
        return {
          _id: q._key || q.id || `q-${idx}`,
          question: q.question || "",
          options: ((q.options || []) as unknown[]).map((opt) => {
            const optStr = typeof opt === "string" ? opt : String(opt || "");
            return {
              text: optStr,
              isCorrect: optStr === String(correctAns)
            };
          }),
          explanation: q.explanation || ""
        };
      });
    }

    if (type === "lessons" && data) {
      // Pastikan array berupa array sungguhan (tangani kemungkinan JSON berbentuk string)
      const parseArray = (val: unknown) => {
        if (!val) return [];
        if (Array.isArray(val)) return val;
        try { return typeof val === "string" ? JSON.parse(val) : []; } catch { return []; }
      };

      const contentBlocks = parseArray(data.content_blocks);
      
      // Mengambil vocab_list & kanji_list secara dinamis dari tabel lessons di Supabase berdasarkan slug pelajaran
      let vocabListRaw: string[] = [];
      let kanjiListRaw: string[] = [];
      try {
        const lessonSlug = typeof data.slug === "object" && data.slug !== null 
          ? (data.slug as { current?: string }).current || slugOrId 
          : String(data.slug || slugOrId);

        const { data: dbLesson, error: dbErr } = await supabase
          .from("lessons")
          .select("vocab_list, kanji_list")
          .eq("slug", lessonSlug)
          .single();

        if (dbErr) {
          if (dbErr.code !== "PGRST116") {
            console.error(`[getLibraryItemBySlug] Gagal mengambil daftar dari database untuk slug="${lessonSlug}":`, dbErr.message);
          }
        } else if (dbLesson) {
          if (dbLesson.vocab_list) vocabListRaw = parseArray(dbLesson.vocab_list);
          if (dbLesson.kanji_list) kanjiListRaw = parseArray(dbLesson.kanji_list);
        }
      } catch (err) {
        console.error(`[getLibraryItemBySlug] Gagal mengambil daftar dari database:`, err);
      }

      // Fallback ke data Sanity jika data di database kosong
      if (!vocabListRaw.length && (data.vocab_list || data.vocabList)) {
        vocabListRaw = parseArray(data.vocab_list || data.vocabList);
      }
      if (!kanjiListRaw.length && (data.kanji_list || data.kanjiList)) {
        kanjiListRaw = parseArray(data.kanji_list || data.kanjiList);
      }
      const grammarListRaw = parseArray(data.grammar_list || data.grammarList);
      const listeningListRaw = parseArray(data.listening_list || data.listeningList);
      const readingListRaw = parseArray(data.reading_list || data.readingList);

      // Normalisasi blok untuk memastikan mereka memiliki _type (menangani data lama dengan kunci 'type')
      const articles = contentBlocks.map((block: ContentBlock | Record<string, unknown>) => {
        if (!block) return block;
        const normalized = { ...block };
        if (!normalized._type && (normalized as Record<string, unknown>).type) {
          normalized._type = (normalized as Record<string, unknown>).type as string;
        }
        if (!normalized._type) {
          normalized._type = 'block';
        }
        return normalized;
      });

      // Buat objek hasil yang bersih dengan data awal
      const result: LibraryItem = {
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

      // Ambil data relasi secara paralel untuk menghindari penumpukan latensi (waterfall)
      const fetchVocab = async () => {
        if (!vocabListRaw.length) return;
        const cleanList = vocabListRaw.map((s: unknown) => String(s).trim());
        const hasUUIDs = cleanList.some(isUUID);
        
        let vItems: VocabRow[] = [];
        if (hasUUIDs) {
          const { data } = await supabase.from("vocab").select("id, word, furigana, romaji, meaning_id, hinshi, pitch_accent, usage_notes, mnemonic, slug").in("id", cleanList);
          vItems = data || [];
        } else {
          const [byWord, bySlug] = await Promise.all([
            supabase.from("vocab").select("id, word, furigana, romaji, meaning_id, hinshi, pitch_accent, usage_notes, mnemonic, slug").in("word", cleanList),
            supabase.from("vocab").select("id, word, furigana, romaji, meaning_id, hinshi, pitch_accent, usage_notes, mnemonic, slug").in("slug", cleanList)
          ]);
          vItems = [...(byWord.data || []), ...(bySlug.data || [])];
          vItems = Array.from(new Map(vItems.map(item => [item.id, item])).values());
        }
        
        result.vocabList = cleanList.map((item: string, idx: number) => {
          let wordPart = item;
          let furiganaPart = "";
          if (item.includes("-")) {
            const parts = item.split("-");
            if (!isUUID(item)) {
              wordPart = parts[0];
              furiganaPart = parts[1];
            }
          }

          const matched = vItems.find(v => 
            v.id === item || 
            v.word === item || 
            v.slug === item || 
            v.word === wordPart || 
            v.slug === `${wordPart}-${furiganaPart}`
          );

          if (matched) {
            return {
              ...matched,
              _id: matched.id,
              meaning: matched.meaning_id
            };
          }

          return {
            _id: `temp-${item}-${idx}`,
            word: wordPart,
            furigana: furiganaPart || undefined,
            meaning: "Detail pending..."
          };
        });
      };

      const fetchKanji = async () => {
        if (!kanjiListRaw.length) return;
        const cleanList = kanjiListRaw.map((s: unknown) => String(s).trim());
        const hasUUIDs = cleanList.some(isUUID);
        const { data: kItems } = await supabase
          .from("kanji")
          .select("id, character, meaning, onyomi, kunyomi, jlpt_level, stroke_order_svg")
          .in(hasUUIDs ? "id" : "character", cleanList);
        
        result.kanjiList = cleanList.map((item: string, idx: number) => {
          const matched = (kItems || []).find(k => k.id === item || k.character === item);
          if (matched) {
            return {
              ...matched,
              _id: matched.id,
              jlptLevel: matched.jlpt_level
            };
          }
          return {
            _id: `temp-${item}-${idx}`,
            character: item,
            meaning: "Detail pending..."
          };
        });
      };

      const fetchGrammar = async () => {
        if (!grammarListRaw.length) return;
        const cleanList = grammarListRaw.map((s: unknown) => String(s).trim());
        const hasUUIDs = cleanList.some(isUUID);
        
        let gItems: GrammarRow[] = [];
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
        
        result.grammarList = cleanList.map((item: string, idx: number) => {
          const matched = gItems.find(g => g.id === item || g.title === item || g.slug === item);
          if (matched) {
            return {
              ...matched,
              _id: matched.id,
              jlptLevel: matched.jlpt_level,
              exampleSentences: matched.examples
            };
          }
          return {
            _id: `temp-${item}-${idx}`,
            title: item,
            meaning: "Detail pending..."
          };
        });
      };

      const fetchListening = async () => {
        if (!listeningListRaw.length) return;
        const cleanList = listeningListRaw.map((s: unknown) => String(s).trim());
        const hasUUIDs = cleanList.some(isUUID);
        
        let lItems: ListeningMaterialRow[] = [];
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
            // Parser yang kuat untuk Teks Dialog Mentah
            let dialogue: Record<string, unknown>[] = [];
            if (typeof l.body === 'string') {
              const lines = l.body.split('\n').filter((line: string) => line.trim());
              const translations = typeof l.translation === 'string' ? l.translation.split('\n').filter((line: string) => line.trim()) : [];
              const readings = typeof l.hiragana === 'string' ? l.hiragana.split('\n').filter((line: string) => line.trim()) : [];
              
              dialogue = lines.map((line: string, idx: number) => {
                const parts = line.split(/[：:]/);
                const speaker = parts.length > 1 ? parts[0].trim() : "???";
                const text = parts.length > 1 ? parts.slice(1).join("：").trim() : line.trim();
                
                // Coba temukan terjemahan yang cocok
                let translation = translations[idx] || "";
                if (translation.includes("：") || translation.includes(":")) {
                   translation = translation.split(/[：:]/).slice(1).join("：").trim();
                }

                // Coba temukan bacaan (hiragana) yang cocok
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
        const cleanList = readingListRaw.map((s: unknown) => String(s).trim());
        const hasUUIDs = cleanList.some(isUUID);
        
        let rItems: ReadingMaterialRow[] = [];
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

      // Tambahkan pemeriksaan akhir untuk artikel
      if (!result.articles || (result.articles as unknown[]).length === 0) {
        result.articles = articles.length > 0 ? articles : contentBlocks;
      }

      return result;
    }

    return data;
  } catch (error) {
    console.error(`Gagal mengambil detail:`, error);
    return null;
  }
}

/**
 * Mengambil detail dari Supabase berdasarkan slug atau karakter/kata.
 */
export async function getLibraryDetail(
  type: "kanji" | "vocab" | "grammar" | "reading" | "listening" | "lessons" | "exams" | "phrase",
  slugOrId: string
): Promise<LibraryItem | null> {
  const supabase = createStaticClient();
  return getLibraryItemBySlug(type, slugOrId);
}
