#!/usr/bin/env node

/**
 * @file generate-missing-illustrations.mjs
 * @description Script utilitas untuk memindai semua dokumen `lesson` di Supabase
 * yang belum memiliki ilustrasi, kemudian menggenerasi ilustrasi secara otomatis
 * menggunakan 9router / Gemini dan mengunggahnya ke Supabase Storage.
 *
 * Penggunaan:
 *   node scripts/generate-missing-illustrations.mjs --limit 50
 */

import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { createClient } from "@supabase/supabase-js";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function printUsage() {
  console.log(
    [
      "=== NIHONGOROUTE MISSING LESSON ILLUSTRATION GENERATOR ===",
      "Penggunaan:",
      "  node scripts/generate-missing-illustrations.mjs [options]",
      "",
      "Opsi:",
      "  --limit <number>       Jumlah dokumen maksimal yang diproses. Default: 50",
      "  --level <N5/N4/...>    Filter level JLPT (contoh: N5)",
      "  --lesson <number>      Filter nomor bab pelajaran (contoh: 1)",
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
    level: null,
    lessonNum: null,
  };

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];

    if (arg === "--help" || arg === "-h") {
      printUsage();
      process.exit(0);
    }

    if (arg === "--limit") {
      options.limit = Number.parseInt(args[index + 1], 10) || 50;
      index += 1;
      continue;
    }

    if (arg === "--level") {
      options.level = args[index + 1] ? args[index + 1].toUpperCase() : null;
      index += 1;
      continue;
    }

    if (arg === "--lesson") {
      options.lessonNum = Number.parseInt(args[index + 1], 10) || null;
      index += 1;
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
  const ninerouterUrl = process.env.NINEROUTER_URL;
  const ninerouterKey = process.env.NINEROUTER_KEY;

  const imgBaseUrl = ninerouterUrl ? (ninerouterUrl.endsWith("/v1") ? ninerouterUrl : `${ninerouterUrl}/v1`) : process.env.AI_BASE_URL;
  const imgApiKey = ninerouterKey ?? process.env.AI_API_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error("❌ [Config] NEXT_PUBLIC_SUPABASE_URL dan SUPABASE_SERVICE_ROLE_KEY wajib didefinisikan!");
    process.exit(1);
  }

  if (!imgBaseUrl) {
    console.error("❌ [Config] AI_BASE_URL / NINEROUTER_URL wajib didefinisikan!");
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  // Pastikan bucket 'asset' ada di storage
  const BUCKET_NAME = "asset";
  try {
    const { data: buckets } = await supabase.storage.listBuckets();
    const exists = buckets?.some(b => b.name === BUCKET_NAME);
    if (!exists) {
      console.log(`⚡ Membuat bucket '${BUCKET_NAME}' baru...`);
      const { error: createErr } = await supabase.storage.createBucket(BUCKET_NAME, {
        public: true,
      });
      if (createErr) {
        console.warn(`⚠️ Gagal membuat bucket: ${createErr.message}`);
      }
    }
  } catch (err) {
    console.warn(`⚠️ Gagal mendeteksi/membuat bucket: ${err.message}`);
  }

  console.log("🔍 [Supabase] Membaca dokumen lesson dari database...");

  // 1. Bangun query lessons berfilter
  let sbQuery = supabase
    .from("lessons")
    .select("id, title, content_blocks, slug, image_url");

  // Hanya lessons yang belum memiliki gambar
  sbQuery = sbQuery.or("image_url.is.null,image_url.eq.");

  if (options.level) {
    sbQuery = sbQuery.like("slug", `${options.level.toLowerCase()}-%`);
  }
  if (options.lessonNum !== null) {
    sbQuery = sbQuery.eq("order_number", options.lessonNum);
  }

  // Batasi
  sbQuery = sbQuery.limit(options.limit);

  const { data: lessons, error: fetchError } = await sbQuery;

  if (fetchError) {
    console.error("❌ Gagal membaca lessons dari Supabase:", fetchError.message);
    process.exit(1);
  }

  console.log(`✓ Ditemukan ${lessons ? lessons.length : 0} lesson untuk diproses.`);

  if (!lessons || lessons.length === 0) {
    console.log("✅ Semua dokumen lesson di Supabase sudah memiliki ilustrasi!");
    process.exit(0);
  }

  const generatePromptForDoc = async (title, contentBlocks, type) => {
    let textSnippet = "";
    if (Array.isArray(contentBlocks)) {
      textSnippet = contentBlocks
        .map(b => b.content || b.text || "")
        .filter(Boolean)
        .join("\n")
        .slice(0, 800);
    }
    
    const aiPrompt = `
Anda adalah direktur seni visual. Buat satu prompt deskripsi gambar dalam Bahasa Inggris untuk mengilustrasikan dokumen ${type} bahasa Jepang berjudul "${title}".

Materi/Konten:
${textSnippet}

Aturan prompt gambar:
- Harus berupa satu kalimat deskripsi adegan dalam Bahasa Inggris.
- Adegan harus menggambarkan aktivitas utama atau ilustrasi konsep edukasi yang dijelaskan pada materi di atas.
- Wajib diawali dengan: "2D digital anime style illustration, clean line art, soft colors, high resolution, NihongoRoute educational theme: "
- Output HANYA berupa text prompt tunggal, tidak boleh dibungkus markdown JSON atau kutipan lain.
`.trim();

    try {
      const response = await fetch(`${imgBaseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(imgApiKey ? { Authorization: `Bearer ${imgApiKey}` } : {}),
        },
        body: JSON.stringify({
          model: process.env.AI_MODEL || "ag/gemini-3-flash",
          messages: [{ role: "user", content: aiPrompt }],
          stream: false,
        }),
      });

      if (!response.ok) throw new Error(`Status: ${response.status}`);
      const data = await response.json();
      return data.choices?.[0]?.message?.content?.trim() || "";
    } catch (err) {
      console.warn(`   ⚠️ Gagal membuat prompt lewat LLM: ${err.message}. Menggunakan prompt bawaan.`);
      return `2D digital anime style illustration, clean line art, soft colors, high resolution, NihongoRoute educational theme: Student learning Japanese dialogue about ${title}`;
    }
  };

  const processDoc = async (doc, type) => {
    const slugStr = doc.slug || "lesson";
    console.log(`\n🎨 [AI Image] Menggenerasi ilustrasi untuk ${type}: "${doc.title}"...`);

    const imagePrompt = await generatePromptForDoc(doc.title, doc.content_blocks, type);
    console.log(`   Prompt: "${imagePrompt}"`);

    try {
      const response = await fetch(`${imgBaseUrl}/images/generations?response_format=binary`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(imgApiKey ? { Authorization: `Bearer ${imgApiKey}` } : {}),
        },
        body: JSON.stringify({
          model: process.env.AI_IMAGE_MODEL || "ag/gemini-3.1-flash-image",
          prompt: imagePrompt,
          size: "1024x768"
        })
      });

      if (!response.ok) {
        throw new Error(`Images API gagal: ${response.status}`);
      }

      const buffer = Buffer.from(await response.arrayBuffer());
      const BUCKET_NAME = "asset";
      const filename = `lesson/${slugStr}/illustration.png`;

      console.log(`   ⚡ Mengunggah ilustrasi ke Supabase Storage (${BUCKET_NAME}/${filename})...`);
      const { error: uploadError } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(filename, buffer, {
          contentType: "image/png",
          upsert: true,
        });

      if (uploadError) throw new Error(`Upload storage gagal: ${uploadError.message}`);

      const publicUrl = supabase.storage.from(BUCKET_NAME).getPublicUrl(filename).data.publicUrl;
      console.log(`   ✓ Gambar berhasil diunggah ke Supabase: ${publicUrl}`);

      const { error: updateError } = await supabase
        .from("lessons")
        .update({ image_url: publicUrl })
        .eq("id", doc.id);

      if (updateError) throw new Error(`Gagal memperbarui database: ${updateError.message}`);
      console.log(`   ✓ Dokumen "${doc.title}" berhasil di-patch dengan image_url baru!`);
      return true;
    } catch (err) {
      console.error(`   ❌ Gagal memproses ilustrasi "${doc.title}":`, err.message);
      return false;
    }
  };

  // Jalankan untuk lesson
  console.log("\n🚀 Memulai pemrosesan dokumen lesson...");
  for (const doc of lessons) {
    await processDoc(doc, "lesson");
    await sleep(2000);
  }

  console.log("\n🎉 Proses pemindaian dan penggenerasian ilustrasi selesai!");
}

main();
