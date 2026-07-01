#!/usr/bin/env node

/**
 * @file enrich-expressions.mjs
 * @description Script utilitas produksi untuk memperkaya tabel `expressions` di Supabase.
 * Mengisi arti bahasa Indonesia (kolom indonesia), cara baca (kolom reading), 
 * dan jlpt_level yang kosong menggunakan AI (9router dengan fallback Gemini).
 * 
 * Penggunaan:
 *   node scripts/enrich-expressions.mjs --limit 50
 */

import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { createClient } from "@supabase/supabase-js";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function printUsage() {
  console.log(
    [
      "=== NIHONGOROUTE EXPRESSIONS ENRICHER ===",
      "Penggunaan:",
      "  node scripts/enrich-expressions.mjs [options]",
      "",
      "Opsi:",
      "  --limit <number>       Jumlah baris maksimal yang diproses. Default: 20",
      "  --llm-batch-size <N>   Jumlah baris per batch request LLM. Default: 5",
      "  --llm-retries <number> Retry attempt jika koneksi LLM gagal. Default: 2",
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
    limit: 20,
    llmBatchSize: 5,
    llmRetries: 2,
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

    if (arg === "--llm-batch-size") {
      options.llmBatchSize = Number.parseInt(args[index + 1], 10);
      index += 1;
      continue;
    }

    if (arg === "--llm-retries") {
      options.llmRetries = Number.parseInt(args[index + 1], 10);
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
  const geminiKeys = collectGeminiKeys();
  loadEnvFile();
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

function buildPrompt(items) {
  return `
Anda adalah asisten penerjemah dan editor bahasa Jepang profesional.
Tugas Anda adalah melengkapi data ungkapan (expressions) bahasa Jepang ke bahasa Indonesia.

Lengkapi bidang berikut untuk setiap objek di dalam array input:
1. "reading": Cara baca kana/hiragana yang benar dari teks Jepang.
2. "indonesia": Array berisi terjemahan natural bahasa Indonesia (minimal 1, maksimal 3 variasi).
3. "meanings": Array berisi penjelasan arti dalam bahasa Inggris.
4. "jlpt_level": Estimasi tingkat JLPT yang sesuai (N5, N4, N3, N2, N1).

Format output WAJIB berupa JSON murni dengan struktur:
{
  "enriched": [
    {
      "id": "ID ungkapan asli",
      "reading": "pembacaan kana",
      "indonesia": ["arti indonesia 1", "arti indonesia 2"],
      "meanings": ["meaning english 1"],
      "jlpt_level": "N5"
    }
  ]
}

Data Input:
${JSON.stringify(items)}
`.trim();
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
  const aiClient = await createAiClient();
  console.log(`🤖 [AI] Model aktif: ${aiClient.provider}`);

  console.log("🔍 [Database] Memuat ungkapan yang belum diperkaya...");
  const { data: expressions, error } = await supabase
    .from("expressions")
    .select("id, text, reading, meanings, indonesia, jlpt_level")
    .or("indonesia.is.null,reading.eq.,jlpt_level.is.null")
    .limit(options.limit);

  if (error) {
    console.error("❌ Gagal memuat data expressions:", error.message);
    process.exit(1);
  }

  if (!expressions || expressions.length === 0) {
    console.log("✅ Semua data expressions sudah lengkap diperkaya.");
    process.exit(0);
  }

  console.log(`📈 [Proses] Memulai enrichment ${expressions.length} ungkapan...`);
  
  const totalBatches = Math.ceil(expressions.length / options.llmBatchSize);

  for (let b = 0; b < totalBatches; b += 1) {
    const batch = expressions.slice(b * options.llmBatchSize, (b + 1) * options.llmBatchSize);
    console.log(`   📦 Memproses batch ${b + 1}/${totalBatches} (${batch.length} item)...`);

    const prompt = buildPrompt(batch.map((x) => ({ id: x.id, text: x.text })));

    let enrichedItems = [];
    for (let attempt = 1; attempt <= options.llmRetries; attempt += 1) {
      try {
        const responseText = await aiClient.generateText(prompt);
        const cleanJson = responseText.trim().replace(/^```json|```$/g, "").trim();
        const parsed = JSON.parse(cleanJson);
        if (Array.isArray(parsed.enriched)) {
          enrichedItems = parsed.enriched;
          break;
        }
      } catch (err) {
        if (attempt >= options.llmRetries) {
          console.warn(`   ⚠️ Attempt ${attempt} gagal:`, err.message);
        }
      }
    }

    if (enrichedItems.length === 0) {
      console.warn(`   ❌ Batch ${b + 1} dilewati karena kegagalan LLM.`);
      continue;
    }

    console.log(`   💾 Menyimpan data hasil enrichment ke database...`);
    for (const item of enrichedItems) {
      const { error: updateError } = await supabase
        .from("expressions")
        .update({
          reading: item.reading,
          indonesia: item.indonesia,
          meanings: item.meanings,
          jlpt_level: item.jlpt_level,
        })
        .eq("id", item.id);

      if (updateError) {
        console.error(`      └─ Gagal mengupdate ID ${item.id}:`, updateError.message);
      } else {
        console.log(`      └─ Sukses memperkaya ID ${item.id} ("${item.reading}")`);
      }
    }

    if (b < totalBatches - 1) {
      await sleep(1500);
    }
  }

  console.log("\n🎉 [Sukses] Proses enrichment ungkapan selesai!");
  process.exit(0);
}

main();
