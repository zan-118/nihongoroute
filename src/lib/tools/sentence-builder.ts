/**
 * Prompt data structure for sentence builder exercise.
 */
export interface SentenceBuilderPrompt {
  /** Unique identifier. */
  id: string;
  /** JLPT level (e.g., N5, N4). */
  level: string;
  /** Target Japanese sentence. */
  target: string;
  /** Translation in target language. */
  translation: string;
  /** Correct sequence of tokens. */
  tokens: string[];
  /** Grammar explanation. */
  explanation?: string;
  /** Grammar pattern template. */
  pattern?: string;
}

/**
 * Split Japanese sentence into tokens using regex.
 * @param japanese Japanese text.
 * @returns Array of tokens.
 */
export function tokenizeSentence(japanese: string): string[] {
  // Match particles, punctuation, or kanji/kana blocks
  const regex = /(でした|です|ました|ます|から|まで|[はがをにでとへも])|([。、！？!?])|([^\u3001\u3002\uFF01\uFF1F!?\sはがをにでとへも]+)/g;
  const matches: string[] = [];
  let match;
  while ((match = regex.exec(japanese)) !== null) {
    matches.push(match[0]);
  }
  return matches.filter(Boolean);
}

/**
 * Predefined sentence builder prompts.
 */
export const SENTENCE_BUILDER_PROMPTS: SentenceBuilderPrompt[] = [
  {
    id: "want-water",
    level: "N5",
    target: "水が飲みたいです。",
    translation: "Saya ingin minum air.",
    tokens: ["水", "が", "飲みたい", "です", "。"],
    explanation: "Bentuk たい memakai が untuk objek keinginan dalam pola dasar.",
    pattern: "N が Vたいです",
  },
  {
    id: "study-library",
    level: "N5",
    target: "図書館で日本語を勉強します。",
    translation: "Saya belajar bahasa Jepang di perpustakaan.",
    tokens: ["図書館", "で", "日本語", "を", "勉強します", "。"],
    explanation: "で menandai tempat aksi, を menandai objek yang dipelajari.",
    pattern: "Place で Object を Vます",
  },
  {
    id: "went-with-friend",
    level: "N5",
    target: "友達と映画を見に行きました。",
    translation: "Saya pergi menonton film dengan teman.",
    tokens: ["友達", "と", "映画", "を", "見に", "行きました", "。"],
    explanation: "と menunjukkan bersama siapa, dan V-stem に行く berarti pergi untuk melakukan sesuatu.",
    pattern: "Person と Object を Vに行く",
  },
  {
    id: "because-busy",
    level: "N4",
    target: "忙しかったので、宿題ができませんでした。",
    translation: "Karena sibuk, saya tidak bisa mengerjakan PR.",
    tokens: ["忙しかった", "ので", "、", "宿題", "が", "できませんでした", "。"],
    explanation: "ので memberi alasan yang terdengar lebih netral daripada から.",
    pattern: "Reason ので Result",
  },
  {
    id: "must-study",
    level: "N4",
    target: "毎日漢字を勉強しなければなりません。",
    translation: "Saya harus belajar kanji setiap hari.",
    tokens: ["毎日", "漢字", "を", "勉強しなければ", "なりません", "。"],
    explanation: "〜なければなりません menyatakan kewajiban.",
    pattern: "Vない stem + なければなりません",
  },
  {
    id: "even-if-rain",
    level: "N3",
    target: "雨が降っても、練習に行きます。",
    translation: "Walaupun hujan turun, saya akan pergi latihan.",
    tokens: ["雨", "が", "降っても", "、", "練習", "に", "行きます", "。"],
    explanation: "〜ても menunjukkan kondisi yang tetap tidak mengubah hasil.",
    pattern: "Vても Result",
  },
];

/**
 * Shuffle tokens deterministically using seed.
 * @param tokens Array of tokens.
 * @param seed Seed string.
 * @returns Shuffled tokens.
 */
export function shuffleSentenceTokens(tokens: string[], seed: string) {
  const next = [...tokens];
  // Generate seed hash value
  let state = Array.from(seed).reduce((total, char) => total + char.charCodeAt(0), 0) || 1;

  // Linear Congruential Generator (LCG) for deterministic shuffle
  for (let index = next.length - 1; index > 0; index--) {
    state = (state * 9301 + 49297) % 233280;
    const swapIndex = state % (index + 1);
    [next[index], next[swapIndex]] = [next[swapIndex], next[index]];
  }

  return next;
}

/**
 * Normalize tokens to single string.
 * @param tokens Array of tokens.
 * @returns Normalized string.
 */
export function normalizeBuiltSentence(tokens: string[]) {
  return tokens.join("").normalize("NFKC").replace(/\s/g, "");
}

/**
 * Compare expected and answer tokens.
 * @param expectedTokens Correct tokens.
 * @param answerTokens User tokens.
 * @returns True if match.
 */
export function isBuiltSentenceCorrect(expectedTokens: string[], answerTokens: string[]) {
  return normalizeBuiltSentence(expectedTokens) === normalizeBuiltSentence(answerTokens);
}