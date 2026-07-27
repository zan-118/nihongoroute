/**
 * @file lessons.actions.ts
 * @description Server Actions untuk mengambil data pelajaran (lessons), artikel, dan kategori kursus dari Supabase.
 */



// ======================
// IMPORTS
// ======================
import { createStaticClient } from "@/lib/supabase/server";
import { LibraryItem } from "@/types/library";
import { getLibraryItemBySlug } from "@/actions/library.actions";
import { transformLessonBlocks } from "@/lib/learning/lesson-block-transformer";

// ======================
// SERVER ACTIONS
// ======================

/**
 * Mengambil detail lengkap materi pelajaran bahasa Jepang berdasarkan slug teks.
 * Menghubungkan data pelajaran dengan data kategori kursusnya (course_categories) dari Supabase.
 * 
 * @param {string} slug - Slug unik pelajaran
 * @returns {Promise<any | null>} Objek detail pelajaran, atau null jika gagal
 */
export async function getLessonDetail(slug: string) {
  const supabase = createStaticClient();
  const { data, error } = await supabase
    .from("lessons")
    .select("*, category:course_categories(*)")
    .eq("slug", slug)
    .maybeSingle();

  if (!data || error) {
    // Fallback ke tabel articles jika data pelajaran tidak ditemukan
    const { data: artData } = await supabase
      .from("articles")
      .select("*, category:course_categories(*)")
      .eq("slug", slug)
      .maybeSingle();
    if (artData) return artData;

    if (error) {
      console.error("Gagal mengambil detail pelajaran:", error);
    }
    return null;
  }
  return data;
}

// ======================
// TYPES
// ======================

/**
 * Representasi item pelajaran minimal.
 */
interface LessonListItem {
  _id: string;
  title: string;
  slug: string;
}

/**
 * Mengambil seluruh daftar kategori kursus dari Supabase, lalu menggabungkannya secara paralel
 * dengan mengambil daftar pelajaran dari database Supabase dalam satu kueri efisien.
 * Mengelompokkan pelajaran berdasarkan kategori masing-masing untuk rendering katalog Dasbor.
 * 
 * @returns {Promise<Array<any>>} Daftar kategori kursus terformat lengkap beserta daftar preview pelajarannya
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

  // Ambil semua data pelajaran dari Supabase lessons
  const { data: dbLessons } = await supabase
    .from("lessons")
    .select("id, title, slug, category_id, order_number, summary")
    .in("category_id", categories.map(c => c.id))
    .order("order_number", { ascending: true });

  // Ambil semua data artikel dari Supabase articles
  const { data: dbArticles } = await supabase
    .from("articles")
    .select("id, title, slug, category_id, order_number, summary")
    .in("category_id", categories.map(c => c.id))
    .order("order_number", { ascending: true });

  // Gabungkan pelajaran dan artikel ke dalam satu array
  const allDbLessons = [
    ...(dbLessons || []),
    ...(dbArticles || [])
  ];

  // Normalisasi struktur data
  const supabaseLessons = allDbLessons.map((l) => ({
    _id: l.id,
    title: l.title,
    slug: l.slug,
    category_id: l.category_id,
    order_number: l.order_number,
    summary: l.summary
  }));

  const allLessons = supabaseLessons;

  // Kelompokkan pelajaran berdasarkan kategori (yang cocok dengan slug atau id di category_id)
  const categoriesWithData = categories.map((cat) => {
    const lessons = allLessons.filter(
      (l: LessonListItem & { category_id?: string }) => l.category_id === cat.id || l.category_id === cat.slug
    );

    return {
      ...cat,
      _id: cat.id,
      lessonCount: lessons.length,
      lessons: lessons.map((l: LessonListItem) => ({
        _id: l._id,
        title: l.title,
        slug: l.slug
      })),
      previews: lessons.slice(0, 4).map((l: LessonListItem) => ({
        _id: l._id,
        title: l.title,
        slug: l.slug
      }))
    };
  });

  return categoriesWithData;
}

/**
 * Mengambil daftar ujian berdasarkan kategori.
 * 
 * @deprecated Tabel ujian lama telah dihapus. Selalu mengembalikan array kosong.
 * @param {string} categoryId - ID Kategori
 * @returns {Promise<Array<any>>} Array kosong
 */
export async function getExamsByCategory(categoryId: string) {
  // Legacy exams table has been dropped. Returning empty array.
  return [];
}

/**
 * Representasi baris data kosakata dari database.
 */
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

/**
 * Representasi baris data tata bahasa dari database.
 */
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

/**
 * Tipe data untuk blok konten dinamis pelajaran.
 */
type ContentBlock = {
  _type?: string;
  type?: string;
  children?: unknown[];
  id?: string;
  order?: number;
  listType?: string;
  items?: string[];
  headers?: string[];
  rows?: string[][];
  style?: string;
  calloutType?: string;
  title?: string;
  content?: string;
  romaji?: string;
  translation?: string;
  [key: string]: unknown;
};

/**
 * Memeriksa apakah string merupakan format UUID v4 yang valid.
 * 
 * @param {string} s - String yang akan diperiksa
 * @returns {boolean} True jika format UUID valid
 */
const isUUID = (s: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s);

/**
 * Mengubah konten Markdown biasa menjadi struktur ContentBlock dinamis.
 * Berguna untuk parsing artikel atau konten berbasis teks mentah.
 * 
 * @param {string} markdown - String markdown mentah
 * @returns {ContentBlock[]} Array blok konten terstruktur
 */
function parseMarkdownToBlocks(markdown: string): ContentBlock[] {
  if (!markdown) return [];

  const blocks: ContentBlock[] = [];
  // Pisahkan berdasarkan baris kosong ganda untuk mendeteksi paragraf/blok baru
  const sections = markdown.split(/\r?\n\s*\r?\n/);

  sections.forEach((section, idx) => {
    const trimmed = section.trim();
    if (!trimmed) return;

    const id = `block-${idx}`;

    // Deteksi Heading 3
    if (trimmed.startsWith("### ")) {
      blocks.push({
        id,
        type: "heading",
        content: trimmed.slice(4).trim(),
        level: 3,
        order: idx
      });
      return;
    }
    // Deteksi Heading 2
    if (trimmed.startsWith("## ")) {
      blocks.push({
        id,
        type: "heading",
        content: trimmed.slice(3).trim(),
        level: 2,
        order: idx
      });
      return;
    }
    // Deteksi Heading 1
    if (trimmed.startsWith("# ")) {
      blocks.push({
        id,
        type: "heading",
        content: trimmed.slice(2).trim(),
        level: 1,
        order: idx
      });
      return;
    }

    // Deteksi Callout / Blockquote
    if (trimmed.startsWith(">")) {
      const lines = trimmed.split(/\r?\n/).map(l => l.replace(/^>\s?/, "").trim());
      let title = "";
      let content = "";
      if (lines.length > 1 && (lines[0].startsWith("**") || /^[^\w\s]/.test(lines[0]))) {
        title = lines[0].replace(/^\*\*|\*\*$/g, "");
        content = lines.slice(1).join("\n");
      } else {
        content = lines.join("\n");
      }

      blocks.push({
        id,
        type: "callout",
        title,
        content,
        calloutType: "info",
        order: idx
      });
      return;
    }

    // List block (bullet)
    if (trimmed.startsWith("- ") || trimmed.startsWith("* ") || trimmed.startsWith("• ")) {
      const items = trimmed.split(/\r?\n/).map(line => line.replace(/^[-*•]\s?/, "").trim());
      blocks.push({
        id,
        type: "list",
        listType: "bullet",
        items,
        order: idx
      } as ContentBlock);
      return;
    }

    // List block (number)
    if (/^\d+\.\s/.test(trimmed)) {
      const items = trimmed.split(/\r?\n/).map(line => line.replace(/^\d+\.\s?/, "").trim());
      blocks.push({
        id,
        type: "list",
        listType: "number",
        items,
        order: idx
      } as ContentBlock);
      return;
    }

    // Table block
    if (trimmed.startsWith("|")) {
      const lines = trimmed.split(/\r?\n/).map(line => line.trim());
      if (lines.length >= 2) {
        const headers = lines[0].split("|").slice(1, -1).map(c => c.trim());
        const rows = lines.slice(2).map(line => line.split("|").slice(1, -1).map(c => c.trim()));
        blocks.push({
          id,
          type: "table",
          headers,
          rows,
          order: idx
        } as ContentBlock);
        return;
      }
    }

    // Deteksi Gambar Markdown
    const imgMatch = trimmed.match(/^!\[(.*?)\]\((.*?)\)$/);
    if (imgMatch) {
      blocks.push({
        id,
        type: "image",
        title: imgMatch[1],
        content: imgMatch[2],
        order: idx
      });
      return;
    }

    // Default ke blok teks biasa
    blocks.push({
      id,
      type: "text",
      content: trimmed,
      order: idx
    });
  });

  return blocks;
}

/**
 * Mengambil detail satu pelajaran berdasarkan slug atau ID beserta relasinya.
 * Melakukan query ke Supabase (lessons/articles) dan memformat relasi kosakata, kanji, tata bahasa,
 * listening, dan reading secara paralel.
 * 
 * @param {string} slugOrId - Slug atau UUID pelajaran
 * @returns {Promise<LibraryItem | null>} Objek detail pelajaran terformat lengkap, atau null jika tidak ditemukan
 */
export async function getLibraryLessonDetail(slugOrId: string): Promise<LibraryItem | null> {
  const supabase = createStaticClient();

  try {
    // Pastikan array berupa array sungguhan (tangani kemungkinan JSON berbentuk string)
    const parseArray = (val: unknown) => {
      if (!val) return [];
      if (Array.isArray(val)) return val;
      try { return typeof val === "string" ? JSON.parse(val) : []; } catch { return []; }
    };

    // 1. Coba ambil dari Supabase terlebih dahulu
    const query = supabase
      .from("lessons")
      .select("*, category:course_categories(*)");

    if (isUUID(slugOrId)) {
      query.eq("id", slugOrId);
    } else {
      query.eq("slug", slugOrId);
    }

    const { data: dbLesson, error: dbErr } = await query.maybeSingle();

    if (dbErr) {
      console.error(`[getLibraryLessonDetail] Supabase query error:`, dbErr);
    }

    let data: LibraryItem | null = null;
    let fromSupabase = false;

    if (dbLesson) {
      console.log(`[getLibraryLessonDetail] BERHASIL mengambil dari SUPABASE untuk slugOrId="${slugOrId}"`);
      fromSupabase = true;
      data = {
        id: dbLesson.id,
        _id: dbLesson.id,
        title: dbLesson.title,
        slug: dbLesson.slug,
        summary: dbLesson.summary,
        order_number: dbLesson.order_number,
        estimated_minutes: dbLesson.estimated_minutes || 15,
        content_blocks: parseMarkdownToBlocks(dbLesson.content || ""),
        content: dbLesson.content,
        dialogue: dbLesson.dialogue,
        vocab_list: parseArray(dbLesson.vocab_list),
        kanji_list: parseArray(dbLesson.kanji_list),
        grammar_list: parseArray(dbLesson.grammar_list),
        listening_list: parseArray(dbLesson.listening_list),
        reading_list: parseArray(dbLesson.reading_list),
        quizzes: parseArray(dbLesson.quizzes),
        seo: dbLesson.seo || {},
        category_id: dbLesson.category_id,
        levelTitle: dbLesson.category?.title || "N5",
        categoryType: dbLesson.category?.type || "jlpt",
        generation_context: dbLesson.generation_context,
        image_url: dbLesson.image_url,
        imageUrl: dbLesson.image_url
      } as LibraryItem;
    } else {
      // 2. Coba ambil dari tabel articles di Supabase jika tidak ada di lessons
      const { data: dbArticle, error: artErr } = await supabase
        .from("articles")
        .select("*, category:course_categories(*)")
        .eq(isUUID(slugOrId) ? "id" : "slug", slugOrId)
        .maybeSingle();

      if (dbArticle) {
        console.log(`[getLibraryLessonDetail] BERHASIL mengambil dari ARTICLES untuk slugOrId="${slugOrId}"`);
        fromSupabase = true;
        data = {
          id: dbArticle.id,
          _id: dbArticle.id,
          title: dbArticle.title,
          slug: dbArticle.slug,
          summary: dbArticle.summary,
          order_number: dbArticle.order_number,
          estimated_minutes: dbArticle.estimated_minutes || 15,
          content_blocks: parseMarkdownToBlocks(dbArticle.content || ""),
          image_url: dbArticle.image_url,
          vocab_list: [],
          kanji_list: [],
          grammar_list: [],
          listening_list: [],
          reading_list: [],
          quizzes: parseArray(dbArticle.quizzes),
          seo: dbArticle.seo || {},
          category_id: dbArticle.category_id,
          levelTitle: dbArticle.category?.title || "Artikel",
          categoryType: dbArticle.category?.type || "article",
          generation_context: { source: "articles_table" }
        } as LibraryItem;
      } else {
        data = null;
      }
    }

    if (!data) return null;

    const contentBlocks = parseArray(data.content_blocks);
    
    let vocabListRaw: string[] = [];
    let kanjiListRaw: string[] = [];

    if (fromSupabase) {
      vocabListRaw = parseArray(data.vocab_list);
      kanjiListRaw = parseArray(data.kanji_list);
    } else {
      // Mengambil vocab_list & kanji_list secara dinamis dari tabel lessons di Supabase berdasarkan slug pelajaran
      try {
        const lessonSlug = typeof data.slug === "object" && data.slug !== null 
          ? (data.slug as { current?: string }).current || slugOrId 
          : String(data.slug || slugOrId);

        const { data: dbLessonMeta, error: dbErrMeta } = await supabase
          .from("lessons")
          .select("vocab_list, kanji_list")
          .eq("slug", lessonSlug)
          .single();

        if (dbErrMeta) {
          if (dbErrMeta.code !== "PGRST116") {
            console.error(`[getLibraryLessonDetail] Gagal mengambil daftar dari database untuk slug="${lessonSlug}":`, dbErrMeta.message);
          }
        } else if (dbLessonMeta) {
          if (dbLessonMeta.vocab_list) vocabListRaw = parseArray(dbLessonMeta.vocab_list);
          if (dbLessonMeta.kanji_list) kanjiListRaw = parseArray(dbLessonMeta.kanji_list);
        }
      } catch (err) {
        console.error(`[getLibraryLessonDetail] Gagal mengambil daftar dari database:`, err);
      }

      // Fallback ke data metadata jika data relasi kosong
      if (!vocabListRaw.length && (data.vocab_list || data.vocabList)) {
        vocabListRaw = parseArray(data.vocab_list || data.vocabList);
      }
      if (!kanjiListRaw.length && (data.kanji_list || data.kanjiList)) {
        kanjiListRaw = parseArray(data.kanji_list || data.kanjiList);
      }
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
    
    /**
     * Mengambil data kosakata (vocab) dari Supabase berdasarkan ID, kata, atau slug.
     */
    const fetchVocab = async () => {
      if (!vocabListRaw.length) return;
      const cleanList = vocabListRaw.map((s: unknown) => String(s).trim());
      const hasUUIDs = cleanList.some(isUUID);
      
      let vItems: VocabRow[] = [];
      if (hasUUIDs) {
        const { data } = await supabase.from("vocab").select("id, word, furigana, romaji, meaning_id, hinshi, pitch_accent, usage_notes, mnemonic, slug, audio_url").in("id", cleanList);
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
          supabase.from("vocab").select("id, word, furigana, romaji, meaning_id, hinshi, pitch_accent, usage_notes, mnemonic, slug, audio_url").in("word", searchTerms),
          supabase.from("vocab").select("id, word, furigana, romaji, meaning_id, hinshi, pitch_accent, usage_notes, mnemonic, slug, audio_url").in("slug", searchTerms)
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

    /**
     * Mengambil data Kanji dari Supabase berdasarkan ID atau karakter.
     */
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

    /**
     * Mengambil data tata bahasa (grammar) dari Supabase berdasarkan ID, judul, atau slug.
     */
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
            exampleSentences: (matched.examples as Array<Record<string, string>> || []).map((ex) => ({
              jp: ex.japanese || ex.jp || "",
              id: ex.indonesian || ex.id || "",
              romaji: ex.romaji || "",
              furigana: ex.furigana || ""
            }))
          };
        }
        return {
          _id: `temp-${item}-${idx}`,
          title: item,
          meaning: "Detail pending..."
        };
      });
    };

    /**
     * Mengambil data latihan menyimak (listening) dari Supabase.
     */
    const fetchListening = async () => {
      if (data && data.dialogue && Array.isArray(data.dialogue) && data.dialogue.length > 0) {
        const dialogueList = (data.dialogue as Record<string, unknown>[]) || [];
        result.listeningList = [{
          _id: `dialogue-${data.id}`,
          id: `dialogue-${data.id}`,
          title: "Skenario Percakapan",
          transcript: dialogueList.map((item, idx) => ({
            ...item,
            id: String(item.id || idx),
            text: String(item.text || item.jp || ""),
            jp: String(item.jp || item.text || ""),
            speaker: String(item.speaker || ""),
            speakerName: String(item.speakerName || ""),
            translation: String(item.translation || ""),
            furigana: item.furigana as string | undefined
          }))
        }];
        return;
      }

      if (!listeningListRaw.length) return;
      const cleanList = listeningListRaw.map((s: unknown) => String(s).trim());
      
      const { data: dbListening } = await supabase
        .from("listening")
        .select("*")
        .in("slug", cleanList);

      const lItems: Record<string, unknown>[] = (dbListening as Record<string, unknown>[]) || [];
      
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
                id: String(idx)
              };
            });
          } else if (Array.isArray(l.body)) {
            dialogue = l.body as Record<string, unknown>[];
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

    /**
     * Mengambil data latihan membaca (reading) dari Supabase.
     */
    const fetchReading = async () => {
      if (!readingListRaw.length) return;
      const cleanList = readingListRaw.map((s: unknown) => String(s).trim());
      
      const { data: dbReading } = await supabase
        .from("reading")
        .select("*")
        .in("slug", cleanList);

      const rItems: Record<string, unknown>[] = (dbReading as Record<string, unknown>[]) || [];
      
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

    // Jalankan semua fungsi fetch relasi secara paralel
    await Promise.all([
      fetchVocab(),
      fetchKanji(),
      fetchGrammar(),
      fetchListening(),
      fetchReading()
    ]);

    // Tambahkan pemeriksaan akhir untuk artikel
    // Rekonstruksi dinamis hanya untuk kategori tipe jlpt, untuk kategori umum/general gunakan content_blocks asli
    if (fromSupabase && result.categoryType === "jlpt") {
      result.articles = transformLessonBlocks(result, contentBlocks, articles);
    } else if (!result.articles || (result.articles as unknown[]).length === 0) {
      result.articles = articles.length > 0 ? articles : contentBlocks;
    }

    return result;
  } catch (error) {
    console.error(`Gagal mengambil detail pelajaran:`, error);
    return null;
  }
}

/**
 * Fetches lesson data and navigation list from Supabase.
 *
 * @param categoryId - Course category slug.
 * @param slug - Lesson slug.
 * @returns Lesson details and navigation array, or null if category not found.
 */
export async function getLessonData(categoryId: string, slug: string) {
  const supabase = createStaticClient();

  // 1. Ambil Kategori & Pelajaran secara paralel
  const [categoryRes, lesson] = await Promise.all([
    supabase
      .from("course_categories")
      .select("id, title, type")
      .eq("slug", categoryId.toLowerCase())
      .single(),
    getLibraryItemBySlug("lessons", slug)
  ]);

  const category = categoryRes.data;
  if (!category) return null;

  if (lesson) {
    lesson.levelTitle = category.title;
    lesson.categoryType = category.type;
    lesson.levelCode = categoryId;
  }

  // 2. Dapatkan Navigasi
  let dbLessons = [];
  if (category.type === "general" || category.type === "article") {
    const { data } = await supabase
      .from("articles")
      .select("id, title, slug, category_id, order_number, summary")
      .eq("category_id", category.id)
      .order("order_number", { ascending: true });
    dbLessons = data || [];
  } else {
    const { data } = await supabase
      .from("lessons")
      .select("id, title, slug, category_id, order_number, summary")
      .eq("category_id", category.id)
      .order("order_number", { ascending: true });
    dbLessons = data || [];
  }

  // Map database fields to match expected structure.
  const supabaseLessons = dbLessons.map((l) => ({
    _id: l.id,
    title: l.title,
    slug: l.slug,
    category_id: l.category_id,
    order_number: l.order_number,
    summary: l.summary
  }));

  // Sort navigation items by order number ascending.
  const nav = supabaseLessons.sort((a, b) => (a.order_number || 0) - (b.order_number || 0));

  return { lesson, nav };
}

/**
 * Fetch top Lesson/Course category & slug params for static build generation (ISR).
 * Filters explicitly by beginner levels (N5, N4, kana).
 * 
 * @param limit - Maximum number of params to pre-render.
 * @returns Array of objects containing categoryId and slug.
 */
export async function getLessonStaticParams(limit: number = 100): Promise<{ categoryId: string; slug: string }[]> {
  const supabase = createStaticClient();
  try {
    const { data: categories, error: catErr } = await supabase
      .from("course_categories")
      .select("id, slug")
      .in("slug", ["n5", "n4", "hiragana", "katakana"]);

    if (catErr || !categories || categories.length === 0) return [];

    const categoryMap = new Map<string, string>();
    categories.forEach((c) => categoryMap.set(c.id, c.slug));

    const categoryIds = categories.map((c) => c.id);

    const [lessonsRes, articlesRes] = await Promise.all([
      supabase
        .from("lessons")
        .select("slug, category_id")
        .in("category_id", categoryIds)
        .not("slug", "is", null)
        .order("order_number", { ascending: true })
        .limit(limit),
      supabase
        .from("articles")
        .select("slug, category_id")
        .in("category_id", categoryIds)
        .not("slug", "is", null)
        .order("order_number", { ascending: true })
        .limit(limit),
    ]);

    const combined = [...(lessonsRes.data || []), ...(articlesRes.data || [])];
    const results: { categoryId: string; slug: string }[] = [];

    for (const item of combined) {
      const catSlug = categoryMap.get(item.category_id);
      if (catSlug && item.slug) {
        results.push({ categoryId: catSlug, slug: item.slug });
      }
      if (results.length >= limit) break;
    }

    return results;
  } catch (error) {
    console.error("Gagal mengambil static params lessons:", error);
    return [];
  }
}