#!/usr/bin/env node

/**
 * @file generate_dialogue_tts.js
 * @description Script utilitas produksi (CommonJS) untuk melakukan batch-generation / pre-sintesis
 * seluruh teks percakapan (dialog) dan contoh kalimat tata bahasa (grammar examples)
 * dari lessons (Supabase & Sanity) dan listeningMaterial (Sanity).
 * 
 * Didukung penanganan error tangguh (AFK-Safe):
 * - Penangkap uncaughtException & unhandledRejection agar tidak crash.
 * - Retry otomatis dengan jeda berjenjang jika koneksi VOICEVOX atau Edge TTS drop.
 * - Pause protektif jika terjadi kegagalan beruntun.
 * - Pencatatan kalimat gagal ke tts_failures.log.
 * 
 * Penggunaan:
 *   node scripts/tts/generate_dialogue_tts.js [--execute] [--limit 50]
 */

const fs = require("node:fs");
const path = require("node:path");
const process = require("node:process");
const crypto = require("node:crypto");
const { spawnSync } = require("node:child_process");
const { createClient } = require("@supabase/supabase-js");
const { createClient: createSanityClient } = require("@sanity/client");
const { MsEdgeTTS } = require("msedge-tts");

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const FAILURE_LOG_PATH = path.resolve(process.cwd(), "tts_failures.log");

// ==========================================
// PENCEGAH CRASH GLOBAL (AFK-Safe)
// ==========================================
process.on("unhandledRejection", (reason) => {
  console.error("\n⚠️ [Global Unhandled Rejection] Terdeteksi (diabaikan):", reason);
});
process.on("uncaughtException", (error) => {
  console.error("\n⚠️ [Global Uncaught Exception] Terdeteksi (diabaikan):", error.message || error);
});

function logFailure(text, voice, errorMsg) {
  const timestamp = new Date().toISOString();
  fs.appendFileSync(
    FAILURE_LOG_PATH,
    `[${timestamp}] [Dialogue] Teks: "${text}" | Voice: ${voice} | Error: ${errorMsg}\n`,
    "utf8"
  );
}

// ==========================================
// VOICE RESOLUTION UTILITIES (Mirrors src/lib/tts.ts)
// ==========================================
const FEMALE_KEYWORDS = [
  "女", "母", "姉", "妹", "奥", "彼女", "娘", "ちゃん", "chan",
  "先生",
  "ゆき", "はna", "さき", "あおい", "みく", "ゆみ", "けいこ", "みさ",
  "Yuki", "Hana", "Saki", "Aoi", "Miku", "Yumi", "Keiko", "Misa",
];
const MALE_KEYWORDS = [
  "男", "父", "兄", "弟", "夫", "彼", "くん", "君", "kun",
  "たろう", "けんじ", "ひろし", "けん", "しんじ", "だいち", "ケン",
  "Taro", "Kenji", "Hiroshi", "Ken", "Shinji", "Daichi",
];

const femaleVoices = ["zundamon", "lara", "indah", "siti", "dewi", "hayashi", "sato", "ayu", "ritsu"];
const maleVoices = ["namonashi", "dito", "budi", "suzuki", "tanaka", "yamada", "kimura", "andi", "faisal", "takahashi", "kobayashi", "ooba"];
const allVoices = [...femaleVoices, ...maleVoices];

const SPEAKER_MAP = {
  "indah": "indah", "インダ": "indah", "インダハ": "indah",
  "lara": "lara", "ララ": "lara",
  "siti": "siti", "シティ": "siti",
  "dewi": "dewi", "デウィ": "dewi",
  "hayashi": "hayashi", "林": "hayashi", "はやし": "hayashi",
  "sato": "sato", "佐藤": "sato", "さとう": "sato",
  "ayu": "ayu", "アユ": "ayu",
  "zundamon": "zundamon", "ずんだもん": "zundamon", "ズンダモン": "zundamon",
  "ritsu": "ritsu", "リツ": "ritsu", "りつ": "ritsu",
  "budi": "budi", "ブディ": "budi",
  "dito": "dito", "ディト": "dito",
  "suzuki": "suzuki", "鈴木": "suzuki", "すずき": "suzuki",
  "tanaka": "tanaka", "田中": "tanaka", "たなか": "tanaka",
  "yamada": "yamada", "山田": "yamada", "やまだ": "yamada",
  "kimura": "kimura", "木村": "kimura", "きむら": "kimura",
  "andi": "andi", "アンディ": "andi",
  "faisal": "faisal", "ファイサル": "faisal",
  "takahashi": "takahashi", "高橋": "takahashi", "たかはし": "takahashi",
  "kobayashi": "kobayashi", "小林": "kobayashi", "こばやし": "kobayashi",
  "namonashi": "namonashi", "名無し": "namonashi",
  "ooba": "ooba", "大庭": "ooba", "おおば": "ooba"
};

function detectVoice(speaker, fallbackIndex = 0) {
  if (!speaker || speaker === "???" || speaker.trim() === "") {
    return allVoices[fallbackIndex % allVoices.length];
  }
  const cleanSpeaker = speaker.replace(/[- ]?(さん|くん|ちゃん|様|君|sama|san|kun|chan)$/i, "").trim().toLowerCase();
  if (SPEAKER_MAP[cleanSpeaker]) {
    return SPEAKER_MAP[cleanSpeaker];
  }
  if (allVoices.includes(cleanSpeaker)) {
    return cleanSpeaker;
  }
  const speakerLowerOriginal = speaker.toLowerCase().trim();
  let preDetectedGender = null;
  if (speakerLowerOriginal.endsWith("ちゃん") || speakerLowerOriginal.endsWith("chan")) {
    preDetectedGender = "female";
  } else if (speakerLowerOriginal.endsWith("くん") || speakerLowerOriginal.endsWith("kun") || speakerLowerOriginal.endsWith("君")) {
    preDetectedGender = "male";
  }
  let hash = 0;
  for (let i = 0; i < cleanSpeaker.length; i++) {
    hash = cleanSpeaker.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash);
  if (preDetectedGender === "female") {
    return femaleVoices[index % femaleVoices.length];
  }
  if (preDetectedGender === "male") {
    return maleVoices[index % maleVoices.length];
  }
  const EXACT_FEMALE = [
    "ayu", "siti", "dewi", "rara", "indah", "sakura", "lara", "sato", "hayashi",
    "アユ", "シティ", "デウィ", "ララ", "インダ", "さくら", "サクラ", "さとう", "はやし"
  ];
  const EXACT_MALE = [
    "budi", "faisal", "andi", "dito", "adit", "ken", "suzuki", "tanaka", "yamada", "kimura", "takahashi", "kobayashi",
    "ブディ", "ファイサル", "アンディ", "ディト", "アディット", "ケン", "すずき", "たなか", "やまだ", "きむら", "たかはし", "こばやし"
  ];
  if (EXACT_FEMALE.includes(cleanSpeaker)) {
    return femaleVoices[index % femaleVoices.length];
  }
  if (EXACT_MALE.includes(cleanSpeaker)) {
    return maleVoices[index % maleVoices.length];
  }
  const isFemale = FEMALE_KEYWORDS.some(k => cleanSpeaker.includes(k));
  const isMale   = MALE_KEYWORDS.some(k => cleanSpeaker.includes(k));
  if (isFemale && !isMale) {
    return femaleVoices[index % femaleVoices.length];
  }
  if (isMale && !isFemale) {
    return maleVoices[index % maleVoices.length];
  }
  return allVoices[index % allVoices.length];
}

function getDeterministicVoiceForText(text) {
  const cleanText = text.trim();
  let hash = 0;
  for (let i = 0; i < cleanText.length; i++) {
    hash = cleanText.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash);
  return allVoices[index % allVoices.length];
}

// Speaker IDs untuk VOICEVOX
const VOICEVOX_SPEAKER_MAP = {
  "indah": 2, "lara": 8, "siti": 10, "dewi": 14, "hayashi": 16,
  "sato": 20, "ayu": 23, "zundamon": 3, "ritsu": 9,
  "budi": 13, "dito": 11, "suzuki": 21, "tanaka": 52, "yamada": 53,
  "kimura": 12, "andi": 51, "faisal": 94, "takahashi": 100, "kobayashi": 99,
  "namonashi": 113, "ooba": 42,
};

const EDGE_VOICE_MAP = {
  "indah": "ja-JP-NanamiNeural", "lara": "ja-JP-NanamiNeural", "siti": "ja-JP-NanamiNeural",
  "dewi": "ja-JP-NanamiNeural", "hayashi": "ja-JP-NanamiNeural", "sato": "ja-JP-NanamiNeural",
  "ayu": "ja-JP-NanamiNeural", "zundamon": "ja-JP-NanamiNeural", "ritsu": "ja-JP-NanamiNeural",
  "budi": "ja-JP-KeitaNeural", "dito": "ja-JP-KeitaNeural", "suzuki": "ja-JP-KeitaNeural",
  "tanaka": "ja-JP-KeitaNeural", "yamada": "ja-JP-KeitaNeural", "kimura": "ja-JP-KeitaNeural",
  "andi": "ja-JP-KeitaNeural", "faisal": "ja-JP-KeitaNeural", "takahashi": "ja-JP-KeitaNeural",
  "kobayashi": "ja-JP-KeitaNeural", "namonashi": "ja-JP-KeitaNeural", "ooba": "ja-JP-KeitaNeural",
};

const GEMINI_VOICE_MAP = {
  // Wanita
  "indah": "Zephyr",       // default premium (Bright)
  "lara": "Leda",         // young/cheerful (Youthful)
  "siti": "Vindemiatrix", // gentle/clear (Gentle)
  "dewi": "Laomedeia",    // energetic/cutesy (Upbeat)
  "hayashi": "Gacrux",    // mature/academic (Mature)
  "sato": "Sulafat",      // friendly/mature (Warm)
  "ayu": "Erinome",       // cool/clear (Clear)
  "zundamon": "Autonoe",  // mascot child/neutral (Bright/Youthful)
  "ritsu": "Achernar",    // cool/neutral (Soft)

  // Pria
  "budi": "Charon",       // default polite/formal (Informative)
  "dito": "Alnilam",      // cool/deep (Firm)
  "suzuki": "Iapetus",    // smart/young (Clear)
  "tanaka": "Fenrir",     // energetic/rough (Excitable)
  "yamada": "Achird",     // warm/casual (Friendly)
  "kimura": "Algieba",    // polite/formal (Smooth)
  "andi": "Orus",         // dramatic/heroic (Firm)
  "faisal": "Puck",       // cool/youthful (Upbeat)
  "takahashi": "Rasalgethi", // mature/deep (Informative)
  "kobayashi": "Zubenelgenubi", // youthful (Casual)
  "namonashi": "Algenib",  // middle-aged/rough (Gravelly)
  "ooba": "Sadachbia",    // boy/child (Lively)
};

function printUsage() {
  console.log(
    [
      "=== NIHONGOROUTE BATCH DIALOGUE/GRAMMAR TTS GENERATOR (AFK-SAFE) ===",
      "Penggunaan:",
      "  node scripts/tts/generate_dialogue_tts.js [options]",
      "",
      "Opsi:",
      "  --execute      Jalankan pemrosesan nyata (Default: Dry Run saja).",
      "  --limit <num>  Batasi jumlah audio baru yang dibuat. Default: Unlimited (Semua)",
      "  --level <lvl>  Filter level JLPT (N5, N4, N3, N2, N1).",
      "  --help, -h     Tampilkan bantuan ini.",
    ].join("\n")
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
  }

  return options;
}

function convertWavToMp3(wavBuffer) {
  const result = spawnSync(
    "ffmpeg",
    [
      "-i", "pipe:0",
      "-f", "mp3",
      "-acodec", "libmp3lame",
      "-ab", "128k",
      "pipe:1"
    ],
    { input: wavBuffer, maxBuffer: 15 * 1024 * 1024 }
  );

  if (result.status !== 0) {
    const err = result.stderr ? result.stderr.toString() : "Ffmpeg error";
    throw new Error(`Ffmpeg conversion failed: ${err}`);
  }

  return result.stdout;
}

async function queryVoicevoxWithRetry(text, speakerId, retries = 3, initialDelay = 1500) {
  let delay = initialDelay;
  for (let attempt = 1; attempt <= retries; attempt += 1) {
    try {
      const host = process.env.VOICEVOX_URL || "http://127.0.0.1:50021";
      const queryUrl = `${host}/audio_query?text=${encodeURIComponent(text)}&speaker=${speakerId}`;
      const queryRes = await fetch(queryUrl, { method: "POST" });
      if (!queryRes.ok) throw new Error(`Query VOICEVOX gagal: ${queryRes.statusText}`);

      const queryJson = await queryRes.json();
      const synthesisUrl = `${host}/synthesis?speaker=${speakerId}`;
      const synthesisRes = await fetch(synthesisUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(queryJson),
      });
      if (!synthesisRes.ok) throw new Error(`Sintesis VOICEVOX gagal: ${synthesisRes.statusText}`);

      const arrayBuffer = await synthesisRes.arrayBuffer();
      return Buffer.from(arrayBuffer);
    } catch (err) {
      if (attempt === retries) throw err;
      console.warn(`   ⚠️  [VOICEVOX Coba ${attempt}/${retries}] Gagal: ${err.message}. Mencoba kembali...`);
      await sleep(delay);
      delay *= 2;
    }
  }
}

async function queryEdgeTtsWithRetry(text, voiceName, retries = 3, initialDelay = 2000) {
  let delay = initialDelay;
  for (let attempt = 1; attempt <= retries; attempt += 1) {
    try {
      const tts = new MsEdgeTTS();
      await tts.setMetadata(voiceName, "audio-128khz-128kbps-mono-mp3");
      return await new Promise((resolve, reject) => {
        const chunks = [];
        let timer = setTimeout(() => {
          reject(new Error("Timeout koneksi WebSockets Edge TTS (15 detik)."));
        }, 15000);

        const { audioStream } = tts.toStream(text);

        audioStream.on("data", (data) => chunks.push(data));
        audioStream.on("end", () => {
          clearTimeout(timer);
          resolve(Buffer.concat(chunks));
        });
        audioStream.on("error", (err) => {
          clearTimeout(timer);
          reject(err);
        });
      });
    } catch (err) {
      if (attempt === retries) throw err;
      console.warn(`   ⚠️  [Edge TTS Coba ${attempt}/${retries}] Gagal: ${err.message}. Mencoba kembali...`);
      await sleep(delay);
      delay *= 2;
    }
  }
}

function parseResetTime(message) {
  let maxSeconds = 65; // default fallback 65s

  // Pattern 1: Please retry in 54.859173362s
  const retryMatch = message.match(/Please retry in (\d+(?:\.\d+)?)s/i);
  if (retryMatch) {
    const secs = parseFloat(retryMatch[1]);
    if (secs > maxSeconds) {
      maxSeconds = secs;
    }
  }

  // Pattern 2: reset after 1m 35s or reset after 35s
  const resetMatch = message.match(/reset after (?:(\d+)m\s*)?(\d+)s/i);
  if (resetMatch) {
    const minutes = resetMatch[1] ? parseInt(resetMatch[1], 10) : 0;
    const seconds = parseInt(resetMatch[2], 10);
    const totalSecs = minutes * 60 + seconds;
    if (totalSecs > maxSeconds) {
      maxSeconds = totalSecs;
    }
  }

  return Math.ceil(maxSeconds * 1000) + 5000; // add 5s safety buffer
}

async function queryGeminiTtsWithRetry(text, geminiVoice, retries = 3, initialDelay = 2000) {
  const baseUrl = process.env.AI_BASE_URL || "http://localhost:20128/v1";
  const apiKey = process.env.AI_API_KEY;

  if (!apiKey) {
    throw new Error("AI_API_KEY tidak dikonfigurasi di env.");
  }

  const url = `${baseUrl}/audio/speech`;
  let delay = initialDelay;

  for (let attempt = 1; attempt <= retries; attempt += 1) {
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: `gemini/gemini-3.1-flash-tts-preview/${geminiVoice}`,
          input: text,
          language: "Japanese",
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const arrayBuffer = await response.arrayBuffer();
      return Buffer.from(arrayBuffer);
    } catch (err) {
      if (attempt === retries) throw err;

      const isQuotaError = err.message.includes("quota") || err.message.includes("Quota") || err.message.includes("exceeded");
      if (isQuotaError) {
        const waitMs = parseResetTime(err.message);
        console.warn(`   ⚠️  [Gemini TTS Coba ${attempt}/${retries}] Batas kuota terlampaui. Menunggu ${Math.ceil(waitMs / 1000)} detik agar kuota di-reset...`);
        await sleep(waitMs);
      } else {
        console.warn(`   ⚠️  [Gemini TTS Coba ${attempt}/${retries}] Gagal: ${err.message}. Mencoba kembali...`);
        await sleep(delay);
        delay *= 2;
      }
    }
  }
}

async function processTtsItem(supabase, text, voice, rate = "medium") {
  const cacheId = crypto.createHash("md5").update(`${text}_${voice}_${rate}`).digest("hex");
  const filename = `${cacheId}.mp3`;
  const BUCKET_NAME = "tts-cache";

  const geminiVoice = GEMINI_VOICE_MAP[voice];
  if (!geminiVoice) {
    throw new Error(`Suara Gemini untuk karakter '${voice}' tidak ditemukan di pemetaan.`);
  }

  const audioBuffer = await queryGeminiTtsWithRetry(text, geminiVoice);
  console.log(`   └─ [Gemini TTS] Sintesis sukses (${geminiVoice}).`);

  const { error: uploadError } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(filename, audioBuffer, {
      contentType: "audio/mpeg",
      upsert: true,
    });

  if (uploadError) throw new Error(`Upload storage gagal: ${uploadError.message}`);

  const publicUrl = supabase.storage.from(BUCKET_NAME).getPublicUrl(filename).data.publicUrl;

  const { error: dbError } = await supabase
    .from("tts_cache")
    .upsert({ id: cacheId, text, voice, rate, audio_url: publicUrl });

  if (dbError) throw new Error(`Registrasi DB gagal: ${dbError.message}`);

  return publicUrl;
}

async function main() {
  loadEnvFile();
  const options = parseArgs(process.argv.slice(2));

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error("❌ [Config] NEXT_PUBLIC_SUPABASE_URL dan SUPABASE_SERVICE_ROLE_KEY wajib ada di .env.local!");
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  const sanityClient = createSanityClient({
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
    useCdn: false,
    apiVersion: "2024-03-11",
  });

  try {
    const itemsToProcess = [];

    const addItem = (text, voice) => {
      if (!text) return;
      const clean = text.trim();
      if (!clean) return;
      
      const exists = itemsToProcess.some((i) => i.text === clean && i.voice === voice);
      if (!exists) {
        itemsToProcess.push({ text: clean, voice });
      }
    };

    const processContentBlocks = (blocks) => {
      if (!Array.isArray(blocks)) return;
      blocks.forEach((block) => {
        const type = block.type || block._type;
        if ((type === "dialogue" || type === "dialogueBlock") && block.content) {
          const lines = block.content.split("\n").filter(Boolean);
          lines.forEach((line, i) => {
            const parts = line.split(/[：:]/);
            const rawSpeaker = parts.length > 1 ? parts[0].trim() : undefined;
            const lineText = parts.length > 1 ? parts.slice(1).join("：").trim() : line.trim();
            const voice = detectVoice(rawSpeaker, i);
            addItem(lineText, voice);
          });
        }
      });
    };

    // 1. Tarik pelajaran (lessons) dari Supabase
    console.log("🔍 [1/4] Menarik data lessons dari Supabase...");
    let sbQuery = supabase.from("lessons").select("content_blocks, slug");
    if (options.level) {
      sbQuery = sbQuery.like("slug", `${options.level.toLowerCase()}-%`);
    }
    const { data: supabaseLessons } = await sbQuery;
    if (supabaseLessons) {
      supabaseLessons.forEach((row) => processContentBlocks(row.content_blocks));
    }

    // 2. Tarik pelajaran (lessons) dari Sanity CMS
    try {
      console.log("🔍 [2/4] Menarik data lessons dari Sanity...");
      let query = '*[_type == "lesson"]';
      if (options.level) {
        query = `*[_type == "lesson" && (slug.current match "${options.level.toLowerCase()}*" || title match "${options.level}*")]`;
      }
      const sanityLessons = await sanityClient.fetch(`${query} { content_blocks }`);
      if (Array.isArray(sanityLessons)) {
        sanityLessons.forEach((row) => processContentBlocks(row.content_blocks));
      }
    } catch (err) {
      console.warn("⚠️  [Sanity] Lewati: ", err.message);
    }

    // 3. Tarik listeningMaterial dari Sanity CMS
    try {
      console.log("🔍 [3/4] Menarik data listeningMaterial dari Sanity...");
      let lmQuery = '*[_type == "listeningMaterial"]';
      if (options.level) {
        lmQuery = `*[_type == "listeningMaterial" && (level == "${options.level}" || slug.current match "${options.level.toLowerCase()}*")]`;
      }
      const listeningMaterials = await sanityClient.fetch(`${lmQuery} { body }`);
      if (Array.isArray(listeningMaterials)) {
        listeningMaterials.forEach((row) => {
          if (!row.body) return;
          const lines = row.body.split("\n").filter(Boolean);
          lines.forEach((line, i) => {
            const parts = line.split(/[：:]/);
            const rawSpeaker = parts.length > 1 ? parts[0].trim() : undefined;
            const lineText = parts.length > 1 ? parts.slice(1).join("：").trim() : line.trim();
            const voice = detectVoice(rawSpeaker, i);
            addItem(lineText, voice);
          });
        });
      }
    } catch (err) {
      console.warn("⚠️  [Sanity] Lewati: ", err.message);
    }

    console.log(`📊 Total baris teks dialog/contoh kalimat unik yang ditemukan: ${itemsToProcess.length}`);

    // 4. Bandingkan dengan database tts_cache (Paginated)
    console.log("🔍 [4/4] Memeriksa status cache di database...");
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
        if (rows.length < dbLimit) {
          dbHasMore = false;
        }
      }
    }

    itemsToProcess.forEach((item) => {
      const cacheId = crypto.createHash("md5").update(`${item.text}_${item.voice}_medium`).digest("hex");
      if (!existingCacheIds.has(cacheId)) {
        missingItems.push(item);
      }
    });

    console.log(`📈 Jumlah item yang belum memiliki cache audio: ${missingItems.length}`);

    if (missingItems.length === 0) {
      console.log("✅ Semua audio dialog/contoh kalimat sudah lengkap di-cache!");
      process.exit(0);
    }

    if (!options.execute) {
      console.log(`\n📋 [Dry Run] Menampilkan 10 item pertama yang belum di-cache:`);
      missingItems.slice(0, 10).forEach((item, idx) => {
        console.log(`   ${idx + 1}. [Voice: ${item.voice}] "${item.text}"`);
      });
      console.log(`\n💡 Silakan jalankan dengan '--execute --limit <num>' untuk mensintesis secara nyata.`);
      process.exit(0);
    }

    const targetItems = missingItems.slice(0, options.limit);
    console.log(`\n🚀 Memulai sintesis ${targetItems.length} item...`);

    let successCount = 0;
    let consecutiveFailures = 0;

    for (let idx = 0; idx < targetItems.length; idx += 1) {
      const item = targetItems[idx];
      try {
        console.log(`[${idx + 1}/${targetItems.length}] Menyintesis: "${item.text}" [Voice: ${item.voice}]`);
        await processTtsItem(supabase, item.text, item.voice, "medium");
        successCount += 1;
        consecutiveFailures = 0; // reset
        await sleep(8000); // 8s rate limiting to stay safely under 10 RPM (Gemini Free Tier)
      } catch (err) {
        console.error(`❌ Gagal mensintesis "${item.text}":`, err.message);
        logFailure(item.text, item.voice, err.message);
        consecutiveFailures += 1;

        if (consecutiveFailures >= 5) {
          console.warn("\n⚠️  Terjadi 5 kegagalan beruntun. Istirahat 30 detik untuk menghindari pemblokiran IP...");
          await sleep(30000);
          consecutiveFailures = 0;
        } else {
          await sleep(5000);
        }
      }
    }

    console.log(`\n🎉 [Selesai] Berhasil memproses ${successCount}/${targetItems.length} audio dialog!`);
    if (successCount < targetItems.length) {
      console.log(`💡 Kegagalan dicatat di: ${FAILURE_LOG_PATH}`);
    }
    process.exit(0);

  } catch (error) {
    console.error("❌ [Error] Gagal menjalankan generator dialog:", error.message || error);
    process.exit(1);
  }
}

main();
