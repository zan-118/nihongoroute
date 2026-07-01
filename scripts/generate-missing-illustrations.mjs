#!/usr/bin/env node

/**
 * @file generate-missing-illustrations.mjs
 * @description Script utilitas untuk memindai semua dokumen `lesson` di Sanity CMS 
 * yang belum memiliki ilustrasi, kemudian menggenerasi ilustrasi secara otomatis 
 * menggunakan 9router / Gemini dan mengunggahnya ke Sanity.
 * 
 * Penggunaan:
 *   node scripts/generate-missing-illustrations.mjs --limit 100
 */

import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { createClient } from "@sanity/client";

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
  }

  return options;
}

async function main() {
  loadEnvFile();
  const options = parseArgs(process.argv.slice(2));

  const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "qoczxvvo";
  const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
  const token = process.env.SANITY_API_WRITE_TOKEN;
  const ninerouterUrl = process.env.NINEROUTER_URL;
  const ninerouterKey = process.env.NINEROUTER_KEY;

  const imgBaseUrl = ninerouterUrl ? (ninerouterUrl.endsWith("/v1") ? ninerouterUrl : `${ninerouterUrl}/v1`) : process.env.AI_BASE_URL;
  const imgApiKey = ninerouterKey ?? process.env.AI_API_KEY;

  if (!token) {
    console.error("❌ [Config] SANITY_API_WRITE_TOKEN wajib didefinisikan!");
    process.exit(1);
  }

  if (!imgBaseUrl) {
    console.error("❌ [Config] AI_BASE_URL / NINEROUTER_URL wajib didefinisikan!");
    process.exit(1);
  }

  const sanity = createClient({
    projectId,
    dataset,
    apiVersion: "2026-05-17",
    token,
    useCdn: false,
  });

  console.log("🔍 [Sanity] Membaca dokumen lesson yang tidak memiliki ilustrasi...");

  // 1. Dapatkan lesson yang tidak memiliki imageBlock
  const lessons = await sanity.fetch(
    `*[_type == "lesson" && !("imageBlock" in content_blocks[]._type)][0...$limit] {
      _id,
      title,
      summary,
      content_blocks
    }`,
    { limit: options.limit }
  );

  console.log(`✓ Ditemukan ${lessons.length} lesson untuk diproses.`);

  if (lessons.length === 0) {
    console.log("✅ Semua dokumen lesson di Sanity sudah memiliki ilustrasi!");
    process.exit(0);
  }

  const generatePromptForDoc = async (title, body, type) => {
    const textSnippet = typeof body === "string" ? body.slice(0, 800) : JSON.stringify(body || "").slice(0, 800);
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
    const slugStr = doc.slug?.current || doc.slug || "lesson";
    console.log(`\n🎨 [AI Image] Menggenerasi ilustrasi untuk ${type}: "${doc.title}"...`);

    const imagePrompt = await generatePromptForDoc(doc.title, doc.body || doc.summary || doc.content_blocks, type);
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
      const asset = await sanity.assets.upload("image", buffer, {
        filename: `${slugStr}-auto-img.png`
      });
      console.log(`   ✓ Gambar berhasil diunggah ke Sanity: ${asset.url}`);

      const imageBlock = {
        _type: "imageBlock",
        _key: `block-ill-${Date.now()}`,
        title: `Ilustrasi Pelajaran: ${doc.title}`,
        content: asset.url
      };

      const existingBlocks = doc.content_blocks || [];
      const updatedBlocks = [...existingBlocks, imageBlock];

      await sanity.patch(doc._id).set({ content_blocks: updatedBlocks }).commit();
      console.log(`   ✓ Dokumen "${doc.title}" berhasil di-patch dengan imageBlock baru!`);
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
