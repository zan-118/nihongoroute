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
  // 1. Tarik dari relasi Kosakata dan samakan nama key-nya
  linkedVocab[]-> {
    "label": meaning,
    "jp": word,
    romaji
  },
  // 2. Tarik dari input manual
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

export const vocabByIdsQuery = `*[_type == "kosakata" && _id in $ids] {
  _id,
  word,
  furigana,
  romaji,
  meaning,
  kanjiDetails,
  "audioUrl": audio.asset->url
}`;

// ✨ PERUBAHAN DI SINI: Menggunakan course_category
export const lessonQuery = `*[_type == "lesson" && slug.current == $slug][0] {
  title,
  summary,
  orderNumber,
  vocabList[]->{ 
    _id, word, furigana, romaji, meaning, kanjiDetails, examples 
  },
  referenceWords[]->{ 
    _id, word, furigana, romaji, meaning, kanjiDetails, examples 
  },
  patterns,
  examples,
  conversation,
  grammar,
  quizzes
}`;
