#!/usr/bin/env node

/**
 * @file generate_single_tts.js
 * @description Script utilitas (CommonJS) untuk menyintesis satu teks Jepang (Text-to-Speech)
 * menggunakan VOICEVOX lokal atau fallback ke Microsoft Edge TTS, lalu mengunggahnya ke cache.
 * 
 * Penggunaan:
 *   node scripts/tts/generate_single_tts.js --text "こんにちは" --voice "zundamon" [--rate "medium"]
 */

const fs = require("node:fs");
const path = require("node:path");
const process = require("node:process");
const crypto = require("node:crypto");
const { spawnSync } = require("node:child_process");
const { createClient } = require("@supabase/supabase-js");
const { MsEdgeTTS } = require("msedge-tts");

// VOICEVOX Speaker ID Mapping sesuai Casting Sheet src/lib/tts.ts
const VOICEVOX_SPEAKER_MAP = {
  // Wanita
  "indah": 2,      // Shikoku Metan
  "lara": 8,       // Kasukabe Tsumugi
  "siti": 10,      // Amehare Hau
  "dewi": 14,      // Meimei Himari
  "hayashi": 16,   // Kyushu Sora
  "sato": 20,      // Mochiko-san
  "ayu": 23,       // WhiteCUL
  "zundamon": 3,   // Zundamon
  "ritsu": 9,      // Namine Ritsu

  // Pria
  "budi": 13,      // Aoyama Ryuusei
  "dito": 11,      // Kuronou Takehiro
  "suzuki": 21,    // Kenzaki Mesu
  "tanaka": 52,    // Sakamatsuri Shuji
  "yamada": 53,    // Kigasajima Sourin
  "kimura": 12,    // Shirakami Koutarou
  "andi": 51,      // Holy Knight Red Sakura
  "faisal": 94,    // Nakae Tsurugi
  "takahashi": 100,// Kurosawa Kohaku
  "kobayashi": 99, // Rito
  "namonashi": 113,// Ankomon
  "ooba": 42,      // Chibi Shikiji
};

// Edge TTS Gender Fallback mapping
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
  // Wanita (11)
  "indah": "Aoede",
  "lara": "Zephyr",
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

function printUsage() {
  console.log(
    [
      "=== NIHONGOROUTE SINGLE TTS GENERATOR ===",
      "Penggunaan:",
      "  node scripts/tts/generate_single_tts.js --text <string> [--voice <name>] [--rate <rate>]",
      "",
      "Opsi:",
      "  --text <string>  Teks Jepang yang akan disintesis (Wajib).",
      "  --voice <name>   Nama pengisi suara. Default: zundamon",
      "  --rate <rate>    Kecepatan (medium/slow/fast). Default: medium",
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
    text: null,
    voice: "zundamon",
    rate: "medium",
  };

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (arg === "--help" || arg === "-h") {
      printUsage();
      process.exit(0);
    }
    if (arg === "--text") {
      options.text = args[index + 1];
      index += 1;
      continue;
    }
    if (arg === "--voice") {
      options.voice = args[index + 1]?.trim().toLowerCase();
      index += 1;
      continue;
    }
    if (arg === "--rate") {
      options.rate = args[index + 1]?.trim().toLowerCase();
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

async function synthesizeEdgeTts(text, voiceName) {
  const tts = new MsEdgeTTS();
  await tts.setMetadata(voiceName, "audio-128khz-128kbps-mono-mp3");
  return new Promise((resolve, reject) => {
    const chunks = [];
    const { audioStream } = tts.toStream(text);
    audioStream.on("data", (data) => chunks.push(data));
    audioStream.on("end", () => resolve(Buffer.concat(chunks)));
    audioStream.on("error", (err) => reject(err));
  });
}

async function synthesizeGeminiTts(text, geminiVoice) {
  const baseUrl = process.env.AI_BASE_URL || "http://localhost:20128/v1";
  const apiKey = process.env.AI_API_KEY;

  if (!apiKey) {
    throw new Error("AI_API_KEY tidak dikonfigurasi di env.");
  }

  const response = await fetch(`${baseUrl}/audio/speech`, {
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
}

async function main() {
  loadEnvFile();
  const options = parseArgs(process.argv.slice(2));

  if (!options.text) {
    console.error("❌ Parameter --text wajib disertakan!");
    printUsage();
    process.exit(1);
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error("❌ [Config] NEXT_PUBLIC_SUPABASE_URL dan SUPABASE_SERVICE_ROLE_KEY wajib ada di .env.local!");
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  const BUCKET_NAME = "tts-cache";
  
  // Hitung hash MD5 yang konsisten dengan route API
  const cacheId = crypto.createHash("md5").update(`${options.text}_${options.voice}_${options.rate}`).digest("hex");
  const filename = `single/${cacheId}.mp3`;

  console.log(`🎙️  Sintesis: "${options.text}" [Voice: ${options.voice}, Rate: ${options.rate}]`);

  try {
    // Cek cache database
    const { data: existing } = await supabase
      .from("tts_cache")
      .select("id")
      .eq("id", cacheId)
      .maybeSingle();

    if (existing) {
      const publicUrl = supabase.storage.from(BUCKET_NAME).getPublicUrl(filename).data.publicUrl;
      console.log(`✨ Skip: Audio sudah di-cache. URL: ${publicUrl}`);
      process.exit(0);
    }

    let audioBuffer;
    if (options.voice === "zundamon") {
      try {
        console.log(`   ➔ [VOICEVOX] Menyintesis Zundamon (Speaker ID: 3)...`);
        const wavBuffer = await synthesizeVoicevox(options.text, 3);
        audioBuffer = convertWavToMp3(wavBuffer);
        console.log(`   └─ [VOICEVOX] Sintesis Zundamon sukses.`);
      } catch (vvError) {
        throw new Error(`Gagal sintesis VOICEVOX untuk Zundamon: ${vvError.message}`);
      }
    } else {
      const geminiVoice = GEMINI_VOICE_MAP[options.voice];
      if (!geminiVoice) {
        throw new Error(`Suara Gemini untuk karakter '${options.voice}' tidak ditemukan di pemetaan.`);
      }

      audioBuffer = await synthesizeGeminiTts(options.text, geminiVoice);
      console.log(`   └─ [Gemini TTS] Sintesis sukses (${geminiVoice}).`);
    }

    console.log(`   ⚡ Mengunggah ke Supabase Storage (${filename})...`);
    const { error: uploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filename, audioBuffer, {
        contentType: "audio/mpeg",
        upsert: true,
      });

    if (uploadError) throw uploadError;

    const publicUrl = supabase.storage.from(BUCKET_NAME).getPublicUrl(filename).data.publicUrl;

    console.log("   💾 Menyimpan ke database...");
    const { error: dbError } = await supabase
      .from("tts_cache")
      .upsert({
        id: cacheId,
        text: options.text,
        voice: options.voice,
        rate: options.rate,
        audio_url: publicUrl,
      });

    if (dbError) throw dbError;

    console.log(`✅ Sukses! URL: ${publicUrl}`);
    process.exit(0);

  } catch (err) {
    console.error("❌ Terjadi kesalahan:", err.message || err);
    process.exit(1);
  }
}

main();
