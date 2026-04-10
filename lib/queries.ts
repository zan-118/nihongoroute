// Query untuk mengambil semua kata kerja
export const allVerbsQuery = `*[_type == "verb_dictionary"] | order(group asc, masu asc) {
  _id,
  group,
  masu,
  te,
  jisho,
  nai,
  ta,
  meaning,
  lesson
}`;

export const allCheatsheetsQuery = `*[_type == "cheatsheet"] | order(category asc) {
  _id,
  title,
  category,
  items[] {
    label,
    jp
  }
}`;

export const allGrammarArticlesQuery = `*[_type == "grammar_article"] {
  _id,
  title,
  "slug": slug.current,
  content
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
