// lib/queries.ts

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

export const allCheatsheetsQuery = `*[_type == "cheatsheet"] | order(category asc) {
  _id,
  title,
  category,
  // Menyesuaikan referensi ke skema 'vocab'
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

// Update: Menggunakan _type "vocab", menghapus kanjiDetails, dan menambahkan hinshi
export const vocabByIdsQuery = `*[_type == "vocab" && _id in $ids] {
  _id,
  word,
  furigana,
  romaji,
  meaning,
  hinshi,
  "audioUrl": audio.asset->url
}`;

// Update: Menghapus kanjiDetails dan menambahkan hinshi pada proyeksi vocabList dan referenceWords
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
