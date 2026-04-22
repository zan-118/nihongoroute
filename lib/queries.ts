/**
 * @file queries.ts
 * @description Koleksi query GROQ (Graph Relational Object Queries) untuk pengambilan data dari Sanity CMS.
 * Mengatur struktur proyeksi data yang dikirimkan ke frontend.
 * @module lib/queries
 */

// ======================
// CONTENT QUERIES
// ======================

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
