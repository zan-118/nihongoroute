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
  "rara",
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

  // 10. Rara - Remaja Gadis Pemalu
  rara: "rara",
  ララ: "rara",
  らら: "rara",

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

const VOICE_PRESETS = {
  // ===== TOKOH WANITA (10 karakter) =====

  // 1. Indah - Guru Wanita. Tenang, dewasa, formal.
  indah: "30代女性、教師、落ち着いた、丁寧な声、大人っぽい",

  // 2. Lala - Siswi SMA. Ceria, ramah.
  lara: "10代女性、高校生、明るい、元気な声、フレンドリー",

  // 3. Siti - Teman Sekolah. Lembut, natural.
  siti: "10代女性、高校生、優しい、自然な声、柔らかい",

  // 4. Dewi - Gadis Kecil. Manja, energetik.
  dewi: "子供、女性、元気いっぱい、高い声、甘えん坊",

  // 5. Hayashi - Wanita Karir / Ibu. Bijaksana.
  hayashi: "30代女性、母親、温かい、知性的な声、落ち着いた",

  // 6. Sato - Resepsionis / Pegawai. Sopan, formal.
  sato: "20代女性、受付嬢、丁寧な声、はっきりした、礼儀正しい",

  // 7. Ayu - Teman Wanita. Modern, santai.
  ayu: "20代女性、現代的な、カジュアルな声、自然体",

  // 8. Ritsu - Wanita Dewasa. Misterius, bernada khas.
  ritsu: "20代女性、神秘的、独特な雰囲気、落ち着いた声",

  // 9. Sakura - Remaja Gadis. Baik hati.
  sakura: "10代女性、優しい、透明感のある声、思いやりがある",

  // 10. Rara - Remaja Gadis. Pemalu, santun.
  rara: "10代女性、恥ずかしがり屋、控えめな声、礼儀正しい",

  // ===== TOKOH PRIA (10 karakter) =====

  // 1. Budi - Guru Pria. Berwibawa.
  budi: "40代男性、教師、低い声、威厳がある、落ち着いた",

  // 2. Dito - Siswa SMA. Kalem, kasual.
  dito: "10代男性、高校生、穏やかな声、自然な話し方",

  // 3. Suzuki - Pegawai Stasiun / Kantor. Tegas, formal.
  suzuki: "30代男性、駅員、はっきりした声、業務的、丁寧",

  // 4. Tanaka - Ayah / Pria Dewasa. Tenang, berat.
  tanaka: "40代男性、父親、低く落ち着いた声、ゆっくり話す",

  // 5. Yamada - Kakek. Ramah, berat, serak.
  yamada: "70代男性、おじいさん、優しい、少し掠れた声、ゆっくり",

  // 6. Kimura - Pemuda Gaul. Santai, energetik.
  kimura: "20代男性、元気な若者、軽い感じ、早口気味",

  // 7. Andi - Pemuda Keren. Suara khas, dramatis & penuh semangat.
  andi: "20代男性、情熱的な、はっきりした声、ドラマチック",

  // 8. Faisal - Pria Dewasa Kalem. Tenang, bijaksana.
  faisal: "30代男性、知的で落ち着いた、安心感のある声",

  // 9. Takahashi - Pekerja Kantoran Muda. Sopan, ramah.
  takahashi: "20代男性、会社員、爽やかな声、礼儀正しい",

  // 10. Kobayashi - Pria Dewasa. Suara serius, dalam, berwibawa.
  kobayashi: "40代男性、深い低音、真面目で威厳がある、堂々とした",

  // ===== MASKOT =====

  // Zundamon - Maskot Cilik. Kekanak-kanakan, nada sangat tinggi.
  zundamon: "子供、マスコット、とても高い声、可愛い、元気いっぱい",
};

// Default fallback
const DEFAULT_FEMALE = "女性、自然な声、聞き取りやすい";
const DEFAULT_MALE = "男性、自然な声、聞き取りやすい";

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
    "rara",
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
      "  --help, -h         Tampilkan bantuan ini.",
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

function generateConsistentSeed(voice, text) {
  // Kombinasi voice + text untuk seed yang konsisten
  const combined = `${voice}_${text.slice(0, 30)}`;
  let hash = 0;
  for (let i = 0; i < combined.length; i++) {
    const char = combined.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash) % 2147483647; // Max int32
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
) {
  let delay = initialDelay;
  const stylePrompt = buildVoicePrompt(voice);

  // 🎯 Seed konsisten untuk voice + text
  const seedValue = generateConsistentSeed(voice, text);

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
) {
  const cacheId = crypto
    .createHash("md5")
    .update(`${text}_${voice}_${rate}`)
    .digest("hex");

  const filename = folder ? `${folder}/${cacheId}.mp3` : `${cacheId}.mp3`;
  const BUCKET_NAME = "tts-cache";
  const speechText = ttsText || text;

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

  if (options.execute) {
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
