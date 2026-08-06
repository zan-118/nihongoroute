#!/usr/bin/env node

/**
 * @file generate_vocab_tts.js
 * @description Script utilitas (CommonJS) untuk memproses batch-generation seluruh kosakata (vocab)
 * dari database Supabase yang belum disintesis.
 * Vocab hanya disintesis menggunakan suara Microsoft Edge TTS "ja-JP-NanamiNeural" (sangat natural seperti native)
 * dan disimpan di database cache dengan identitas pengisi suara "indah".
 * 
 * Didukung penanganan error tangguh (AFK-Safe):
 * - Penangkap uncaughtException & unhandledRejection agar tidak crash di tengah jalan.
 * - Retry otomatis dengan jeda berjenjang (exponential backoff) jika koneksi Edge TTS drop.
 * - Pause protektif (30 detik) jika terjadi kegagalan beruntun.
 * - Pencatatan kata gagal ke tts_failures.log.
 * 
 * Penggunaan:
 *   node scripts/tts/generate_vocab_tts.js [--execute] [--limit 20] [--level N5]
 */

const fs = require("node:fs");
const path = require("node:path");
const process = require("node:process");
const crypto = require("node:crypto");
const { createClient } = require("@supabase/supabase-js");
const { MsEdgeTTS } = require("msedge-tts");

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const TARGET_EDGE_VOICE = "ja-JP-NanamiNeural";
const FAILURE_LOG_PATH = path.resolve(process.cwd(), "tts_failures.log");

// ==========================================
// PENCEGAH CRASH GLOBAL (AFK-Safe)
// ==========================================
process.on("unhandledRejection", (reason) => {
  console.error("\n⚠️ [Global Unhandled Rejection] Terdeteksi (diabaikan agar tidak crash):", reason);
});
process.on("uncaughtException", (error) => {
  console.error("\n⚠️ [Global Uncaught Exception] Terdeteksi (diabaikan agar tidak crash):", error.message || error);
});

function logFailure(text, errorMsg) {
  const timestamp = new Date().toISOString();
  fs.appendFileSync(
    FAILURE_LOG_PATH,
    `[${timestamp}] [Vocab] Teks: "${text}" | Error: ${errorMsg}\n`,
    "utf8"
  );
}

function printUsage() {
  console.log(
    [
      "=== NIHONGOROUTE BATCH VOCAB TTS GENERATOR (AFK-SAFE) ===",
      "Penggunaan:",
      "  node scripts/tts/generate_vocab_tts.js [options]",
      "",
      "Opsi:",
      "  --execute      Jalankan pemrosesan nyata (Default: Dry Run saja).",
      "  --limit <num>  Batasi jumlah kata baru yang disintesis. Default: Unlimited (Semua)",
      "  --level <lvl>  Filter level JLPT (N5, N4, N3, N2, N1).",
      "  --force        Paksa sintesis ulang kosakata yang sudah di-cache.",
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
    if (arg === "--force") {
      options.force = true;
      continue;
    }
  }

  return options;
}

// Sintesis suara Edge TTS dengan mekanisme timeout & retry
async function synthesizeWithRetry(text, voiceName, retries = 3, initialDelay = 2000) {
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
      console.warn(`   ⚠️  [Percobaan ${attempt}/${retries}] Gagal menyintesis: ${err.message}`);
      if (attempt === retries) throw err;
      
      console.log(`      Mencoba kembali dalam ${delay / 1000} detik...`);
      await sleep(delay);
      delay *= 2; // Exponential backoff
    }
  }
}

async function processTtsItem(supabase, text, voice = "indah", rate = "medium") {
  const cacheId = crypto.createHash("md5").update(`${text}_${voice}_${rate}`).digest("hex");
  const filename = `${cacheId}.mp3`;
  const BUCKET_NAME = "tts-cache";

  const audioBuffer = await synthesizeWithRetry(text, TARGET_EDGE_VOICE);
  console.log(`   └─ [Edge TTS] Sintesis sukses.`);

  let publicUrl = "";
  try {
    const { isR2Configured, uploadToR2Storage } = await import("../utils/r2-helper.mjs");
    if (isR2Configured()) {
      publicUrl = await uploadToR2Storage(BUCKET_NAME, filename, audioBuffer, "audio/mpeg");
      console.log(`   └─ [R2 Storage] Upload ke Cloudflare R2 sukses.`);
    }
  } catch (err) {
    console.warn(`   └─ [R2 Warning] Gagal upload ke R2, mencoba Supabase:`, err.message);
  }

  if (!publicUrl) {
    const { error: uploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filename, audioBuffer, {
        contentType: "audio/mpeg",
        upsert: true,
      });

    if (uploadError) throw new Error(`Upload storage gagal: ${uploadError.message}`);

    publicUrl = supabase.storage.from(BUCKET_NAME).getPublicUrl(filename).data.publicUrl;
  }

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
  
  console.log("🔍 Memuat data kosakata dari database Supabase...");

  try {
    const vocabRows = [];
    let vocabHasMore = true;
    let vocabPage = 0;
    const vocabLimit = 1000;
    while (vocabHasMore) {
      let query = supabase
        .from("vocab")
        .select("word, jlpt_level")
        .range(vocabPage * vocabLimit, (vocabPage + 1) * vocabLimit - 1);
      if (options.level) {
        query = query.eq("jlpt_level", options.level);
      } else {
        query = query.is("jlpt_level", null);
      }

      const { data: rows, error: vocabErr } = await query;
      if (vocabErr) throw vocabErr;

      if (!rows || rows.length === 0) {
        vocabHasMore = false;
      } else {
        vocabRows.push(...rows);
        vocabPage += 1;
        if (rows.length < vocabLimit) {
          vocabHasMore = false;
        }
      }
    }

    console.log(`📊 Ditemukan ${vocabRows.length} kosakata total.`);

    // Bandingkan dengan database tts_cache (Paginated)
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

    const missingVocabs = [];
    vocabRows.forEach((row) => {
      if (!row.word) return;
      const wordClean = row.word.trim();
      const cacheId = crypto.createHash("md5").update(`${wordClean}_indah_medium`).digest("hex");
      if (options.force || !existingCacheIds.has(cacheId)) {
        if (!missingVocabs.includes(wordClean)) {
          missingVocabs.push(wordClean);
        }
      }
    });

    console.log(`📈 Jumlah kosakata yang belum di-cache: ${missingVocabs.length}`);

    if (missingVocabs.length === 0) {
      console.log("✅ Seluruh kosakata telah di-cache dengan lengkap!");
      process.exit(0);
    }

    if (!options.execute) {
      console.log(`📋 [Dry Run] Menampilkan 10 kosakata pertama yang belum di-cache:`);
      missingVocabs.slice(0, 10).forEach((word, idx) => {
        console.log(`   ${idx + 1}. "${word}"`);
      });
      console.log(`\n💡 Silakan jalankan dengan '--execute --limit <num>' untuk mensintesis secara nyata.`);
      process.exit(0);
    }

    const targetWords = missingVocabs.slice(0, options.limit);
    console.log(`🚀 Memulai sintesis ${targetWords.length} kosakata...`);

    let successCount = 0;
    let consecutiveFailures = 0;

    for (let idx = 0; idx < targetWords.length; idx += 1) {
      const word = targetWords[idx];
      try {
        console.log(`[${idx + 1}/${targetWords.length}] Menyintesis: "${word}"`);
        await processTtsItem(supabase, word, "indah", "medium");
        successCount += 1;
        consecutiveFailures = 0; // reset
        await sleep(1000); // rate limiting
      } catch (err) {
        console.error(`❌ Gagal mensintesis "${word}":`, err.message);
        logFailure(word, err.message);
        consecutiveFailures += 1;

        // Jeda protektif jika terjadi rentetan error (diduga diblokir/rate limit)
        if (consecutiveFailures >= 5) {
          console.warn("\n⚠️  Terjadi 5 kegagalan beruntun. Istirahat 30 detik untuk menghindari pemblokiran IP...");
          await sleep(30000);
          consecutiveFailures = 0;
        } else {
          await sleep(2000);
        }
      }
    }

    console.log(`\n🎉 [Selesai] Berhasil memproses ${successCount}/${targetWords.length} kosakata!`);
    if (successCount < targetWords.length) {
      console.log(`💡 Kegagalan dicatat di: ${FAILURE_LOG_PATH}`);
    }
    process.exit(0);

  } catch (err) {
    console.error("❌ Terjadi kesalahan fatal:", err.message || err);
    process.exit(1);
  }
}

main();
