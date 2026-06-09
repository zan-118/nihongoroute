export type DrillLevel = "N5" | "N4" | "N3" | "N2" | "N1";
export type DrillKind = "vocab" | "kanji" | "grammar";

export interface MiniDrillQuestion {
  id: string;
  level: DrillLevel;
  kind: DrillKind;
  prompt: string;
  options: string[];
  answer: string;
  explanation: string;
  reading?: string;
  sourceHref?: string;
  sourceTitle?: string;
  sourceType?: "database" | "static";
}

export interface MiniDrillConfig {
  level: DrillLevel | "all";
  kind: DrillKind | "mixed";
  amount: number;
  seed?: string;
  bank?: MiniDrillQuestion[];
}

export const DRILL_LEVELS: Array<DrillLevel | "all"> = ["all", "N5", "N4", "N3", "N2", "N1"];
export const DRILL_KINDS: Array<DrillKind | "mixed"> = ["mixed", "vocab", "kanji", "grammar"];

export const MINI_DRILL_BANK: MiniDrillQuestion[] = [
  {
    id: "n5-vocab-water",
    level: "N5",
    kind: "vocab",
    prompt: "水",
    reading: "みず",
    options: ["air", "api", "angin", "tanah"],
    answer: "air",
    explanation: "水 dibaca みず dan berarti air.",
  },
  {
    id: "n5-vocab-school",
    level: "N5",
    kind: "vocab",
    prompt: "学校",
    reading: "がっこう",
    options: ["sekolah", "kantor", "stasiun", "rumah sakit"],
    answer: "sekolah",
    explanation: "学校 berarti sekolah.",
  },
  {
    id: "n5-kanji-day",
    level: "N5",
    kind: "kanji",
    prompt: "日",
    reading: "にち / ひ",
    options: ["hari", "bulan", "api", "mata"],
    answer: "hari",
    explanation: "日 bisa berarti hari atau matahari.",
  },
  {
    id: "n5-kanji-person",
    level: "N5",
    kind: "kanji",
    prompt: "人",
    reading: "じん / ひと",
    options: ["orang", "anak", "guru", "kaki"],
    answer: "orang",
    explanation: "人 berarti orang/manusia.",
  },
  {
    id: "n5-grammar-wa",
    level: "N5",
    kind: "grammar",
    prompt: "私は学生___。",
    options: ["です", "ます", "でしたい", "ありません"],
    answer: "です",
    explanation: "です dipakai untuk membuat pernyataan sopan dengan nomina/adjektiva-na.",
  },
  {
    id: "n5-grammar-object",
    level: "N5",
    kind: "grammar",
    prompt: "本___読みます。",
    options: ["を", "で", "に", "へ"],
    answer: "を",
    explanation: "を menandai objek langsung dari tindakan membaca.",
  },
  {
    id: "n4-vocab-hurry",
    level: "N4",
    kind: "vocab",
    prompt: "急ぐ",
    reading: "いそぐ",
    options: ["terburu-buru", "beristirahat", "menunggu", "membuka"],
    answer: "terburu-buru",
    explanation: "急ぐ berarti terburu-buru atau bergegas.",
  },
  {
    id: "n4-kanji-special",
    level: "N4",
    kind: "kanji",
    prompt: "特",
    reading: "とく",
    options: ["khusus", "lama", "murah", "kecil"],
    answer: "khusus",
    explanation: "特 muncul pada kata seperti 特別, berarti khusus.",
  },
  {
    id: "n4-grammar-must",
    level: "N4",
    kind: "grammar",
    prompt: "勉強しなければ___。",
    options: ["なりません", "いけます", "ありません", "しました"],
    answer: "なりません",
    explanation: "〜なければなりません berarti harus melakukan sesuatu.",
  },
  {
    id: "n3-vocab-suddenly",
    level: "N3",
    kind: "vocab",
    prompt: "急に",
    reading: "きゅうに",
    options: ["tiba-tiba", "pelan-pelan", "selalu", "jarang"],
    answer: "tiba-tiba",
    explanation: "急に berarti tiba-tiba.",
  },
  {
    id: "n3-kanji-feel",
    level: "N3",
    kind: "kanji",
    prompt: "感",
    reading: "かん",
    options: ["rasa", "uang", "jalan", "suara"],
    answer: "rasa",
    explanation: "感 berkaitan dengan rasa/perasaan, seperti 感じる.",
  },
  {
    id: "n3-grammar-even-if",
    level: "N3",
    kind: "grammar",
    prompt: "雨が降って___、行きます。",
    options: ["も", "から", "ので", "ばかり"],
    answer: "も",
    explanation: "〜ても menunjukkan 'walaupun'.",
  },
  {
    id: "n2-vocab-abstract",
    level: "N2",
    kind: "vocab",
    prompt: "抽象的",
    reading: "ちゅうしょうてき",
    options: ["abstrak", "konkret", "sementara", "resmi"],
    answer: "abstrak",
    explanation: "抽象的 berarti abstrak.",
  },
  {
    id: "n2-grammar-result",
    level: "N2",
    kind: "grammar",
    prompt: "考えた___、この答えにしました。",
    options: ["末に", "ばかりに", "つつ", "がち"],
    answer: "末に",
    explanation: "〜末に berarti setelah melalui proses panjang akhirnya.",
  },
  {
    id: "n1-vocab-subtle",
    level: "N1",
    kind: "vocab",
    prompt: "微妙",
    reading: "びみょう",
    options: ["halus/sulit dijelaskan", "sangat jelas", "berbahaya", "terlambat"],
    answer: "halus/sulit dijelaskan",
    explanation: "微妙 berarti nuansa halus, rumit, atau sulit dinilai.",
  },
  {
    id: "n1-grammar-only-after",
    level: "N1",
    kind: "grammar",
    prompt: "失敗して___、大切さが分かった。",
    options: ["はじめて", "以来", "ところを", "かたがた"],
    answer: "はじめて",
    explanation: "〜てはじめて berarti baru setelah mengalami sesuatu.",
  },
];

function shuffleBySeed<T>(items: T[], seed: string) {
  const next = [...items];
  let state = Array.from(seed).reduce((total, char) => total + char.charCodeAt(0), 0) || 1;

  for (let index = next.length - 1; index > 0; index--) {
    state = (state * 9301 + 49297) % 233280;
    const swapIndex = state % (index + 1);
    [next[index], next[swapIndex]] = [next[swapIndex], next[index]];
  }

  return next;
}

export function createMiniDrill(config: MiniDrillConfig) {
  const questionBank = config.bank && config.bank.length > 0 ? config.bank : MINI_DRILL_BANK;
  const pool = questionBank.filter((question) => {
    const levelMatch = config.level === "all" || question.level === config.level;
    const kindMatch = config.kind === "mixed" || question.kind === config.kind;
    return levelMatch && kindMatch;
  });
  const fallbackPool = pool.length > 0 ? pool : questionBank;
  const shuffled = shuffleBySeed(
    fallbackPool,
    `${config.level}-${config.kind}-${config.amount}-${config.seed ?? "default"}`
  );
  const amount = Math.max(1, Math.min(config.amount, 20));

  return Array.from({ length: amount }, (_, index) => shuffled[index % shuffled.length]);
}

export function normalizeMiniDrillAnswer(value: string) {
  return value.normalize("NFKC").trim().toLowerCase();
}

export function isMiniDrillAnswerCorrect(expected: string, answer: string) {
  return normalizeMiniDrillAnswer(expected) === normalizeMiniDrillAnswer(answer);
}
