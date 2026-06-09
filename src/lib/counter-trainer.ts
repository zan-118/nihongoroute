export const COUNTER_OPTIONS = ["人", "本", "枚", "匹", "台", "冊", "杯", "個", "階", "歳"] as const;

export type CounterWord = (typeof COUNTER_OPTIONS)[number];
export type CounterLevel = "N5" | "N4";

export interface CounterQuestion {
  id: string;
  level: CounterLevel;
  number: number;
  noun: string;
  nounReading: string;
  category: string;
  answer: CounterWord;
  phrase: string;
  reading: string;
  translation: string;
  hint: string;
  explanation: string;
  sourceHref?: string;
  sourceTitle?: string;
  sourceType?: "database" | "static";
}

export const COUNTER_QUESTIONS: CounterQuestion[] = [
  {
    id: "people-three",
    level: "N5",
    number: 3,
    noun: "友だち",
    nounReading: "ともだち",
    category: "orang",
    answer: "人",
    phrase: "三人の友だち",
    reading: "さんにんのともだち",
    translation: "tiga teman",
    hint: "Dipakai untuk menghitung orang.",
    explanation: "人 adalah counter untuk orang. Perhatikan bentuk khusus 一人 dan 二人.",
  },
  {
    id: "pencils-three",
    level: "N5",
    number: 3,
    noun: "鉛筆",
    nounReading: "えんぴつ",
    category: "benda panjang",
    answer: "本",
    phrase: "三本の鉛筆",
    reading: "さんぼんのえんぴつ",
    translation: "tiga pensil",
    hint: "Untuk benda panjang atau silinder.",
    explanation: "本 dipakai untuk benda panjang seperti pensil, botol, payung, dan jalan.",
  },
  {
    id: "paper-five",
    level: "N5",
    number: 5,
    noun: "紙",
    nounReading: "かみ",
    category: "benda tipis",
    answer: "枚",
    phrase: "五枚の紙",
    reading: "ごまいのかみ",
    translation: "lima lembar kertas",
    hint: "Untuk benda tipis dan datar.",
    explanation: "枚 cocok untuk kertas, foto, tiket, piring, atau pakaian yang dihitung sebagai lembaran.",
  },
  {
    id: "cats-two",
    level: "N5",
    number: 2,
    noun: "猫",
    nounReading: "ねこ",
    category: "hewan kecil",
    answer: "匹",
    phrase: "二匹の猫",
    reading: "にひきのねこ",
    translation: "dua kucing",
    hint: "Untuk banyak hewan kecil.",
    explanation: "匹 umum dipakai untuk hewan kecil seperti kucing, anjing kecil, ikan, dan serangga.",
  },
  {
    id: "cars-four",
    level: "N5",
    number: 4,
    noun: "車",
    nounReading: "くるま",
    category: "mesin/kendaraan",
    answer: "台",
    phrase: "四台の車",
    reading: "よんだいのくるま",
    translation: "empat mobil",
    hint: "Untuk kendaraan dan mesin.",
    explanation: "台 menghitung kendaraan, komputer, kamera, mesin, dan perangkat elektronik besar.",
  },
  {
    id: "books-six",
    level: "N5",
    number: 6,
    noun: "本",
    nounReading: "ほん",
    category: "buku/jilid",
    answer: "冊",
    phrase: "六冊の本",
    reading: "ろくさつのほん",
    translation: "enam buku",
    hint: "Untuk buku atau benda berjilid.",
    explanation: "冊 dipakai untuk buku, majalah, manga, dan kamus sebagai jilid.",
  },
  {
    id: "tea-two",
    level: "N5",
    number: 2,
    noun: "お茶",
    nounReading: "おちゃ",
    category: "minuman",
    answer: "杯",
    phrase: "二杯のお茶",
    reading: "にはいのおちゃ",
    translation: "dua cangkir teh",
    hint: "Untuk isi gelas, cangkir, atau mangkuk.",
    explanation: "杯 menghitung minuman atau cairan dalam wadah, seperti teh, kopi, atau sup.",
  },
  {
    id: "apples-eight",
    level: "N5",
    number: 8,
    noun: "りんご",
    nounReading: "りんご",
    category: "benda umum",
    answer: "個",
    phrase: "八個のりんご",
    reading: "はっこのりんご",
    translation: "delapan apel",
    hint: "Counter serbaguna untuk benda kecil.",
    explanation: "個 adalah counter umum untuk benda kecil dan benda yang tidak punya counter khusus.",
  },
  {
    id: "floor-ten",
    level: "N4",
    number: 10,
    noun: "建物",
    nounReading: "たてもの",
    category: "lantai",
    answer: "階",
    phrase: "十階の建物",
    reading: "じゅっかいのたてもの",
    translation: "gedung sepuluh lantai",
    hint: "Untuk lantai gedung.",
    explanation: "階 menghitung lantai. 十階 lazim dibaca じゅっかい atau じっかい.",
  },
  {
    id: "age-twenty",
    level: "N4",
    number: 20,
    noun: "学生",
    nounReading: "がくせい",
    category: "umur",
    answer: "歳",
    phrase: "二十歳の学生",
    reading: "はたちのがくせい",
    translation: "pelajar berumur dua puluh tahun",
    hint: "Untuk umur.",
    explanation: "歳 dipakai untuk umur. 二十歳 punya bacaan khusus: はたち.",
  },
];

export function normalizeCounterAnswer(value: string) {
  return value.normalize("NFKC").trim();
}

export function isCounterAnswerCorrect(expected: string, answer: string) {
  return normalizeCounterAnswer(expected) === normalizeCounterAnswer(answer);
}

export function getCounterQuestion(index: number, questions: CounterQuestion[] = COUNTER_QUESTIONS) {
  const questionBank = questions.length > 0 ? questions : COUNTER_QUESTIONS;
  const normalizedIndex = ((index % questionBank.length) + questionBank.length) % questionBank.length;
  return questionBank[normalizedIndex];
}

export function formatCounterPrompt(question: CounterQuestion) {
  return `${question.number} ___ の${question.noun}`;
}
