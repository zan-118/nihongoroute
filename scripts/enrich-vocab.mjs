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
      "  --delay <ms>                     Jeda antar batch, dalam milidetik (Default: 1500).",
      "  --retries <number>               Percobaan ulang per batch jika gagal (Default: 3).",
      "  --force                          Paksa update meskipun data sudah lengkap.",
      "  --ids <id1,id2,...>              Proses hanya ID tertentu (abaikan filter level/limit/kelengkapan).",
      "  --dry-run                        Jalankan tanpa menulis perubahan ke Supabase.",
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
    delayMs: 1500,
    retries: 3,
    force: false,
    dryRun: false,
    ids: null,
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

    if (arg === "--delay") {
      const val = Number.parseInt(args[index + 1], 10);
      if (Number.isInteger(val) && val >= 0) {
        options.delayMs = val;
      }
      index += 1;
      continue;
    }

    if (arg === "--retries") {
      const val = Number.parseInt(args[index + 1], 10);
      if (Number.isInteger(val) && val >= 0) {
        options.retries = val;
      }
      index += 1;
      continue;
    }

    if (arg === "--force") {
      options.force = true;
      continue;
    }

    if (arg === "--ids") {
      const raw = args[index + 1];
      if (raw && !raw.startsWith("--")) {
        options.ids = raw
          .split(",")
          .map((id) => id.trim())
          .filter(Boolean);
        index += 1;
      } else {
        console.error("❌ [Args] --ids butuh daftar ID dipisah koma, contoh: --ids abc123,def456");
        process.exit(1);
      }
      continue;
    }

    if (arg === "--dry-run") {
      options.dryRun = true;
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
  - "jp": Kalimat contoh Jepang natural (tulis kanji secara normal, tanpa furigana/ruby di dalam string ini).
  - "furigana": Pembacaan kana lengkap dari kalimat "jp" tersebut (hiragana untuk kanji, katakana tetap katakana).
  - "romaji": Pembacaan romaji standar (Hepburn) dari kalimat "jp" tersebut.
  - "meaning": Terjemahan kalimat contoh tersebut dalam Bahasa Indonesia.

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
        {
          "jp": "日本語の例文です。",
          "furigana": "にほんごのれいぶんです。",
          "romaji": "nihongo no reibun desu.",
          "meaning": "Ini adalah contoh kalimat bahasa Jepang."
        },
        {
          "jp": "二番目の例文です。",
          "furigana": "にばんめのれいぶんです。",
          "romaji": "nibanme no reibun desu.",
          "meaning": "Ini adalah contoh kalimat kedua."
        }
      ]
    }
  ]
}
`.trim();
}

const KANA_PATTERN = /^[\u3040-\u309F\u30A0-\u30FFー、。・\s]+$/;
const ROMAJI_PATTERN = /^[a-zA-Z0-9À-ʯ\s.,'’\-!?]+$/;
const PITCH_ACCENT_PATTERN = /^\d+(\s*[,/]\s*\d+)*$/;
const KNOWN_HINSHI = new Set([
  "noun",
  "verb-u",
  "verb-ru",
  "verb-irregular",
  "adjective-i",
  "adjective-na",
  "adverb",
  "particle",
  "conjunction",
  "interjection",
  "prefix",
  "suffix",
  "counter",
  "expression",
  "pronoun",
]);

function isNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function validateEnrichedItem(item, sourceWord) {
  const reasons = [];

  if (!item || typeof item !== "object") {
    return { valid: false, reasons: ["item bukan objek"] };
  }
  if (!isNonEmptyString(item.id)) reasons.push("id kosong/tidak valid");
  if (!isNonEmptyString(item.meaning_id)) reasons.push("meaning_id kosong");
  if (sourceWord && isNonEmptyString(item.meaning_id) && item.meaning_id.trim() === sourceWord.trim()) {
    reasons.push("meaning_id sama persis dengan kata sumber (kemungkinan LLM tidak menerjemahkan)");
  }

  if (!isNonEmptyString(item.furigana)) {
    reasons.push("furigana kosong");
  } else if (!KANA_PATTERN.test(item.furigana.trim())) {
    reasons.push(`furigana mengandung karakter non-kana: "${item.furigana}"`);
  }

  if (!isNonEmptyString(item.romaji)) {
    reasons.push("romaji kosong");
  } else if (!ROMAJI_PATTERN.test(item.romaji.trim())) {
    reasons.push(`romaji mengandung karakter tak terduga: "${item.romaji}"`);
  }

  if (!Array.isArray(item.hinshi) || item.hinshi.length === 0) {
    reasons.push("hinshi kosong/bukan array");
  } else {
    for (const tag of item.hinshi) {
      if (!isNonEmptyString(tag)) {
        reasons.push("hinshi berisi elemen kosong/bukan string");
        break;
      }
      if (!KNOWN_HINSHI.has(tag)) {
        reasons.push(`hinshi "${tag}" di luar daftar yang dikenal (tetap diterima, cek manual disarankan)`);
      }
    }
  }

  if (item.pitch_accent != null && !PITCH_ACCENT_PATTERN.test(String(item.pitch_accent).trim())) {
    reasons.push(`pitch_accent format tidak valid: "${item.pitch_accent}"`);
  }

  if (item.usage_notes != null && typeof item.usage_notes !== "string") {
    reasons.push("usage_notes bukan string/null");
  }
  if (item.mnemonic != null && typeof item.mnemonic !== "string") {
    reasons.push("mnemonic bukan string/null");
  }

  if (!Array.isArray(item.examples) || item.examples.length !== 2) {
    reasons.push("examples harus berisi tepat 2 item");
  } else {
    item.examples.forEach((ex, idx) => {
      if (!ex || typeof ex !== "object") {
        reasons.push(`examples[${idx}] bukan objek`);
        return;
      }
      if (!isNonEmptyString(ex.jp)) reasons.push(`examples[${idx}].jp kosong`);
      if (!isNonEmptyString(ex.furigana)) {
        reasons.push(`examples[${idx}].furigana kosong`);
      } else if (!KANA_PATTERN.test(ex.furigana.trim())) {
        reasons.push(`examples[${idx}].furigana mengandung karakter non-kana`);
      }
      if (!isNonEmptyString(ex.romaji)) {
        reasons.push(`examples[${idx}].romaji kosong`);
      } else if (!ROMAJI_PATTERN.test(ex.romaji.trim())) {
        reasons.push(`examples[${idx}].romaji mengandung karakter tak terduga`);
      }
      if (!isNonEmptyString(ex.meaning)) reasons.push(`examples[${idx}].meaning kosong`);

      if (sourceWord && isNonEmptyString(ex.jp) && !ex.jp.includes(sourceWord.trim())) {
        reasons.push(`examples[${idx}].jp sepertinya tidak memuat kata "${sourceWord}" (cek manual disarankan)`);
      }
    });

    if (
      Array.isArray(item.examples) &&
      item.examples.length === 2 &&
      isNonEmptyString(item.examples[0]?.jp) &&
      isNonEmptyString(item.examples[1]?.jp) &&
      item.examples[0].jp.trim() === item.examples[1].jp.trim()
    ) {
      reasons.push("kedua examples identik (duplikat)");
    }
  }

  // Reasons that are purely advisory (won't fail validation) are prefixed accordingly.
  const hardFailures = reasons.filter((r) => !r.includes("(tetap diterima") && !r.includes("(cek manual disarankan)"));

  return { valid: hardFailures.length === 0, reasons };
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

  if (options.dryRun) {
    console.log("🧪 [Dry-run] Mode simulasi aktif — tidak ada perubahan yang akan ditulis ke Supabase.");
  }

  console.log("🔍 [Database] Mencari data kosong pada tabel \"vocab\"...");

  const dbItems = [];

  if (options.ids && options.ids.length > 0) {
    console.log(`🎯 [Target] Mode --ids aktif: memproses ${options.ids.length} ID spesifik (mengabaikan --limit dan filter kelengkapan).`);

    let idQuery = supabase.from("vocab").select("id, word, meaning_id, furigana, examples, hinshi").in("id", options.ids);
    if (options.level) {
      idQuery = idQuery.eq("jlpt_level", options.level);
    }

    const { data: chunk, error } = await idQuery;
    if (error) {
      console.error("❌ [Supabase] Gagal membaca tabel:", error.message);
      process.exit(1);
    }

    dbItems.push(...(chunk ?? []));

    const foundIds = new Set(dbItems.map((item) => item.id));
    const notFound = options.ids.filter((id) => !foundIds.has(id));
    if (notFound.length > 0) {
      console.warn(`⚠️ [Target] ${notFound.length} ID tidak ditemukan di tabel "vocab": ${notFound.join(", ")}`);
    }
  } else {
    const PAGE_SIZE = 1000;
    let fromOffset = 0;

    while (dbItems.length < options.limit) {
      const fetchSize = Math.min(PAGE_SIZE, options.limit - dbItems.length);
      let pageQuery = supabase.from("vocab").select("id, word, meaning_id, furigana, examples, hinshi");

      if (options.level) {
        pageQuery = pageQuery.eq("jlpt_level", options.level);
      }

      if (!options.force) {
        pageQuery = pageQuery.or("meaning_id.is.null,furigana.is.null,examples.is.null,hinshi.is.null");
      }

      const { data: chunk, error } = await pageQuery.range(fromOffset, fromOffset + fetchSize - 1);

      if (error) {
        console.error("❌ [Supabase] Gagal membaca tabel:", error.message);
        process.exit(1);
      }

      if (!chunk || chunk.length === 0) break;
      dbItems.push(...chunk);

      if (chunk.length < fetchSize) break;
      fromOffset += chunk.length;
    }
  }

  const filteredItems = options.force || (options.ids && options.ids.length > 0)
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

  let totalUpdated = 0;
  let totalFailed = 0;
  const failedItems = []; // { id, word, reason }

  for (let i = 0; i < filteredItems.length; i += options.batchSize) {
    const batch = filteredItems.slice(i, i + options.batchSize);
    const batchIndex = Math.floor(i / options.batchSize) + 1;
    const totalBatches = Math.ceil(filteredItems.length / options.batchSize);
    
    console.log(`\n📦 [Proses] Memproses batch ${batchIndex}/${totalBatches}...`);

    const promptItems = batch.map((item) => ({ id: item.id, word: item.word }));
    const prompt = buildPrompt(promptItems);

    let parsed = null;
    for (let attempt = 1; attempt <= options.retries; attempt += 1) {
      try {
        const responseText = await aiClient.generateText(prompt);
        const cleanJson = responseText.trim().replace(/^```json|```$/g, "").trim();
        const candidate = JSON.parse(cleanJson);

        if (!Array.isArray(candidate.results)) {
          throw new Error("Hasil kembalian LLM tidak valid (bukan array 'results').");
        }

        parsed = candidate;
        break;
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        console.error(
          `⚠️ [Error] Percobaan ${attempt}/${options.retries} untuk batch ${batchIndex} gagal: ${message}`
        );
        if (attempt < options.retries) {
          const backoffMs = 1000 * 2 ** (attempt - 1);
          await sleep(backoffMs);
        }
      }
    }

    if (!parsed) {
      console.error(`❌ [Error] Batch ${batchIndex} dilewati setelah ${options.retries} percobaan gagal.`);
      totalFailed += batch.length;
      batch.forEach((item) =>
        failedItems.push({ id: item.id, word: item.word, reason: "Generate LLM gagal setelah retry habis" })
      );
    } else {
      const returnedIds = new Set();

      for (const enriched of parsed.results) {
        const original = batch.find((b) => b.id === enriched?.id);

        if (!original) {
          console.warn(
            `⚠️ [Validasi] LLM mengembalikan ID "${enriched?.id}" yang tidak ada di batch ini. Dilewati (kemungkinan halusinasi).`
          );
          totalFailed += 1;
          failedItems.push({ id: enriched?.id ?? "unknown", word: "?", reason: "ID hasil LLM tidak cocok dengan batch (halusinasi)" });
          continue;
        }

        returnedIds.add(original.id);

        const { valid, reasons } = validateEnrichedItem(enriched, original.word);
        const advisories = reasons.filter((r) => r.includes("(tetap diterima") || r.includes("(cek manual disarankan)"));
        const hardFailures = reasons.filter((r) => !advisories.includes(r));

        if (!valid) {
          console.warn(`⚠️ [Validasi] ID "${enriched.id}" (${original.word}) gagal validasi:`);
          hardFailures.forEach((r) => console.warn(`      - ${r}`));
          totalFailed += 1;
          failedItems.push({ id: enriched.id, word: original.word, reason: hardFailures.join("; ") });
          continue;
        }

        if (advisories.length > 0) {
          console.warn(`ℹ️  [Peringatan] ID "${enriched.id}" (${original.word}) lolos validasi tapi perlu ditinjau:`);
          advisories.forEach((r) => console.warn(`      - ${r}`));
        }

        if (options.dryRun) {
          console.log(`  🧪 [Dry-run] ID: "${enriched.id}" (${original.word}) -> akan diperbarui (tidak ditulis).`);
          totalUpdated += 1;
          continue;
        }

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
          totalFailed += 1;
          failedItems.push({ id: enriched.id, word: original.word, reason: `Gagal menulis ke Supabase: ${updateError.message}` });
        } else {
          console.log(`  ✨ [Update] ID: "${enriched.id}" (${original.word}) -> diperbarui.`);
          totalUpdated += 1;
        }
      }

      const missing = batch.filter((b) => !returnedIds.has(b.id));
      if (missing.length > 0) {
        console.warn(
          `⚠️ [Validasi] ${missing.length} kata di batch ${batchIndex} tidak dikembalikan sama sekali oleh LLM: ${missing
            .map((m) => `${m.word} (${m.id})`)
            .join(", ")}`
        );
        totalFailed += missing.length;
        missing.forEach((m) =>
          failedItems.push({ id: m.id, word: m.word, reason: "Tidak dikembalikan sama sekali oleh LLM" })
        );
      }
    }

    if (batchIndex < totalBatches) {
      await sleep(options.delayMs);
    }
  }

  console.log(
    `\n🎉 [Selesai] ${totalUpdated} baris berhasil${options.dryRun ? " disimulasikan" : " diperbarui"}, ${totalFailed} baris gagal/dilewati.`
  );

  if (failedItems.length > 0 && !options.dryRun) {
    const reportsDir = path.resolve(process.cwd(), "reports");
    if (!fs.existsSync(reportsDir)) fs.mkdirSync(reportsDir, { recursive: true });

    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const reportPath = path.join(reportsDir, `enrich-vocab-failures-${timestamp}.json`);
    const uniqueFailedIds = Array.from(new Set(failedItems.map((f) => f.id).filter((id) => id && id !== "unknown")));

    fs.writeFileSync(
      reportPath,
      JSON.stringify({ generatedAt: new Date().toISOString(), totalFailed: failedItems.length, items: failedItems }, null, 2)
    );

    console.log(`\n📄 [Report] Detail kegagalan disimpan di: ${reportPath}`);
    if (uniqueFailedIds.length > 0) {
      console.log(`\n🔁 [Retry] Jalankan ini untuk retry hanya baris yang gagal:`);
      console.log(`   node scripts/enrich-vocab.mjs --force --ids ${uniqueFailedIds.join(",")}`);
    }
  }

  process.exit(totalFailed > 0 && totalUpdated === 0 ? 1 : 0);
}

main();
