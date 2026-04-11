// Query untuk mengambil semua kata kerja
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
export const allGrammarArticlesQuery = `*[_type == "grammar_article"] | order(_createdAt desc) {
  _id,
  title,
  "slug": slug.current,
  // Mengambil 200 karakter pertama dari konten untuk preview (opsional)
  "excerpt": pt::text(content)[0...200]
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
