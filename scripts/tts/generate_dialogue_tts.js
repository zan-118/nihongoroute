#!/usr/bin/env node

/**
 * @file generate_dialogue_tts.js
 * @description Script untuk batch-generation TTS dengan Irodori-TTS (khusus bahasa Jepang)
 * Fokus: Konsistensi suara per karakter
 */

const fs = require("node:fs");
const path = require("node:path");
const process = require("node:process");
const crypto = require("node:crypto");
const { spawnSync } = require("node:child_process");
const { createClient } = require("@supabase/supabase-js");
const { createClient: createSanityClient } = require("@sanity/client");
const { Client: GradioClient } = require("@gradio/client");

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const FAILURE_LOG_PATH = path.resolve(process.cwd(), "tts_failures.log");

let gradioApp = null;

// ==========================================
// PENCEGAH CRASH GLOBAL (AFK-Safe)
// ==========================================
process.on("unhandledRejection", (reason) => {
  console.error("\n⚠️ [Global Unhandled Rejection]:", reason);
});
process.on("uncaughtException", (error) => {
  console.error("\n⚠️ [Global Uncaught Exception]:", error.message || error);
});

function logFailure(text, voice, errorMsg) {
  const timestamp = new Date().toISOString();
  fs.appendFileSync(
    FAILURE_LOG_PATH,
    `[${timestamp}] [Dialogue] Teks: "${text}" | Voice: ${voice} | Error: ${errorMsg}\n`,
    "utf8",
  );
}

// ==========================================
// VOICE RESOLUTION
// ==========================================
const FEMALE_KEYWORDS = [
  "女",
  "母",
  "姉",
  "妹",
  "奥",
  "彼女",
  "娘",
  "ちゃん",
  "chan",
  "先生",
  "ゆき",
  "はな",
  "さき",
  "あおい",
  "みく",
  "ゆみ",
  "けいこ",
  "みさ",
  "Yuki",
  "Hana",
  "Saki",
  "Aoi",
  "Miku",
  "Yumi",
  "Keiko",
  "Misa",
];
const MALE_KEYWORDS = [
  "男",
  "父",
  "兄",
  "弟",
  "夫",
  "彼",
  "くん",
  "君",
  "kun",
  "たろう",
  "けんじ",
  "ひろし",
  "けん",
  "しんじ",
  "だいち",
  "Taro",
  "Kenji",
  "Hiroshi",
  "Ken",
  "Shinji",
  "Daichi",
];

const femaleVoices = [
  "zundamon",
  "lara",
  "indah",
  "siti",
  "dewi",
  "hayashi",
  "sato",
  "ayu",
  "ritsu",
  "sakura",
  "ani",
];
const maleVoices = [
  "namonashi",
  "dito",
  "budi",
  "suzuki",
  "tanaka",
  "yamada",
  "kimura",
  "andi",
  "faisal",
  "takahashi",
  "kobayashi",
  "ooba",
];
const allVoices = [...femaleVoices, ...maleVoices];

// ==========================================
// 🎯 MAPPING KARAKTER KE VOICE ID
// ==========================================
const CHARACTER_VOICE_MAP = {
  // ===== TOKOH WANITA (10 karakter) =====
  // 1. Indah - Guru Wanita
  indah: "indah",
  インダ: "indah",
  インダハ: "indah",
  inda: "indah",

  // 2. Lala - Siswi SMA
  lala: "lara",
  ララ: "lara",
  らら: "lara",

  // 3. Siti - Teman Sekolah
  siti: "siti",
  シティ: "siti",
  siti: "siti",

  // 4. Dewi - Gadis Kecil
  dewi: "dewi",
  デウィ: "dewi",
  dewi: "dewi",

  // 5. Hayashi - Wanita Karir / Ibu
  hayashi: "hayashi",
  林: "hayashi",
  はやし: "hayashi",

  // 6. Sato - Resepsionis / Pegawai
  sato: "sato",
  佐藤: "sato",
  さとう: "sato",

  // 7. Ayu - Teman Wanita
  ayu: "ayu",
  アユ: "ayu",
  あゆ: "ayu",

  // 8. Ritsu - Wanita Dewasa Misterius
  ritsu: "ritsu",
  リツ: "ritsu",
  りつ: "ritsu",

  // 9. Sakura - Remaja Gadis
  sakura: "sakura",
  さくら: "sakura",
  サクラ: "sakura",

  // 10. Ani - Remaja Gadis Pemalu
  ani: "ani",
  アニ: "ani",
  あに: "ani",
  rara: "ani",
  ラーラ: "ani",
  らーら: "ani",

  // ===== TOKOH PRIA (10 karakter) =====
  // 1. Budi - Guru Pria
  budi: "budi",
  ブディ: "budi",
  budhi: "budi",

  // 2. Dito - Siswa SMA
  dito: "dito",
  ディト: "dito",
  ditho: "dito",

  // 3. Suzuki - Pegawai Stasiun / Kantor
  suzuki: "suzuki",
  鈴木: "suzuki",
  すずき: "suzuki",

  // 4. Tanaka - Ayah / Pria Dewasa
  tanaka: "tanaka",
  田中: "tanaka",
  たなか: "tanaka",

  // 5. Yamada - Kakek
  yamada: "yamada",
  山田: "yamada",
  やまだ: "yamada",

  // 6. Kimura - Pemuda Gaul
  kimura: "kimura",
  木村: "kimura",
  きむら: "kimura",

  // 7. Andi - Pemuda Keren
  andi: "andi",
  アンディ: "andi",
  andhi: "andi",

  // 8. Faisal - Pria Dewasa Kalem
  faisal: "faisal",
  ファイサル: "faisal",
  faizal: "faisal",

  // 9. Takahashi - Pekerja Kantoran Muda
  takahashi: "takahashi",
  高橋: "takahashi",
  たかはし: "takahashi",

  // 10. Kobayashi - Pria Dewasa Serius
  kobayashi: "kobayashi",
  小林: "kobayashi",
  こばやし: "kobayashi",

  // ===== MASKOT =====
  // Zundamon - Maskot Cilik
  zundamon: "zundamon",
  ずんだもん: "zundamon",
  ズンダモン: "zundamon",
};

// ==========================================
// 🎯 VOICE PRESET UNTUK KONSISTENSI
// Berdasarkan karakter yang didefinisikan
// ==========================================

// Struktur tiap caption sengaja dibuat konsisten supaya VoiceDesign gampang
// "mengunci" identitas suara: [usia+gender+peran] → [kepribadian] →
// [kualitas suara: pitch/tempo/timbre] → [nada bicara khas]. Caption yang
// terlalu pendek/generic cenderung menghasilkan suara yang "melayang" dan
// gampang berubah antar generate; detail tempo & timbre di akhir kalimat
// membantu konsistensi itu.
const VOICE_PRESETS = {
  // ===== TOKOH WANITA (10 karakter) =====

  // 1. Indah - Guru Wanita. Tenang, dewasa, formal.
  indah:
    "30代女性、中学校の教師、落ち着きがあり知的、やや低めで丁寧な声、ゆっくりはっきりした話し方、穏やかで安定したトーン",

  // 2. Lala - Siswi SMA. Ceria, ramah.
  lara: "16歳女性、女子高生、明るく元気、少し高めで張りのある声、テンポが速めで弾むような話し方、フレンドリーな笑顔が伝わる声",

  // 3. Siti - Teman Sekolah. Lembut, natural.
  siti: "16歳女性、女子高生、優しく控えめ、柔らかく自然な中音域の声、ゆったりとした話し方、聞き手を安心させる穏やかな声",

  // 4. Dewi - Gadis Kecil. Manja, energetik.
  dewi: "7歳女性、子供、無邪気で甘えん坊、非常に高いかわいい声、早口で跳ねるような話し方、興奮しやすいテンション",

  // 5. Hayashi - Wanita Karir / Ibu. Bijaksana.
  hayashi:
    "35歳女性、母親兼キャリアウーマン、温かく知性的、低めで包み込むような声、ゆっくり落ち着いた話し方、安心感のある包容力",

  // 6. Sato - Resepsionis / Pegawai. Sopan, formal.
  sato: "24歳女性、受付嬢、礼儀正しく几帳面、はっきりとした明瞭な声、標準的なテンポで丁寧な言葉遣い、業務的だが柔らかい印象",

  // 7. Ayu - Teman Wanita. Modern, santai.
  ayu: "22歳女性、現代的な友人、カジュアルで自然体、軽やかな中音域の声、リラックスした話し方、飾らない親しみやすいトーン",

  // 8. Ritsu - Wanita Dewasa. Misterius, bernada khas.
  ritsu:
    "27歳女性、神秘的な雰囲気、クールで独特、低めで艶のある声、ゆっくり間を置く話し方、感情を抑えた落ち着いたトーン",

  // 9. Sakura - Remaja Gadis. Baik hati.
  sakura:
    "15歳女性、優しい少女、思いやりがあり純粋、透明感のある高めの声、穏やかで丁寧な話し方、柔らかく澄んだトーン",

  // 10. Ani - Remaja Gadis. Pemalu, santun.
  ani: "15歳女性、恥ずかしがり屋、内気で控えめ、小さめで震えがちな声、ゆっくりとためらいがちな話し方、礼儀正しく遠慮気味なトーン",

  // ===== TOKOH PRIA (10 karakter) =====

  // 1. Budi - Guru Pria. Berwibawa.
  budi: "45歳男性、高校の教師、威厳があり落ち着いている、低く響く声、ゆっくりはっきりした話し方、安定感のある権威的なトーン",

  // 2. Dito - Siswa SMA. Kalem, kasual.
  dito: "17歳男性、高校生、穏やかでカジュアル、自然な中音域の声、標準的なテンポで飾らない話し方、リラックスした友好的なトーン",

  // 3. Suzuki - Pegawai Stasiun / Kantor. Tegas, formal.
  suzuki:
    "32歳男性、駅員、几帳面で業務的、はっきりとした張りのある声、テキパキとした話し方、礼儀正しく事務的なトーン",

  // 4. Tanaka - Ayah / Pria Dewasa. Tenang, berat.
  tanaka:
    "45歳男性、父親、落ち着いていて頼りがいがある、低く重みのある声、ゆっくりとした話し方、安定感のある温かいトーン",

  // 5. Yamada - Kakek. Ramah, berat, serak.
  yamada:
    "72歳男性、祖父、優しく穏やか、低くやや掠れた声、非常にゆっくりとした話し方、慈しみ深い温かいトーン",

  // 6. Kimura - Pemuda Gaul. Santai, energetik.
  kimura:
    "23歳男性、元気な若者、軽快でノリがいい、明るめの中音域の声、早口気味でテンポの良い話し方、カジュアルで陽気なトーン",

  // 7. Andi - Pemuda Keren. Suara khas, dramatis & penuh semangat.
  andi: "24歳男性、情熱的な青年、ドラマチックで自信家、はっきりと通る声、抑揚の効いた話し方、熱のこもった力強いトーン",

  // 8. Faisal - Pria Dewasa Kalem. Tenang, bijaksana.
  faisal:
    "34歳男性、知的で落ち着いた性格、低めで安心感のある声、ゆったりとした話し方、思慮深く穏やかなトーン",

  // 9. Takahashi - Pekerja Kantoran Muda. Sopan, ramah.
  takahashi:
    "26歳男性、若手会社員、礼儀正しく爽やか、明瞭な中音域の声、標準的なテンポで丁寧な話し方、親しみやすいビジネストーン",

  // 10. Kobayashi - Pria Dewasa. Suara serius, dalam, berwibawa.
  kobayashi:
    "42歳男性、真面目で威厳がある、深く低い声、ゆっくりと重みのある話し方、堂々とした真剣なトーン",

  // ===== MASKOT =====

  // Zundamon - Maskot Cilik. Kekanak-kanakan, nada sangat tinggi.
  zundamon:
    "マスコットキャラクター、子供っぽく無邪気、非常に高くかわいい声、早口で弾むような話し方、元気いっぱいの明るいトーン",
};

// Default fallback — tetap ikut struktur yang sama biar gak keluar dari
// "kerangka" suara yang lain kalau ada voice baru yang belum di-preset.
const DEFAULT_FEMALE =
  "成人女性、自然な話し方、聞き取りやすい標準的な声、落ち着いたテンポ";
const DEFAULT_MALE =
  "成人男性、自然な話し方、聞き取りやすい標準的な声、落ち着いたテンポ";

function buildVoicePrompt(voice) {
  const isFemale = femaleVoices.includes(voice);
  const preset = VOICE_PRESETS[voice];

  if (preset) return preset;
  return isFemale ? DEFAULT_FEMALE : DEFAULT_MALE;
}

// ==========================================
// VOICE DETECTION
// ==========================================

function detectVoice(speaker, fallbackIndex = 0) {
  if (!speaker || speaker === "???" || speaker.trim() === "") {
    return allVoices[fallbackIndex % allVoices.length];
  }

  const cleanSpeaker = speaker
    .replace(/[- ]?(さん|くん|ちゃん|様|君|sama|san|kun|chan)$/i, "")
    .trim()
    .toLowerCase();

  // Cek di mapping karakter dulu
  if (CHARACTER_VOICE_MAP[cleanSpeaker]) {
    return CHARACTER_VOICE_MAP[cleanSpeaker];
  }

  // Cek di voice list
  if (allVoices.includes(cleanSpeaker)) {
    return cleanSpeaker;
  }

  const speakerLowerOriginal = speaker.toLowerCase().trim();
  let preDetectedGender = null;

  if (
    speakerLowerOriginal.endsWith("ちゃん") ||
    speakerLowerOriginal.endsWith("chan")
  ) {
    preDetectedGender = "female";
  } else if (
    speakerLowerOriginal.endsWith("くん") ||
    speakerLowerOriginal.endsWith("kun") ||
    speakerLowerOriginal.endsWith("君")
  ) {
    preDetectedGender = "male";
  }

  let hash = 0;
  for (let i = 0; i < cleanSpeaker.length; i++) {
    hash = cleanSpeaker.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash);

  if (preDetectedGender === "female")
    return femaleVoices[index % femaleVoices.length];
  if (preDetectedGender === "male")
    return maleVoices[index % maleVoices.length];

  const EXACT_FEMALE = [
    "ayu",
    "siti",
    "dewi",
    "ani",
    "indah",
    "sakura",
    "lara",
    "sato",
    "hayashi",
    "ritsu",
  ];
  const EXACT_MALE = [
    "budi",
    "faisal",
    "andi",
    "dito",
    "adit",
    "ken",
    "suzuki",
    "tanaka",
    "yamada",
    "kimura",
    "takahashi",
    "kobayashi",
  ];

  if (EXACT_FEMALE.includes(cleanSpeaker))
    return femaleVoices[index % femaleVoices.length];
  if (EXACT_MALE.includes(cleanSpeaker))
    return maleVoices[index % maleVoices.length];

  const isFemale = FEMALE_KEYWORDS.some((k) => cleanSpeaker.includes(k));
  const isMale = MALE_KEYWORDS.some((k) => cleanSpeaker.includes(k));

  if (isFemale && !isMale) return femaleVoices[index % femaleVoices.length];
  if (isMale && !isFemale) return maleVoices[index % maleVoices.length];

  return allVoices[index % allVoices.length];
}

// ==========================================
// UTILITY FUNCTIONS
// ==========================================

function printUsage() {
  console.log(
    [
      "=== NIHONGOROUTE BATCH TTS GENERATOR (IRODORI-COLAB) ===",
      "Penggunaan:",
      "  node scripts/tts/generate_dialogue_tts.js [options]",
      "",
      "Opsi:",
      "  --execute          Jalankan pemrosesan nyata (Default: Dry Run).",
      "  --limit <num>      Batasi jumlah audio baru. Default: Unlimited",
      "  --level <lvl>      Filter level JLPT (N5, N4, N3, N2, N1).",
      "  --lesson <num>     Filter berdasarkan nomor order lesson.",
      "  --listening <term> Filter berdasarkan slug/title listening.",
      "  --type <type>      Filter tipe konten (lesson / listening).",
      "  --force            Paksa proses ulang meskipun sudah di-cache.",
      "  --no-emoji         Matikan auto-emoji styling (default: aktif).",
      "  --help, -h         Tampilkan bantuan ini.",
      "",
      "Mode Audisi Suara (cari seed terbaik per karakter):",
      "  --audition <voice>       Generate beberapa kandidat seed untuk 1 karakter.",
      "  --audition all           Audisi SEMUA karakter sekaligus (satu per satu, otomatis).",
      "  --candidates <num>       Jumlah kandidat seed per karakter. Default: 5",
      '  --audition-text "..."    Kalimat contoh custom. Default: kalimat netral bawaan.',
      "  Contoh: node scripts/tts/generate_dialogue_tts.js --audition budi --candidates 8",
      "  Contoh: node scripts/tts/generate_dialogue_tts.js --audition all --candidates 3",
      "  Hasil disimpan lokal di ./audition_output/{voice}/, gak masuk Supabase.",
      "  Kalau udah nemu seed favorit, kunci di MANUAL_SEED_OVERRIDES di dalam script.",
    ].join("\n"),
  );
}

function loadEnvFile() {
  const envPath = path.resolve(process.cwd(), ".env.local");
  if (!fs.existsSync(envPath)) return;
  const lines = fs.readFileSync(envPath, "utf8").split(/\r?\n/);
  lines.forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) return;
    const separatorIndex = trimmed.indexOf("=");
    if (separatorIndex === -1) return;
    const key = trimmed.slice(0, separatorIndex).trim();
    const rawValue = trimmed.slice(separatorIndex + 1).trim();
    if (!key || process.env[key] !== undefined) return;
    process.env[key] = rawValue.replace(/^['"]|['"]$/g, "");
  });
}

function parseArgs(args) {
  const options = {
    execute: false,
    limit: Infinity,
    level: null,
    lessonNum: null,
    listeningQuery: null,
    type: null,
    force: false,
    audition: null,
    candidates: 5,
    auditionText: null,
    noEmoji: false,
  };

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (arg === "--help" || arg === "-h") {
      printUsage();
      process.exit(0);
    }
    if (arg === "--execute") {
      options.execute = true;
      continue;
    }
    if (arg === "--limit") {
      options.limit = Number.parseInt(args[index + 1], 10) || Infinity;
      index += 1;
      continue;
    }
    if (arg === "--level") {
      options.level = args[index + 1]?.trim().toUpperCase();
      index += 1;
      continue;
    }
    if (arg === "--lesson") {
      const val = args[index + 1]?.trim();
      options.lessonNum = /^\d+$/.test(val) ? Number.parseInt(val, 10) : null;
      index += 1;
      continue;
    }
    if (arg === "--listening") {
      options.listeningQuery = args[index + 1]?.trim();
      index += 1;
      continue;
    }
    if (arg === "--type") {
      options.type = args[index + 1]?.trim().toLowerCase();
      index += 1;
      continue;
    }
    if (arg === "--force") {
      options.force = true;
      continue;
    }
    if (arg === "--no-emoji") {
      options.noEmoji = true;
      continue;
    }
    if (arg === "--audition") {
      options.audition = args[index + 1]?.trim();
      index += 1;
      continue;
    }
    if (arg === "--candidates") {
      options.candidates = Number.parseInt(args[index + 1], 10) || 5;
      index += 1;
      continue;
    }
    if (arg === "--audition-text") {
      options.auditionText = args[index + 1];
      index += 1;
      continue;
    }
  }

  return options;
}

function convertWavToMp3(wavBuffer) {
  const result = spawnSync(
    "ffmpeg",
    [
      "-i",
      "pipe:0",
      "-f",
      "mp3",
      "-acodec",
      "libmp3lame",
      "-ab",
      "128k",
      "pipe:1",
    ],
    { input: wavBuffer, maxBuffer: 15 * 1024 * 1024 },
  );

  if (result.status !== 0) {
    const err = result.stderr ? result.stderr.toString() : "Ffmpeg error";
    throw new Error(`Ffmpeg conversion failed: ${err}`);
  }

  return result.stdout;
}

// ==========================================
// 🎯 SEED UNTUK KONSISTENSI SUARA
// ==========================================

function generateConsistentSeed(voice) {
  // PENTING: seed HANYA dari nama voice, bukan dari teks kalimat.
  // Kalau teks ikut campur ke hash, tiap kalimat beda bakal dapet seed beda,
  // dan karena mode VoiceDesign gak pakai reference audio, seed itulah yang
  // menentukan identitas suara virtual -- hasilnya karakter yang sama bisa
  // kedengeran kontras banget antar kalimat kalau seed-nya ikut berubah.
  let hash = 0;
  for (let i = 0; i < voice.length; i++) {
    const char = voice.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash) % 2147483647; // Max int32
}

// ==========================================
// 🎯 OVERRIDE SEED MANUAL
// Kalau seed hasil hash-otomatis kedengeran kurang pas buat karakter
// tertentu (misal setelah sesi audisi via --audition), kunci di sini.
// Isi angkanya dari hasil "🎯 Seed:" yang dicetak pas audisi.
// ==========================================
const MANUAL_SEED_OVERRIDES = {
  // indah: 123456789,
  // budi: 987654321,
};

function resolveSeed(voice) {
  if (MANUAL_SEED_OVERRIDES[voice] !== undefined) {
    return MANUAL_SEED_OVERRIDES[voice];
  }
  return generateConsistentSeed(voice);
}

// ==========================================
// 🎭 EMOJI STYLE CONTROL (Irodori-TTS VoiceDesign)
// Model ini bisa dikontrol lewat emoji yang disisipkan di teks (bukan di
// caption). Referensi resmi dari model card (Aratako/Irodori-TTS-600M-v3-
// VoiceDesign), disederhanakan jadi tabel dipilih yang relevan buat dialog
// belajar bahasa (netral, gak yang NSFW/moaning dkk):
//
//   👂 bisikan/dekat telinga   😮‍💨 helaan napas/menghela   ⏸️ jeda/diam
//   🤭 tertawa kecil/cekikikan  😏 menggoda/manja           🥺 suara bergetar/ragu
//   😮 menahan napas/kaget      🫶 lembut                    😭 isak/sedih
//   😱 teriak/jeritan           😪 mengantuk/lesu            😴 ngigau/mendengkur
//   ⏩ bicara cepat/terburu²    📞 lewat telepon             🐢 pelan-pelan
//   😰 panik/gugup/gagap        😆 gembira                   💥 penuh tenaga
//   😠 marah/kesal/ngambek      😲 terkejut/takjub           🥱 menguap
//   😖 kesakitan/menderita      😟 khawatir                  🫣 malu²
//   🙄 kesal/eneg               😊 senang/ceria               😎 pede/sombong
//   👌 menyahut/mengangguk      🙏 memohon                    😌 lega/puas
//   🤔 bertanya²/ragu           💪 dengan tenaga              🎵 bersenandung
//   😌 tenang/lega               📖 narasi/monolog
//
// Emoji bisa diulang untuk menguatkan efeknya (mis. 😭😭 = tangisan lebih
// kuat). Fungsi di bawah cuma heuristik RINGAN berbasis tanda baca & kata
// kunci yang sering muncul di teks pelajaran/dialog Jepang -- niatnya
// nambah sedikit ekspresi otomatis, BUKAN pengganti anotasi emosi manual.
// Kalau sumber dialog sudah/nanti punya field emosi eksplisit, sambungkan
// lewat parameter `emotionHint` di enrichSpeechText().
// ==========================================

const EMOTION_EMOJI_RULES = [
  // [regex, emoji, posisi] — posisi "before" | "after"
  {
    pattern: /[！!]{2,}|[？?][！!]|[！!][？?]/,
    emoji: "😲",
    position: "before",
  }, // terkejut/takjub
  { pattern: /[！!]{1}$/, emoji: "💥", position: "before" }, // tegas/penuh tenaga
  {
    pattern: /(笑|ふふ|うふふ|えへへ|くすくす)/,
    emoji: "🤭",
    position: "before",
  }, // tertawa kecil
  { pattern: /(はぁ|ふぅ|やれやれ|ため息)/, emoji: "😮‍💨", position: "before" }, // helaan napas
  {
    pattern: /(え[…、]|えっ|うそ[…、]|まさか)/,
    emoji: "😮",
    position: "before",
  }, // menahan napas/kaget
  {
    pattern: /(ごめん(なさい)?|お願いします|お願い[…、])/,
    emoji: "🙏",
    position: "before",
  }, // memohon
  { pattern: /(うれし|楽し|やった)/, emoji: "😊", position: "before" }, // senang
  { pattern: /(心配|大丈夫かな|不安)/, emoji: "😟", position: "before" }, // khawatir
  { pattern: /…$|\.{3,}$|、、、$/, emoji: "⏸️", position: "after" }, // jeda/menggantung
];

function enrichSpeechText(text, emotionHint = null) {
  if (!text) return text;
  let result = text;

  // Kalau ada hint emosi eksplisit (mis. dari field data), pakai itu dulu.
  const HINT_MAP = {
    senang: "😊",
    sedih: "😭",
    marah: "😠",
    kaget: "😲",
    takut: "😱",
    bisik: "👂",
    ragu: "🥺",
    ngantuk: "😪",
    lega: "😌",
    narasi: "📖",
  };
  if (emotionHint && HINT_MAP[emotionHint]) {
    return `${HINT_MAP[emotionHint]}${result}`;
  }

  // Heuristik ringan berbasis pola teks. Cukup terapkan aturan PERTAMA yang
  // cocok supaya gak numpuk banyak emoji dan bikin caption jadi berisik.
  for (const rule of EMOTION_EMOJI_RULES) {
    if (rule.pattern.test(result)) {
      result =
        rule.position === "before"
          ? `${rule.emoji}${result}`
          : `${result}${rule.emoji}`;
      break;
    }
  }

  return result;
}

// ==========================================
// IRODORI TTS INTEGRATION
// ==========================================

const IRODORI_CHECKPOINT =
  process.env.IRODORI_CHECKPOINT || "Aratako/Irodori-TTS-600M-v3-VoiceDesign";

async function queryIrodoriTtsWithRetry(
  gradioApp,
  baseApiUrl,
  text,
  voice,
  retries = 3,
  initialDelay = 2000,
  seedOverride = null,
) {
  let delay = initialDelay;
  const stylePrompt = buildVoicePrompt(voice);

  // 🎯 Seed konsisten per karakter (bukan per kalimat!), atau pakai
  // seedOverride kalau dipanggil dari mode audisi.
  const seedValue = seedOverride ?? resolveSeed(voice);

  for (let attempt = 1; attempt <= retries; attempt += 1) {
    try {
      console.log(`   🎯 Seed: ${seedValue} | Voice: ${voice}`);
      console.log(`   📝 Caption: ${stylePrompt}`);

      const result = await gradioApp.predict("/_run_generation", {
        checkpoint: IRODORI_CHECKPOINT,
        model_device: "cuda",
        model_precision: "fp32",
        codec_device: "cuda",
        codec_precision: "fp32",
        text: text, // Teks harus dalam bahasa Jepang!
        caption: stylePrompt,
        ref_wav: null,
        num_steps: 40,
        num_candidates: 1,
        seed_raw: seedValue.toString(), // 🎯 PAKAI SEED
        seconds_raw: "",
        duration_scale: 1,
        t_schedule_mode: "linear",
        sway_coeff: -1,
        cfg_guidance_mode: "independent",
        cfg_scale_text: 3,
        cfg_scale_caption: 4,
        cfg_scale_speaker: 5,
        cfg_scale_raw: "",
        cfg_min_t: 0.5,
        cfg_max_t: 1,
        context_kv_cache: true,
        speaker_kv_scale_raw: "",
        max_text_len_raw: "",
        max_caption_len_raw: "",
        truncation_factor_raw: "",
        rescale_k_raw: "",
        rescale_sigma_raw: "",
        lora_adapter_raw: "",
      });

      const rawSlot = result.data ? result.data[0] : null;
      const audioData =
        rawSlot && typeof rawSlot === "object" && "value" in rawSlot
          ? rawSlot.value
          : rawSlot;

      let fileUrl = audioData?.url || null;
      if (!fileUrl && audioData?.path) {
        const cleanBase = baseApiUrl.replace(/\/$/, "");
        fileUrl = `${cleanBase}/file=${encodeURI(audioData.path)}`;
      }

      if (!fileUrl) {
        const runLog = result.data ? result.data[32] : null;
        console.warn("   🔎 Debug audioData:", JSON.stringify(audioData));
        throw new Error(
          `Tidak ada audio dihasilkan. Run Log: ${runLog || "(kosong)"}`,
        );
      }

      const fileResponse = await fetch(fileUrl);
      if (!fileResponse.ok) {
        throw new Error(`Gagal mengunduh WAV: ${fileResponse.statusText}`);
      }

      const arrayBuffer = await fileResponse.arrayBuffer();
      return Buffer.from(arrayBuffer);
    } catch (err) {
      if (attempt === retries) throw err;
      console.warn(
        `   ⚠️ Attempt ${attempt}/${retries} gagal: ${err.message}. Retry...`,
      );
      await sleep(delay);
      delay *= 2;
    }
  }
}

// ==========================================
// 🎯 MODE AUDISI: cari seed terbaik per karakter
// ==========================================
const DEFAULT_AUDITION_TEXT =
  "こんにちは、はじめまして。今日はいい天気ですね。よろしくお願いします。";

async function runAudition(
  gradioApp,
  baseApiUrl,
  voice,
  candidateCount,
  customText,
) {
  if (!allVoices.includes(voice)) {
    console.error(`❌ Voice "${voice}" tidak dikenal.`);
    console.log(`💡 Voice yang tersedia:\n   ${allVoices.join(", ")}`);
    process.exit(1);
  }

  const text = customText || DEFAULT_AUDITION_TEXT;
  const outDir = path.resolve(process.cwd(), "audition_output", voice);
  fs.mkdirSync(outDir, { recursive: true });

  console.log(`\n🎧 Mode Audisi: "${voice}"`);
  console.log(`📝 Kalimat contoh: ${text}`);
  console.log(`🎯 Style/caption: ${buildVoicePrompt(voice)}`);
  console.log(`🔢 Jumlah kandidat: ${candidateCount}\n`);

  const baseSeed = generateConsistentSeed(voice);

  for (let i = 0; i < candidateCount; i += 1) {
    // Kandidat ke-0 pakai seed hash asli (baseline), sisanya offset
    // supaya tetap deterministik/reproducible tiap kali audisi diulang.
    const candidateSeed = i === 0 ? baseSeed : baseSeed + i * 97;
    try {
      console.log(`[${i + 1}/${candidateCount}] Seed: ${candidateSeed}...`);
      const rawWavBuffer = await queryIrodoriTtsWithRetry(
        gradioApp,
        baseApiUrl,
        text,
        voice,
        3,
        2000,
        candidateSeed,
      );
      const audioBuffer = convertWavToMp3(rawWavBuffer);
      const filename = path.join(outDir, `seed${candidateSeed}.mp3`);
      fs.writeFileSync(filename, audioBuffer);
      console.log(`   ✅ Tersimpan: ${filename}`);
      await sleep(1000);
    } catch (err) {
      console.error(
        `   ❌ Kandidat seed ${candidateSeed} gagal: ${err.message}`,
      );
    }
  }

  console.log(
    `\n🎉 Audisi selesai! Dengerin file-file di ${outDir}, lalu kunci seed favoritmu di MANUAL_SEED_OVERRIDES.`,
  );
}

// ==========================================
// PROCESS TTS ITEM
// ==========================================

async function processTtsItem(
  supabase,
  gradioApp,
  baseApiUrl,
  text,
  voice,
  rate = "medium",
  folder = "",
  ttsText = null,
  useEmoji = true,
) {
  const cacheId = crypto
    .createHash("md5")
    .update(`${text}_${voice}_${rate}`)
    .digest("hex");

  const filename = folder ? `${folder}/${cacheId}.mp3` : `${cacheId}.mp3`;
  const BUCKET_NAME = "tts-cache";
  const baseSpeechText = ttsText || text;
  const speechText = useEmoji
    ? enrichSpeechText(baseSpeechText)
    : baseSpeechText;

  // Pastikan teks dalam bahasa Jepang
  if (!/[\u3040-\u30FF\u4E00-\u9FFF]/.test(speechText)) {
    console.warn(
      `   ⚠️ Teks mungkin bukan bahasa Jepang: "${speechText.slice(0, 30)}..."`,
    );
  }

  const rawWavBuffer = await queryIrodoriTtsWithRetry(
    gradioApp,
    baseApiUrl,
    speechText,
    voice,
  );

  console.log(`   └─ Konversi WAV → MP3...`);
  const audioBuffer = convertWavToMp3(rawWavBuffer);

  const { error: uploadError } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(filename, audioBuffer, {
      contentType: "audio/mpeg",
      upsert: true,
    });

  if (uploadError)
    throw new Error(`Upload storage gagal: ${uploadError.message}`);

  const publicUrl = supabase.storage.from(BUCKET_NAME).getPublicUrl(filename)
    .data.publicUrl;

  const { error: dbError } = await supabase.from("tts_cache").upsert({
    id: cacheId,
    text,
    voice,
    rate,
    audio_url: publicUrl,
  });

  if (dbError) throw new Error(`Registrasi DB gagal: ${dbError.message}`);

  return publicUrl;
}

// ==========================================
// MAIN
// ==========================================

async function main() {
  loadEnvFile();
  const options = parseArgs(process.argv.slice(2));

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const irodoriApiUrl = process.env.IRODORI_API_URL;

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error("❌ Supabase credentials required!");
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  const sanityClient = createSanityClient({
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
    useCdn: false,
    apiVersion: "2024-03-11",
  });

  if (options.execute || options.audition) {
    if (!irodoriApiUrl) {
      console.error("❌ IRODORI_API_URL not found!");
      process.exit(1);
    }
    try {
      console.log(`🔗 Connecting to Irodori-TTS: ${irodoriApiUrl}`);
      gradioApp = await GradioClient.connect(irodoriApiUrl);
      console.log("✅ Connected!");
    } catch (err) {
      console.error("❌ Connection failed:", err.message);
      process.exit(1);
    }
  }

  if (options.audition === "all") {
    console.log(
      `\n🎧 Audisi SEMUA karakter (${allVoices.length} voice) — ${options.candidates} kandidat masing-masing.`,
    );
    console.log(
      `⏱️  Estimasi total: ~${allVoices.length * options.candidates} kali generate, bisa makan waktu cukup lama.\n`,
    );
    for (const v of allVoices) {
      await runAudition(
        gradioApp,
        irodoriApiUrl,
        v,
        options.candidates,
        options.auditionText,
      );
    }
    console.log(
      `\n🎉🎉 Audisi semua karakter selesai! Cek folder ./audition_output/{nama_voice}/ satu-satu.`,
    );
    process.exit(0);
  }

  if (options.audition) {
    await runAudition(
      gradioApp,
      irodoriApiUrl,
      options.audition,
      options.candidates,
      options.auditionText,
    );
    process.exit(0);
  }

  try {
    const itemsToProcess = [];

    const addItem = (kanjiText, ttsText, voice, folder = "") => {
      if (!kanjiText) return;
      const cleanKanji = kanjiText.trim();
      if (!cleanKanji) return;
      const cleanTts = (ttsText || kanjiText).trim();
      const exists = itemsToProcess.some(
        (i) => i.text === cleanKanji && i.voice === voice,
      );
      if (!exists) {
        itemsToProcess.push({
          text: cleanKanji,
          furigana: cleanTts,
          voice,
          folder,
        });
      }
    };

    const processContentBlocks = (blocks, folder = "") => {
      if (!Array.isArray(blocks)) return;
      blocks.forEach((block) => {
        const type = block.type || block._type;
        if (
          (type === "dialogue" || type === "dialogueBlock") &&
          block.content
        ) {
          const kanjiLines = block.content.split("\n").filter(Boolean);
          const furiganaLines = (block.furigana || block.content)
            .split("\n")
            .filter(Boolean);
          const total = Math.min(kanjiLines.length, furiganaLines.length);
          for (let i = 0; i < total; i++) {
            const kanjiLine = kanjiLines[i];
            const furiganaLine = furiganaLines[i];
            const kanjiParts = kanjiLine.split(/[：:]/);
            const furiganaParts = furiganaLine.split(/[：:]/);
            const rawSpeaker =
              kanjiParts.length > 1 ? kanjiParts[0].trim() : undefined;
            const kanjiText =
              kanjiParts.length > 1
                ? kanjiParts.slice(1).join("：").trim()
                : kanjiLine.trim();
            const ttsText =
              furiganaParts.length > 1
                ? furiganaParts.slice(1).join("：").trim()
                : furiganaLine.trim();
            const voice = detectVoice(rawSpeaker, i);
            addItem(kanjiText, ttsText, voice, folder);
          }
        }
      });
    };

    // 1. Lessons dari Supabase
    if (options.type !== "listening") {
      console.log("🔍 [1/3] Fetching lessons from Supabase...");
      let sbQuery = supabase
        .from("lessons")
        .select("content_blocks, slug, order_number");
      if (options.level)
        sbQuery = sbQuery.like("slug", `${options.level.toLowerCase()}-%`);
      if (options.lessonNum !== null)
        sbQuery = sbQuery.eq("order_number", options.lessonNum);
      const { data: supabaseLessons } = await sbQuery;
      if (supabaseLessons) {
        supabaseLessons.forEach((row) =>
          processContentBlocks(row.content_blocks, `lessons/${row.slug}`),
        );
      }
    }

    // 2. Listening dari Sanity
    if (options.type !== "lesson" && options.lessonNum === null) {
      try {
        console.log("🔍 [2/3] Fetching listeningMaterial from Sanity...");
        let lmQuery = '*[_type == "listeningMaterial"]';
        const filters = [];
        if (options.level)
          filters.push(
            `(level == "${options.level}" || jlpt_level == "${options.level}")`,
          );
        if (options.listeningQuery)
          filters.push(
            `(slug.current match "*${options.listeningQuery}*" || title match "*${options.listeningQuery}*")`,
          );
        if (filters.length > 0)
          lmQuery = `*[_type == "listeningMaterial" && ${filters.join(" && ")}]`;
        const listeningMaterials = await sanityClient.fetch(
          `${lmQuery} { body, slug }`,
        );
        if (Array.isArray(listeningMaterials)) {
          listeningMaterials.forEach((row) => {
            if (!row.body) return;
            const lines = row.body.split("\n").filter(Boolean);
            lines.forEach((line, i) => {
              const parts = line.split(/[：:]/);
              const rawSpeaker = parts.length > 1 ? parts[0].trim() : undefined;
              const lineText =
                parts.length > 1
                  ? parts.slice(1).join("：").trim()
                  : line.trim();
              const voice = detectVoice(rawSpeaker, i);
              addItem(
                lineText,
                null, // belum ada data furigana untuk listeningMaterial
                voice,
                `listening/${row.slug?.current || "unknown"}`,
              );
            });
          });
        }
      } catch (err) {
        console.warn("⚠️ Sanity skip:", err.message);
      }
    }

    console.log(`📊 Total unique items: ${itemsToProcess.length}`);

    // 3. Check cache
    console.log("🔍 [3/3] Checking cache...");
    const missingItems = [];
    const existingCacheIds = new Set();
    let dbHasMore = true;
    let dbPage = 0;
    const dbLimit = 1000;

    while (dbHasMore) {
      const { data: rows, error: dbErr } = await supabase
        .from("tts_cache")
        .select("id")
        .range(dbPage * dbLimit, (dbPage + 1) * dbLimit - 1);
      if (dbErr) throw dbErr;
      if (!rows || rows.length === 0) {
        dbHasMore = false;
      } else {
        rows.forEach((r) => existingCacheIds.add(r.id));
        dbPage += 1;
        if (rows.length < dbLimit) dbHasMore = false;
      }
    }

    if (!options.force) {
      itemsToProcess.forEach((item) => {
        const cacheId = crypto
          .createHash("md5")
          .update(`${item.text}_${item.voice}_medium`)
          .digest("hex");
        if (!existingCacheIds.has(cacheId)) missingItems.push(item);
      });
    } else {
      console.log("⚠️ Force mode: regenerating all items");
      missingItems.push(...itemsToProcess);
    }

    console.log(`📈 Items to process: ${missingItems.length}`);

    if (missingItems.length === 0) {
      console.log("✅ All cached!");
      process.exit(0);
    }

    if (!options.execute) {
      console.log(`\n📋 [Dry Run] First 10 items:`);
      missingItems.slice(0, 10).forEach((item, idx) => {
        console.log(
          `   ${idx + 1}. [${item.voice}] "${item.text.slice(0, 50)}..."`,
        );
      });
      console.log(`\n💡 Run with --execute to generate.`);
      process.exit(0);
    }

    const targetItems = missingItems.slice(0, options.limit);
    console.log(`\n🚀 Generating ${targetItems.length} items...`);

    let successCount = 0;
    let consecutiveFailures = 0;

    for (let idx = 0; idx < targetItems.length; idx += 1) {
      const item = targetItems[idx];
      try {
        console.log(
          `\n[${idx + 1}/${targetItems.length}] "${item.text.slice(0, 40)}..." [${item.voice}]`,
        );
        await processTtsItem(
          supabase,
          gradioApp,
          irodoriApiUrl,
          item.text,
          item.voice,
          "medium",
          item.folder,
          item.furigana,
          !options.noEmoji,
        );
        successCount += 1;
        consecutiveFailures = 0;
        await sleep(1000);
      } catch (err) {
        console.error(`❌ Failed:`, err.message);
        logFailure(item.text, item.voice, err.message);
        consecutiveFailures += 1;
        if (consecutiveFailures >= 5) {
          console.warn("⚠️ 5 consecutive failures. Cooling down 15s...");
          await sleep(15000);
          consecutiveFailures = 0;
        } else {
          await sleep(3000);
        }
      }
    }

    console.log(`\n🎉 Done! ${successCount}/${targetItems.length} successful.`);
    if (successCount < targetItems.length) {
      console.log(`💡 Failures logged to: ${FAILURE_LOG_PATH}`);
    }
    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error.message || error);
    process.exit(1);
  }
}

main();
