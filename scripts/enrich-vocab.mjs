#!/usr/bin/env node

/**
 * @file enrich-vocab.mjs
 * @description Script utilitas produksi khusus untuk melakukan pengayaan (enrichment) data kosakata
 * di database Supabase (tabel vocab) menggunakan Google Generative AI (Gemini 3).
 * 
 * Pengayaan komprehensif mencakup semua kolom skema:
 * - meaning_id: Terjemahan bahasa Indonesia.
 * - furigana, romaji, pitch_accent.
 * - hinshi: Kelas kata (noun, verb, adjective, etc.).
 * - usage_notes, mnemonic.
 * - examples: Tepat 2 contoh kalimat Jepang-Indonesia.
 */

import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { createClient } from "@supabase/supabase-js";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function printUsage() {
  console.log(
    [
      "=== NIHONGOROUTE VOCABULARY ENRICHER CLI ===",
      "Penggunaan:",
      "  node scripts/enrich-vocab.mjs [options]",
      "",
      "Opsi:",
      "  --level <N5|N4|N3|N2|N1>       Filter berdasarkan level JLPT (Default: semua level).",
      "  --limit <number>                 Jumlah maksimal baris data yang diproses (Default: 10).",
      "  --batch-size <number>            Jumlah kata per request LLM (Default: 5).",
      "  --force                          Paksa update meskipun data sudah lengkap.",
      "  --help, -h                       Tampilkan bantuan ini.",
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
    level: null,
    limit: 10,
    batchSize: 5,
    force: false,
  };

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];

    if (arg === "--help" || arg === "-h") {
      printUsage();
      process.exit(0);
    }

    if (arg === "--level") {
      const lvl = args[index + 1]?.trim().toUpperCase();
      if (lvl && ["N5", "N4", "N3", "N2", "N1"].includes(lvl)) {
        options.level = lvl;
      } else {
        console.error(`❌ [Args] Level JLPT tidak valid: ${args[index + 1]}`);
        process.exit(1);
      }
      index += 1;
      continue;
    }

    if (arg === "--limit") {
      const val = Number.parseInt(args[index + 1], 10);
      if (Number.isInteger(val) && val > 0) {
        options.limit = val;
      }
      index += 1;
      continue;
    }

    if (arg === "--batch-size") {
      const val = Number.parseInt(args[index + 1], 10);
      if (Number.isInteger(val) && val > 0) {
        options.batchSize = val;
      }
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

function buildPrompt(items) {
  return `
Anda adalah ahli bahasa Jepang profesional untuk audiens Indonesia. Tugas Anda adalah melengkapi data kosakata (vocab) berikut:
${JSON.stringify(items, null, 2)}

Untuk setiap kosakata, hasilkan bidang-bidang berikut:
- "id": String ID dari item input (wajib sama persis).
- "meaning_id": Terjemahan arti kata dalam Bahasa Indonesia yang paling akurat.
- "furigana": Pembacaan kana lengkap (hiragana/katakana) dari kosakata tersebut.
- "romaji": Pembacaan romaji standar (Hepburn).
- "hinshi": Kelas kata dalam bentuk array of strings (e.g. ["noun"], ["verb-u"], ["verb-ru"], ["adjective-i"], ["adjective-na"], ["adverb"], ["particle"]).
- "pitch_accent": Nilai pitch accent kata dalam bahasa Jepang (e.g., "0", "1", "2").
- "usage_notes": Catatan singkat penggunaan kata/perbedaan nuansa dalam bahasa Indonesia (atau null jika tidak ada).
- "mnemonic": Jembatan keledai untuk membantu mengingat kosakata ini (atau null jika tidak ada).
- "examples": Array berisi tepat 2 objek kalimat contoh Jepang-Indonesia dengan format:
  - "jp": Kalimat contoh Jepang natural (tanpa furigana/ruby di dalam string jp, tulis kanji secara normal).
  - "id": Terjemahan kalimat contoh tersebut dalam Bahasa Indonesia.

Format output WAJIB berupa JSON murni dengan struktur:
{
  "results": [
    {
      "id": "id_vocab",
      "meaning_id": "arti",
      "furigana": "ふりがな",
      "romaji": "romaji",
      "hinshi": ["noun"],
      "pitch_accent": "0",
      "usage_notes": "...",
      "mnemonic": "...",
      "examples": [
        { "jp": "日本語の例文です。", "id": "Contoh kalimat..." },
        { "jp": "二番目の例文です。", "id": "Contoh kalimat kedua..." }
      ]
    }
  ]
}
`.trim();
}

function validateEnrichedItem(item) {
  if (!item || typeof item !== "object") return false;
  if (typeof item.id !== "string" || !item.id) return false;
  if (typeof item.meaning_id !== "string" || !item.meaning_id) return false;
  if (typeof item.furigana !== "string" || !item.furigana) return false;
  if (typeof item.romaji !== "string" || !item.romaji) return false;
  if (!Array.isArray(item.hinshi) || item.hinshi.length === 0) return false;
  
  if (!Array.isArray(item.examples) || item.examples.length !== 2) return false;
  for (const ex of item.examples) {
    if (typeof ex.jp !== "string" || !ex.jp) return false;
    if (typeof ex.id !== "string" || !ex.id) return false;
  }

  return true;
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

  console.log(`🔌 [Supabase] Menghubungkan ke ${supabaseUrl}...`);
  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  
  const aiClient = await createAiClient();
  console.log(`🤖 [AI] Model aktif: ${aiClient.provider}`);

  console.log("🔍 [Database] Mencari data kosong pada tabel \"vocab\"...");

  let query = supabase.from("vocab").select("id, word, meaning_id, furigana, examples, hinshi");

  if (options.level) {
    query = query.eq("jlpt_level", options.level);
  }

  if (!options.force) {
    query = query.or("meaning_id.is.null,furigana.is.null,examples.is.null,hinshi.is.null");
  }

  const { data: dbItems, error } = await query.limit(options.limit);

  if (error) {
    console.error("❌ [Supabase] Gagal membaca tabel:", error.message);
    process.exit(1);
  }

  const filteredItems = options.force
    ? dbItems
    : dbItems.filter((item) => {
        const hasExamples = Array.isArray(item.examples) && item.examples.length === 2;
        const hasHinshi = Array.isArray(item.hinshi) && item.hinshi.length > 0;
        return !item.meaning_id || !item.furigana || !hasExamples || !hasHinshi;
      });

  if (filteredItems.length === 0) {
    console.log("✅ [Database] Semua kolom pada target sudah terisi lengkap. Tidak ada data yang perlu diperkaya.");
    process.exit(0);
  }

  console.log(`📈 [Database] Menemukan ${filteredItems.length} baris data yang siap diperkaya.`);

  for (let i = 0; i < filteredItems.length; i += options.batchSize) {
    const batch = filteredItems.slice(i, i + options.batchSize);
    const batchIndex = Math.floor(i / options.batchSize) + 1;
    const totalBatches = Math.ceil(filteredItems.length / options.batchSize);
    
    console.log(`\n📦 [Proses] Memproses batch ${batchIndex}/${totalBatches}...`);

    const promptItems = batch.map((item) => ({ id: item.id, word: item.word }));
    const prompt = buildPrompt(promptItems);

    try {
      const responseText = await aiClient.generateText(prompt);
      const cleanJson = responseText.trim().replace(/^```json|```$/g, "").trim();
      const parsed = JSON.parse(cleanJson);

      if (!Array.isArray(parsed.results)) {
        console.error("⚠️ [Format] Hasil kembalian LLM tidak valid (bukan array 'results').");
        continue;
      }

      for (const enriched of parsed.results) {
        if (!validateEnrichedItem(enriched)) {
          console.warn(`⚠️ [Validasi] Item dengan ID "${enriched.id}" gagal dalam validasi skema. Dilewati.`);
          continue;
        }

        const original = batch.find((b) => b.id === enriched.id);
        const wordLabel = original ? original.word : enriched.id;
        
        console.log(`  ✨ [Update] ID: "${enriched.id}" (${wordLabel}) -> diperbarui.`);

        const { error: updateError } = await supabase
          .from("vocab")
          .update({
            meaning_id: enriched.meaning_id,
            furigana: enriched.furigana,
            romaji: enriched.romaji,
            hinshi: enriched.hinshi,
            pitch_accent: enriched.pitch_accent,
            usage_notes: enriched.usage_notes,
            mnemonic: enriched.mnemonic,
            examples: enriched.examples,
          })
          .eq("id", enriched.id);

          if (updateError) {
            console.error(`  ❌ [Supabase] Gagal menyimpan ID "${enriched.id}":`, updateError.message);
          }
      }
    } catch (err) {
      console.error(`❌ [Error] Gagal menyelesaikan batch ${batchIndex}:`, err.message || err);
    }

    if (batchIndex < totalBatches) {
      await sleep(1500);
    }
  }

  console.log("\n🎉 [Sukses] Pengayaan database kosakata selesai!");
  process.exit(0);
}

main();
