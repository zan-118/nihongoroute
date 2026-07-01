#!/usr/bin/env node

/**
 * @file enrich-cheatsheet.mjs
 * @description Script utilitas produksi untuk memperkaya tabel `cheatsheets` di Supabase.
 * Mengisi atau memoles item ringkasan/lembar rangkuman bahasa Jepang (kolom items)
 * menggunakan AI (9router dengan fallback Gemini) berdasarkan judul dan kategori cheatsheet.
 * 
 * Skema item diselaraskan dengan interface SheetItem di CheatsheetTable.tsx:
 * - jp: Teks Jepang/Kanji utama (e.g., "〜ほうがいい").
 * - romaji: Cara baca romaji (e.g., "hou ga ii").
 * - label: Deskripsi/arti bahasa Indonesia (e.g., "Sebaiknya... (digunakan untuk memberikan saran)").
 * 
 * Penggunaan:
 *   node scripts/enrich-cheatsheet.mjs --limit 5
 */

import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { createClient } from "@supabase/supabase-js";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function printUsage() {
  console.log(
    [
      "=== NIHONGOROUTE CHEATSHEETS ENRICHER ===",
      "Penggunaan:",
      "  node scripts/enrich-cheatsheet.mjs [options]",
      "",
      "Opsi:",
      "  --limit <number>       Jumlah baris maksimal yang diproses. Default: 5",
      "  --llm-retries <number> Retry attempt jika koneksi LLM gagal. Default: 2",
      "  --force                Paksa enrichment ulang meskipun field items sudah terisi.",
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
    limit: 5,
    llmRetries: 2,
    force: false,
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

    if (arg === "--llm-retries") {
      options.llmRetries = Number.parseInt(args[index + 1], 10);
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

function buildPrompt(title, category) {
  return `
Anda adalah pembuat panduan belajar bahasa Jepang interaktif tingkat tinggi untuk murid Indonesia.
Tugas Anda adalah mengisi lembar rangkuman / cheatsheet berjudul "${title}" di dalam kategori "${category}".

Hasilkan array minimal 8-15 item ringkasan utama, di mana masing-masing objek item memiliki format wajib:
- "jp": Teks Jepang/Kanji utama (e.g., "〜ほうがいい", "は", "が").
- "romaji": Cara baca romaji standar (e.g., "hou ga ii", "ha", "ga").
- "label": Penjelasan detail arti dan penggunaan pola dalam bahasa Indonesia (e.g., "Sebaiknya... (digunakan untuk memberikan saran atau alternatif yang lebih baik)").

Format output WAJIB berupa JSON murni dengan struktur:
{
  "items": [
    {
      "jp": "〜ほうがいい",
      "romaji": "hou ga ii",
      "label": "Sebaiknya... (memberikan saran)"
    }
  ]
}
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

  console.log("🔍 [Database] Memuat cheatsheet...");
  let query = supabase
    .from("cheatsheets")
    .select("id, title, category, items");

  if (!options.force) {
    // Cari cheatsheet yang items-nya kosong, null, atau panjangnya 0
    query = query.or("items.is.null,items.eq.[]");
  }

  const { data: cheatsheets, error } = await query.limit(options.limit);

  if (error) {
    console.error("❌ Gagal memuat data cheatsheets:", error.message);
    process.exit(1);
  }

  if (!cheatsheets || cheatsheets.length === 0) {
    console.log("✅ Semua data cheatsheets sudah lengkap diperkaya.");
    process.exit(0);
  }

  console.log(`📈 [Proses] Memulai enrichment ${cheatsheets.length} cheatsheets...`);

  for (let i = 0; i < cheatsheets.length; i += 1) {
    const cs = cheatsheets[i];
    console.log(`   📝 Memproses cheatsheet ${i + 1}/${cheatsheets.length}: "${cs.title}"...`);

    const prompt = buildPrompt(cs.title, cs.category || "General");

    let enrichedItems = [];
    for (let attempt = 1; attempt <= options.llmRetries; attempt += 1) {
      try {
        const responseText = await aiClient.generateText(prompt);
        const cleanJson = responseText.trim().replace(/^```json|```$/g, "").trim();
        const parsed = JSON.parse(cleanJson);
        if (Array.isArray(parsed.items)) {
          enrichedItems = parsed.items;
          break;
        }
      } catch (err) {
        if (attempt >= options.llmRetries) {
          console.warn(`   ⚠️ Attempt ${attempt} gagal:`, err.message);
        }
      }
    }

    if (enrichedItems.length === 0) {
      console.warn(`   ❌ Gagal memproses cheatsheet "${cs.title}" dari AI.`);
      continue;
    }

    console.log(`   💾 Menyimpan data ke database Supabase...`);
    const { error: updateError } = await supabase
      .from("cheatsheets")
      .update({
        items: enrichedItems,
      })
      .eq("id", cs.id);

    if (updateError) {
      console.error(`      └─ Gagal mengupdate ID ${cs.id}:`, updateError.message);
    } else {
      console.log(`      └─ Sukses memperkaya cheatsheet "${cs.title}" dengan ${enrichedItems.length} item!`);
    }

    if (i < cheatsheets.length - 1) {
      await sleep(1500);
    }
  }

  console.log("\n🎉 [Sukses] Proses enrichment cheatsheet selesai!");
  process.exit(0);
}

main();
