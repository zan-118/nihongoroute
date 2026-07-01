#!/usr/bin/env node

/**
 * @file cleanup_vocab_cache.js
 * @description Script utilitas produksi (CommonJS) untuk membersihkan file audio yatim di Supabase Storage bucket 'tts-cache'.
 * 
 * Penggunaan:
 *   node scripts/tts/cleanup_vocab_cache.js --execute
 */

const fs = require("node:fs");
const path = require("node:path");
const process = require("node:process");
const { createClient } = require("@supabase/supabase-js");

function printUsage() {
  console.log(
    [
      "=== NIHONGOROUTE VOCAB STORAGE CLEANER ===",
      "Penggunaan:",
      "  node scripts/tts/cleanup_vocab_cache.js [options]",
      "",
      "Opsi:",
      "  --execute      Jalankan penghapusan file secara riil (Default: Dry Run saja).",
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

async function cleanupVocabCache() {
  loadEnvFile();

  const args = process.argv.slice(2);
  if (args.includes("--help") || args.includes("-h")) {
    printUsage();
    process.exit(0);
  }

  const dryRun = !args.includes("--execute");

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error("❌ [Config] NEXT_PUBLIC_SUPABASE_URL dan SUPABASE_SERVICE_ROLE_KEY wajib ada di .env.local!");
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  const BUCKET_NAME = "tts-cache";

  console.log(`🔌 [Supabase] Menghubungkan ke Storage Bucket "${BUCKET_NAME}"...`);
  if (dryRun) {
    console.log("ℹ️  [Mode] DRY RUN AKTIF (Tidak ada file di storage yang akan dihapus).");
  } else {
    console.log("⚠️  [Mode] EKSEKUSI RIIL AKTIF (File audio yatim akan dihapus permanen!).");
  }

  try {
    // 1. Ambil semua ID aktif dari tabel database tts_cache (Paginated to handle 34k+ entries)
    console.log("🔍 [Database] Mengambil semua ID aktif dari tts_cache...");
    const activeCacheIds = new Set();
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
        rows.forEach((r) => {
          if (r.id) activeCacheIds.add(r.id.trim());
        });
        dbPage += 1;
        if (rows.length < dbLimit) {
          dbHasMore = false;
        }
      }
    }
    console.log(`   └─ Ditemukan ${activeCacheIds.size} ID aktif di database.`);

    // 2. Ambil semua file audio dari Supabase Storage (dilakukan per halaman/batch)
    console.log("🔍 [Storage] Memindai file audio di bucket...");
    const allStorageFiles = [];
    let offset = 0;
    const limit = 1000;
    let hasMore = true;

    while (hasMore) {
      const { data: files, error: storageErr } = await supabase.storage
        .from(BUCKET_NAME)
        .list("", {
          limit,
          offset,
          sortBy: { column: "name", order: "asc" },
        });

      if (storageErr) throw storageErr;

      if (!files || files.length === 0) {
        hasMore = false;
      } else {
        allStorageFiles.push(...files);
        offset += files.length;
        if (files.length < limit) {
          hasMore = false;
        }
      }
    }

    console.log(`   └─ Ditemukan ${allStorageFiles.length} file audio di storage bucket.`);

    // 3. Cari file audio yatim (tidak ada di database)
    const orphans = [];
    allStorageFiles.forEach((file) => {
      if (file.id === undefined && file.metadata === undefined) return;
      
      const filename = file.name;
      const fileId = filename.substring(0, filename.lastIndexOf("."));
      
      if (!fileId) return;

      if (!activeCacheIds.has(fileId)) {
        orphans.push(filename);
      }
    });

    console.log(`\n🧹 [Analisis] Ditemukan ${orphans.length} file audio yatim.`);

    if (orphans.length === 0) {
      console.log("✅ [Selesai] Storage bucket bersih. Tidak ada file audio yatim.");
      process.exit(0);
    }

    if (dryRun) {
      console.log("\nDaftar 10 File Audio Yatim Pertama (Dry Run):");
      console.log("=".repeat(50));
      orphans.slice(0, 10).forEach((filename) => {
        console.log(`- ${filename}`);
      });
      console.log("=".repeat(50));
      console.log(`\n💡 Jalankan dengan opsi '--execute' untuk menghapus ${orphans.length} file ini secara riil.`);
    } else {
      console.log(`\n🗑️  Menghapus ${orphans.length} file dari storage...`);
      
      const batchSize = 100;
      let deletedCount = 0;

      for (let i = 0; i < orphans.length; i += batchSize) {
        const batchFiles = orphans.slice(i, i + batchSize);
        const { error: removeErr } = await supabase.storage
          .from(BUCKET_NAME)
          .remove(batchFiles);

        if (removeErr) {
          console.error(`❌ Gagal menghapus batch ${Math.floor(i / batchSize) + 1}:`, removeErr.message);
        } else {
          deletedCount += batchFiles.length;
          console.log(`   └─ Berhasil menghapus ${deletedCount}/${orphans.length} file...`);
        }
      }

      console.log(`\n🎉 [Sukses] Berhasil membersihkan ${deletedCount}/${orphans.length} file audio yatim dari storage!`);
    }

  } catch (error) {
    console.error("❌ [Error] Terjadi kesalahan saat pembersihan storage:", error.message || error);
    process.exit(1);
  }
}

cleanupVocabCache();
