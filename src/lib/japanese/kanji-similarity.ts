/**
 * Kanji details for similarity comparison.
 */
export interface SimilarKanjiItem {
  character: string;
  meaning: string;
  reading: string;
  cue: string;
  examples: Array<{ word: string; meaning: string }>;
}

/**
 * Pair of similar kanji with comparison details.
 */
export interface SimilarKanjiPair {
  id: string;
  level: "N5" | "N4" | "N3";
  title: string;
  difference: string;
  mnemonic: string;
  items: [SimilarKanjiItem, SimilarKanjiItem];
}

/**
 * List of similar kanji pairs for N5-N3 levels.
 */
export const SIMILAR_KANJI_PAIRS: SimilarKanjiPair[] = [
  {
    id: "matsu-mada",
    level: "N5",
    title: "未 vs 末",
    difference: "Garis atas 未 lebih pendek; garis atas 末 lebih panjang.",
    mnemonic: "未 seperti sesuatu yang belum tumbuh penuh. 末 ujungnya sudah menonjol.",
    items: [
      {
        character: "未",
        meaning: "belum",
        reading: "み / まだ",
        cue: "Garis kedua lebih panjang.",
        examples: [
          { word: "未来", meaning: "masa depan" },
          { word: "未成年", meaning: "belum dewasa" },
        ],
      },
      {
        character: "末",
        meaning: "akhir",
        reading: "まつ / すえ",
        cue: "Garis atas lebih panjang.",
        examples: [
          { word: "週末", meaning: "akhir pekan" },
          { word: "月末", meaning: "akhir bulan" },
        ],
      },
    ],
  },
  {
    id: "day-eye",
    level: "N5",
    title: "日 vs 目",
    difference: "日 punya satu garis tengah; 目 punya dua garis dalam.",
    mnemonic: "Mata 目 butuh detail lebih banyak daripada matahari 日.",
    items: [
      {
        character: "日",
        meaning: "hari / matahari",
        reading: "にchi / ひ",
        cue: "Satu garis horizontal di dalam.",
        examples: [
          { word: "日本", meaning: "Jepang" },
          { word: "日曜日", meaning: "Minggu" },
        ],
      },
      {
        character: "目",
        meaning: "mata",
        reading: "もく / め",
        cue: "Dua garis horizontal di dalam.",
        examples: [
          { word: "目", meaning: "mata" },
          { word: "目的", meaning: "tujuan" },
        ],
      },
    ],
  },
  {
    id: "soil-samurai",
    level: "N5",
    title: "土 vs 士",
    difference: "土 punya garis bawah lebih panjang; 士 punya garis atas lebih panjang.",
    mnemonic: "Tanah 土 melebar di bawah. Samurai 士 berdiri gagah di atas.",
    items: [
      {
        character: "土",
        meaning: "tanah",
        reading: "ど / つち",
        cue: "Garis bawah lebih panjang.",
        examples: [
          { word: "土曜日", meaning: "Sabtu" },
          { word: "土地", meaning: "tanah / lahan" },
        ],
      },
      {
        character: "士",
        meaning: "samurai / ahli",
        reading: "し",
        cue: "Garis atas lebih panjang.",
        examples: [
          { word: "武士", meaning: "samurai" },
          { word: "博士", meaning: "doktor" },
        ],
      },
    ],
  },
  {
    id: "right-stone",
    level: "N5",
    title: "右 vs 石",
    difference: "右 memakai mulut 口 di bawah; 石 memiliki bentuk mirip batu dengan garis miring lebih kuat.",
    mnemonic: "右 adalah tangan kanan menuju mulut; 石 terlihat seperti batu jatuh.",
    items: [
      {
        character: "右",
        meaning: "kanan",
        reading: "う / みぎ",
        cue: "Makna arah kanan.",
        examples: [
          { word: "右手", meaning: "tangan kanan" },
          { word: "右側", meaning: "sisi kanan" },
        ],
      },
      {
        character: "石",
        meaning: "batu",
        reading: "せき / いし",
        cue: "Makna benda batu.",
        examples: [
          { word: "石", meaning: "batu" },
          { word: "石油", meaning: "minyak bumi" },
        ],
      },
    ],
  },
  {
    id: "power-knife",
    level: "N5",
    title: "力 vs 刀",
    difference: "力 punya kait tenaga; 刀 lebih seperti bilah pisau.",
    mnemonic: "力 menekan seperti otot. 刀 tajam seperti pedang pendek.",
    items: [
      {
        character: "力",
        meaning: "kekuatan",
        reading: "りょく / ちから",
        cue: "Ada rasa dorongan ke bawah.",
        examples: [
          { word: "力", meaning: "kekuatan" },
          { word: "能力", meaning: "kemampuan" },
        ],
      },
      {
        character: "刀",
        meaning: "pedang",
        reading: "とう / かたな",
        cue: "Bentuk seperti bilah.",
        examples: [
          { word: "刀", meaning: "katana" },
          { word: "日本刀", meaning: "pedang Jepang" },
        ],
      },
    ],
  },
  {
    id: "noon-cow",
    level: "N5",
    title: "午 vs 牛",
    difference: "午 tidak menembus garis atas; 牛 punya garis vertikal yang menembus atas.",
    mnemonic: "Sapi 牛 punya tanduk yang naik. Siang 午 lebih rata.",
    items: [
      {
        character: "午",
        meaning: "siang",
        reading: "ご",
        cue: "Garis vertikal tidak menonjol ke atas.",
        examples: [
          { word: "午前", meaning: "pagi / AM" },
          { word: "午後", meaning: "sore / PM" },
        ],
      },
      {
        character: "牛",
        meaning: "sapi",
        reading: "ぎゅう / うし",
        cue: "Garis vertikal menembus atas.",
        examples: [
          { word: "牛肉", meaning: "daging sapi" },
          { word: "牛乳", meaning: "susu" },
        ],
      },
    ],
  },
];

/**
 * Get kanji pair by ID. Fallback to first pair if not found.
 * @param id Pair identifier.
 */
export function getSimilarKanjiPair(id: string) {
  // Find pair by ID. Fallback to index 0 if missing.
  return SIMILAR_KANJI_PAIRS.find((pair) => pair.id === id) || SIMILAR_KANJI_PAIRS[0];
}