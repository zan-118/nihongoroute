#!/usr/bin/env node

/**
 * @file generate_listening_tts_direct.js
 * @description Script utilitas produksi untuk pre-sintesis percakapan
 * pada materi mendengarkan (listeningMaterial) menggunakan Gemini API langsung (tanpa gateway).
 * 
 * Penggunaan:
 *   node scripts/tts/generate_listening_tts_direct.js [--execute] [--limit 50] [--level N5] [--query minimarket]
 */

const fs = require("node:fs");
const path = require("node:path");
const process = require("node:process");
const crypto = require("node:crypto");
const { spawnSync } = require("node:child_process");
const { createClient } = require("@supabase/supabase-js");
const { createClient: createSanityClient } = require("@sanity/client");

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const FAILURE_LOG_PATH = path.resolve(process.cwd(), "tts_failures.log");

// Global error handlers
process.on("unhandledRejection", (reason) => {
  console.error("\n⚠️ [Global Unhandled Rejection] Terdeteksi:", reason);
});
process.on("uncaughtException", (error) => {
  console.error("\n⚠️ [Global Uncaught Exception] Terdeteksi:", error.message || error);
});

function logFailure(text, voice, errorMsg) {
  const timestamp = new Date().toISOString();
  fs.appendFileSync(
    FAILURE_LOG_PATH,
    `[${timestamp}] [Listening Direct] Teks: "${text}" | Voice: ${voice} | Error: ${errorMsg}\n`,
    "utf8"
  );
}

// Voice mappings (Mirrors existing config)
const FEMALE_KEYWORDS = [
  "女", "母", "姉", "妹", "奥", "彼女", "娘", "ちゃん", "chan",
  "先生",
  "ゆき", "はna", "さき", "あおい", "みku", "ゆmi", "けいこ", "みsa",
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
  "ritsu": "ritsu", "りつ": "ritsu",
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

const GEMINI_VOICE_MAP = {
  // Wanita
  "indah": "Zephyr",
  "lara": "Leda",
  "siti": "Vindemiatrix",
  "dewi": "Laomedeia",
  "hayashi": "Gacrux",
  "sato": "Sulafat",
  "ayu": "Erinome",
  "zundamon": "Autonoe",
  "ritsu": "Achernar",

  // Pria
  "budi": "Charon",
  "dito": "Alnilam",
  "suzuki": "Iapetus",
  "tanaka": "Fenrir",
  "yamada": "Achird",
  "kimura": "Algieba",
  "andi": "Orus",
  "faisal": "Puck",
  "takahashi": "Rasalgethi",
  "kobayashi": "Zubenelgenubi",
  "namonashi": "Algenib",
  "ooba": "Sadachbia",
};

function printUsage() {
  console.log(
    [
      "=== NIHONGOROUTE BATCH LISTENING DIALOGUE DIRECT TTS GENERATOR ===",
      "Penggunaan:",
      "  node scripts/tts/generate_listening_tts_direct.js [options]",
      "",
      "Opsi:",
      "  --execute          Jalankan pemrosesan nyata (Default: Dry Run saja).",
      "  --limit <num>      Batasi jumlah audio baru yang dibuat. Default: Unlimited (Semua)",
      "  --level <lvl>      Filter level JLPT (N5, N4, N3, N2, N1).",
      "  --query <term>     Filter berdasarkan kata kunci slug/title listening (contoh: minimarket).",
      "  --force            Paksa proses ulang dan timpa audio meskipun sudah di-cache.",
      "  --help, -h         Tampilkan bantuan ini.",
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
    query: null,
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
    if (arg === "--query") {
      options.query = args[index + 1]?.trim();
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

function convertPcmToMp3(pcmBuffer, sampleRate = 24000) {
  const result = spawnSync(
    "ffmpeg",
    [
      "-f", "s16le",
      "-ar", String(sampleRate),
      "-ac", "1",
      "-i", "pipe:0",
      "-f", "mp3",
      "-acodec", "libmp3lame",
      "-ab", "128k",
      "pipe:1"
    ],
    { input: pcmBuffer, maxBuffer: 15 * 1024 * 1024 }
  );

  if (result.status !== 0) {
    const err = result.stderr ? result.stderr.toString() : "Ffmpeg error";
    throw new Error(`Ffmpeg conversion failed: ${err}`);
  }

  return result.stdout;
}

function getGeminiApiKeys() {
  const keys = [];

  if (process.env.GEMINI_API_KEY) {
    keys.push(process.env.GEMINI_API_KEY.trim());
  }

  if (process.env.GEMINI_API_KEYS) {
    const list = process.env.GEMINI_API_KEYS.split(",").map(k => k.trim()).filter(Boolean);
    keys.push(...list);
  }

  for (const envKey in process.env) {
    if (envKey.startsWith("GEMINI_API_KEY_")) {
      const val = process.env[envKey]?.trim();
      if (val) {
        keys.push(val);
      }
    }
  }

  return Array.from(new Set(keys)).filter(Boolean);
}

function getGeminiModels() {
  const models = [];
  if (process.env.GEMINI_TTS_MODEL) {
    models.push(process.env.GEMINI_TTS_MODEL.trim());
  }
  if (process.env.GEMINI_TTS_MODELS) {
    const list = process.env.GEMINI_TTS_MODELS.split(",").map(m => m.trim()).filter(Boolean);
    models.push(...list);
  }
  if (models.length === 0) {
    models.push(
      "gemini-3.1-flash-tts-preview",
      "gemini-2.5-flash-preview-tts",
      "gemini-2.5-flash-lite-preview-tts",
      "gemini-2.5-pro-preview-tts"
    );
  }
  return Array.from(new Set(models)).filter(Boolean);
}

let globalKeyIndex = 0;
let globalModelIndex = 0;

async function queryGeminiTtsWithRetry(text, geminiVoice, retries = 5, initialDelay = 5000) {
  const apiKeys = getGeminiApiKeys();
  if (apiKeys.length === 0) {
    throw new Error("GEMINI_API_KEY tidak ditemukan di environment.");
  }

  const models = getGeminiModels();
  let delay = initialDelay;

  // Pastikan jumlah percobaan minimal cukup untuk mencoba seluruh kombinasi (key * model) setidaknya 2 kali
  const maxAttempts = Math.max(retries, apiKeys.length * models.length * 2);
  let keysTriedForCurrentModel = 0;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    const currentApiKey = apiKeys[globalKeyIndex % apiKeys.length];
    const currentModel = models[globalModelIndex % models.length];
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${currentModel}:generateContent?key=${currentApiKey}`;

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [{ text: text }],
            },
          ],
          generationConfig: {
            responseModalities: ["AUDIO"],
            speechConfig: {
              voiceConfig: {
                prebuiltVoiceConfig: {
                  voiceName: geminiVoice,
                },
              },
            },
          },
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorJson;
        try {
          errorJson = JSON.parse(errorText);
        } catch (_) {}

        const status = response.status;
        const msg = errorJson?.error?.message || errorText;

        // 429 = Rate limit, 502/503 = Server overload, 403 = Key diblokir/dilarang
        if (status === 429 || status === 502 || status === 503 || status === 403) {
          const hasTriedAllKeys = (attempt % apiKeys.length === 0);

          if (apiKeys.length > 1 && !hasTriedAllKeys) {
            console.warn(`   ⚠️  [Gemini TTS Coba ${attempt}/${maxAttempts}] Key #${(globalKeyIndex % apiKeys.length) + 1} terkena error ${status} (Model: ${currentModel}). Memutar ke key berikutnya...`);
            globalKeyIndex += 1;
            keysTriedForCurrentModel += 1;

            if (keysTriedForCurrentModel >= apiKeys.length) {
              keysTriedForCurrentModel = 0;
              globalModelIndex += 1;
              console.warn(`   🔄 [Gemini TTS] Seluruh key untuk model ${currentModel} telah dicoba. Memutar ke model berikutnya: ${models[globalModelIndex % models.length]}...`);
            }

            await sleep(1000); // delay singkat sebelum mencoba key berikutnya
            continue;
          }

          let waitMs = 25000;
          if (status === 429) {
            const retryDelayStr = errorJson?.error?.details?.find(d => d.retryDelay)?.retryDelay;
            if (retryDelayStr) {
              const seconds = parseFloat(retryDelayStr);
              if (!isNaN(seconds)) {
                waitMs = Math.ceil(seconds * 1000) + 2000;
              }
            } else {
              const resetMatch = msg.match(/Please retry in (\d+(?:\.\d+)?)s/i);
              if (resetMatch) {
                waitMs = Math.ceil(parseFloat(resetMatch[1]) * 1000) + 2000;
              }
            }
          } else {
            // Untuk 502/503/403, jika semua key sudah dicoba dan gagal, tunggu 30 detik sebelum mengulangi loop
            waitMs = 30000;
          }

          console.warn(`   ⚠️  [Gemini TTS Coba ${attempt}/${maxAttempts}] Semua key ter-limit / bermasalah (Status: ${status}, Model: ${currentModel}). Menunggu ${Math.ceil(waitMs / 1000)} detik...`);
          await sleep(waitMs);

          globalKeyIndex += 1; // tetap putar key setelah sleep
          keysTriedForCurrentModel += 1;
          if (keysTriedForCurrentModel >= apiKeys.length) {
            keysTriedForCurrentModel = 0;
            globalModelIndex += 1;
            console.warn(`   🔄 [Gemini TTS] Seluruh key untuk model ${currentModel} telah dicoba. Memutar ke model berikutnya: ${models[globalModelIndex % models.length]}...`);
          }
          continue;
        }

        throw new Error(`HTTP ${status}: ${msg}`);
      }

      const data = await response.json();
      const candidate = data.candidates?.[0];
      if (!candidate) {
        throw new Error("Respon Gemini kosong (no candidates).");
      }

      const part = candidate.content?.parts?.find((p) => p.inlineData);
      if (!part || !part.inlineData) {
        throw new Error("Respon Gemini tidak berisi audio inlineData.");
      }

      const pcmBuffer = Buffer.from(part.inlineData.data, "base64");
      const mimeType = part.inlineData.mimeType || "audio/L16;codec=pcm;rate=24000";

      let sampleRate = 24000;
      const rateMatch = mimeType.match(/rate=(\d+)/);
      if (rateMatch) {
        sampleRate = parseInt(rateMatch[1], 10);
      }

      return convertPcmToMp3(pcmBuffer, sampleRate);
    } catch (err) {
      if (attempt === maxAttempts) throw err;
      console.warn(`   ⚠️  [Gemini TTS Coba ${attempt}/${maxAttempts}] Gagal: ${err.message}. Memutar key/model & Retrying in ${delay / 1000}s...`);

      if (apiKeys.length > 1) {
        globalKeyIndex += 1;
        keysTriedForCurrentModel += 1;
        if (keysTriedForCurrentModel >= apiKeys.length) {
          keysTriedForCurrentModel = 0;
          globalModelIndex += 1;
          console.warn(`   🔄 [Gemini TTS] Seluruh key untuk model ${currentModel} telah dicoba. Memutar ke model berikutnya: ${models[globalModelIndex % models.length]}...`);
        }
      }

      await sleep(delay);
      delay *= 2;
    }
  }

  // Jika keluar dari loop tanpa return, artinya semua percobaan gagal
  throw new Error("Semua percobaan sintesis gagal setelah rotasi seluruh API Key dan Model.");
}


async function processTtsItem(supabase, text, voice, rate = "medium") {
  const cacheId = crypto.createHash("md5").update(`${text}_${voice}_${rate}`).digest("hex");
  const filename = `${cacheId}.mp3`;
  const BUCKET_NAME = "tts-cache";

  const geminiVoice = GEMINI_VOICE_MAP[voice];
  if (!geminiVoice) {
    throw new Error(`Suara Gemini untuk '${voice}' tidak ditemukan.`);
  }

  const mp3Buffer = await queryGeminiTtsWithRetry(text, geminiVoice);
  console.log(`   └─ [Gemini TTS] Sintesis & konversi sukses (${geminiVoice}).`);

  const { error: uploadError } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(filename, mp3Buffer, {
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

const readline = require("node:readline");

function askQuestion(query) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  return new Promise((resolve) => {
    rl.question(query, (ans) => {
      rl.close();
      resolve(ans.trim());
    });
  });
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

    // 1. Tarik listeningMaterial dari Sanity CMS
    try {
      console.log("🔍 [1/2] Menarik data listeningMaterial dari Sanity...");
      
      const allListeningMaterials = await sanityClient.fetch('*[_type == "listeningMaterial"] { title, slug, level, jlpt_level, body }');
      let targetMaterials = allListeningMaterials || [];

      // Aktifkan menu interaktif jika dijalankan di terminal dan tanpa filter pencarian
      if (targetMaterials.length > 0 && !options.level && !options.query && process.stdout.isTTY) {
        console.log("\n=== PILIH LEVEL JLPT ===");
        const lvlInput = await askQuestion("Pilih Level JLPT (N5, N4, N3, N2, N1, atau tekan Enter untuk semua): ");

        if (lvlInput) {
          const lvl = lvlInput.trim().toLowerCase();
          targetMaterials = targetMaterials.filter(m => 
            m.level?.toLowerCase() === lvl || 
            m.jlpt_level?.toLowerCase() === lvl || 
            m.slug?.current?.toLowerCase().includes(lvl)
          );
        }

        if (targetMaterials.length === 0) {
          console.log("❌ Tidak ada materi yang cocok dengan kriteria level Anda. Membatalkan...");
          process.exit(0);
        }

        console.log("\n=== DAFTAR MATERI MENDENGARKAN ===");
        targetMaterials.forEach((m, idx) => {
          console.log(`[${idx + 1}] [${m.jlpt_level || m.level || "N/A"}] ${m.title || "Untitled"} (slug: ${m.slug?.current || "N/A"})`);
        });
        console.log("[0] PROSES SEMUA MATERI HASIL FILTER");

        const answer = await askQuestion(`\nPilih nomor materi (0-${targetMaterials.length}): `);
        const choice = parseInt(answer, 10);
        if (isNaN(choice) || choice < 0 || choice > targetMaterials.length) {
          console.log("❌ Pilihan tidak valid. Membatalkan...");
          process.exit(0);
        }

        if (choice > 0) {
          targetMaterials = [targetMaterials[choice - 1]];
          console.log(`\nSelected: ${targetMaterials[0].title}`);
        } else {
          console.log("\nProcessing all filtered materials...");
        }

        const forceAns = await askQuestion("Apakah ingin memaksa sintesis ulang (menimpa cache)? (y/N): ");
        if (forceAns.toLowerCase() === "y" || forceAns.toLowerCase() === "yes") {
          options.force = true;
          console.log("⚠️  Mode force aktif: Mengabaikan cache.");
        }
      } else {
        // Mode non-interaktif (otomatis dengan filter)
        if (options.level) {
          const lvl = options.level.toLowerCase();
          targetMaterials = targetMaterials.filter(m => 
            m.level?.toLowerCase() === lvl || 
            m.slug?.current?.toLowerCase().startsWith(lvl)
          );
        }
        if (options.query) {
          const q = options.query.toLowerCase();
          targetMaterials = targetMaterials.filter(m => 
            m.slug?.current?.toLowerCase().includes(q) || 
            m.title?.toLowerCase().includes(q)
          );
        }
      }

      if (targetMaterials.length > 0) {
        targetMaterials.forEach((row) => {
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
      console.warn("⚠️  [Sanity] Lewati listeningMaterial: ", err.message);
    }

    console.log(`📊 Total baris teks dialog listening unik yang ditemukan: ${itemsToProcess.length}`);

    // 2. Bandingkan dengan cache DB
    console.log("🔍 [2/2] Memeriksa status cache di database...");
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

    if (!options.force) {
      itemsToProcess.forEach((item) => {
        const cacheId = crypto.createHash("md5").update(`${item.text}_${item.voice}_medium`).digest("hex");
        if (!existingCacheIds.has(cacheId)) {
          missingItems.push(item);
        }
      });
    } else {
      console.log("⚠️  Mode force aktif: Mengabaikan cache database dan memproses ulang seluruh item.");
      missingItems.push(...itemsToProcess);
    }

    console.log(`📈 Jumlah item yang akan diproses: ${missingItems.length}`);

    if (missingItems.length === 0) {
      console.log("✅ Semua audio dialog listening sudah lengkap di-cache!");
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
        consecutiveFailures = 0; 
        await sleep(22000); // 22s delay agar aman di bawah rate limit 3 RPM Gemini Free Tier
      } catch (err) {
        console.error(`❌ Gagal mensintesis "${item.text}":`, err.message);
        logFailure(item.text, item.voice, err.message);
        consecutiveFailures += 1;

        if (consecutiveFailures >= 5) {
          console.warn("\n⚠️  Terjadi 5 kegagalan beruntun. Istirahat 45 detik...");
          await sleep(45000);
          consecutiveFailures = 0;
        } else {
          await sleep(10000);
        }
      }
    }

    console.log(`\n🎉 [Selesai] Berhasil memproses ${successCount}/${targetItems.length} audio listening!`);
    if (successCount < targetItems.length) {
      console.log(`💡 Kegagalan dicatat di: ${FAILURE_LOG_PATH}`);
    }
    process.exit(0);

  } catch (error) {
    console.error("❌ [Error] Gagal menjalankan generator listening:", error.message || error);
    process.exit(1);
  }
}

main();
