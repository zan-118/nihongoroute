export type ShadowingLevel = "N5" | "N4" | "N3";

export interface ShadowingPreset {
  id: string;
  level: ShadowingLevel;
  title: string;
  text: string;
  translation: string;
  focus: string;
  targetSeconds: number;
  chunks: string[];
}

export const SHADOWING_PRESETS: ShadowingPreset[] = [
  {
    id: "morning-greeting",
    level: "N5",
    title: "Salam pagi",
    text: "おはようございます。今日もよろしくお願いします。",
    translation: "Selamat pagi. Mohon kerja samanya hari ini juga.",
    focus: "ritme sopan",
    targetSeconds: 5,
    chunks: ["おはようございます", "今日も", "よろしくお願いします"],
  },
  {
    id: "station-question",
    level: "N5",
    title: "Tanya arah",
    text: "すみません、駅はどこですか。",
    translation: "Permisi, stasiun ada di mana?",
    focus: "intonasi tanya",
    targetSeconds: 4,
    chunks: ["すみません", "駅は", "どこですか"],
  },
  {
    id: "repeat-slowly",
    level: "N5",
    title: "Minta diulang",
    text: "もう一度ゆっくり言ってください。",
    translation: "Tolong ucapkan sekali lagi dengan pelan.",
    focus: "bunyi panjang",
    targetSeconds: 4,
    chunks: ["もう一度", "ゆっくり", "言ってください"],
  },
  {
    id: "weather-plan",
    level: "N4",
    title: "Tetap pergi",
    text: "雨が降っていても、予定どおり行きます。",
    translation: "Walaupun hujan turun, saya akan pergi sesuai rencana.",
    focus: "pola ても",
    targetSeconds: 6,
    chunks: ["雨が降っていても", "予定どおり", "行きます"],
  },
  {
    id: "reading-practice",
    level: "N4",
    title: "Latihan membaca",
    text: "最近、日本語の文章を声に出して読む練習をしています。",
    translation: "Belakangan ini saya berlatih membaca teks Jepang dengan suara keras.",
    focus: "napas kalimat panjang",
    targetSeconds: 8,
    chunks: ["最近", "日本語の文章を", "声に出して", "読む練習をしています"],
  },
  {
    id: "news-relief",
    level: "N3",
    title: "Berita dan rasa lega",
    text: "このニュースを聞いて、少し安心しました。",
    translation: "Setelah mendengar berita ini, saya merasa sedikit lega.",
    focus: "koneksi て",
    targetSeconds: 6,
    chunks: ["このニュースを聞いて", "少し", "安心しました"],
  },
];

export function getShadowingPreset(index: number) {
  const normalizedIndex = ((index % SHADOWING_PRESETS.length) + SHADOWING_PRESETS.length) % SHADOWING_PRESETS.length;
  return SHADOWING_PRESETS[normalizedIndex];
}

export function formatShadowingDuration(totalSeconds: number) {
  const safeSeconds = Math.max(0, Math.floor(totalSeconds));
  const minutes = Math.floor(safeSeconds / 60).toString().padStart(2, "0");
  const seconds = (safeSeconds % 60).toString().padStart(2, "0");

  return `${minutes}:${seconds}`;
}

export function getShadowingPaceLabel(elapsedSeconds: number, targetSeconds: number) {
  if (elapsedSeconds <= 0) return "Belum direkam";
  if (elapsedSeconds < targetSeconds * 0.75) return "Terlalu cepat";
  if (elapsedSeconds > targetSeconds * 1.45) return "Terlalu lambat";
  return "Tempo mendekati target";
}
