#!/usr/bin/env node

/**
 * @file cleanup_non_vocab_tts.js
 * @description Menghapus SELURUH cache audio non-vocab (dialog, grammar, listening, dll).
 *
 * Yang dipertahankan hanya voice default vocab: "indah".
 *
 * Penggunaan:
 *   node scripts/tts/cleanup_non_vocab_tts.js
 *   node scripts/tts/cleanup_non_vocab_tts.js --execute
 */

const fs = require("node:fs");
const path = require("node:path");
const process = require("node:process");
const { createClient } = require("@supabase/supabase-js");

function loadEnvFile() {
  const envPath = path.resolve(process.cwd(), ".env.local");

  if (!fs.existsSync(envPath)) return;

  const lines = fs.readFileSync(envPath, "utf8").split(/\r?\n/);

  for (const line of lines) {
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith("#")) continue;

    const idx = trimmed.indexOf("=");

    if (idx === -1) continue;

    const key = trimmed.slice(0, idx).trim();
    const value = trimmed
      .slice(idx + 1)
      .trim()
      .replace(/^['"]|['"]$/g, "");

    if (!(key in process.env)) {
      process.env[key] = value;
    }
  }
}

function printUsage() {
  console.log(`
=== NIHONGOROUTE NON-VOCAB TTS CLEANER ===

Menghapus SELURUH cache audio non-vocab.

Voice yang dipertahankan:
- indah (vocab)

Penggunaan:

  node scripts/tts/cleanup_non_vocab_tts.js
  node scripts/tts/cleanup_non_vocab_tts.js --execute
`);
}

async function main() {
  loadEnvFile();

  const args = process.argv.slice(2);

  if (args.includes("--help") || args.includes("-h")) {
    printUsage();
    process.exit(0);
  }

  const dryRun = !args.includes("--execute");

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error(
      "❌ NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY belum diset.",
    );
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  const BUCKET = "tts-cache";
  const PAGE_SIZE = 1000;

  console.log(`🔌 Bucket: ${BUCKET}`);

  if (dryRun) {
    console.log("ℹ️  DRY RUN");
  } else {
    console.log("⚠️  EXECUTE MODE");
  }

  const rows = [];
  let page = 0;

  while (true) {
    const from = page * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;

    const { data, error } = await supabase
      .from("tts_cache")
      .select("id, voice")
      .neq("voice", "indah")
      .range(from, to);

    if (error) {
      throw error;
    }

    if (!data || data.length === 0) {
      break;
    }

    rows.push(...data);

    console.log(`   └─ ${rows.length} ditemukan...`);

    if (data.length < PAGE_SIZE) {
      break;
    }

    page++;
  }

  console.log(`\n📦 Total cache non-vocab: ${rows.length}`);

  if (rows.length === 0) {
    console.log("✅ Tidak ada cache non-vocab.");
    return;
  }

  if (dryRun) {
    console.log("\n10 data pertama:\n");

    rows.slice(0, 10).forEach((r) => {
      console.log(`${r.id}  (${r.voice})`);
    });

    console.log(
      `\nJalankan dengan --execute untuk menghapus ${rows.length} cache.`,
    );
    return;
  }

  const BATCH = 100;

  let dbDeleted = 0;
  let storageDeleted = 0;

  for (let i = 0; i < rows.length; i += BATCH) {
    const batch = rows.slice(i, i + BATCH);

    const ids = batch.map((r) => r.id);
    const files = ids.map((id) => `${id}.mp3`);

    const { error: dbError } = await supabase
      .from("tts_cache")
      .delete()
      .in("id", ids);

    if (dbError) {
      console.error(`❌ DB Batch ${i / BATCH + 1}: ${dbError.message}`);
      continue;
    }

    dbDeleted += ids.length;

    const { error: storageError } = await supabase.storage
      .from(BUCKET)
      .remove(files);

    if (storageError) {
      console.error(
        `❌ Storage Batch ${i / BATCH + 1}: ${storageError.message}`,
      );
    } else {
      storageDeleted += files.length;
    }

    console.log(
      `✔ Batch ${Math.floor(i / BATCH) + 1} (${Math.min(i + BATCH, rows.length)}/${rows.length})`,
    );
  }

  console.log("\n====================================");
  console.log(`Database dihapus : ${dbDeleted}`);
  console.log(`Storage dihapus  : ${storageDeleted}`);
  console.log("====================================");
  console.log("🎉 Selesai.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
