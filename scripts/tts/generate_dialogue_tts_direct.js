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


const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const FAILURE_LOG_PATH = path.resolve(process.cwd(), "tts_failures.log");

// --- Logging helpers ---
function ts() {
  return new Date().toTimeString().slice(0, 8); // HH:MM:SS
}
function log(msg) {
  console.log(`[${ts()}] ${msg}`);
}
function logWarn(msg) {
  console.warn(`[${ts()}] ⚠️  ${msg}`);
}
function logErr(msg) {
  console.error(`[${ts()}] ❌ ${msg}`);
}
function formatDuration(ms) {
  const totalSec = Math.round(ms / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  if (h > 0) return `${h}j ${m}m ${s}d`;
  if (m > 0) return `${m}m ${s}d`;
  return `${s}d`;
}
function truncate(text, max = 60) {
  if (!text) return "";
  return text.length > max ? `${text.slice(0, max)}…` : text;
}

// Global error handlers
process.on("unhandledRejection", (reason) => {
  logErr(`[Global Unhandled Rejection] Terdeteksi: ${reason?.message || reason}`);
});
process.on("uncaughtException", (error) => {
  logErr(`[Global Uncaught Exception] Terdeteksi: ${error.message || error}`);
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
  "faisal":"fausal",

  // Japanese Katakana/Kanji dari database (30)
  "アニ": "ani",
  "アユ": "ayu",
  "アンディ": "andi",
  "アンジ": "andi",
  "インダ": "indah",
  "インダー": "indah",
  "キムラ": "kimura",
  "木村": "kimura",
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
  "田中": "tanaka",
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
  "やまだ": "yamada",
  "ファイサル":"faisal"
};

const GEMINI_VOICE_MAP = {
  // ===== Siswi Wanita (Female A) =====
  "lala": "Zephyr",
  "siti": "Vindemiatrix",
  "sakura": "Kore",
  "ayu": "Callirrhoe",
  "ani": "Achernar",
  "dewi": "Leda",

  // ===== Staf/Guru Wanita (Female B) =====
  "indah": "Aoede",
  "hayashi": "Sulafat",
  "sato": "Erinome",
  "ritsu": "Enceladus",

  // ===== Siswa Pria (Male A) =====
  "dito": "Umbriel",
  "andi": "Alnilam",
  "kimura": "Fenrir",

  // ===== Staf/Guru Pria (Male B) =====
  "budi": "Charon",
  "suzuki": "Iapetus",
  "tanaka": "Orus",
  "yamada": "Algenib",
  "takahashi": "Achird",
  "kobayashi": "Rasalgethi",
  "faisal": "Algieba",

  // Catatan: "zundamon" sengaja TIDAK dimasukkan di sini. Voice itu selalu
  // disintesis via VOICEVOX lokal (lihat processTtsItem) sebelum kode
  // sempat melakukan lookup ke map ini, jadi entry Gemini untuk zundamon
  // sebelumnya adalah dead code.
};

const DIRECTOR_NOTES = {
  // ================= SISWI WANITA (Female A) =================
  "lala": "Speaker: Female, teenage high school student. Style: 'Vocal Smile', very bright and energetic. Pace: Fast, bouncing cadence.",
  "siti": "Speaker: Female, teenage/young student. Style: Gentle, soft-spoken, and reassuring. Pace: Relaxed.",
  "sakura": "Speaker: Female, teenage student. Style: Pure, gentle, and caring girl. Pace: Soft and polite.",
  "ayu": "Speaker: Female, young student. Style: Casual, friendly, modern youth. Pace: Natural and relaxed.",
  "ani": "Speaker: Female, teenage student. Style: Shy, hesitant, and quiet. Pace: Slow and slightly trembling.",
  "dewi": "Speaker: Female, young child student. Style: Innocent, spoiled child. Dynamics: High pitch, excitable.",

  // ============== STAF / GURU WANITA (Female B) ==============
  "indah": "Speaker: Female, adult staff/teacher. Style: Calm and intellectual. Pace: Slow and polite.",
  "hayashi": "Speaker: Female, middle-aged/older staff/teacher. Style: Motherly, wise, and warm. Pace: Slow and comforting.",
  "sato": "Speaker: Female, adult staff/receptionist. Style: Formal, polite receptionist. Pace: Standard, professional.",
  "ritsu": "Speaker: Female, adult staff/teacher. Style: Mysterious, cool, breathless. Pace: Very slow with pauses.",

  // ================= SISWA PRIA (Male A) =================
  "dito": "Speaker: Male, teenage high school student. Style: Chill, casual high school boy. Pace: Standard, relaxed.",
  "andi": "Speaker: Male, young adult student. Style: Passionate, dramatic, confident. Dynamics: Strong projection.",
  "kimura": "Speaker: Male, young adult student. Style: Energetic, casual youth. Pace: Fast and upbeat.",

  // ============== STAF / GURU PRIA (Male B) ==============
  "budi": "Speaker: Male, adult staff/teacher. Style: Authoritative but warm teacher. Voice: Deep and resonant. Pace: Slow and clear.",
  "suzuki": "Speaker: Male, adult staff/office worker. Style: Crisp, formal office worker. Pace: Fast and efficient.",
  "tanaka": "Speaker: Male, middle-aged staff/teacher. Style: Dependable father figure. Voice: Heavy and deep. Pace: Slow and steady.",
  "yamada": "Speaker: Male, elderly staff/teacher. Style: Kind grandfather. Voice: Gravelly and breathy. Pace: Very slow and warm.",
  "takahashi": "Speaker: Male, young adult staff/businessman. Style: Friendly, polite young businessman. Pace: Natural.",
  "kobayashi": "Speaker: Male, adult staff/teacher. Style: Serious, strict, and deep. Pace: Deliberate and heavy.",
  "faisal": "Speaker: Male, adult staff/teacher. Style: Calm, intellectual, and smooth. Pace: Relaxed and thoughtful.",

  // ===================== MASKOT =====================
  "zundamon": "Speaker: Genderless mascot character. Style: Childish mascot, extremely high energy. Pace: Very fast and jumpy. (Disintesis via VOICEVOX lokal, bukan Gemini — notes ini hanya untuk referensi.)",
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
      "  --direct           Lewati 9Router, langsung panggil Gemini API (untuk debug voice mismatch).",
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
      logWarn(`Gagal memuat cache konteks dari ${file}: ${e.message}`);
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
    direct: false,
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
    if (arg === "--direct") {
      options.direct = true;
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
    // Urutan: 2.5-flash didahulukan karena gemini-3.1-flash-tts-preview
    // punya limitasi resmi "voice tidak konsisten dengan prompt" (lihat
    // dokumentasi Gemini TTS). 3.1 tetap ada sebagai fallback terakhir.
    models.push(
      "gemini-3.1-flash-tts-preview",
      // "gemini-2.5-flash-preview-tts",
    );
  }
  return Array.from(new Set(models)).filter(Boolean);
}

function buildTtsPrompt(text, characterId, context = "") {
  const notes = DIRECTOR_NOTES[characterId] || "Style: Neutral reading.";
  let sceneSection = "";
  if (context) {
    sceneSection = `\n## THE SCENE\n${context}\n`;
  }
  return `
### DIRECTOR'S NOTES
Language: Native Japanese [BCP-47: ja-JP]. You are a Japanese voice actor. Pronounce the transcript with fluent, native Japanese intonation.
${notes}
${sceneSection}
#### TRANSCRIPT
${text}
`.trim();
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

    const promptText = buildTtsPrompt(text, characterId, context);

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
            parts: [{ text: promptText }],
          },
        ],
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
            logWarn(`[Gemini TTS ${attempt}/${maxAttempts}] Key #${(globalKeyIndex % apiKeys.length) + 1} error ${status} (Model: ${currentModel}) → memutar ke key berikutnya`);
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

          logWarn(`Limit API tercapai di semua key (Model: ${currentModel}) → menunggu ${Math.ceil(waitMs / 1000)}d untuk reset quota`);
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
        return { buffer: convertPcmToMp3(pcmBuffer, audioPart.sample_rate || 24000), model: currentModel };
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

        return { buffer: convertPcmToMp3(pcmBuffer, sampleRate), model: currentModel };
      }
    } catch (err) {
      if (attempt === maxAttempts) throw err;
      logWarn(`[Gemini TTS ${attempt}/${maxAttempts}] Gagal: ${err.message} → retry key/model dalam ${delay / 1000}d`);

      if (apiKeys.length > 1) {
        globalKeyIndex += 1;
        keysTriedForCurrentModel += 1;
        if (keysTriedForCurrentModel >= apiKeys.length) {
          keysTriedForCurrentModel = 0;
          globalModelIndex += 1;
          logWarn(`Seluruh key untuk model ${currentModel} sudah dicoba → memutar ke model berikutnya: ${models[globalModelIndex % models.length]}`);
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
    const currentModel = models[globalModelIndex % models.length];
    // 9Router menyimpan nama voice sebagai bagian dari string model,
    // format: gemini/<model>/<voice> — BUKAN sebagai field "voice" terpisah.
    // (Dikonfirmasi dari curl yang di-generate UI 9Router sendiri.)
    const modelBase = process.env.NINEROUTER_TTS_MODEL || `gemini/${currentModel}`;
    const voiceModel = `${modelBase}/${geminiVoice}`;

    const baseUrl = ninerouterUrl.endsWith("/v1") ? ninerouterUrl : `${ninerouterUrl}/v1`;
    const url = `${baseUrl}/audio/speech`;
    const promptText = buildTtsPrompt(text, characterId, context);

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(ninerouterKey ? { "Authorization": `Bearer ${ninerouterKey}` } : {}),
        },
        body: JSON.stringify({
          model: voiceModel,
          input: promptText,
          language: "Japanese",
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        const status = response.status;

        // Rotate model on rate limit or other failures
        if (status === 429 || status === 502 || status === 503 || status === 403) {
          if (models.length > 1 && modelsTriedForCurrentCycle + 1 < models.length) {
            logWarn(`[9Router TTS ${attempt}/${maxAttempts}] Model ${voiceModel} error ${status} → memutar ke model berikutnya`);
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

          logWarn(`Limit API tercapai di 9Router → menunggu ${Math.ceil(waitMs / 1000)}d untuk reset quota`);
          await sleep(waitMs);
          modelsTriedForCurrentCycle = 0;
          continue;
        }

        throw new Error(`9Router TTS HTTP ${status}: ${errorText}`);
      }

      const arrayBuffer = await response.arrayBuffer();
      return { buffer: Buffer.from(arrayBuffer), model: currentModel };
    } catch (err) {
      if (attempt === maxAttempts) throw err;
      logWarn(`[9Router TTS ${attempt}/${maxAttempts}] Gagal: ${err.message} → retry model dalam ${delay / 1000}d`);
      globalModelIndex += 1;
      await sleep(delay);
      delay *= 2;
    }
  }

  throw new Error("Semua percobaan sintesis gagal setelah rotasi seluruh model di 9Router.");
}

async function processTtsItem(supabase, text, voice, rate = "medium", folder = "", context = "", forceDirect = false) {
  const cacheId = crypto.createHash("md5").update(`${text}_${voice}_${rate}`).digest("hex");
  const filename = folder ? `${folder}/${cacheId}.mp3` : `${cacheId}.mp3`;
  const BUCKET_NAME = "tts-cache";

  let mp3Buffer;
  let modelUsed = "voicevox";
  if (voice === "zundamon") {
    try {
      log(`   ➔ [VOICEVOX] Menyintesis suara Zundamon (Speaker ID: 3)...`);
      const wavBuffer = await synthesizeVoicevox(text, 3);
      mp3Buffer = convertWavToMp3(wavBuffer);
      log(`   └─ [VOICEVOX] Sukses.`);
    } catch (vvError) {
      throw new Error(`Gagal sintesis VOICEVOX untuk Zundamon: ${vvError.message}`);
    }
  } else {
    const geminiVoice = GEMINI_VOICE_MAP[voice];
    if (!geminiVoice) {
      throw new Error(`Suara Gemini untuk '${voice}' tidak ditemukan.`);
    }

    try {
      if (forceDirect) {
        throw new Error("--direct aktif: melewati 9Router, langsung ke Gemini API.");
      }
      const result = await query9RouterTtsWithRetry(text, geminiVoice, voice, context);
      mp3Buffer = result.buffer;
      modelUsed = result.model;
      log(`   └─ [9Router] Sukses — voice: ${geminiVoice}, model: ${modelUsed}`);
    } catch (ninerouterError) {
      logWarn(`[9Router] ${forceDirect ? "Dilewati" : "Gagal/tidak aktif"} (${ninerouterError.message}) → ${forceDirect ? "" : "fallback ke "}direct Gemini API`);
      const result = await queryGeminiTtsWithRetry(text, geminiVoice, voice, context);
      mp3Buffer = result.buffer;
      modelUsed = result.model;
      log(`   └─ [Gemini Direct] Sukses — voice: ${geminiVoice}, model: ${modelUsed}`);
    }
  }

  let publicUrl = "";
  try {
    const { isR2Configured, uploadToR2Storage } = await import("../utils/r2-helper.mjs");
    if (isR2Configured()) {
      publicUrl = await uploadToR2Storage(BUCKET_NAME, filename, mp3Buffer, "audio/mpeg");
      log(`   └─ [R2 Storage] Upload ke Cloudflare R2 sukses.`);
    }
  } catch (err) {
    log(`   └─ [R2 Warning] Gagal upload ke R2, mencoba Supabase: ${err.message}`);
  }

  if (!publicUrl) {
    const { error: uploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filename, mp3Buffer, {
        contentType: "audio/mpeg",
        upsert: true,
      });

    if (uploadError) throw new Error(`Upload storage gagal: ${uploadError.message}`);

    publicUrl = supabase.storage.from(BUCKET_NAME).getPublicUrl(filename).data.publicUrl;
  }

  const { error: dbError } = await supabase
    .from("tts_cache")
    .upsert({ id: cacheId, text, voice, rate, audio_url: publicUrl, model_used: modelUsed });

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
    logErr(`[Config] NEXT_PUBLIC_SUPABASE_URL dan SUPABASE_SERVICE_ROLE_KEY wajib ada di .env.local!`);
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  console.log("\n=== NIHONGOROUTE TTS DIALOGUE GENERATOR ===");
  log(`Mode         : ${options.execute ? "🚀 EXECUTE (akan generate audio nyata)" : "📋 DRY RUN (cuma preview, tidak generate)"}`);
  log(`Filter level : ${options.level || "(semua level)"}`);
  log(`Filter lesson: ${options.lessonNum !== null ? options.lessonNum : "(semua lesson)"}`);
  log(`Force/cache  : ${options.force ? "force (abaikan cache)" : "pakai cache"}`);
  log(`Routing      : ${options.direct ? "🔧 DIRECT (lewati 9Router, langsung ke Gemini API)" : "9Router → fallback Gemini direct"}`);
  log(`Limit item   : ${options.limit === Infinity ? "(tanpa batas)" : options.limit}`);
  log(`Gemini keys  : ${getGeminiApiKeys().length} key terdeteksi`);
  log(`Model order  : ${getGeminiModels().join(" → ")}`);
  console.log("");

  try {
    const itemsToProcess = [];
    const seenItemKeys = new Set();

    const addItem = (text, voice, folder = "", context = "") => {
      if (!text) return;
      const clean = text.trim();
      if (!clean) return;

      const key = `${clean}::${voice}`;
      if (!seenItemKeys.has(key)) {
        seenItemKeys.add(key);
        itemsToProcess.push({ text: clean, voice, folder, context });
      }
    };

    const processContentBlocks = (blocks, folder = "", contextString = "") => {
      if (!Array.isArray(blocks)) return;
      blocks.forEach((block) => {
        if (!block) return;

        // 1. Dukungan format Supabase lessons.dialogue (array of dialogue line objects)
        if (block.text || block.jp) {
          const rawText = (block.text || block.jp || "").trim();
          let rawSpeaker = (block.speaker || block.speakerName || "").trim();
          let lineText = rawText;

          if (lineText.includes("：") || lineText.includes(":")) {
            const parts = lineText.split(/[：:]/);
            if (parts.length > 1 && (!rawSpeaker || parts[0].trim().length < 15)) {
              if (!rawSpeaker) rawSpeaker = parts[0].trim();
              lineText = parts.slice(1).join("：").trim();
            }
          }

          if (lineText && rawSpeaker) {
            try {
              const voice = detectVoice(rawSpeaker);
              addItem(lineText, voice, folder, contextString);
            } catch (err) {
              logWarn(`Gagal deteksi voice untuk baris dialog "${lineText}" (${rawSpeaker}): ${err.message}`);
            }
          }
          return;
        }

        // 2. Dukungan format legacy (PortableText / content block)
        const type = block.type || block._type;
        if ((type === "dialogue" || type === "dialogueBlock") && block.content) {
          const lines = block.content.split("\n").filter(Boolean);
          lines.forEach((line) => {
            const parts = line.split(/[：:]/);
            const rawSpeaker = parts.length > 1 ? parts[0].trim() : undefined;
            const lineText = parts.length > 1 ? parts.slice(1).join("：").trim() : line.trim();
            if (lineText && rawSpeaker) {
              try {
                const voice = detectVoice(rawSpeaker);
                addItem(lineText, voice, folder, contextString);
              } catch (err) {
                logWarn(`Gagal deteksi voice untuk baris dialog legacy "${lineText}": ${err.message}`);
              }
            }
          });
        }
      });
    };

    // Tarik daftar lessons terlebih dahulu dari Supabase untuk keperluan menu
    let allLessons = [];
    try {
      const { data } = await supabase.from("lessons").select("title, order_number, slug, dialogue");
      if (data) {
        allLessons = data;
        allLessons.sort((a, b) => (a.order_number || 0) - (b.order_number || 0));
      }
    } catch (e) {
      logWarn(`Gagal menarik lessons dari Supabase: ${e.message}`);
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
    log("🔍 [1/2] Menarik data lessons dari Supabase...");
    let sbQuery = supabase.from("lessons").select("dialogue, slug, order_number, title");
    if (options.level) {
      sbQuery = sbQuery.like("slug", `${options.level.toLowerCase()}-%`);
    }
    if (options.lessonNum !== null) {
      sbQuery = sbQuery.eq("order_number", options.lessonNum);
    }
    const { data: supabaseLessons, error: supabaseLessonsError } = await sbQuery;
    if (supabaseLessonsError) {
      logWarn(`Gagal menarik lessons dari Supabase: ${supabaseLessonsError.message}`);
    }
    if (supabaseLessons) {
      log(`   └─ ${supabaseLessons.length} lesson ditemukan dari Supabase.`);
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
        processContentBlocks(row.dialogue, `lessons/${row.slug}`, ctxStr);
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

    log(`📊 Total baris teks dialog/contoh kalimat unik: ${itemsToProcess.length}`);
    {
      const perVoice = {};
      itemsToProcess.forEach((i) => { perVoice[i.voice] = (perVoice[i.voice] || 0) + 1; });
      const breakdown = Object.entries(perVoice)
        .sort((a, b) => b[1] - a[1])
        .map(([v, c]) => `${v}:${c}`)
        .join(", ");
      log(`   └─ Sebaran per voice: ${breakdown}`);
    }

    // 2. Bandingkan dengan cache DB
    log("🔍 [2/2] Memeriksa status cache di database...");
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
    log(`   └─ ${existingCacheIds.size} entri sudah ada di tts_cache.`);

    if (!options.force && !hasRecreateFilter) {
      itemsToProcess.forEach((item) => {
        const cacheId = crypto.createHash("md5").update(`${item.text}_${item.voice}_medium`).digest("hex");
        if (!existingCacheIds.has(cacheId)) {
          missingItems.push(item);
        }
      });
    } else {
      logWarn(`Mode force/recreate aktif → mengabaikan cache database, memproses ulang seluruh item terfilter.`);
      missingItems.push(...itemsToProcess);
    }

    log(`📈 Item yang perlu diproses: ${missingItems.length} (dari ${itemsToProcess.length} total unik)`);

    if (missingItems.length === 0) {
      log("✅ Semua audio dialog/contoh kalimat sudah lengkap di-cache!");
      process.exit(0);
    }

    if (!options.execute) {
      const perVoice = {};
      missingItems.forEach((i) => { perVoice[i.voice] = (perVoice[i.voice] || 0) + 1; });
      log(`\n📋 [Dry Run] ${missingItems.length} item belum di-cache, sebaran per voice:`);
      Object.entries(perVoice)
        .sort((a, b) => b[1] - a[1])
        .forEach(([v, c]) => console.log(`   • ${v}: ${c} item`));
      console.log(`\n   Contoh 10 item pertama:`);
      missingItems.slice(0, 10).forEach((item, idx) => {
        console.log(`   ${idx + 1}. [${item.voice}] "${truncate(item.text)}"`);
      });
      log(`💡 Jalankan dengan '--execute --limit <num>' untuk mensintesis secara nyata.`);
      process.exit(0);
    }

    const targetItems = missingItems.slice(0, options.limit);
    log(`🚀 Memulai sintesis ${targetItems.length} item (delay ~22d/item agar aman di rate limit)...\n`);

    let successCount = 0;
    let consecutiveFailures = 0;
    const failedVoices = {};
    const startTime = Date.now();

    for (let idx = 0; idx < targetItems.length; idx += 1) {
      const item = targetItems[idx];
      const doneSoFar = idx; // items attempted before this one
      const pct = ((doneSoFar / targetItems.length) * 100).toFixed(1);
      let etaStr = "menghitung...";
      if (doneSoFar > 0) {
        const elapsed = Date.now() - startTime;
        const avgPerItem = elapsed / doneSoFar;
        const remaining = avgPerItem * (targetItems.length - doneSoFar);
        etaStr = formatDuration(remaining);
      }
      try {
        log(`[${idx + 1}/${targetItems.length} · ${pct}% · ETA ${etaStr}] Menyintesis [${item.voice}] "${truncate(item.text)}"`);
        await processTtsItem(supabase, item.text, item.voice, "medium", item.folder, item.context, options.direct);
        successCount += 1;
        consecutiveFailures = 0; 
        await sleep(22000); // 22s delay agar aman di bawah rate limit 3 RPM Gemini Free Tier
      } catch (err) {
        logErr(`Gagal mensintesis [${item.voice}] "${truncate(item.text)}": ${err.message}`);
        logFailure(item.text, item.voice, err.message);
        failedVoices[item.voice] = (failedVoices[item.voice] || 0) + 1;
        consecutiveFailures += 1;

        if (consecutiveFailures >= 5) {
          logWarn(`5 kegagalan beruntun terdeteksi → istirahat 45 detik...`);
          await sleep(45000);
          consecutiveFailures = 0;
        } else {
          await sleep(10000);
        }
      }
    }

    const totalElapsed = Date.now() - startTime;
    const failCount = targetItems.length - successCount;
    console.log("");
    log(`🎉 [Selesai] Berhasil ${successCount}/${targetItems.length} audio dalam ${formatDuration(totalElapsed)}.`);
    if (failCount > 0) {
      const failBreakdown = Object.entries(failedVoices)
        .sort((a, b) => b[1] - a[1])
        .map(([v, c]) => `${v}:${c}`)
        .join(", ");
      log(`   └─ ${failCount} gagal — sebaran per voice: ${failBreakdown}`);
      log(`   └─ Detail kegagalan dicatat di: ${FAILURE_LOG_PATH}`);
    }
    if (missingItems.length > targetItems.length) {
      log(`   └─ Masih ada ${missingItems.length - targetItems.length} item tersisa (di luar --limit). Jalankan lagi untuk lanjut.`);
    }
    process.exit(0);

  } catch (error) {
    logErr(`[Error] Gagal menjalankan generator dialog: ${error.message || error}`);
    process.exit(1);
  }
}

main();