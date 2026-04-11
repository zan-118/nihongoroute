// Query untuk mengambil semua kata kerja LENGKAP
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

// Tambahkan romaji di Cheatsheet sekalian biar muncul di tabel
export const allCheatsheetsQuery = `*[_type == "cheatsheet"] | order(category asc) {
  _id,
  title,
  category,
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

// ✨ FIX: lessonQuery sekarang mengekstrak data dari Reference Kosakata secara penuh ✨
export const lessonQuery = `*[_type == "lesson" && slug.current == $slug][0] {
  title,
  summary,
  orderNumber,
  vocabList[]->{ 
    _id, 
    word, 
    furigana, 
    romaji, 
    meaning, 
    kanjiDetails, 
    examples 
  },
  referenceWords[]->{ 
    _id, 
    word, 
    furigana, 
    romaji, 
    meaning, 
    kanjiDetails, 
    examples 
  },
  patterns,
  examples,
  conversation,
  grammar,
  quizzes
}`;
