/**
 * @file lessons.actions.ts
 * @description Server Actions untuk mengambil data pelajaran (lessons) dan kategori kursus.
 * Menggabungkan data dari Supabase (metadata kategori) dan Sanity CMS (konten pelajaran) secara paralel.
 */

"use server";

// ======================
// IMPORTS
// ======================
import { createStaticClient } from "@/lib/supabase/server";
import { getSanityLessonsByCategory, getSanityLessonsByCategories, getSanityLessonBySlug, getSanityReadingBySlug, getSanityListeningBySlug } from "@/lib/queries";
import { LibraryItem } from "@/types/library";

// ======================
// SERVER ACTIONS
// ======================

/**
 * Server Action: getLessonDetail
 * 
 * Mengambil detail lengkap materi pelajaran bahasa Jepang berdasarkan slug teks.
 * Menghubungkan data pelajaran dengan data kategori kursusnya (course_categories) dari Supabase.
 * 
 * @param {string} slug - Slug unik pelajaran
 * @returns {Promise<Object | null>} Objek detail pelajaran, atau null jika gagal
 */
export async function getLessonDetail(slug: string) {
  const supabase = createStaticClient();
  const { data, error } = await supabase
    .from("lessons")
    .select("*, category:course_categories(*)")
    .eq("slug", slug)
    .single();

  if (error) {
    console.error("Gagal mengambil detail pelajaran:", error);
    return null;
  }
  return data;
}

// ======================
// TYPES
// ======================
interface SanityLessonListItem {
  _id: string;
  title: string;
  slug: string;
}

/**
 * Server Action: getCourseCategories
 * 
 * Mengambil seluruh daftar kategori kursus dari Supabase, lalu menggabungkannya secara paralel
 * dengan mengambil daftar pelajaran dari Sanity CMS dalam satu kueri efisien.
 * Mengelompokkan pelajaran berdasarkan kategori masing-masing untuk rendering katalog Dasbor.
 * 
 * @returns {Promise<Array>} Daftar kategori kursus terformat lengkap beserta daftar preview pelajarannya
 */
export async function getCourseCategories() {
  const supabase = createStaticClient();
  const { data: categories, error } = await supabase
    .from("course_categories")
    .select("*")
    .order("order_number", { ascending: true });

  if (error) {
    console.error("Gagal mengambil kategori kursus:", error);
    return [];
  }

  if (!categories || categories.length === 0) return [];

  // Kumpulkan seluruh slug kategori dan UUID ke dalam satu array
  const categoryIds = categories.flatMap(cat => [cat.slug, cat.id]);

  // Ambil semua data pelajaran untuk seluruh kategori dalam 1 kueri
  const allLessons = await getSanityLessonsByCategories(categoryIds);

  // Kelompokkan pelajaran berdasarkan kategori (yang cocok dengan slug atau id di category_id)
  const categoriesWithData = categories.map((cat) => {
    const lessons = allLessons.filter(
      (l: SanityLessonListItem & { category_id?: string }) => l.category_id === cat.id || l.category_id === cat.slug
    );

    return {
      ...cat,
      _id: cat.id,
      lessonCount: lessons.length,
      previews: lessons.slice(0, 4).map((l: SanityLessonListItem) => ({
        _id: l._id,
        title: l.title,
        slug: l.slug
      }))
    };
  });

  return categoriesWithData;
}

export async function getExamsByCategory(categoryId: string) {
  // Legacy exams table has been dropped. Returning empty array.
  return [];
}

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

type ContentBlock = {
  _type?: string;
  type?: string;
  children?: unknown[];
  [key: string]: unknown;
};

const isUUID = (s: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s);

/**
 * Mengambil detail satu pelajaran berdasarkan slug atau ID beserta relasinya.
 */
export async function getLibraryLessonDetail(slugOrId: string): Promise<LibraryItem | null> {
  const supabase = createStaticClient();

  try {
    const data = (await getSanityLessonBySlug(slugOrId)) as LibraryItem | null;
    if (!data) return null;

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
          console.error(`[getLibraryLessonDetail] Gagal mengambil daftar dari database untuk slug="${lessonSlug}":`, dbErr.message);
        }
      } else if (dbLesson) {
        if (dbLesson.vocab_list) vocabListRaw = parseArray(dbLesson.vocab_list);
        if (dbLesson.kanji_list) kanjiListRaw = parseArray(dbLesson.kanji_list);
      }
    } catch (err) {
      console.error(`[getLibraryLessonDetail] Gagal mengambil daftar dari database:`, err);
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
        // Normalisasi daftar pencarian untuk mencakup bagian kata sebelum tanda hubung '-'
        const searchTerms = cleanList.flatMap((item) => {
          if (item.includes("-") && !isUUID(item)) {
            const parts = item.split("-");
            return [item, parts[0]];
          }
          return [item];
        });

        const [byWord, bySlug] = await Promise.all([
          supabase.from("vocab").select("id, word, furigana, romaji, meaning_id, hinshi, pitch_accent, usage_notes, mnemonic, slug").in("word", searchTerms),
          supabase.from("vocab").select("id, word, furigana, romaji, meaning_id, hinshi, pitch_accent, usage_notes, mnemonic, slug").in("slug", searchTerms)
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
        .select("id, character, meaning, onyomi, kunyomi, jlpt_level, stroke_order_svg, slug")
        .in(hasUUIDs ? "id" : "character", cleanList);
      
      result.kanjiList = cleanList.map((item: string, idx: number) => {
        const matched = (kItems || []).find(k => k.id === item || k.character === item);
        if (matched) {
          return {
            ...matched,
            _id: matched.id,
            jlptLevel: matched.jlpt_level,
            slug: matched.slug
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
      
      const lItems = (await Promise.all(
        cleanList.map(async (slug: string) => {
          try {
            return await getSanityListeningBySlug(slug);
          } catch {
            return null;
          }
        })
      )).filter(Boolean);
      
      if (lItems && lItems.length > 0) {
        result.listeningList = lItems.map((l: Record<string, unknown>) => {
          let dialogue: Record<string, unknown>[] = [];
          if (typeof l.body === 'string') {
            const lines = l.body.split('\n').filter((line: string) => line.trim());
            const translations = typeof l.translation === 'string' ? l.translation.split('\n').filter((line: string) => line.trim()) : [];
            const readings = typeof l.hiragana === 'string' ? l.hiragana.split('\n').filter((line: string) => line.trim()) : [];
            
            dialogue = lines.map((line: string, idx: number) => {
              const parts = line.split(/[：:]/);
              const speaker = parts.length > 1 ? parts[0].trim() : "???";
              const text = parts.length > 1 ? parts.slice(1).join("：").trim() : line.trim();
              
              let translation = translations[idx] || "";
              if (translation.includes("：") || translation.includes(":")) {
                 translation = translation.split(/[：:]/).slice(1).join("：").trim();
              }

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
                furigana,
                translation: translation || text,
                id: idx
              };
            });
          } else if (Array.isArray(l.body)) {
            dialogue = l.body;
          }

          return {
            ...l,
            _id: l._id || l.id,
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
      
      const rItems = (await Promise.all(
        cleanList.map(async (slug: string) => {
          try {
            return await getSanityReadingBySlug(slug);
          } catch {
            return null;
          }
        })
      )).filter(Boolean);
      
      if (rItems && rItems.length > 0) {
        result.readingList = rItems.map((r: Record<string, unknown>) => ({
          ...r,
          _id: r._id || r.id,
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
  } catch (error) {
    console.error(`Gagal mengambil detail pelajaran:`, error);
    return null;
  }
}
