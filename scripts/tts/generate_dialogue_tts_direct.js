#!/usr/bin/env node

/**
 * @file generate_dialogue_tts_direct.js
 * @description Script utilitas produksi untuk pre-sintesis percakapan (dialog)
 * dan contoh kalimat pelajaran (Lessons) menggunakan Gemini API langsung (tanpa gateway).
 * 
 * Penggunaan:
 *   node scripts/tts/generate_dialogue_tts_direct.js [--execute] [--limit 50] [--level N5] [--lesson 1]
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
    `[${timestamp}] [Dialogue Direct] Teks: "${text}" | Voice: ${voice} | Error: ${errorMsg}\n`,
    "utf8"
  );
}

// Voice mappings (Mirrors existing config)
const SPEAKER_MAP = {
  // English/Romaji (20)
  "ani": "ani",
  "ayu": "ayu",
  "andi": "andi",
  "indah": "indah",
  "kimura": "kimura",
  "kobayashi": "kobayashi",
  "sakura": "sakura",
  "sato": "sato",
  "siti": "siti",
  "suzuki": "suzuki",
  "zundamon": "zundamon",
  "takahashi": "takahashi",
  "tanaka": "tanaka",
  "dito": "dito",
  "dewi": "dewi",
  "hayashi": "hayashi",
  "budi": "budi",
  "lala": "lala",
  "ritsu": "ritsu",
  "yamada": "yamada",

  // Japanese Katakana/Kanji dari database (30)
  "アニ": "ani",
  "アユ": "ayu",
  "アンディ": "andi",
  "インダ": "indah",
  "キムラ": "kimura",
  "コバヤシ": "kobayashi",
  "サクラ": "sakura",
  "サト": "sato",
  "サトウ": "sato",
  "シティ": "siti",
  "スズキ": "suzuki",
  "ずんだもん": "zundamon",
  "ズンダモン": "zundamon",
  "タカハシ": "takahashi",
  "タナカ": "tanaka",
  "ディト": "dito",
  "デウィ": "dewi",
  "ハヤシ": "hayashi",
  "ブディ": "budi",
  "ララ": "lala",
  "ララ・ディト・シティ": "lala",
  "ララ・ディト・シティ ": "lala",
  "lala・dito・siti": "lala",
  "リツ": "ritsu",
  "佐藤": "sato",
  "小林": "kobayashi",
  "林": "hayashi",
  "鈴木": "suzuki",
  "高橋": "takahashi",
  "山田": "yamada",
  "ヤマダ": "yamada",
  "やまだ": "yamada"
};

const GEMINI_VOICE_MAP = {
  // Wanita (11)
  "indah": "Aoede",
  "lala": "Zephyr",
  "siti": "Vindemiatrix",
  "dewi": "Leda",
  "hayashi": "Sulafat",
  "sato": "Erinome",
  "ayu": "Callirrhoe",
  "zundamon": "Autonoe",
  "ritsu": "Enceladus",
  "sakura": "Kore",
  "ani": "Achernar",

  // Pria (10)
  "budi": "Charon",
  "dito": "Umbriel",
  "suzuki": "Iapetus",
  "tanaka": "Orus",
  "kimura": "Fenrir",
  "andi": "Alnilam",
  "faisal": "Algieba",
  "takahashi": "Achird",
  "kobayashi": "Rasalgethi",
  "yamada": "Algenib"
};

const DIRECTOR_NOTES = {
  // Wanita (11)
  "indah": "Style: Calm and intellectual. Pace: Slow and polite.",
  "lala": "Style: 'Vocal Smile', very bright and energetic high school girl. Pace: Fast, bouncing cadence.",
  "siti": "Style: Gentle, soft-spoken, and reassuring. Pace: Relaxed.",
  "dewi": "Style: Innocent, spoiled child. Dynamics: High pitch, excitable.",
  "hayashi": "Style: Motherly, wise, and warm. Pace: Slow and comforting.",
  "sato": "Style: Formal, polite receptionist. Pace: Standard, professional.",
  "ayu": "Style: Casual, friendly, modern youth. Pace: Natural and relaxed.",
  "ritsu": "Style: Mysterious, cool, breathless. Pace: Very slow with pauses.",
  "sakura": "Style: Pure, gentle, and caring girl. Pace: Soft and polite.",
  "ani": "Style: Shy, hesitant, and quiet. Pace: Slow and slightly trembling.",
  "zundamon": "Style: Childish mascot, extremely high energy. Pace: Very fast and jumpy.",

  // Pria (10)
  "budi": "Style: Authoritative but warm teacher. Voice: Deep and resonant. Pace: Slow and clear.",
  "dito": "Style: Chill, casual high school boy. Pace: Standard, relaxed.",
  "suzuki": "Style: Crisp, formal office worker. Pace: Fast and efficient.",
  "tanaka": "Style: Dependable father figure. Voice: Heavy and deep. Pace: Slow and steady.",
  "kimura": "Style: Energetic, casual youth. Pace: Fast and upbeat.",
  "andi": "Style: Passionate, dramatic, confident. Dynamics: Strong projection.",
  "faisal": "Style: Calm, intellectual, and smooth. Pace: Relaxed and thoughtful.",
  "takahashi": "Style: Friendly, polite young businessman. Pace: Natural.",
  "kobayashi": "Style: Serious, strict, and deep. Pace: Deliberate and heavy.",
  "yamada": "Style: Kind grandfather. Voice: Gravelly and breathy. Pace: Very slow and warm."
};

function detectVoice(speaker) {
  if (!speaker || speaker === "???" || speaker.trim() === "") {
    throw new Error("Nama pembicara tidak boleh kosong atau tidak valid.");
  }
  
  const originalClean = speaker.trim().toLowerCase();
  
  // 1. Cek pemetaan eksplisit untuk nama persis (misal: "ララ・ディト・シティ")
  if (SPEAKER_MAP[originalClean]) {
    return SPEAKER_MAP[originalClean];
  }
  
  // 2. Cek pemetaan setelah dibersihkan gelar/honorifik secara utuh
  const cleanOriginal = originalClean.replace(/[- ]?(さん|くん|ちゃん|様|君|先生|sama|san|kun|chan|sensei)$/i, "").trim();
  if (SPEAKER_MAP[cleanOriginal]) {
    return SPEAKER_MAP[cleanOriginal];
  }
  
  // 3. Fallback potong pembicara pertama jika berupa gabungan yang tidak terdaftar
  const firstSpeaker = speaker.split(/[・、/&,]/)[0].split(/\s+dan\s+/i)[0].split(/\s+and\s+/i)[0].trim();
  const cleanSpeaker = firstSpeaker.replace(/[- ]?(さん|くん|ちゃん|様|君|先生|sama|san|kun|chan|sensei)$/i, "").trim().toLowerCase();
  
  if (SPEAKER_MAP[cleanSpeaker]) {
    return SPEAKER_MAP[cleanSpeaker];
  }
  
  if (GEMINI_VOICE_MAP[cleanSpeaker]) {
    return cleanSpeaker;
  }
  
  throw new Error(`Karakter tidak dikenal: "${speaker}". Script dikonfigurasi secara Strict Mode (tidak menerima karakter baru). Pastikan ejaan karakter sudah benar di sumber materi.`);
}

function printUsage() {
  console.log(
    [
      "=== NIHONGOROUTE BATCH LESSON DIALOGUE DIRECT TTS GENERATOR ===",
      "Penggunaan:",
      "  node scripts/tts/generate_dialogue_tts_direct.js [options]",
      "",
      "Opsi:",
      "  --execute          Jalankan pemrosesan nyata (Default: Dry Run saja).",
      "  --limit <num>      Batasi jumlah audio baru yang dibuat. Default: Unlimited (Semua)",
      "  --level <lvl>      Filter level JLPT (N5, N4, N3, N2, N1).",
      "  --lesson <num>     Filter berdasarkan nomor order lesson (contoh: 1).",
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

// --- Load Context Cache from .cache ---
const CACHE_DIR = path.resolve(process.cwd(), ".cache");
const lessonContextCache = {}; // format: { "n5_1": "Context string..." }

function loadLocalCache() {
  if (!fs.existsSync(CACHE_DIR)) return;
  const files = fs.readdirSync(CACHE_DIR).filter(f => f.endsWith("_progress.json"));
  for (const file of files) {
    try {
      const level = file.split("_")[0].toLowerCase(); // e.g. "n5"
      const content = JSON.parse(fs.readFileSync(path.join(CACHE_DIR, file), "utf8"));
      if (content.lessons) {
        for (const [orderNumber, lessonData] of Object.entries(content.lessons)) {
          const title = lessonData.title || "";
          const summary = lessonData.summary || "";
          const canDo = lessonData.generation_context?.can_do || "";
          
          const ctx = [];
          if (title) ctx.push(`Title: ${title}`);
          if (summary) ctx.push(`Situation: ${summary}`);
          if (canDo) ctx.push(`Goal: ${canDo}`);
          
          if (ctx.length > 0) {
            lessonContextCache[`${level}_${orderNumber}`] = ctx.join("\n");
          }
        }
      }
    } catch (e) {
      console.warn(`⚠️ Gagal memuat cache konteks dari ${file}:`, e.message);
    }
  }
}

function parseArgs(args) {
  const options = {
    execute: false,
    limit: Infinity,
    level: null,
    lessonNum: null,
    force: false,
    recreateVoice: null,
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
    if (arg === "--force") {
      options.force = true;
      continue;
    }
    if (arg === "--recreate-voice") {
      options.recreateVoices = args[index + 1]?.split(",").map(v => v.trim().toLowerCase()).filter(Boolean) || [];
      index += 1;
      continue;
    }
    if (arg === "--recreate-hash") {
      options.recreateHashes = args[index + 1]?.split(",").map(h => h.trim()).filter(Boolean) || [];
      index += 1;
      continue;
    }
    if (arg === "--recreate-text") {
      options.recreateTexts = args[index + 1]?.split("|").map(t => t.trim()).filter(Boolean) || [];
      index += 1;
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
    throw new Error(`Ffmpeg WAV conversion failed: ${err}`);
  }

  return result.stdout;
}

async function synthesizeVoicevox(text, speakerId) {
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
      "gemini-2.5-pro-preview-tts",
    );
  }
  return Array.from(new Set(models)).filter(Boolean);
}

let globalKeyIndex = 0;
let globalModelIndex = 0;

async function queryGeminiTtsWithRetry(text, geminiVoice, characterId, context = "", retries = 5, initialDelay = 5000) {
  const apiKeys = getGeminiApiKeys();
  if (apiKeys.length === 0) {
    throw new Error("GEMINI_API_KEY tidak ditemukan di environment.");
  }

  const models = getGeminiModels();
  let delay = initialDelay;

  const maxAttempts = Math.max(retries, apiKeys.length * models.length * 2);
  let keysTriedForCurrentModel = 0;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    const currentApiKey = apiKeys[globalKeyIndex % apiKeys.length];
    const currentModel = models[globalModelIndex % models.length];
    
    const isInteractionsApi = currentModel.includes("3.1");
    let url, requestBody;
    
    const notes = DIRECTOR_NOTES[characterId] || "Style: Neutral reading.";
    let sceneSection = "";
    if (context) {
      sceneSection = `\n## THE SCENE\n${context}\n`;
    }

    const promptText = `
### DIRECTOR'S NOTES
Language: Native Japanese [BCP-47: ja-JP]. You are a Japanese voice actor. Pronounce the transcript with fluent, native Japanese intonation.
${notes}
${sceneSection}
#### TRANSCRIPT
${text}
`.trim();

    if (isInteractionsApi) {
      url = `https://generativelanguage.googleapis.com/v1beta/interactions?key=${currentApiKey}`;
      requestBody = {
        model: currentModel,
        input: promptText,
        response_format: { type: "audio" },
        generation_config: {
          speech_config: [ { voice: geminiVoice } ]
        }
      };
    } else {
      url = `https://generativelanguage.googleapis.com/v1beta/models/${currentModel}:generateContent?key=${currentApiKey}`;
      requestBody = {
        contents: [
          {
            role: "user",
            parts: [{ text: text }],
          },
        ],
        systemInstruction: {
          parts: [{ text: `You are a text-to-speech reader. Do not converse. Emulate this persona:\n${notes}\n\nContext:\n${context}` }]
        },
        generationConfig: {
          responseModalities: ["AUDIO"],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: geminiVoice },
            },
          },
        },
      };
    }

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorJson;
        try {
          errorJson = JSON.parse(errorText);
        } catch (_) {}

        const status = response.status;
        const msg = errorJson?.error?.message || errorText;

        // 429 = Rate limit, 502/503 = Server overload, 403 = Key diblokir
        if (status === 429 || status === 502 || status === 503 || status === 403) {
          if (apiKeys.length > 1 && keysTriedForCurrentModel + 1 < apiKeys.length) {
            console.warn(`   ⚠️  [Gemini TTS Coba ${attempt}/${maxAttempts}] Key #${(globalKeyIndex % apiKeys.length) + 1} terkena error ${status} (Model: ${currentModel}). Memutar ke key berikutnya...`);
            globalKeyIndex += 1;
            keysTriedForCurrentModel += 1;
            await sleep(1000);
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
          }

          console.warn(`   ⏳ Limit API tercapai pada semua key. Menunggu ${Math.ceil(waitMs / 1000)} detik untuk reset quota sebelum retry...`);
          await sleep(waitMs);

          // Jangan memutar model! Quota sudah di-reset, jadi kita bisa mencoba model yang sama lagi.
          keysTriedForCurrentModel = 0;
          continue;
        }

        throw new Error(`HTTP ${status}: ${msg}`);
      }

      const data = await response.json();

      if (isInteractionsApi) {
        const step = data.steps?.find(s => s.type === "model_output");
        const audioPart = step?.content?.find(c => c.type === "audio" || c.mime_type?.startsWith("audio/"));
        if (!audioPart || !audioPart.data) {
          throw new Error("Respon Gemini Interactions tidak berisi data audio.");
        }
        const pcmBuffer = Buffer.from(audioPart.data, "base64");
        return convertPcmToMp3(pcmBuffer, audioPart.sample_rate || 24000);
      } else {
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
      }
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


async function query9RouterTtsWithRetry(text, geminiVoice, characterId, context = "", retries = 5) {
  const ninerouterUrl = process.env.NINEROUTER_URL || "http://localhost:20128";
  const ninerouterKey = process.env.NINEROUTER_KEY;

  const models = getGeminiModels();
  const maxAttempts = Math.max(retries * models.length, 30);
  let delay = 5000;
  let modelsTriedForCurrentCycle = 0;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    let voiceModel = process.env.NINEROUTER_TTS_MODEL || "";
    const currentModel = models[globalModelIndex % models.length];
    if (!voiceModel) {
      voiceModel = `gemini/${currentModel}`;
    }

    const baseUrl = ninerouterUrl.endsWith("/v1") ? ninerouterUrl : `${ninerouterUrl}/v1`;
    const url = `${baseUrl}/audio/speech`;

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(ninerouterKey ? { "Authorization": `Bearer ${ninerouterKey}` } : {}),
        },
        body: JSON.stringify({
          model: voiceModel,
          voice: geminiVoice,
          input: text,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        const status = response.status;

        // Rotate model on rate limit or other failures
        if (status === 429 || status === 502 || status === 503 || status === 403) {
          if (models.length > 1 && modelsTriedForCurrentCycle + 1 < models.length) {
            console.warn(`   ⚠️  [9Router TTS Coba ${attempt}/${maxAttempts}] Model ${voiceModel} terkena error ${status}. Memutar ke model berikutnya...`);
            globalModelIndex += 1;
            modelsTriedForCurrentCycle += 1;
            await sleep(1000);
            continue;
          }

          let waitMs = 25000;
          const resetMatch = errorText.match(/reset after (\d+(?:\.\d+)?)s/i) || errorText.match(/Please retry in (\d+(?:\.\d+)?)s/i);
          if (resetMatch) {
            waitMs = Math.ceil(parseFloat(resetMatch[1]) * 1000) + 2000;
          }

          console.warn(`   ⏳ Limit API tercapai pada 9Router. Menunggu ${Math.ceil(waitMs / 1000)} detik untuk reset quota sebelum retry...`);
          await sleep(waitMs);
          modelsTriedForCurrentCycle = 0;
          continue;
        }

        throw new Error(`9Router TTS HTTP ${status}: ${errorText}`);
      }

      const arrayBuffer = await response.arrayBuffer();
      return Buffer.from(arrayBuffer);
    } catch (err) {
      if (attempt === maxAttempts) throw err;
      console.warn(`   ⚠️  [9Router TTS Coba ${attempt}/${maxAttempts}] Gagal: ${err.message}. Memutar model & Retrying in ${delay / 1000}s...`);
      globalModelIndex += 1;
      await sleep(delay);
      delay *= 2;
    }
  }

  throw new Error("Semua percobaan sintesis gagal setelah rotasi seluruh model di 9Router.");
}

async function processTtsItem(supabase, text, voice, rate = "medium", folder = "", context = "") {
  const cacheId = crypto.createHash("md5").update(`${text}_${voice}_${rate}`).digest("hex");
  const filename = folder ? `${folder}/${cacheId}.mp3` : `${cacheId}.mp3`;
  const BUCKET_NAME = "tts-cache";

  let mp3Buffer;
  if (voice === "zundamon") {
    try {
      console.log(`   ➔ [VOICEVOX] Menyintesis Zundamon (Speaker ID: 3)...`);
      const wavBuffer = await synthesizeVoicevox(text, 3);
      mp3Buffer = convertWavToMp3(wavBuffer);
      console.log(`   └─ [VOICEVOX] Sintesis Zundamon sukses.`);
    } catch (vvError) {
      throw new Error(`Gagal sintesis VOICEVOX untuk Zundamon: ${vvError.message}`);
    }
  } else {
    const geminiVoice = GEMINI_VOICE_MAP[voice];
    if (!geminiVoice) {
      throw new Error(`Suara Gemini untuk '${voice}' tidak ditemukan.`);
    }

    try {
      mp3Buffer = await query9RouterTtsWithRetry(text, geminiVoice, voice, context);
      console.log(`   └─ [9Router TTS] Sintesis sukses (${geminiVoice}).`);
    } catch (ninerouterError) {
      console.warn(`   ⚠️  [9Router TTS] Gagal/tidak aktif (${ninerouterError.message}). Mencoba direct Gemini API...`);
      mp3Buffer = await queryGeminiTtsWithRetry(text, geminiVoice, voice, context);
      console.log(`   └─ [Gemini TTS] Sintesis & konversi sukses (${geminiVoice}).`);
    }
  }

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
  loadLocalCache();
  let options = parseArgs(process.argv.slice(2));

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

    const addItem = (text, voice, folder = "", context = "") => {
      if (!text) return;
      const clean = text.trim();
      if (!clean) return;
      
      const exists = itemsToProcess.some((i) => i.text === clean && i.voice === voice);
      if (!exists) {
        itemsToProcess.push({ text: clean, voice, folder, context });
      }
    };

    const processContentBlocks = (blocks, folder = "", contextString = "") => {
      if (!Array.isArray(blocks)) return;
      blocks.forEach((block) => {
        const type = block.type || block._type;
        if ((type === "dialogue" || type === "dialogueBlock") && block.content) {
          const lines = block.content.split("\n").filter(Boolean);
          lines.forEach((line, i) => {
            const parts = line.split(/[：:]/);
            const rawSpeaker = parts.length > 1 ? parts[0].trim() : undefined;
            const lineText = parts.length > 1 ? parts.slice(1).join("：").trim() : line.trim();
            const voice = detectVoice(rawSpeaker);
            addItem(lineText, voice, folder, contextString);
          });
        }
      });
    };

    // Tarik daftar lessons terlebih dahulu dari Supabase untuk keperluan menu
    let allLessons = [];
    try {
      const { data } = await supabase.from("lessons").select("title, order_number, slug, content_blocks");
      if (data) {
        allLessons = data;
        allLessons.sort((a, b) => (a.order_number || 0) - (b.order_number || 0));
      }
    } catch (e) {
      console.warn("⚠️ Gagal menarik lessons dari Supabase: ", e.message);
    }

    const hasRecreateFilter = 
      (options.recreateVoices && options.recreateVoices.length > 0) ||
      (options.recreateHashes && options.recreateHashes.length > 0) ||
      (options.recreateTexts && options.recreateTexts.length > 0);

    // Aktifkan menu interaktif jika dijalankan di terminal dan tanpa filter pencarian/recreate
    if (allLessons.length > 0 && !options.level && options.lessonNum === null && !hasRecreateFilter && process.stdout.isTTY) {
      console.log("\n=== PILIH LEVEL JLPT ===");
      const lvlInput = await askQuestion("Pilih Level JLPT (N5, N4, N3, N2, N1, atau tekan Enter untuk semua): ");

      let targetLessons = allLessons;

      if (lvlInput) {
        const lvl = lvlInput.trim().toLowerCase();
        options.level = lvl.toUpperCase();
        targetLessons = targetLessons.filter(l => 
          l.slug?.toLowerCase().includes(lvl) ||
          l.title?.toLowerCase().includes(lvl)
        );
      }

      if (targetLessons.length === 0) {
        console.log("❌ Tidak ada pelajaran yang cocok dengan kriteria level Anda. Membatalkan...");
        process.exit(0);
      }

      console.log("\n=== DAFTAR PELAJARAN (LESSONS) ===");
      targetLessons.forEach((l, idx) => {
        console.log(`[${idx + 1}] Lesson ${l.order_number || idx + 1}: ${l.title || l.slug || "Untitled"}`);
      });
      console.log("[0] PROSES SEMUA PELAJARAN HASIL FILTER");

      const answer = await askQuestion(`\nPilih nomor pelajaran (0-${targetLessons.length}): `);
      const choice = parseInt(answer, 10);
      if (isNaN(choice) || choice < 0 || choice > targetLessons.length) {
        console.log("❌ Pilihan tidak valid. Membatalkan...");
        process.exit(0);
      }

      if (choice > 0) {
        const selectedLesson = targetLessons[choice - 1];
        options.lessonNum = selectedLesson.order_number;
        // set filter level jika lessonNum terpilih agar query Sanity di bawah juga ter-filter
        if (selectedLesson.slug) {
          const match = selectedLesson.slug.match(/^(n[1-5])/i);
          if (match) {
            options.level = match[1].toUpperCase();
          }
        }
        console.log(`\nSelected: Lesson ${selectedLesson.order_number}`);
      } else {
        console.log("\nProcessing all filtered lessons...");
      }

      const forceAns = await askQuestion("Apakah ingin memaksa sintesis ulang (menimpa cache)? (y/N): ");
      if (forceAns.toLowerCase() === "y" || forceAns.toLowerCase() === "yes") {
        options.force = true;
        console.log("⚠️  Mode force aktif: Mengabaikan cache.");
      }
    }

    // 1. Ambil pelajaran dari Supabase
    console.log("\n🔍 [1/2] Menarik data lessons dari Supabase...");
    let sbQuery = supabase.from("lessons").select("content_blocks, slug, order_number, title");
    if (options.level) {
      sbQuery = sbQuery.like("slug", `${options.level.toLowerCase()}-%`);
    }
    if (options.lessonNum !== null) {
      sbQuery = sbQuery.eq("order_number", options.lessonNum);
    }
    const { data: supabaseLessons } = await sbQuery;
    if (supabaseLessons) {
      supabaseLessons.forEach((row) => {
        let ctxStr = "";
        const match = row.slug?.match(/^(n[1-5])/i);
        if (match && row.order_number) {
          const level = match[1].toLowerCase();
          ctxStr = lessonContextCache[`${level}_${row.order_number}`] || "";
        }
        if (!ctxStr && row.title) {
          ctxStr = `Title: ${row.title}`;
        }
        processContentBlocks(row.content_blocks, `lessons/${row.slug}`, ctxStr);
      });
    }


    if (hasRecreateFilter) {
      const filtered = itemsToProcess.filter((item) => {
        const cacheId = crypto.createHash("md5").update(`${item.text}_${item.voice}_medium`).digest("hex");
        return (options.recreateVoices && options.recreateVoices.includes(item.voice)) ||
               (options.recreateHashes && options.recreateHashes.includes(cacheId)) ||
               (options.recreateTexts && options.recreateTexts.includes(item.text));
      });
      itemsToProcess.length = 0;
      itemsToProcess.push(...filtered);
    }

    console.log(`📊 Total baris teks dialog/contoh kalimat unik yang ditemukan: ${itemsToProcess.length}`);

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

    if (!options.force && !hasRecreateFilter) {
      itemsToProcess.forEach((item) => {
        const cacheId = crypto.createHash("md5").update(`${item.text}_${item.voice}_medium`).digest("hex");
        if (!existingCacheIds.has(cacheId)) {
          missingItems.push(item);
        }
      });
    } else {
      console.log("⚠️  Mode force/recreate aktif: Mengabaikan cache database dan memproses ulang seluruh item terfilter.");
      missingItems.push(...itemsToProcess);
    }

    console.log(`📈 Jumlah item yang akan diproses: ${missingItems.length}`);

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
        await processTtsItem(supabase, item.text, item.voice, "medium", item.folder, item.context);
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
