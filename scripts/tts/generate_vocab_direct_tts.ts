import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
// @ts-ignore (msedge-tts doesn't have official TS typings)
import { MsEdgeTTS } from 'msedge-tts';

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const TARGET_EDGE_VOICE = "ja-JP-NanamiNeural";
const FAILURE_LOG_PATH = path.resolve(process.cwd(), "tts_vocab_failures.log");

// Global Crash Prevention (AFK-Safe)
process.on("unhandledRejection", (reason) => {
  console.error("\n⚠️ [Global Unhandled Rejection] Terdeteksi (diabaikan agar tidak crash):", reason);
});
process.on("uncaughtException", (error) => {
  console.error("\n⚠️ [Global Uncaught Exception] Terdeteksi (diabaikan agar tidak crash):", error.message || error);
});

function logFailure(id: string, text: string, errorMsg: string) {
  const timestamp = new Date().toISOString();
  fs.appendFileSync(
    FAILURE_LOG_PATH,
    `[${timestamp}] [Vocab Direct] ID: ${id} | Teks: "${text}" | Error: ${errorMsg}\n`,
    "utf8"
  );
}

function printUsage() {
  console.log(
    [
      "=== NIHONGOROUTE DIRECT VOCAB TTS GENERATOR ===",
      "Penggunaan:",
      "  npx tsx scripts/tts/generate_vocab_direct_tts.ts [options]",
      "",
      "Opsi:",
      "  --execute      Jalankan pemrosesan nyata (Default: Dry Run saja).",
      "  --limit <num>  Batasi jumlah kata baru yang disintesis. Default: Unlimited (Semua)",
      "  --level <lvl>  Filter level JLPT (N5, N4, N3, N2, N1).",
      "  --force        Paksa sintesis ulang kosakata yang sudah memiliki audio_url.",
      "  --help, -h     Tampilkan bantuan ini.",
    ].join("\n")
  );
}

function parseArgs(args: string[]) {
  const options = {
    execute: false,
    limit: Infinity,
    level: null as string | null,
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

async function synthesizeWithRetry(text: string, voiceName: string, retries = 3, initialDelay = 2000): Promise<Buffer> {
  let delay = initialDelay;

  for (let attempt = 1; attempt <= retries; attempt += 1) {
    try {
      const tts = new MsEdgeTTS();
      await tts.setMetadata(voiceName, "audio-24khz-96kbitrate-mono-mp3" as any);

      return await new Promise<Buffer>((resolve, reject) => {
        const chunks: Buffer[] = [];
        const timer = setTimeout(() => {
          reject(new Error("Timeout koneksi WebSockets Edge TTS (15 detik)."));
        }, 15000);

        const { audioStream } = tts.toStream(text);

        audioStream.on("data", (data: Buffer) => chunks.push(data));
        audioStream.on("end", () => {
          clearTimeout(timer);
          resolve(Buffer.concat(chunks));
        });
        audioStream.on("error", (err: Error) => {
          clearTimeout(timer);
          reject(err);
        });
      });
    } catch (err: any) {
      console.warn(`   ⚠️  [Percobaan ${attempt}/${retries}] Gagal menyintesis: ${err.message}`);
      if (attempt === retries) throw err;
      
      console.log(`      Mencoba kembali dalam ${delay / 1000} detik...`);
      await sleep(delay);
      delay *= 2;
    }
  }
  throw new Error("Sintesis gagal setelah seluruh percobaan.");
}

async function processVocabItem(supabase: any, id: string, word: string) {
  const cleanWord = word.trim();
  const filename = `vocab/${id}.mp3`;
  const BUCKET_NAME = "asset";

  const audioBuffer = await synthesizeWithRetry(cleanWord, TARGET_EDGE_VOICE);
  if (!audioBuffer || audioBuffer.length === 0) {
    throw new Error("Hasil sintesis kosong (0 bytes)");
  }
  console.log(`   └─ [Edge TTS] Sintesis sukses. Ukuran: ${audioBuffer.length} bytes.`);

  // Upload ke storage bucket 'asset' path 'vocab/id.mp3'
  const { error: uploadError } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(filename, audioBuffer, {
      contentType: "audio/mpeg",
      upsert: true,
    });

  if (uploadError) throw new Error(`Upload storage gagal: ${uploadError.message}`);

  const publicUrl = supabase.storage.from(BUCKET_NAME).getPublicUrl(filename).data.publicUrl;

  // Update langsung ke tabel vocab
  const { error: updateError } = await supabase
    .from("vocab")
    .update({ audio_url: publicUrl })
    .eq("id", id);

  if (updateError) throw new Error(`Update tabel vocab gagal: ${updateError.message}`);

  console.log(`   └─ [Supabase] Tabel vocab diperbarui. URL: ${publicUrl}`);
  return publicUrl;
}

async function main() {
  dotenv.config({ path: '.env.local' });
  const options = parseArgs(process.argv.slice(2));

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error("❌ [Config] NEXT_PUBLIC_SUPABASE_URL dan SUPABASE_SERVICE_ROLE_KEY wajib ada di .env.local!");
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  console.log("🔍 Memuat data kosakata dari database...");

  try {
    const vocabRows: Array<{ id: string; word: string; audio_url: string | null; jlpt_level: string | null }> = [];
    let hasMore = true;
    let page = 0;
    const limit = 1000;

    while (hasMore) {
      let query = supabase
        .from("vocab")
        .select("id, word, audio_url, jlpt_level")
        .range(page * limit, (page + 1) * limit - 1);

      if (options.level) {
        query = query.eq("jlpt_level", options.level);
      }

      const { data: rows, error } = await query;
      if (error) throw error;

      if (!rows || rows.length === 0) {
        hasMore = false;
      } else {
        vocabRows.push(...rows);
        page += 1;
        if (rows.length < limit) {
          hasMore = false;
        }
      }
    }

    console.log(`📊 Ditemukan ${vocabRows.length} kosakata total.`);

    // Filter kosakata yang perlu diproses
    const targets = vocabRows.filter(row => {
      if (!row.word) return false;
      if (options.force) return true;
      return !row.audio_url; // Hanya proses jika audio_url masih kosong
    });

    console.log(`📈 Jumlah kosakata yang perlu disintesis: ${targets.length}`);

    if (targets.length === 0) {
      console.log("✅ Seluruh kosakata telah ter-sintesis!");
      process.exit(0);
    }

    if (!options.execute) {
      console.log(`📋 [Dry Run] Menampilkan 10 kosakata pertama yang akan diproses:`);
      targets.slice(0, 10).forEach((item, idx) => {
        console.log(`   ${idx + 1}. ID: ${item.id} | Word: "${item.word}"`);
      });
      console.log(`\n💡 Silakan jalankan dengan '--execute --limit <num>' untuk memproses secara nyata.`);
      process.exit(0);
    }

    const targetsToProcess = targets.slice(0, options.limit);
    console.log(`🚀 Memulai sintesis ${targetsToProcess.length} kosakata...`);

    let successCount = 0;
    let consecutiveFailures = 0;

    for (let idx = 0; idx < targetsToProcess.length; idx += 1) {
      const item = targetsToProcess[idx];
      try {
        console.log(`[${idx + 1}/${targetsToProcess.length}] Memproses ID ${item.id}: "${item.word}"`);
        await processVocabItem(supabase, item.id, item.word);
        successCount += 1;
        consecutiveFailures = 0; // reset
        await sleep(1000); // rate limiting
      } catch (err: any) {
        console.error(`❌ Gagal memproses ID ${item.id}:`, err.message);
        logFailure(item.id, item.word, err.message);
        consecutiveFailures += 1;

        if (consecutiveFailures >= 5) {
          console.warn("\n⚠️  Terjadi 5 kegagalan beruntun. Istirahat 30 detik untuk menghindari pemblokiran IP...");
          await sleep(30000);
          consecutiveFailures = 0;
        } else {
          await sleep(2000);
        }
      }
    }

    console.log(`\n🎉 [Selesai] Berhasil memproses ${successCount}/${targetsToProcess.length} kosakata!`);
    if (successCount < targetsToProcess.length) {
      console.log(`💡 Kegagalan dicatat di: ${FAILURE_LOG_PATH}`);
    }
    process.exit(0);
  } catch (err: any) {
    console.error("❌ Kesalahan fatal:", err.message || err);
    process.exit(1);
  }
}

main();
