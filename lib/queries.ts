/**
 * @file queries.ts
 * @description Koleksi query GROQ (Graph Relational Object Queries) untuk pengambilan data dari Sanity CMS.
 * Mengatur struktur proyeksi data yang dikirimkan ke frontend.
 * @module lib/queries
 */

// ======================
// DICTIONARY QUERIES
// ======================

/**
 * Mengambil semua daftar kata kerja dari kamus beserta konjugasinya.
 */
export const allVerbsQuery = `*[_type == "verb_dictionary"] | order(group asc, masu asc) {
  _id,
  group,
  masu,
  jisho,
  furigana,
  meaning,
  lesson,
  te,
  nai,
  ta,
  teiru,
  tai,
  nakereba,
  kanou,
  shieki,
  ukemi,
  katei,
  ikou,
  teshimau,
  meirei
}`;

/**
 * Mengambil semua ringkasan materi (cheatsheets) beserta referensi kosakatanya.
 */
export const allCheatsheetsQuery = `*[_type == "cheatsheet"] | order(category asc) {
  _id,
  title,
  category,
  linkedVocab[]-> {
    "label": meaning,
    "jp": word,
    romaji,
    hinshi
  },
  items[] {
    label,
    jp,
    romaji
  }
}`;

// ======================
// CONTENT QUERIES
// ======================

/**
 * Mengambil artikel tata bahasa lengkap.
 */
export const allGrammarArticlesQuery = `*[_type == "grammar_article"] {
  _id,
  title,
  "slug": slug.current,
  meaning,
  content,
  examples[] {
    jp,
    furigana,
    meaning
  }
}`;

/**
 * Mengambil dataset kosakata spesifik berdasarkan daftar ID.
 * Digunakan terutama oleh sistem SRS (Spaced Repetition System).
 */
export const vocabByIdsQuery = `*[_type == "vocab" && _id in $ids] {
  _id,
  word,
  furigana,
  romaji,
  meaning,
  hinshi,
  "audioUrl": audio.asset->url
}`;

/**
 * Query detail materi (Lesson) mencakup daftar kosakata dan kuis.
 */
export const lessonQuery = `*[_type == "lesson" && slug.current == $slug][0] {
  title,
  summary,
  orderNumber,
  vocabList[]->{ 
    _id, word, furigana, romaji, meaning, hinshi, examples 
  },
  referenceWords[]->{ 
    _id, word, furigana, romaji, meaning, hinshi, examples 
  },
  patterns,
  examples,
  conversation,
  grammar,
  quizzes
}`;
