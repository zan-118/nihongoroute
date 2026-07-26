#!/usr/bin/env node

/**
 * @file enrich-kanji.mjs
 * @description Script utilitas produksi khusus untuk melakukan pengayaan (enrichment) data Kanji
 * di database Supabase (tabel kanji) menggunakan Google Generative AI (Gemini 3).
 * 
 * Standar kualitas tinggi:
 * - Menangani satu kebutuhan secara spesifik (tabel kanji saja).
 * - Menggunakan 9router (ag/gemini-3-flash) sebagai prioritas utama.
 * - Fallback otomatis ke SDK Gemini langsung jika 9router gagal.
 * - Rotasi API Key dinamis jika terkena rate limit (HTTP 429) pada fallback Gemini.
 * - Validasi skema JSON hasil kembalian LLM secara ketat.
 */

import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { createClient } from "@supabase/supabase-js";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function printUsage() {
  console.log(
    [
      "=== NIHONGOROUTE KANJI ENRICHER CLI ===",
      "Penggunaan:",
      "  node scripts/enrich-kanji.mjs [options]",
      "",
      "Opsi:",
      "  --level <N5|N4|N3|N2|N1>       Filter berdasarkan level JLPT (Default: semua level).",
      "  --limit <number>                 Jumlah maksimal baris data yang diproses (Default: 10).",
      "  --batch-size <number>            Jumlah kanji per request LLM (Default: 5).",
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
Anda adalah ahli bahasa Jepang profesional untuk audiens Indonesia. Tugas Anda adalah melengkapi data tabel kanji berikut:
${JSON.stringify(items, null, 2)}

Untuk setiap kanji, hasilkan bidang-bidang berikut:
- "id": String ID dari item input (wajib sama persis).
- "meaning": Terjemahan arti kanji (keyword) dalam Bahasa Indonesia, ringkas dan spesifik (hindari terjemahan generik seperti "kata benda" atau "hal").
- "english": Terjemahan arti kanji (keyword) dalam Bahasa Inggris, ringkas dan spesifik (misal "minute, part, understand" bukan "thing").
- "onyomi": Pembacaan onyomi dalam katakana (pisahkan dengan koma jika lebih dari satu). Kosongkan ("") jika kanji ini tidak punya onyomi yang lazim dipakai.
- "kunyomi": Pembacaan kunyomi dalam hiragana (sertakan okurigana jika ada, pisahkan dengan koma jika lebih dari satu). Kosongkan ("") jika kanji ini tidak punya kunyomi yang lazim dipakai.
- "romaji": Pembacaan romaji standar (Hepburn) dari onyomi/kunyomi yang paling umum dipakai.
- "grade_level": Tingkat kelas sekolah Jepang tempat kanji ini diajarkan menurut Kyōiku kanji, ditulis sebagai string angka "1" sampai "6" untuk kanji SD. Jika kanji ini bukan Kyōiku (baru diajarkan di SMP/Jōyō tingkat lanjut), isi dengan "Chuugakkou". Jika benar-benar tidak diketahui, isi dengan "-".
- "radicals": Array berisi 1-3 string karakter radikal/komponen pembentuk kanji ini (HANYA karakternya, contoh: ["刀", "力"]), urutkan dari yang PALING UTAMA/dominan duluan.
- "mnemonics": Array berisi 1 string jembatan keledai (memory hook) dalam Bahasa Indonesia yang menghubungkan bentuk/radikal kanji dengan artinya, supaya gampang diingat pelajar. Buat singkat (1-2 kalimat), kreatif, dan masuk akal secara visual/logis — jangan mengada-ada tanpa dasar bentuk kanjinya.
- "examples": Array berisi tepat 2 objek kalimat contoh Jepang-Indonesia yang menggunakan kata berbasis kanji tersebut:
  - "jp": Kalimat contoh Jepang natural (tanpa furigana/ruby di dalam string jp, tulis kanji secara normal).
  - "id": Terjemahan kalimat contoh tersebut dalam Bahasa Indonesia.

Aturan Penting:
1. Respon WAJIB berupa JSON murni dengan format schema yang diminta secara ketat.
2. Terjemahan "id" untuk kalimat contoh wajib dalam Bahasa Indonesia yang alami, bukan kaku atau hasil terjemahan mesin harfiah.
3. Field "examples" harus berisi tepat 2 kalimat contoh yang BERBEDA satu sama lain (kosakata/konteks berbeda), dan KEDUANYA wajib benar-benar mengandung karakter kanji target di dalam kalimat "jp".
4. Di dalam kalimat Jepang ("jp"), DILARANG menggunakan tanda furigana kurung atau markup ruby. Tulis kanji secara normal.
5. Sesuaikan tingkat kesulitan kosakata dan tata bahasa pada kalimat contoh dengan field "jlpt_level" pada tiap item input (N5 = kalimat sangat sederhana/dasar, N1 = boleh lebih kompleks). Jangan pakai grammar di atas level tersebut.
6. Jangan mengarang pembacaan (onyomi/kunyomi/romaji) yang tidak lazim/tidak dipakai dalam kamus standar. Jika ragu, gunakan pembacaan paling umum.
7. Field "radicals" harus radikal yang SECARA VISUAL benar-benar menyusun kanji tersebut, bukan asal tebak. Kalau kanji terlalu sederhana/dasar untuk dipecah (misal kanji itu sendiri adalah radikal dasar), kembalikan array berisi 1 string yaitu kanji itu sendiri.

Skema JSON yang harus dikembalikan:
{
  "results": [
    {
      "id": "id_kanji",
      "meaning": "arti kanji",
      "english": "meaning in english",
      "onyomi": "オンヨミ",
      "kunyomi": "くんよみ",
      "romaji": "romaji",
      "grade_level": "1",
      "radicals": ["刀"],
      "mnemonics": [
        "Bayangkan sebuah pisau (刀) memotong sesuatu menjadi beberapa BAGIAN."
      ],
      "examples": [
        { "jp": "漢字を使った例文です。", "id": "Ini adalah contoh kalimat menggunakan kanji." },
        { "jp": "もう一つの例文です。", "id": "Ini adalah kalimat contoh lainnya." }
      ]
    }
  ]
}
`.trim();
}

function generateSlug(jlptLevel, id) {
  const levelPart = (jlptLevel || "unranked").toLowerCase();
  const idPart = id.split("-")[0];
  return `kanji-level-${levelPart}-${idPart}`;
}

function validateEnrichedItem(item, originalCharacter) {
  const fail = (reason) => ({ valid: false, reason });

  if (!item || typeof item !== "object") return fail("item bukan object");
  if (typeof item.id !== "string" || !item.id) return fail("id kosong/invalid");
  if (typeof item.meaning !== "string" || !item.meaning.trim()) return fail("meaning kosong");
  if (typeof item.onyomi !== "string") return fail("onyomi bukan string");
  if (typeof item.kunyomi !== "string") return fail("kunyomi bukan string");
  if (!item.onyomi.trim() && !item.kunyomi.trim()) return fail("onyomi dan kunyomi kosong dua-duanya");
  const latinLettersPattern = /[a-zA-Z]/;
  if (latinLettersPattern.test(item.onyomi)) return fail("onyomi mengandung huruf latin (kemungkinan romaji tertukar)");
  if (latinLettersPattern.test(item.kunyomi)) return fail("kunyomi mengandung huruf latin (kemungkinan romaji tertukar)");
  if (typeof item.romaji !== "string" || !item.romaji.trim()) return fail("romaji kosong");
  if (typeof item.english !== "string" || !item.english.trim()) return fail("english kosong");
  if (typeof item.grade_level !== "string" || !item.grade_level.trim()) return fail("grade_level kosong");

  if (!Array.isArray(item.radicals) || item.radicals.length === 0) {
    return fail("radicals harus array dengan minimal 1 item");
  }
  for (const rad of item.radicals) {
    if (typeof rad !== "string" || !rad.trim()) {
      return fail("radicals harus berisi string karakter, bukan object/kosong");
    }
  }

  if (!Array.isArray(item.mnemonics) || item.mnemonics.length === 0) {
    return fail("mnemonics harus array dengan minimal 1 item");
  }
  for (const hint of item.mnemonics) {
    if (typeof hint !== "string" || !hint.trim()) return fail("mnemonics punya item string kosong");
  }

  if (!Array.isArray(item.examples) || item.examples.length !== 2) {
    return fail("examples harus tepat 2 item");
  }

  const furiganaPattern = /[（(].*[）)]/;
  const seenJp = new Set();
  for (const ex of item.examples) {
    if (typeof ex.jp !== "string" || !ex.jp.trim()) return fail("contoh kalimat 'jp' kosong");
    if (typeof ex.id !== "string" || !ex.id.trim()) return fail("terjemahan 'id' kosong");
    if (furiganaPattern.test(ex.jp)) return fail("kalimat 'jp' mengandung markup furigana/kurung");
    if (originalCharacter && !ex.jp.includes(originalCharacter)) {
      return fail(`kalimat 'jp' tidak mengandung karakter target "${originalCharacter}"`);
    }
    if (seenJp.has(ex.jp.trim())) return fail("dua kalimat contoh identik/duplikat");
    seenJp.add(ex.jp.trim());
  }

  return { valid: true };
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

  console.log("🔍 [Database] Mencari data kosong pada tabel \"kanji\"...");

  let query = supabase
    .from("kanji")
    .select("id, character, jlpt_level, meaning, english, onyomi, kunyomi, romaji, examples, radicals, mnemonics, grade_level, slug");

  if (options.level) {
    query = query.eq("jlpt_level", options.level);
  }

  if (!options.force) {
    query = query.or(
      "meaning.is.null,onyomi.is.null,kunyomi.is.null,romaji.is.null,examples.is.null," +
        "english.is.null,radicals.is.null,mnemonics.is.null,grade_level.is.null,slug.is.null," +
        "meaning.eq.,onyomi.eq.,kunyomi.eq.,romaji.eq.,english.eq.,grade_level.eq.,slug.eq."
    );
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
        const hasRadicals = Array.isArray(item.radicals) && item.radicals.length > 0;
        const hasMnemonics = Array.isArray(item.mnemonics) && item.mnemonics.length > 0;
        return (
          !item.meaning ||
          (!item.onyomi && !item.kunyomi) ||
          !item.romaji ||
          !hasExamples ||
          !item.english ||
          !hasRadicals ||
          !hasMnemonics ||
          !item.grade_level ||
          !item.slug
        );
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

    const promptItems = batch.map((item) => ({
      id: item.id,
      character: item.character,
      jlpt_level: item.jlpt_level || "tidak diketahui",
    }));
    const prompt = buildPrompt(promptItems);

    try {
      let responseText;
      try {
        responseText = await aiClient.generateText(prompt);
      } catch (firstErr) {
        console.warn(`  ⚠️ [Retry] Batch ${batchIndex} gagal (${firstErr.message || firstErr}), mencoba ulang sekali...`);
        await sleep(1500);
        responseText = await aiClient.generateText(prompt);
      }
      const cleanJson = responseText.trim().replace(/^```json|```$/g, "").trim();
      const parsed = JSON.parse(cleanJson);

      if (!Array.isArray(parsed.results)) {
        console.error("⚠️ [Format] Hasil kembalian LLM tidak valid (bukan array 'results').");
        continue;
      }

      for (const enriched of parsed.results) {
        const original = batch.find((b) => b.id === enriched.id);
        const charLabel = original ? original.character : enriched.id;

        const check = validateEnrichedItem(enriched, original?.character);
        if (!check.valid) {
          console.warn(`  ⚠️ [Validasi] ID "${enriched.id}" (${charLabel}) ditolak: ${check.reason}. Dilewati.`);
          continue;
        }

        console.log(`  ✨ [Update] ID: "${enriched.id}" (${charLabel}) -> diperbarui.`);

        const slug = original?.slug || generateSlug(original?.jlpt_level, enriched.id);

        const { error: updateError } = await supabase
          .from("kanji")
          .update({
            meaning: enriched.meaning,
            english: enriched.english,
            onyomi: enriched.onyomi,
            kunyomi: enriched.kunyomi,
            romaji: enriched.romaji,
            grade_level: enriched.grade_level,
            radicals: enriched.radicals,
            mnemonics: enriched.mnemonics,
            examples: enriched.examples,
            slug,
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

  console.log("\n🎉 [Sukses] Pengayaan database Kanji selesai!");
  process.exit(0);
}

main();
