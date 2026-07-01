#!/usr/bin/env node

/**
 * @file enrich-vocab-examples-furigana.mjs
 * @description Script utilitas produksi untuk mendeteksi dan menghasilkan furigana 
 * pada array JSON `examples` di dalam tabel `vocab` di Supabase menggunakan Kuroshiro.
 * 
 * Penggunaan:
 *   node scripts/enrich-vocab-examples-furigana.mjs --limit 100
 */

import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { createClient } from "@supabase/supabase-js";
import KuroshiroLib from "kuroshiro";
import KuromojiAnalyzerLib from "kuroshiro-analyzer-kuromoji";

const Kuroshiro = KuroshiroLib.default || KuroshiroLib;
const KuromojiAnalyzer = KuromojiAnalyzerLib.default || KuromojiAnalyzerLib;

function printUsage() {
  console.log(
    [
      "=== NIHONGOROUTE VOCAB EXAMPLES FURIGANA ENRICHER ===",
      "Penggunaan:",
      "  node scripts/enrich-vocab-examples-furigana.mjs [options]",
      "",
      "Opsi:",
      "  --limit <number>       Jumlah baris kosakata maksimal yang diproses. Default: 100",
      "  --concurrency <N>      Jumlah koneksi paralel ke Supabase. Default: 20",
      "  --all                  Proses semua baris kosakata yang contohnya belum memiliki furigana.",
      "  --help, -h             Tampilkan bantuan ini.",
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
    limit: 100,
    concurrency: 20,
    all: false,
  };

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];

    if (arg === "--help" || arg === "-h") {
      printUsage();
      process.exit(0);
    }

    if (arg === "--limit") {
      options.limit = Number.parseInt(args[index + 1], 10);
      index += 1;
      continue;
    }

    if (arg === "--concurrency") {
      options.concurrency = Number.parseInt(args[index + 1], 10);
      index += 1;
      continue;
    }

    if (arg === "--all") {
      options.all = true;
      continue;
    }
  }

  return options;
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

  console.log("🔍 [Kuroshiro] Menginisialisasi analyzer...");
  const kuroshiro = new Kuroshiro();
  const dictPath = path.join(process.cwd(), "node_modules", "kuromoji", "dict");
  await kuroshiro.init(new KuromojiAnalyzer({ dictPath }));
  console.log("✅ [Kuroshiro] Analyzer siap.");

  let totalProcessed = 0;
  let totalSuccess = 0;
  let totalError = 0;

  while (true) {
    console.log("\n🔍 [Database] Memuat kosakata dengan contoh kalimat tanpa furigana...");
    let query = supabase
      .from("vocab")
      .select("id, word, examples")
      .filter("examples", "cs", '[{"furigana":""}]');

    if (!options.all) {
      const remainingLimit = options.limit - totalProcessed;
      if (remainingLimit <= 0) break;
      query = query.limit(Math.min(remainingLimit, 1000));
    } else {
      query = query.limit(1000);
    }

    const { data: vocabList, error } = await query;

    if (error) {
      console.error("❌ Gagal memuat data vocab:", error.message);
      process.exit(1);
    }

    if (!vocabList || vocabList.length === 0) {
      console.log("✅ Tidak ada lagi kosakata yang perlu diproses.");
      break;
    }

    console.log(`📈 [Proses] Memulai konversi furigana untuk ${vocabList.length} kosakata...`);

    const queue = [...vocabList];
    let processedCount = 0;
    let successCount = 0;
    let errorCount = 0;

    const worker = async () => {
      while (queue.length > 0) {
        const item = queue.shift();
        if (!item) break;

        try {
          let modified = false;
          const updatedExamples = [];

          if (Array.isArray(item.examples)) {
            for (const ex of item.examples) {
              const sentenceText = ex.jp || ex.japanese;
              if (sentenceText && (!ex.furigana || ex.furigana === "")) {
                // Konversi teks kalimat Jepang ke hiragana
                const converted = await kuroshiro.convert(sentenceText, {
                  to: "hiragana",
                  mode: "normal",
                });
                updatedExamples.push({
                  ...ex,
                  furigana: converted,
                });
                modified = true;
              } else {
                updatedExamples.push(ex);
              }
            }
          }

          if (modified) {
            const { error: updateError } = await supabase
              .from("vocab")
              .update({ examples: updatedExamples })
              .eq("id", item.id);

            if (updateError) throw updateError;
            successCount++;
          } else {
            successCount++; // Tidak perlu diubah, hitung sukses
          }
        } catch (err) {
          console.error(`❌ Gagal memproses kosakata "${item.word}" (ID: ${item.id}):`, err.message);
          errorCount++;
        }

        processedCount++;
        if (processedCount % 100 === 0 || processedCount === vocabList.length) {
          console.log(`   ⏳ Progres: ${processedCount}/${vocabList.length} selesai...`);
        }
      }
    };

    // Jalankan worker pool
    const workers = [];
    const activeWorkers = Math.min(options.concurrency, vocabList.length);
    for (let i = 0; i < activeWorkers; i++) {
      workers.push(worker());
    }

    await Promise.all(workers);

    totalProcessed += vocabList.length;
    totalSuccess += successCount;
    totalError += errorCount;

    console.log(`   📦 Batch selesai. Sukses: ${successCount}, Gagal: ${errorCount}`);

    if (!options.all && totalProcessed >= options.limit) {
      break;
    }
  }

  console.log(`\n🎉 [Selesai] Total pemrosesan furigana contoh kalimat kosakata:`);
  console.log(`   └─ Sukses: ${totalSuccess}`);
  console.log(`   └─ Gagal: ${totalError}`);
  setTimeout(() => process.exit(0), 200);
}

main().catch((err) => {
  console.error("❌ Terjadi kesalahan fatal:", err);
  process.exit(1);
});
