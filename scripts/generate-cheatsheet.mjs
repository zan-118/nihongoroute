#!/usr/bin/env node

/**
 * @file generate-cheatsheet.mjs
 * @description Script utilitas produksi untuk membuat (generate) data cheatsheet baru 
 * dari awal ke database Supabase (tabel cheatsheets) menggunakan AI (9router dengan fallback Gemini).
 * 
 * Penggunaan:
 *   node scripts/generate-cheatsheet.mjs --title "Partikel Dasar" --category "Partikel"
 */

import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { createClient } from "@supabase/supabase-js";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function printUsage() {
  console.log(
    [
      "=== NIHONGOROUTE CHEATSHEET GENERATOR ===",
      "Penggunaan:",
      "  node scripts/generate-cheatsheet.mjs [options]",
      "",
      "Opsi:",
      "  --title <string>     Judul cheatsheet. Wajib ada.",
      "  --category <string>  Kategori cheatsheet (e.g. Tata Bahasa, Partikel, Angka). Default: Umum",
      "  --help, -h           Tampilkan bantuan ini.",
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
    title: null,
    category: "Umum",
  };

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];

    if (arg === "--help" || arg === "-h") {
      printUsage();
      process.exit(0);
    }

    if (arg === "--title") {
      options.title = args[index + 1];
      index += 1;
      continue;
    }

    if (arg === "--category") {
      options.category = args[index + 1];
      index += 1;
      continue;
    }
  }

  return options;
}

function collectGeminiKeys() {
  const keys = [];
  if (process.env.GEMINI_API_KEY) keys.push(process.env.GEMINI_API_KEY);
  if (process.env.GEMINI_API_KEYS) {
    keys.push(
      ...process.env.GEMINI_API_KEYS.split(",")
        .map((key) => key.trim())
        .filter(Boolean)
    );
  }

  for (const [key, value] of Object.entries(process.env)) {
    if (/^GEMINI_API_KEY_\d+$/.test(key) && value) keys.push(value);
  }

  return Array.from(new Set(keys));
}

async function createAiClient() {
  loadEnvFile();

  const geminiKeys = collectGeminiKeys();
  
  const ninerouterUrl = process.env.NINEROUTER_URL;
  const ninerouterKey = process.env.NINEROUTER_KEY;

  let openAiBaseUrl = process.env.AI_BASE_URL;
  if (ninerouterUrl) {
    openAiBaseUrl = ninerouterUrl.endsWith("/v1") ? ninerouterUrl : `${ninerouterUrl}/v1`;
  }
  const openAiApiKey = ninerouterKey ?? process.env.AI_API_KEY;

  const hasOpenAi = !!openAiBaseUrl;
  const hasGemini = geminiKeys.length > 0;

  if (!hasOpenAi && !hasGemini) {
    throw new Error("Membutuhkan NINEROUTER_URL/NINEROUTER_KEY, AI_BASE_URL/AI_API_KEY atau GEMINI_API_KEY.");
  }

  let openAiClient = null;
  if (hasOpenAi) {
    openAiClient = {
      async generateText(prompt) {
        const response = await fetch(`${openAiBaseUrl}/chat/completions`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(openAiApiKey ? { Authorization: `Bearer ${openAiApiKey}` } : {}),
          },
          body: JSON.stringify({
            model: process.env.AI_MODEL || "ag/gemini-3-flash",
            messages: [{ role: "user", content: prompt }],
            response_format: { type: "json_object" },
            stream: false,
          }),
        });

        if (!response.ok) {
          const errText = await response.text();
          throw new Error(`9router API error: ${response.status} - ${errText}`);
        }

        const data = await response.json();
        return data.choices?.[0]?.message?.content ?? "";
      },
    };
  }

  let geminiClient = null;
  if (hasGemini) {
    const { GoogleGenerativeAI } = await import("@google/generative-ai");
    let currentKeyIndex = 0;
    const modelName = process.env.GEMINI_MODEL || "gemini-2.5-flash";

    const getModel = (idx) => {
      const genAI = new GoogleGenerativeAI(geminiKeys[idx]);
      return genAI.getGenerativeModel({
        model: modelName,
        generationConfig: { responseMimeType: "application/json" },
      });
    };

    let model = getModel(currentKeyIndex);

    geminiClient = {
      async generateText(prompt) {
        for (let attempt = 0; attempt < geminiKeys.length; attempt += 1) {
          try {
            const result = await model.generateContent(prompt);
            return result.response.text();
          } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            const isQuota =
              message.includes("429") ||
              message.toLowerCase().includes("quota") ||
              message.toLowerCase().includes("limit");
            if (!isQuota || geminiKeys.length <= 1) throw error;

            currentKeyIndex = (currentKeyIndex + 1) % geminiKeys.length;
            model = getModel(currentKeyIndex);
          }
        }
        throw new Error("Rotasi API Key Gemini habis.");
      },
    };
  }

  return {
    provider: openAiClient
      ? `9router (${process.env.AI_MODEL || "ag/gemini-3-flash"}) dengan fallback Gemini`
      : "Gemini Direct",
    async generateText(prompt) {
      if (openAiClient) {
        try {
          return await openAiClient.generateText(prompt);
        } catch (error) {
          console.warn(`⚠️ [AI] 9router gagal, mencoba fallback Gemini: ${error.message}`);
          if (geminiClient) {
            return await geminiClient.generateText(prompt);
          }
          throw error;
        }
      }
      return await geminiClient.generateText(prompt);
    },
  };
}

function buildPrompt(title, category) {
  return `
Anda adalah pembuat panduan belajar bahasa Jepang interaktif (Cheatsheet) berstandar tinggi untuk siswa Indonesia.
Tugas Anda adalah memproduksi lembar rangkuman referensi cepat berjudul "${title}" dalam kategori "${category}".

Persyaratan Konten:
1. **Definisi Akurat & Aplikatif**: Kolom 'label' harus menjelaskan arti pola/konsep secara taktis dalam bahasa Indonesia, lengkap dengan batasan penggunaan atau nuansa penting (misalnya: jika partikel, jelaskan peran sintaksisnya).
2. **Kesesuaian Teks Jepang ('jp')**: Kolom 'jp' harus memuat aksara Jepang asli (Kanji/Kana) tanpa furigana di dalamnya.
3. **Romaji Standar**: Kolom 'romaji' harus ditulis dalam romaji standar Hepburn yang rapi, membantu pelafalan mandiri murid.

Format output WAJIB berupa JSON murni tanpa markdown wrapper:
{
  "slug": "slug-cheatsheet-romaji",
  "items": [
    {
      "jp": "〜ほうがいい",
      "romaji": "hou ga ii",
      "label": "Sebaiknya... (digunakan untuk menyatakan saran secara langsung kepada lawan bicara)"
    }
  ]
}
`.trim();
}

async function main() {
  loadEnvFile();

  const options = parseArgs(process.argv.slice(2));

  if (!options.title) {
    console.error("❌ Parameter --title wajib disertakan.");
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
  const aiClient = await createAiClient();
  console.log(`🤖 [AI] Model aktif: ${aiClient.provider}`);

  console.log(`📈 [Proses] Menghasilkan cheatsheet "${options.title}"...`);

  const prompt = buildPrompt(options.title, options.category);

  let generated = null;
  try {
    const responseText = await aiClient.generateText(prompt);
    const cleanJson = responseText.trim().replace(/^```json|```$/g, "").trim();
    generated = JSON.parse(cleanJson);
  } catch (err) {
    console.error("❌ Gagal menghasilkan data dari AI:", err.message);
    process.exit(1);
  }

  if (!generated || !Array.isArray(generated.items)) {
    console.error("❌ Data hasil generate AI tidak lengkap.");
    process.exit(1);
  }

  console.log(`💾 Menyimpan cheatsheet baru ke database Supabase...`);
  const { data, error } = await supabase
    .from("cheatsheets")
    .insert({
      title: options.title,
      category: options.category,
      slug: generated.slug || options.title.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      items: generated.items,
    })
    .select()
    .single();

  if (error) {
    console.error("❌ Gagal menyimpan cheatsheet ke database:", error.message);
    process.exit(1);
  }

  console.log(`🎉 [Sukses] Cheatsheet berhasil dibuat! ID: ${data.id}`);
}

main();
