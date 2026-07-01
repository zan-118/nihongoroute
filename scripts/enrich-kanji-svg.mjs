#!/usr/bin/env node

/**
 * @file enrich-kanji-svg.mjs
 * @description Script utilitas produksi untuk mendeteksi dan mengunduh data XML SVG dari KanjiVG,
 * kemudian menyimpannya langsung ke kolom `stroke_order_svg` pada tabel `kanji` di Supabase.
 * Ini memastikan rendering stroke order berjalan luring-first (offline-first) tanpa 404 dari GitHub.
 * 
 * Penggunaan:
 *   node scripts/enrich-kanji-svg.mjs --limit 50
 */

import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { createClient } from "@supabase/supabase-js";

function printUsage() {
  console.log(
    [
      "=== NIHONGOROUTE KANJI SVG ENRICHER ===",
      "Penggunaan:",
      "  node scripts/enrich-kanji-svg.mjs [options]",
      "",
      "Opsi:",
      "  --limit <number>       Jumlah kanji maksimal yang diproses. Default: 50",
      "  --concurrency <N>      Jumlah koneksi paralel ke Supabase/GitHub. Default: 20",
      "  --all                  Proses semua kanji yang belum memiliki XML SVG utuh.",
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
    limit: 50,
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

  console.log("🔍 [Database] Memuat seluruh data kanji dari database...");
  
  // Ambil data dalam batch 1000 hingga habis karena Postgrest membatasi 1000 baris
  const allKanji = [];
  let offset = 0;
  
  while (true) {
    const { data, error } = await supabase
      .from("kanji")
      .select("id, character, stroke_order_svg")
      .range(offset, offset + 999);

    if (error) {
      console.error("❌ Gagal memuat data kanji:", error.message);
      process.exit(1);
    }

    if (!data || data.length === 0) break;
    allKanji.push(...data);
    offset += 1000;
  }

  console.log(`📊 Total kanji di database: ${allKanji.length}`);

  // Saring kanji yang membutuhkan pengayaan XML SVG (belum ada SVG, atau isinya hanya nama berkas seperti '疲.svg')
  const targets = allKanji.filter(
    (k) => !k.stroke_order_svg || !k.stroke_order_svg.trim().startsWith("<")
  );

  console.log(`📈 Kanji yang membutuhkan pengayaan SVG: ${targets.length}`);

  if (targets.length === 0) {
    console.log("✅ Semua kanji sudah diperkaya dengan XML SVG.");
    process.exit(0);
  }

  const limitTargets = options.all ? targets : targets.slice(0, options.limit);
  console.log(`🚀 Memulai pemrosesan ${limitTargets.length} kanji...`);

  const queue = [...limitTargets];
  let processedCount = 0;
  let successCount = 0;
  let errorCount = 0;
  let notFoundCount = 0;

  const KANJIVG_URL = "https://raw.githubusercontent.com/KanjiVG/kanjivg/master/kanji";

  const worker = async () => {
    while (queue.length > 0) {
      const item = queue.shift();
      if (!item) break;

      try {
        const char = item.character;
        if (!char) throw new Error("Karakter kosong");

        // Hitung unicode heksadesimal kanji
        const codePoint = char.codePointAt(0).toString(16).padStart(5, "0");
        const url = `${KANJIVG_URL}/${codePoint}.svg`;

        const res = await fetch(url);
        if (!res.ok) {
          if (res.status === 404) {
            notFoundCount++;
            throw new Error(`404 Not Found di KanjiVG (${url})`);
          }
          throw new Error(`HTTP Error ${res.status} saat fetch KanjiVG`);
        }

        const svgXmlText = await res.text();
        
        // Simpan XML SVG utuh ke database Supabase
        const { error: updateError } = await supabase
          .from("kanji")
          .update({ stroke_order_svg: svgXmlText })
          .eq("id", item.id);

        if (updateError) throw updateError;
        successCount++;
      } catch (err) {
        console.error(`❌ Gagal memproses Kanji "${item.character}" (ID: ${item.id}):`, err.message);
        errorCount++;
      }

      processedCount++;
      if (processedCount % 50 === 0 || processedCount === limitTargets.length) {
        console.log(`   ⏳ Progres: ${processedCount}/${limitTargets.length} selesai...`);
      }
    }
  };

  // Jalankan worker pool
  const workers = [];
  const activeWorkers = Math.min(options.concurrency, limitTargets.length);
  for (let i = 0; i < activeWorkers; i++) {
    workers.push(worker());
  }

  await Promise.all(workers);

  console.log(`\n🎉 [Selesai] Total pemrosesan SVG Kanji:`);
  console.log(`   └─ Sukses: ${successCount}`);
  console.log(`   └─ Gagal: ${errorCount} (Termasuk 404 KanjiVG: ${notFoundCount})`);
  
  setTimeout(() => process.exit(0), 200);
}

main().catch((err) => {
  console.error("❌ Terjadi kesalahan fatal:", err);
  setTimeout(() => process.exit(1), 200);
});
