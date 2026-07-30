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
      "  --max-readings <number>          Maks. total bacaan (onyomi+kunyomi) yang dicover contoh (Default: 6).",
      "  --max-retries <number>           Maks. percobaan ulang jika generate/validasi gagal (Default: 2).",
      "  --force                          Paksa update meskipun data sudah lengkap.",
      "  --ids <id1,id2,...>              Proses ID spesifik ini aja (mengabaikan filter --level/limit/kelengkapan). Cocok buat re-run baris yang gagal validasi.",
      "  --dry-run                        Jalankan generate + validasi TANPA menulis ke Supabase.",
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
    maxReadings: 6,
    maxRetries: 2,
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

    if (arg === "--max-readings") {
      const val = Number.parseInt(args[index + 1], 10);
      if (Number.isInteger(val) && val > 0) {
        options.maxReadings = val;
      }
      index += 1;
      continue;
    }

    if (arg === "--max-retries") {
      const val = Number.parseInt(args[index + 1], 10);
      if (Number.isInteger(val) && val >= 0) {
        options.maxRetries = val;
      }
      index += 1;
      continue;
    }

    if (arg === "--force") {
      options.force = true;
      continue;
    }

    if (arg === "--dry-run") {
      options.dryRun = true;
      continue;
    }

    if (arg === "--ids") {
      const val = args[index + 1];
      if (val) {
        options.ids = val
          .split(",")
          .map((v) => v.trim())
          .filter(Boolean);
      }
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

function buildPrompt(items, maxReadings = 6) {
  return `
Anda adalah ahli bahasa Jepang profesional untuk audiens Indonesia. Tugas Anda adalah melengkapi data tabel kanji berikut:
${JSON.stringify(items, null, 2)}

Untuk setiap kanji, hasilkan bidang-bidang berikut:
- "id": String ID dari item input (wajib sama persis).
- "meaning": Terjemahan arti kanji (keyword) dalam Bahasa Indonesia, ringkas dan spesifik (hindari terjemahan generik seperti "kata benda" atau "hal").
- "english": Terjemahan arti kanji (keyword) dalam Bahasa Inggris, ringkas dan spesifik (misal "minute, part, understand" bukan "thing").
- "onyomi": Pembacaan onyomi dalam katakana, dipisah koma jika lebih dari satu (contoh: "セイ, ショウ"). Kosongkan ("") jika kanji ini tidak punya onyomi yang lazim dipakai. Jika bacaan onyomi yang lazim ada LEBIH dari ${maxReadings}, pilih HANYA ${maxReadings} yang PALING UMUM/lazim dipakai (jangan cantumkan yang jarang dipakai).
- "kunyomi": Pembacaan kunyomi dalam hiragana (sertakan okurigana jika ada), dipisah koma jika lebih dari satu. Kosongkan ("") jika kanji ini tidak punya kunyomi yang lazim dipakai. Terapkan batas yang sama seperti onyomi jika bacaannya sangat banyak.
- "romaji": Pembacaan romaji standar (Hepburn) dari onyomi/kunyomi yang paling umum dipakai.
- "grade_level": Tingkat kelas sekolah Jepang tempat kanji ini diajarkan menurut Kyōiku kanji, ditulis sebagai string angka "1" sampai "6" untuk kanji SD. Jika kanji ini bukan Kyōiku (baru diajarkan di SMP/Jōyō tingkat lanjut), isi dengan "Chuugakkou". Jika benar-benar tidak diketahui, isi dengan "-".
- "radicals": Array berisi 1-3 string karakter radikal/komponen pembentuk kanji ini (HANYA karakternya, contoh: ["刀", "力"]), urutkan dari yang PALING UTAMA/dominan duluan.
- "mnemonics": Array berisi 1 string jembatan keledai (memory hook) dalam Bahasa Indonesia yang menghubungkan bentuk/radikal kanji dengan artinya, supaya gampang diingat pelajar. Buat singkat (1-2 kalimat), kreatif, dan masuk akal secara visual/logis — jangan mengada-ada tanpa dasar bentuk kanjinya.
- "examples": Array berisi SATU objek kalimat contoh UNTUK SETIAP bacaan individual yang Anda tulis di "onyomi" dan "kunyomi" (jadi kalau "onyomi" punya 2 bacaan dan "kunyomi" punya 1 bacaan, "examples" harus berisi tepat 3 objek — satu per bacaan). Tiap objek terdiri dari:
  - "jp": Kalimat contoh Jepang natural, kanji ditulis NORMAL tanpa furigana/kurung/ruby markup apapun.
  - "romaji": Transliterasi romaji (Hepburn) dari SELURUH kalimat "jp" (bukan cuma kanji targetnya).
  - "furigana": Transliterasi bacaan LENGKAP dari "jp" dalam hiragana/katakana MURNI (tanpa kanji sama sekali, tanpa kurung/bracket) — ini cara baca seluruh kalimat kalau dibaca dengan lantang, sama seperti kalau kalimat itu ditulis ulang penuh pakai kana. Contoh: jp "毎日漢字を勉強します。" -> furigana "まいにちかんじをべんきょうします。"
  - "id": Terjemahan kalimat contoh tersebut dalam Bahasa Indonesia.
  - "reading_type": String "onyomi" atau "kunyomi", menandakan jenis bacaan kanji target yang dipakai di kalimat ini.
  - "reading": String bacaan SPESIFIK (harus sama persis salah satu bacaan yang tercantum di field "onyomi" atau "kunyomi" di atas, sesuai "reading_type") yang dipakai pada kata kanji target di kalimat ini.

Aturan Penting:
1. Respon WAJIB berupa JSON murni dengan format schema yang diminta secara ketat.
2. Terjemahan "id" untuk kalimat contoh wajib dalam Bahasa Indonesia yang alami, bukan kaku atau hasil terjemahan mesin harfiah.
3. WAJIB CAKUP SETIAP BACAAN: setiap bacaan individual yang ada di "onyomi" maupun "kunyomi" harus punya TEPAT SATU kalimat contoh sendiri yang benar-benar menggunakan bacaan tersebut (dicek lewat field "reading"). Contoh: jika "onyomi" = "セイ, ショウ" dan "kunyomi" = "い.きる", maka harus ada 3 kalimat contoh: satu untuk セイ, satu untuk ショウ, satu untuk い.きる. Semua kalimat contoh wajib berbeda satu sama lain (kosakata/konteks berbeda) dan wajib benar-benar mengandung karakter kanji target di dalam kalimat "jp".
4. Jika kanji tidak punya onyomi ATAU tidak punya kunyomi (kosong), maka examples cukup mencakup bacaan yang ada saja (tidak perlu menambah kalimat kosong untuk jenis yang tidak ada).
5. Di dalam kalimat Jepang ("jp"), DILARANG menggunakan tanda furigana kurung atau markup ruby. Bacaan lengkap kalimat itu tugasnya field "furigana" terpisah, DAN "furigana" itu sendiri tidak boleh mengandung karakter kanji apapun (harus 100% kana).
6. Field "furigana" harus mencerminkan cara baca alami dari SELURUH kalimat "jp" (bukan cuma sebagian), termasuk partikel dan kata bantu.
7. Sesuaikan tingkat kesulitan kosakata dan tata bahasa pada kalimat contoh dengan field "jlpt_level" pada tiap item input (N5 = kalimat sangat sederhana/dasar, N1 = boleh lebih kompleks). Jangan pakai grammar di atas level tersebut.
8. Jangan mengarang pembacaan (onyomi/kunyomi/romaji) yang tidak lazim/tidak dipakai dalam kamus standar. Jika ragu, gunakan pembacaan paling umum.
9. Field "radicals" harus berisi 1-3 string radikal yang SECARA VISUAL benar-benar menyusun kanji tersebut, bukan asal tebak, urutkan dari yang PALING UTAMA/dominan duluan. Kalau kanji terlalu sederhana/dasar untuk dipecah (misal kanji itu sendiri adalah radikal dasar), kembalikan array berisi 1 string yaitu kanji itu sendiri.
10. Field "mnemonics" wajib berisi TEPAT 1 string jembatan keledai.

Skema JSON yang harus dikembalikan:
{
  "results": [
    {
      "id": "id_kanji",
      "meaning": "arti kanji",
      "english": "meaning in english",
      "onyomi": "セイ, ショウ",
      "kunyomi": "い.きる",
      "romaji": "sei",
      "grade_level": "1",
      "radicals": ["刀"],
      "mnemonics": [
        "Bayangkan sebuah pisau (刀) memotong sesuatu menjadi beberapa BAGIAN."
      ],
      "examples": [
        {
          "jp": "漢字を使った例文です。",
          "romaji": "kanji o tsukatta reibun desu.",
          "furigana": "かんじをつかったれいぶんです。",
          "id": "Ini adalah contoh kalimat menggunakan kanji.",
          "reading_type": "onyomi",
          "reading": "セイ"
        },
        {
          "jp": "もう一つの例文です。",
          "romaji": "mou hitotsu no reibun desu.",
          "furigana": "もうひとつのれいぶんです。",
          "id": "Ini adalah kalimat contoh lainnya.",
          "reading_type": "onyomi",
          "reading": "ショウ"
        },
        {
          "jp": "彼は元気に生きています。",
          "romaji": "kare wa genki ni ikite imasu.",
          "furigana": "かれはげんきにいきています。",
          "id": "Dia hidup dengan sehat.",
          "reading_type": "kunyomi",
          "reading": "い.きる"
        }
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
  const validGradeLevels = new Set(["1", "2", "3", "4", "5", "6", "Chuugakkou", "-"]);
  if (typeof item.grade_level !== "string" || !validGradeLevels.has(item.grade_level.trim())) {
    return fail(`grade_level tidak valid: "${item.grade_level}" (harus salah satu dari 1-6, "Chuugakkou", atau "-")`);
  }

  if (!Array.isArray(item.radicals) || item.radicals.length === 0 || item.radicals.length > 3) {
    return fail("radicals harus array dengan 1-3 item");
  }
  for (const rad of item.radicals) {
    if (typeof rad !== "string" || !rad.trim()) {
      return fail("radicals harus berisi string karakter, bukan object/kosong");
    }
  }

  if (!Array.isArray(item.mnemonics) || item.mnemonics.length !== 1) {
    return fail("mnemonics harus array dengan tepat 1 item");
  }
  for (const hint of item.mnemonics) {
    if (typeof hint !== "string" || !hint.trim()) return fail("mnemonics punya item string kosong");
  }

  const splitReadings = (str) =>
    (str || "")
      .split(",")
      .map((r) => r.trim())
      .filter(Boolean);

  const onyomiReadings = splitReadings(item.onyomi);
  const kunyomiReadings = splitReadings(item.kunyomi);
  const expectedCount = onyomiReadings.length + kunyomiReadings.length;

  if (!Array.isArray(item.examples) || item.examples.length !== expectedCount) {
    return fail(
      `examples harus berisi tepat ${expectedCount} item (1 per bacaan: ${onyomiReadings.length} onyomi + ${kunyomiReadings.length} kunyomi), tapi dapat ${
        Array.isArray(item.examples) ? item.examples.length : "bukan array"
      }`
    );
  }

  const furiganaMarkupPattern = /[（(].*[）)]/;
  const kanjiPattern = /[\u4e00-\u9faf]/;
  const kanaOnlyPattern = /^[\u3040-\u30ffー、。！？「」『』・…\s]+$/;
  const seenJp = new Set();
  const coveredOnyomi = new Set();
  const coveredKunyomi = new Set();

  for (const ex of item.examples) {
    if (typeof ex.jp !== "string" || !ex.jp.trim()) return fail("contoh kalimat 'jp' kosong");
    if (typeof ex.id !== "string" || !ex.id.trim()) return fail("terjemahan 'id' kosong");
    if (furiganaMarkupPattern.test(ex.jp)) return fail("kalimat 'jp' mengandung markup furigana/kurung (harusnya di field 'furigana')");
    if (originalCharacter && !ex.jp.includes(originalCharacter)) {
      return fail(`kalimat 'jp' tidak mengandung karakter target "${originalCharacter}"`);
    }
    if (seenJp.has(ex.jp.trim())) return fail("dua kalimat contoh identik/duplikat");
    seenJp.add(ex.jp.trim());

    if (typeof ex.romaji !== "string" || !ex.romaji.trim()) {
      return fail("field 'romaji' pada example kosong/tidak ada");
    }

    if (typeof ex.furigana !== "string" || !ex.furigana.trim()) {
      return fail("field 'furigana' kosong/tidak ada");
    }
    if (kanjiPattern.test(ex.furigana)) {
      return fail("field 'furigana' masih mengandung karakter kanji (harus 100% kana)");
    }
    if (!kanaOnlyPattern.test(ex.furigana.trim())) {
      return fail("field 'furigana' mengandung karakter selain kana/tanda baca (kemungkinan romaji/latin nyelip)");
    }

    if (ex.reading_type !== "onyomi" && ex.reading_type !== "kunyomi") {
      return fail(`'reading_type' harus "onyomi" atau "kunyomi", didapat: "${ex.reading_type}"`);
    }

    if (typeof ex.reading !== "string" || !ex.reading.trim()) {
      return fail("field 'reading' pada example kosong/tidak ada");
    }
    const readingTrimmed = ex.reading.trim();

    if (ex.reading_type === "onyomi") {
      if (!onyomiReadings.includes(readingTrimmed)) {
        return fail(`'reading' pada example ("${readingTrimmed}") tidak cocok dengan salah satu bacaan di field 'onyomi' ("${item.onyomi}")`);
      }
      if (coveredOnyomi.has(readingTrimmed)) {
        return fail(`bacaan onyomi "${readingTrimmed}" dipakai lebih dari satu kali di examples`);
      }
      coveredOnyomi.add(readingTrimmed);
    } else {
      if (!kunyomiReadings.includes(readingTrimmed)) {
        return fail(`'reading' pada example ("${readingTrimmed}") tidak cocok dengan salah satu bacaan di field 'kunyomi' ("${item.kunyomi}")`);
      }
      if (coveredKunyomi.has(readingTrimmed)) {
        return fail(`bacaan kunyomi "${readingTrimmed}" dipakai lebih dari satu kali di examples`);
      }
      coveredKunyomi.add(readingTrimmed);
    }
  }

  // Setiap bacaan onyomi & kunyomi wajib punya kalimat contoh sendiri
  const missingOnyomi = onyomiReadings.filter((r) => !coveredOnyomi.has(r));
  const missingKunyomi = kunyomiReadings.filter((r) => !coveredKunyomi.has(r));
  if (missingOnyomi.length > 0 || missingKunyomi.length > 0) {
    return fail(
      `belum semua bacaan tercover oleh examples. Onyomi belum ada contoh: [${missingOnyomi.join(", ")}]. Kunyomi belum ada contoh: [${missingKunyomi.join(", ")}]`
    );
  }

  return { valid: true };
}

async function regenerateSingleItem(aiClient, promptItem, previousAttempt, failReason, maxReadings = 6) {
  const correctivePrompt =
    buildPrompt([promptItem], maxReadings) +
    "\n\n--- KOREKSI ---\n" +
    `Percobaan sebelumnya untuk kanji ini GAGAL validasi dengan alasan: "${failReason}".\n` +
    `Hasil percobaan sebelumnya: ${JSON.stringify(previousAttempt)}\n` +
    "Perbaiki KHUSUS bagian yang menyebabkan kegagalan itu. Bagian lain yang sudah benar boleh dipertahankan. " +
    "Tetap kembalikan dalam skema JSON yang sama persis (\"results\": [ ... ]) berisi 1 item.";

  const responseText = await aiClient.generateText(correctivePrompt);
  const cleanJson = responseText.trim().replace(/^```json|```$/g, "").trim();
  const parsed = JSON.parse(cleanJson);

  if (!Array.isArray(parsed.results) || parsed.results.length === 0) {
    throw new Error("Format hasil koreksi tidak valid (bukan array 'results' non-kosong).");
  }
  return parsed.results[0];
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

  if (options.dryRun) {
    console.log("🧪 [Mode] DRY-RUN aktif — tidak ada perubahan yang akan ditulis ke Supabase.");
  }

  console.log(`🔌 [Supabase] Menghubungkan ke ${supabaseUrl}...`);
  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  
  const aiClient = await createAiClient();
  console.log(`🤖 [AI] Model aktif: ${aiClient.provider}`);

  console.log("🔍 [Database] Mencari data kosong pada tabel \"kanji\"...");

  let query = supabase
    .from("kanji")
    .select("id, character, jlpt_level, meaning, english, onyomi, kunyomi, romaji, examples, radicals, mnemonics, grade_level, slug");

  if (options.ids) {
    query = query.in("id", options.ids);
  } else if (options.level) {
    query = query.eq("jlpt_level", options.level);
  }

  if (!options.force && !options.ids) {
    query = query.or(
      "meaning.is.null,onyomi.is.null,kunyomi.is.null,romaji.is.null,examples.is.null," +
        "english.is.null,radicals.is.null,mnemonics.is.null,grade_level.is.null,slug.is.null," +
        "meaning.eq.,onyomi.eq.,kunyomi.eq.,romaji.eq.,english.eq.,grade_level.eq.,slug.eq."
    );
  }

  const { data: dbItems, error } = await query.limit(options.ids ? options.ids.length : options.limit);

  if (error) {
    console.error("❌ [Supabase] Gagal membaca tabel:", error.message);
    process.exit(1);
  }

  const filteredItems = options.force || options.ids
    ? dbItems
    : dbItems.filter((item) => {
        const hasExamples = Array.isArray(item.examples) && item.examples.length >= 2;
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

  const stats = { succeeded: 0, failed: [] };

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
    const prompt = buildPrompt(promptItems, options.maxReadings);

    try {
      let parsed = null;
      let lastGenErr = null;

      for (let attempt = 0; attempt <= options.maxRetries; attempt += 1) {
        try {
          const responseText = await aiClient.generateText(prompt);
          const cleanJson = responseText.trim().replace(/^```json|```$/g, "").trim();
          const candidate = JSON.parse(cleanJson);

          if (!Array.isArray(candidate.results)) {
            throw new Error("Hasil kembalian LLM tidak valid (bukan array 'results')");
          }

          parsed = candidate;
          lastGenErr = null;
          break;
        } catch (genErr) {
          lastGenErr = genErr;
          const attemptsLeft = options.maxRetries - attempt;
          console.warn(
            `  ⚠️ [Retry] Batch ${batchIndex} percobaan ${attempt + 1}/${options.maxRetries + 1} gagal (${genErr.message || genErr})` +
              (attemptsLeft > 0 ? `, mencoba lagi (sisa ${attemptsLeft})...` : ", sudah habis percobaan.")
          );
          if (attemptsLeft > 0) await sleep(1500 * (attempt + 1));
        }
      }

      if (!parsed) {
        console.error(`❌ [Error] Batch ${batchIndex} gagal total setelah ${options.maxRetries + 1} percobaan: ${lastGenErr?.message || lastGenErr}`);
        for (const original of batch) {
          stats.failed.push({ id: original.id, character: original.character, reason: `batch gagal generate/parse: ${lastGenErr?.message || lastGenErr}` });
        }
        continue;
      }

      for (const original of batch) {
        const charLabel = original.character;
        let enriched = parsed.results.find((r) => r.id === original.id);

        if (!enriched) {
          console.warn(`  ⚠️ [Hilang] ID "${original.id}" (${charLabel}) tidak ada di hasil LLM. Dilewati, data lama dipertahankan.`);
          stats.failed.push({ id: original.id, character: charLabel, reason: "tidak ada di hasil LLM (kemungkinan batch kepotong/terlewat)" });
          continue;
        }

        let check = validateEnrichedItem(enriched, original.character);
        let retryCount = 0;

        while (!check.valid && retryCount < options.maxRetries) {
          retryCount += 1;
          console.warn(
            `  ⚠️ [Validasi] ID "${enriched.id}" (${charLabel}) ditolak (percobaan koreksi ${retryCount}/${options.maxRetries}): ${check.reason}`
          );
          try {
            const promptItem = {
              id: original.id,
              character: original.character,
              jlpt_level: original.jlpt_level || "tidak diketahui",
            };
            const retried = await regenerateSingleItem(aiClient, promptItem, enriched, check.reason, options.maxReadings);
            enriched = retried;
            check = validateEnrichedItem(retried, original.character);
          } catch (retryErr) {
            console.warn(
              `  ❌ [Koreksi] Error saat retry ID "${original.id}" (${charLabel}) percobaan ${retryCount}: ${retryErr.message || retryErr}`
            );
            check = { valid: false, reason: `retry error: ${retryErr.message || retryErr}` };
          }
        }

        if (!check.valid) {
          console.warn(
            `  ❌ [Validasi] ID "${enriched.id}" (${charLabel}) TETAP gagal setelah ${retryCount}x koreksi: ${check.reason}. Dilewati, data lama dipertahankan.`
          );
          stats.failed.push({ id: enriched.id, character: charLabel, reason: check.reason });
          continue;
        }

        if (retryCount > 0) {
          console.log(`  ✅ [Koreksi] ID "${enriched.id}" (${charLabel}) lolos setelah ${retryCount}x koreksi.`);
        }

        const slug = original.slug || generateSlug(original.jlpt_level, enriched.id);

        if (options.dryRun) {
          console.log(`  🧪 [Dry-run] ID: "${enriched.id}" (${charLabel}) -> lolos validasi, TIDAK ditulis ke DB.`);
          console.log(`     slug: ${slug}`);
          console.log(`     onyomi: ${enriched.onyomi || "-"} | kunyomi: ${enriched.kunyomi || "-"} | romaji: ${enriched.romaji}`);
          enriched.examples.forEach((ex, idx) => {
            console.log(`     example[${idx}] (${ex.reading_type}: ${ex.reading}): ${ex.jp}`);
            console.log(`       furigana: ${ex.furigana}`);
          });
          stats.succeeded += 1;
          continue;
        }

        console.log(`  ✨ [Update] ID: "${enriched.id}" (${charLabel}) -> diperbarui.`);

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
            stats.failed.push({ id: enriched.id, character: charLabel, reason: `Supabase update error: ${updateError.message}` });
            continue;
          }

          stats.succeeded += 1;
      }
    } catch (err) {
      console.error(`❌ [Error] Gagal menyelesaikan batch ${batchIndex}:`, err.message || err);
      for (const original of batch) {
        stats.failed.push({ id: original.id, character: original.character, reason: `batch error: ${err.message || err}` });
      }
    }

    if (batchIndex < totalBatches) {
      await sleep(1500);
    }
  }

  console.log("\n📊 [Ringkasan]");
  console.log(`  ✅ Berhasil (${options.dryRun ? "lolos validasi, dry-run" : "ditulis ke DB"}): ${stats.succeeded}`);
  console.log(`  ❌ Gagal (data lama di DB dipertahankan apa adanya): ${stats.failed.length}`);

  if (stats.failed.length > 0) {
    const failFile = path.resolve(process.cwd(), `enrich-kanji-failures-${Date.now()}.json`);
    fs.writeFileSync(failFile, JSON.stringify(stats.failed, null, 2));
    console.log(`  📄 Detail baris gagal ditulis ke: ${failFile}`);
    console.log(`  🔁 Re-run baris ini aja setelah investigasi:`);
    console.log(`     node scripts/enrich-kanji.mjs --ids ${stats.failed.map((f) => f.id).join(",")} --force`);
    console.log("  ⚠️  Selama baris ini belum lolos, schema-nya TETAP beda dari baris yang sudah berhasil (data lama vs baru bercampur).");
  }

  console.log("\n🎉 [Sukses] Pengayaan database Kanji selesai!");
  process.exit(0);
}

main();
