#!/usr/bin/env node

/**
 * @file enrich-grammar.mjs
 * @description Script utilitas produksi khusus untuk melakukan pengayaan (enrichment) data Tata Bahasa (Grammar)
 * di database Supabase (tabel grammar) menggunakan Google Generative AI (Gemini 3).
 *
 * Standar kualitas tinggi:
 * - Menangani satu kebutuhan secara spesifik (tabel grammar saja).
 * - Menggunakan 9router (ag/gemini-3-flash) sebagai prioritas utama.
 * - Fallback otomatis ke SDK Gemini langsung jika 9router gagal.
 * - Rotasi API Key dinamis jika terkena rate limit (HTTP 429) pada fallback Gemini.
 * - Retry dengan backoff untuk kegagalan transient (network/timeout) sebelum menyerah.
 * - Prompt dikalibrasi per level JLPT dan diberi referensi data asli (bukan menebak buta)
 *   untuk grammar_family dan related_grammar.
 * - Validasi skema JSON hasil kembalian LLM secara ketat, termasuk aturan konten
 *   (kana murni, tanpa markup furigana, panjang notes minimum).
 * - Output "notes" WAJIB mendalam dan terstruktur per-heading (Fungsi & Konteks, Cara
 *   Pakai & Aturan, Variasi Bentuk, Konteks Pemakaian Nyata, Perbandingan dengan Pola
 *   Serupa jika relevan, Kesalahan Umum), bukan sekadar ringkasan singkat. "meaning"
 *   WAJIB berupa penjelasan 2-3 kalimat, dan "examples" berisi 3 kalimat contoh dari
 *   konteks/register yang berbeda-beda. Semua ambang ini ditegakkan lewat validasi
 *   panjang/heading di validateEnrichedItem, bukan cuma diminta di prompt.
 */

import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { createClient } from "@supabase/supabase-js";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const JLPT_LEVELS = ["N5", "N4", "N3", "N2", "N1"];

/**
 * Logger sederhana: setiap baris log ditampilkan ke terminal DAN ditulis ke file
 * di folder logs/, dengan timestamp yang konsisten. Nama logInfo/logWarn/logError
 * dipakai (bukan "log"/"warn"/"error") supaya tidak bentrok dengan variabel lokal
 * "error" yang sudah dipakai di banyak blok catch (error) di seluruh file.
 */
let logStream = null;
let logFilePath = null;

function initLogger() {
  try {
    const logDir = path.resolve(process.cwd(), "logs");
    if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true });
    const stamp = new Date().toISOString().replace(/[:.]/g, "-");
    logFilePath = path.join(logDir, `enrich-grammar-${stamp}.log`);
    logStream = fs.createWriteStream(logFilePath, { flags: "a" });
  } catch (err) {
    logFilePath = null;
    logStream = null;
    console.warn(`⚠️ [Logger] Gagal membuat file log (${err.message}). Log hanya akan tampil di terminal.`);
  }
}

function timeNow() {
  return new Date().toTimeString().slice(0, 8);
}

function logInfo(message) {
  const line = `[${timeNow()}] ${message}`;
  console.log(line);
  if (logStream) logStream.write(`${line}\n`);
}

function logWarn(message) {
  const line = `[${timeNow()}] ${message}`;
  console.warn(line);
  if (logStream) logStream.write(`${line}\n`);
}

function logError(message) {
  const line = `[${timeNow()}] ${message}`;
  console.error(line);
  if (logStream) logStream.write(`${line}\n`);
}

function closeLogger() {
  if (logStream) logStream.end();
}

function printUsage() {
  logInfo(
    [
      "=== NIHONGOROUTE GRAMMAR ENRICHER CLI ===",
      "Penggunaan:",
      "  node scripts/enrich-grammar.mjs [options]",
      "",
      "Opsi:",
      "  --level <N5|N4|N3|N2|N1>       Filter berdasarkan level JLPT (Default: semua level).",
      "  --limit <number>                 Jumlah maksimal baris data yang diproses (Default: 10).",
      "  --batch-size <number>            Jumlah pola tata bahasa per request LLM (Default: 3).",
      "  --force                          Paksa proses ulang SEMUA baris, termasuk yang sudah lolos validasi kualitas.",
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
    batchSize: 3,
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
      if (lvl && JLPT_LEVELS.includes(lvl)) {
        options.level = lvl;
      } else {
        logError(`❌ [Args] Level JLPT tidak valid: ${args[index + 1]}`);
        process.exit(1);
      }
      index += 1;
      continue;
    }

    if (arg === "--limit") {
      const val = Number.parseInt(args[index + 1], 10);
      if (Number.isInteger(val) && val > 0) {
        options.limit = val;
      } else {
        logWarn(`⚠️ [Args] --limit tidak valid ("${args[index + 1]}"), menggunakan default: ${options.limit}`);
      }
      index += 1;
      continue;
    }

    if (arg === "--batch-size") {
      const val = Number.parseInt(args[index + 1], 10);
      if (Number.isInteger(val) && val > 0) {
        options.batchSize = val;
      } else {
        logWarn(`⚠️ [Args] --batch-size tidak valid ("${args[index + 1]}"), menggunakan default: ${options.batchSize}`);
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
            temperature: 0.4,
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
        generationConfig: { responseMimeType: "application/json", temperature: 0.4 },
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
          logWarn(`⚠️ [AI] 9router gagal, mencoba fallback Gemini: ${error.message}`);
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

/**
 * Mengambil daftar kandidat related_grammar untuk sebuah item, diprioritaskan dari
 * level JLPT yang sama, lalu level yang bersebelahan (±1). Ini dikirim ke LLM sebagai
 * daftar pilihan konkret, bukan meminta LLM menebak slug yang bahkan tidak pernah
 * ditunjukkan kepadanya.
 */
function getRelatedCandidates(item, dbItems, maxCandidates = 18) {
  const levelIdx = JLPT_LEVELS.indexOf(item.jlpt_level);
  const sameFamily = [];
  const sameLevel = [];
  const adjacentLevel = [];

  for (const other of dbItems) {
    if (other.id === item.id || !other.slug) continue;
    if (item.grammar_family && other.grammar_family === item.grammar_family) {
      sameFamily.push(other);
    } else if (other.jlpt_level === item.jlpt_level) {
      sameLevel.push(other);
    } else if (levelIdx !== -1 && Math.abs(JLPT_LEVELS.indexOf(other.jlpt_level) - levelIdx) === 1) {
      adjacentLevel.push(other);
    }
  }

  // Kandidat dari grammar_family yang sama didahulukan karena secara topik jelas
  // paling relevan untuk dibandingkan nuansanya di "notes"; sisanya cuma pelengkap.
  return [...sameFamily, ...sameLevel, ...adjacentLevel]
    .slice(0, maxCandidates)
    .map((d) => ({ slug: d.slug, title: d.title }));
}

/**
 * Mengambil daftar nama grammar_family yang sudah ada di database (unik, diurutkan),
 * untuk dikirim sebagai referensi ke LLM agar konsep yang sama tidak berakhir dengan
 * nama kategori yang berbeda-beda antar item.
 */
function getExistingFamilies(dbItems, maxFamilies = 60) {
  const families = new Set(dbItems.map((d) => d.grammar_family).filter(Boolean));
  return Array.from(families).sort().slice(0, maxFamilies);
}

function buildPrompt(items, existingFamilies) {
  const familiesBlock =
    existingFamilies.length > 0
      ? `\nKategori "grammar_family" yang SUDAH ADA di database (gunakan ulang salah satu ini jika konsepnya cocok — JANGAN buat nama variasi baru untuk konsep yang sama; hanya buat nama baru bila benar-benar tidak ada yang cocok):\n${JSON.stringify(existingFamilies)}\n`
      : "";

  return `
Anda adalah ahli bahasa Jepang profesional untuk audiens Indonesia. Tugas Anda adalah melengkapi data tabel tata bahasa (grammar) berikut. Setiap item sudah dilengkapi "jlpt_level" dan daftar "related_grammar_candidates" milik item tersebut — gunakan keduanya untuk mengkalibrasi jawaban, jangan mengarang di luar itu.

${JSON.stringify(items, null, 2)}
${familiesBlock}
Untuk setiap item tata bahasa, hasilkan bidang-bidang berikut. INGAT: audiens adalah pembelajar mandiri yang TIDAK punya guru untuk bertanya, jadi setiap penjelasan harus berdiri sendiri, lengkap, dan tidak boleh terasa seperti ringkasan kamus:
- "id": String ID dari item input (wajib sama persis).
- "meaning": Penjelasan arti/fungsi tata bahasa dalam Bahasa Indonesia, 2-3 kalimat mengalir (BUKAN cuma terjemahan satu-dua kata seperti "keinginan" atau "sebab akibat"). Jelaskan APA fungsinya, kapan pola ini biasanya muncul dalam kalimat, dan nuansa rasa yang dibawanya (mis. terkesan formal, terkesan menyesal, terkesan menekankan). Dilarang mengulang kata-kata dari "title" begitu saja.
- "formation": Pola pembentukan tata bahasa (misal: "KK Kamus + ことになっている").
- "formation_furigana": Pembacaan kana dari pola pembentukan tersebut (gunakan Hiragana bersih, jangan ada huruf Romaji seperti KK/KS/KB, ganti KK dengan どうし, KS dengan けいようし, KB dengan めいし).
- "formation_romaji": Romaji standar dari pola pembentukan tersebut.
- "examples": Array berisi TEPAT 3 objek kalimat contoh Jepang-Indonesia berkualitas tinggi yang mendemonstrasikan pola tata bahasa ini dari sudut konteks yang berbeda-beda (mis. satu situasi kerja/sekolah, satu percakapan santai sehari-hari, satu pernyataan/narasi formal atau tertulis) — variasi ini penting supaya pembelajar melihat keluwesan pola dalam berbagai register, bukan cuma satu jenis kalimat yang diulang. Sesuaikan tingkat kesulitan vokabulari dan struktur kalimat dengan "jlpt_level" item (kalimat untuk N5 wajib memakai vokabulari dasar N5, bukan vokabulari tingkat lanjut, dan sebaliknya):
  - Ketiga contoh WAJIB berbeda secara bermakna satu sama lain — subjek, konteks, kosakata isi (content word), DAN idealnya posisi/fungsi pola dalam kalimat harus berbeda. DILARANG membuat kalimat yang hanya beda satu kata (misal cuma ganti nama orang/objek dengan struktur identik).
  - Utamakan konteks konkret dan relevan dengan kehidupan nyata dibanding kalimat abstrak generik ala buku teks.
  - "japanese": Kalimat contoh Jepang menggunakan Kanji dan Kana standar.
  - "furigana": Pembacaan furigana dari SELURUH kalimat tersebut, dalam Hiragana bersih TANPA spasi, tanda slash '/', maupun huruf Romaji/alfabet sama sekali (contoh: "わたしはがくse..." -> "わたしはがくせいです。" atau "にほんごをべんきょうします。"). Setiap kanji di kalimat "japanese" harus terwakili bacaannya di sini, termasuk kanji dalam angka atau istilah asing yang ditulis dengan kanji/katakana.
  - "romaji": Romaji standar (Hepburn) dari kalimat tersebut (contoh: "Watashi wa gakusei desu.").
  - "indonesian": Terjemahan alami dan mengalir dalam Bahasa Indonesia sehari-hari — DILARANG menerjemahkan kata-per-kata secara kaku/harfiah selama makna aslinya tetap terjaga.
- "notes": Penjelasan MENDALAM dalam Bahasa Indonesia yang ramah pemula tapi tidak dangkal, terstruktur rapi dengan Markdown (DILARANG satu paragraf panjang tebal, DILARANG konten generik yang bisa berlaku untuk tata bahasa manapun — semua poin harus spesifik dan konkret untuk pola ini, seolah-olah ditulis oleh guru bahasa Jepang yang benar-benar paham detail nuansanya). Gunakan HEADING TEBAL berikut secara berurutan dan PERSIS seperti ini (gunakan format Markdown "**Judul Heading**" di baris tersendiri), jangan lewati satupun:
  1. **Fungsi & Konteks** — paragraf 2-3 kalimat menjelaskan fungsi dasar tata bahasa, situasi kapan pola ini natural dipakai, dan tingkat formalitas dasarnya (formal/informal, lisan/tulisan).
  2. **Cara Pakai & Aturan** — WAJIB minimal 4 daftar poin (diawali "- ") yang menjabarkan aturan koneksi/pembentukan secara detail (bentuk kata apa yang bisa disambung, pengecualian jika ada), nuansa penggunaan halus, tingkat kesopanan, dan batasan pemakaian (mis. hanya dipakai dengan kata kerja tertentu, tidak dipakai untuk diri sendiri, dsb). Setiap poin harus berisi informasi konkret dan actionable, bukan basa-basi atau pengulangan poin lain.
  3. **Variasi Bentuk** — jika pola ini punya variasi (positif/negatif, lampau/non-lampau, formal/informal, dsb.), WAJIB sertakan tabel Markdown perbandingan bentuk-bentuk tersebut lengkap dengan contoh singkat per baris. Jika pola ini benar-benar tidak punya variasi bentuk, jelaskan secara eksplisit kenapa (mis. karena berupa ungkapan tetap/idiomatik), jangan dikosongkan begitu saja.
  4. **Konteks Pemakaian Nyata** — berikan minimal 1-2 gambaran situasi nyata konkret (bukan sekadar mengulang kalimat contoh) tentang kapan penutur asli akan memilih memakai pola ini dibanding cara lain, termasuk register yang cocok (chat santai, email formal, pidato, dsb).
  5. **Perbandingan dengan Pola Serupa** — jika ada isi di "related_grammar_candidates" milik item ini, WAJIB pilih minimal 1 dan jelaskan perbedaan nuansa konkret (kapan pakai yang satu, kapan pakai yang lain, apa yang berubah maknanya kalau tertukar). Jika daftar kandidatnya benar-benar kosong, boleh dilewati bagian ini SAJA (heading lain tetap wajib ada).
  6. **Kesalahan Umum** — diakhiri satu baris peringatan diawali emoji "⚠️", berisi 1-2 kalimat yang menjelaskan jebakan kesalahan SPESIFIK untuk pola ini (kesalahan bentuk, kesalahan konteks pemakaian, atau tertukar dengan pola mirip) DAN kenapa itu salah/apa akibatnya — bukan peringatan umum seperti "⚠️ Hindari memakai bentuk ini secara sembarangan".
- "grammar_family": Nama kategori tata bahasa dalam Bahasa Indonesia, format Judul Kapital dan konsisten (misal: "Keinginan", "Sebab-Akibat", "Keharusan", "Kondisional", "Waktu", "Keigo"). Gunakan ulang nama dari daftar referensi di atas jika konsepnya sama; hanya buat nama baru jika benar-benar tidak ada kategori yang cocok.
- "related_grammar": Array berisi maksimal 2 slug tata bahasa yang berhubungan dekat. WAJIB pilih HANYA dari daftar "related_grammar_candidates" milik item tersebut (field "slug"-nya, bukan judulnya). Jika tidak ada kandidat yang relevan, kembalikan array kosong [].

Aturan Penting:
1. Respon WAJIB berupa JSON murni dengan format schema yang diminta secara ketat.
2. Terjemahan "indonesian" untuk kalimat contoh wajib dalam Bahasa Indonesia yang alami, bukan kaku.
3. Field "examples" harus berisi TEPAT 3 kalimat contoh yang relevan dengan pola tata bahasa target dengan format lengkap (japanese, furigana murni tanpa spasi/slash, romaji, indonesian), masing-masing dari konteks/register yang berbeda.
4. Di dalam kalimat Jepang ("japanese"), DILARANG menggunakan tanda furigana kurung atau markup ruby. Tulis kanji secara normal.
5. Kolom "formation_furigana" WAJIB menggunakan kana Jepang murni (Hiragana/Katakana) tanpa ada karakter alfabet/Romaji sama sekali.
6. Field "notes" WAJIB memuat SEMUA heading tebal wajib (**Fungsi & Konteks**, **Cara Pakai & Aturan**, **Variasi Bentuk**, **Konteks Pemakaian Nyata**, **Kesalahan Umum**, plus **Perbandingan dengan Pola Serupa** jika ada kandidat terkait) — jangan memangkas demi keringkasan. Kedalaman penjelasan lebih penting daripada keringkasan.
7. Field "meaning" WAJIB berupa penjelasan 2-3 kalimat, bukan terjemahan satu-dua kata.
8. "related_grammar" WAJIB berupa slug yang benar-benar ada di "related_grammar_candidates" milik item terkait — JANGAN mengarang slug yang tidak ada di daftar tersebut.
9. Prioritaskan akurasi linguistik di atas segalanya: jangan menebak pola pembentukan atau nuansa jika tidak yakin — dasarkan pada aturan tata bahasa Jepang standar yang benar-benar berlaku untuk pola tersebut.
10. Ketiga kalimat contoh dalam "examples" WAJIB tidak boleh sama atau nyaris sama satu sama lain (beda hanya 1 kata). Periksa ulang setiap pasangan sebelum menjawab.
11. "formation_furigana" WAJIB merupakan bacaan yang benar-benar sesuai dengan "formation" (bukan bacaan yang hanya mirip-mirip).
12. Jangan menyingkat atau menyerahkan bagian "notes" hanya demi menghemat token — kedalaman dan kelengkapan penjelasan adalah prioritas utama tugas ini.

Skema JSON yang harus dikembalikan (contoh notes di bawah ini sengaja dipersingkat untuk ilustrasi struktur saja; notes asli WAJIB jauh lebih detail dan lengkap sesuai instruksi di atas):
{
  "results": [
    {
      "id": "id_grammar",
      "meaning": "Penjelasan 2-3 kalimat tentang fungsi dan nuansa tata bahasa ini...",
      "formation": "pola pembentukan",
      "formation_furigana": "ふりがな",
      "formation_romaji": "romaji",
      "examples": [
        {
          "japanese": "私は学生です。",
          "furigana": "わたしはがくせいです。",
          "romaji": "Watashi wa gakusei desu.",
          "indonesian": "Saya adalah seorang siswa."
        },
        {
          "japanese": "日本語を勉強します。",
          "furigana": "にほんごをべんきょうします。",
          "romaji": "Nihongo o benkyou shimasu.",
          "indonesian": "Saya belajar bahasa Jepang."
        },
        {
          "japanese": "来週の会議までに資料を準備しておきます。",
          "furigana": "らいしゅうのかいぎまでにしりょうをじゅんびしておきます。",
          "romaji": "Raishuu no kaigi made ni shiryou o junbi shite okimasu.",
          "indonesian": "Saya akan menyiapkan dokumennya sebelum rapat minggu depan."
        }
      ],
      "notes": "**Fungsi & Konteks**\n(paragraf 2-3 kalimat...)\n\n**Cara Pakai & Aturan**\n- poin 1\n- poin 2\n- poin 3\n- poin 4\n\n**Variasi Bentuk**\n| Bentuk | Contoh |\n| --- | --- |\n| ... | ... |\n\n**Konteks Pemakaian Nyata**\n(gambaran situasi nyata...)\n\n**Perbandingan dengan Pola Serupa**\n(jika ada kandidat terkait...)\n\n**Kesalahan Umum**\n⚠️ (penjelasan jebakan spesifik dan akibatnya)",
      "grammar_family": "Keluarga tata bahasa",
      "related_grammar": ["slug-terkait-1", "slug-terkait-2"]
    }
  ]
}
`.trim();
}

/**
 * Menghitung rasio kemiripan sederhana antara dua string berbasis karakter unik
 * yang dipakai (Jaccard-like), untuk mendeteksi dua kalimat contoh yang nyaris
 * identik (mis. cuma beda satu kata) tanpa memerlukan library NLP eksternal.
 */
function similarityRatio(a, b) {
  const normalize = (s) =>
    (s || "")
      .replace(/[。、！？「」『』\s]/g, "")
      .split("");
  const setA = new Set(normalize(a));
  const setB = new Set(normalize(b));
  if (setA.size === 0 || setB.size === 0) return 0;
  let intersection = 0;
  for (const ch of setA) if (setB.has(ch)) intersection += 1;
  const union = new Set([...setA, ...setB]).size;
  return intersection / union;
}

function isPureKana(str) {
  if (typeof str !== "string" || !str) return false;
  if (/[A-Za-z]/.test(str)) return false;
  if (/[\u4E00-\u9FFF]/.test(str)) return false;
  return true;
}

function validateEnrichedItem(item, originalItem = null, validSlugs = null) {
  if (!item || typeof item !== "object") return { valid: false, reason: "item bukan objek" };
  if (typeof item.id !== "string" || !item.id) return { valid: false, reason: "id tidak valid" };
  if (typeof item.meaning !== "string" || !item.meaning) return { valid: false, reason: "meaning kosong" };
  if (originalItem?.title && item.meaning.trim().toLowerCase() === originalItem.title.trim().toLowerCase()) {
    return { valid: false, reason: "meaning hanya menyalin title, bukan penjelasan arti" };
  }
  const meaningWordCount = item.meaning.trim().split(/\s+/).filter(Boolean).length;
  if (meaningWordCount < 12) {
    return { valid: false, reason: `meaning terlalu singkat (${meaningWordCount} kata, minimal ~12 kata / 2-3 kalimat penjelasan)` };
  }
  if (typeof item.formation !== "string" || !item.formation) return { valid: false, reason: "formation kosong" };

  if (typeof item.formation_furigana !== "string" || !item.formation_furigana) {
    return { valid: false, reason: "formation_furigana kosong" };
  }
  if (!isPureKana(item.formation_furigana)) {
    return { valid: false, reason: "formation_furigana mengandung huruf alfabet/romaji atau kanji (harus kana murni)" };
  }

  if (typeof item.formation_romaji !== "string" || !item.formation_romaji) {
    return { valid: false, reason: "formation_romaji kosong" };
  }

  if (typeof item.notes !== "string" || !item.notes) return { valid: false, reason: "notes kosong" };
  if (item.notes.trim().length < 500) {
    return { valid: false, reason: `notes terlalu singkat (${item.notes.trim().length} karakter, minimal ~500 karakter untuk penjelasan yang benar-benar mendalam)` };
  }
  const noteSentenceCount = (item.notes.match(/[.!?]/g) || []).length;
  if (noteSentenceCount < 6) {
    return { valid: false, reason: `notes terlalu singkat (${noteSentenceCount} kalimat, minimal 6)` };
  }
  const bulletCount = (item.notes.match(/(^|\n)\s*-\s+/g) || []).length;
  if (bulletCount < 4) {
    return { valid: false, reason: `notes kurang terstruktur (hanya ${bulletCount} daftar poin "- ", minimal 4 di bagian "Cara Pakai & Aturan")` };
  }
  if (!/⚠️/.test(item.notes)) {
    return { valid: false, reason: "notes tidak berisi baris peringatan ⚠️ untuk jebakan kesalahan umum" };
  }

  // Setiap heading wajib harus ada supaya struktur "mendalam" ini benar-benar
  // ditegakkan, bukan cuma disarankan di prompt lalu diabaikan oleh LLM.
  const requiredHeadings = [
    { label: "Fungsi & Konteks", pattern: /\*\*Fungsi\s*&?\s*Konteks\*\*/i },
    { label: "Cara Pakai & Aturan", pattern: /\*\*Cara\s*Pakai\s*&?\s*Aturan\*\*/i },
    { label: "Variasi Bentuk", pattern: /\*\*Variasi\s*Bentuk\*\*/i },
    { label: "Konteks Pemakaian Nyata", pattern: /\*\*Konteks\s*Pemakaian\s*Nyata\*\*/i },
    { label: "Kesalahan Umum", pattern: /\*\*Kesalahan\s*Umum\*\*/i },
  ];
  const missingHeadings = requiredHeadings.filter((h) => !h.pattern.test(item.notes)).map((h) => h.label);
  if (missingHeadings.length > 0) {
    return { valid: false, reason: `notes tidak memuat heading wajib: ${missingHeadings.join(", ")}` };
  }

  // Heading perbandingan hanya wajib jika item ini memang punya kandidat terkait
  // untuk dibandingkan (dikirim lewat related_grammar_candidates saat prompt dibuat).
  const hasCandidates = Array.isArray(originalItem?.related_grammar_candidates) && originalItem.related_grammar_candidates.length > 0;
  if (hasCandidates && !/\*\*Perbandingan\s*(dengan\s*Pola\s*Serupa)?\*\*/i.test(item.notes)) {
    return { valid: false, reason: 'notes tidak memuat heading "Perbandingan dengan Pola Serupa" padahal ada kandidat terkait' };
  }

  if (typeof item.grammar_family !== "string" || !item.grammar_family) return { valid: false, reason: "grammar_family kosong" };
  if (!Array.isArray(item.related_grammar)) return { valid: false, reason: "related_grammar bukan array" };
  if (validSlugs) {
    const dangling = item.related_grammar.filter((s) => typeof s === "string" && !validSlugs.has(s.trim().toLowerCase()));
    if (dangling.length > 0) {
      return { valid: false, reason: `related_grammar berisi slug yang tidak ada di database: ${dangling.join(", ")}` };
    }
    if (item.related_grammar.some((s) => typeof s === "string" && s.trim().toLowerCase() === (originalItem?.slug || "").toLowerCase())) {
      return { valid: false, reason: "related_grammar berisi self-reference ke slug item itu sendiri" };
    }
  }

  if (!Array.isArray(item.examples) || item.examples.length !== 3) {
    return { valid: false, reason: "examples harus berisi tepat 3 item" };
  }
  for (const [idx, ex] of item.examples.entries()) {
    if (typeof ex.japanese !== "string" || !ex.japanese) {
      return { valid: false, reason: `examples[${idx}].japanese kosong` };
    }
    if (/[（）()]|<rt\b|<ruby\b/i.test(ex.japanese)) {
      return { valid: false, reason: `examples[${idx}].japanese mengandung markup furigana/ruby yang dilarang` };
    }
    if (typeof ex.furigana !== "string" || !ex.furigana) {
      return { valid: false, reason: `examples[${idx}].furigana kosong` };
    }
    if (/[\s/]/.test(ex.furigana)) {
      return { valid: false, reason: `examples[${idx}].furigana mengandung spasi atau tanda '/' yang dilarang` };
    }
    if (!isPureKana(ex.furigana)) {
      return { valid: false, reason: `examples[${idx}].furigana mengandung huruf alfabet/romaji atau kanji (harus kana murni)` };
    }
    if (typeof ex.romaji !== "string" || !ex.romaji) {
      return { valid: false, reason: `examples[${idx}].romaji kosong` };
    }
    if (typeof ex.indonesian !== "string" || !ex.indonesian) {
      return { valid: false, reason: `examples[${idx}].indonesian kosong` };
    }
  }

  if (item.examples.length === 3) {
    for (let i = 0; i < item.examples.length; i += 1) {
      for (let j = i + 1; j < item.examples.length; j += 1) {
        const exA = item.examples[i];
        const exB = item.examples[j];
        if (exA.japanese?.trim() === exB.japanese?.trim()) {
          return { valid: false, reason: `examples[${i}] dan examples[${j}] memiliki kalimat japanese yang identik` };
        }
        const ratio = similarityRatio(exA.japanese, exB.japanese);
        if (ratio > 0.75) {
          return { valid: false, reason: `examples[${i}] dan examples[${j}] terlalu mirip (rasio kemiripan ${ratio.toFixed(2)}), harus lebih bervariasi` };
        }
      }
    }
  }

  return { valid: true, reason: null };
}

/**
 * Menghapus slug related_grammar yang tidak dikenal (halusinasi LLM) atau self-reference,
 * dengan mencocokkan ke daftar slug yang benar-benar ada di tabel. Ini adalah safety net —
 * karena prompt sudah mengirim daftar kandidat konkret, seharusnya sudah jarang ketemu
 * kasus ini, tapi tetap dijaga untuk kasus LLM salah ketik/format.
 * Membatasi hasil akhir ke maksimal 2 slug sesuai instruksi prompt.
 */
function sanitizeRelatedGrammar(item, validSlugs, originalItem) {
  if (!Array.isArray(item.related_grammar)) return;

  const kept = [];
  const removed = [];

  for (let slug of item.related_grammar) {
    if (typeof slug !== "string") continue;
    slug = slug.trim().toLowerCase();

    if (validSlugs.has(slug) && slug !== originalItem.slug) {
      kept.push(slug);
      continue;
    }

    let matched = false;
    if (!JLPT_LEVELS.some((lvl) => slug.startsWith(`${lvl.toLowerCase()}-`))) {
      for (const lvl of JLPT_LEVELS) {
        const candidate = `${lvl.toLowerCase()}-${slug}`;
        if (validSlugs.has(candidate) && candidate !== originalItem.slug) {
          kept.push(candidate);
          matched = true;
          break;
        }
      }
    }
    if (matched) continue;

    const cleanGenerated = slug.replace(/[^a-z0-9]/g, "");
    for (const valid of validSlugs) {
      const cleanValid = valid.replace(/[^a-z0-9]/g, "");
      const validWithoutLvl = valid.slice(3).replace(/[^a-z0-9]/g, "");
      if ((cleanValid === cleanGenerated || validWithoutLvl === cleanGenerated) && valid !== originalItem.slug) {
        kept.push(valid);
        matched = true;
        break;
      }
    }

    if (!matched) removed.push(slug);
  }

  if (removed.length > 0) {
    logWarn(`  ⚠️ [Validasi] related_grammar untuk "${originalItem.title}" berisi slug tidak dikenal, dihapus: ${removed.join(", ")}`);
  }

  item.related_grammar = [...new Set(kept)].slice(0, 2);
}

async function main() {
  loadEnvFile();
  const options = parseArgs(process.argv.slice(2));

  initLogger();
  if (logFilePath) logInfo(`📝 [Logger] Detail run ini juga ditulis ke: ${logFilePath}`);

  const stats = {
    totalCandidates: 0,
    processed: 0,
    updated: 0,
    requeuedForQuality: 0,
    validationFailed: 0,
    validationFailReasons: {},
    idMismatch: 0,
    formatErrors: 0,
    batchApiErrors: 0,
    supabaseErrors: 0,
  };

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    logError("❌ [Config] NEXT_PUBLIC_SUPABASE_URL dan SUPABASE_SERVICE_ROLE_KEY wajib ada di .env.local!");
    closeLogger();
    process.exit(1);
  }

  logInfo(`🔌 [Supabase] Menghubungkan ke ${supabaseUrl}...`);
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  const aiClient = await createAiClient();
  logInfo(`🤖 [AI] Model aktif: ${aiClient.provider}`);

  logInfo('🔍 [Database] Mencari data kosong atau belum lolos validasi kualitas pada tabel "grammar"...');

  let dbItems = [];
  let page = 0;
  const pageSize = 1000;
  let hasMore = true;

  try {
    while (hasMore) {
      let query = supabase
        .from("grammar")
        .select("id, slug, title, meaning, formation, formation_furigana, formation_romaji, notes, related_grammar, grammar_family, examples, jlpt_level");
      if (options.level) {
        query = query.eq("jlpt_level", options.level);
      }
      const { data, error } = await query.range(page * pageSize, (page + 1) * pageSize - 1);
      if (error) throw error;
      dbItems = dbItems.concat(data);
      if (data.length < pageSize) {
        hasMore = false;
      } else {
        page++;
      }
    }
  } catch (error) {
    logError(`❌ [Supabase] Gagal membaca tabel: ${error.message}`);
    closeLogger();
    process.exit(1);
  }

  const validSlugs = new Set(dbItems.map((item) => item.slug).filter(Boolean));
  const existingFamilies = getExistingFamilies(dbItems);

  const filteredItems = options.force
    ? dbItems
    : dbItems.filter((item) => {
        const hasExamples = Array.isArray(item.examples) && item.examples.length >= 3;
        const hasMissingField = !item.meaning || !item.formation || !item.formation_furigana || !item.formation_romaji || !item.notes || !item.grammar_family || !hasExamples;
        if (hasMissingField) return true;

        // Kolom sudah terisi semua, tapi belum tentu lolos standar kualitas terbaru
        // (mis. data lama dari sebelum validasi diperketat). Row seperti ini tetap
        // dimasukkan ke antrian reproses TANPA perlu --force, karena --force sudah
        // punya arti sendiri: paksa proses ulang SEMUA row termasuk yang sudah bagus.
        const { valid, reason } = validateEnrichedItem(item, item, validSlugs);
        if (!valid) {
          stats.requeuedForQuality += 1;
          logInfo(`  🔁 [Kualitas] "${item.title}" sudah terisi tapi belum lolos standar baru (${reason}) -> masuk antrian reproses.`);
          return true;
        }
        return false;
      });

  stats.totalCandidates = filteredItems.length;

  const itemsToProcess = filteredItems.slice(0, options.limit);

  if (itemsToProcess.length === 0) {
    logInfo("✅ [Database] Semua baris pada target sudah lengkap dan lolos validasi kualitas. Tidak ada data yang perlu diperkaya.");
    printSummary(stats);
    closeLogger();
    process.exit(0);
  }

  stats.processed = itemsToProcess.length;
  logInfo(`📈 [Database] Menemukan ${filteredItems.length} baris data yang siap diperkaya. Memproses ${itemsToProcess.length} baris sesuai limit.`);

  for (let i = 0; i < itemsToProcess.length; i += options.batchSize) {
    const batch = itemsToProcess.slice(i, i + options.batchSize);
    const batchIndex = Math.floor(i / options.batchSize) + 1;
    const totalBatches = Math.ceil(itemsToProcess.length / options.batchSize);

    logInfo(`\n📦 [Proses] Memproses batch ${batchIndex}/${totalBatches}...`);

    const promptItems = batch.map((item) => ({
      id: item.id,
      title: item.title,
      jlpt_level: item.jlpt_level,
      related_grammar_candidates: getRelatedCandidates(item, dbItems),
    }));
    const prompt = buildPrompt(promptItems, existingFamilies);

    // Retry dengan backoff untuk kegagalan transient (network/timeout/rate-limit)
    // sebelum benar-benar menyerah pada batch ini.
    let responseText = null;
    let lastError = null;
    const maxAttempts = 2;
    for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
      try {
        responseText = await aiClient.generateText(prompt);
        lastError = null;
        break;
      } catch (err) {
        lastError = err;
        logWarn(`⚠️ [Retry] Percobaan ${attempt}/${maxAttempts} untuk batch ${batchIndex} gagal: ${err.message || err}`);
        if (attempt < maxAttempts) await sleep(2000 * attempt);
      }
    }

    if (lastError) {
      stats.batchApiErrors += 1;
      logError(`❌ [Error] Batch ${batchIndex} gagal setelah ${maxAttempts} percobaan: ${lastError.message || lastError}`);
      if (batchIndex < totalBatches) await sleep(1500);
      continue;
    }

    try {
      // Buang code fence markdown (```json ... ```) jika model membalas dengan itu,
      // baru cari batas objek JSON terluar.
      const withoutFences = responseText.replace(/```(?:json)?/gi, "");
      const jsonStart = withoutFences.indexOf("{");
      const jsonEnd = withoutFences.lastIndexOf("}");
      if (jsonStart === -1 || jsonEnd === -1) {
        throw new Error("Tidak menemukan block JSON.");
      }
      const cleanJson = withoutFences.substring(jsonStart, jsonEnd + 1);
      const parsed = JSON.parse(cleanJson);

      if (!Array.isArray(parsed.results)) {
        stats.formatErrors += 1;
        logError("⚠️ [Format] Hasil kembalian LLM tidak valid (bukan array 'results').");
        continue;
      }

      for (const enriched of parsed.results) {
        const original = batch.find((b) => b.id === enriched.id);
        if (!original) {
          stats.idMismatch += 1;
          logWarn(`⚠️ [Validasi] ID "${enriched.id}" dari LLM tidak cocok dengan item manapun di batch ini. Dilewati.`);
          continue;
        }
        const titleLabel = original.title;

        sanitizeRelatedGrammar(enriched, validSlugs, original);

        const { valid, reason } = validateEnrichedItem(enriched, original, validSlugs);
        if (!valid) {
          stats.validationFailed += 1;
          stats.validationFailReasons[reason] = (stats.validationFailReasons[reason] || 0) + 1;
          logWarn(`⚠️ [Validasi] Item dengan ID "${enriched.id}" gagal validasi (${reason}). Dilewati.`);
          continue;
        }

        // Item ini masuk ke itemsToProcess karena salah satu dari: (a) --force, (b) ada
        // kolom yang masih kosong, atau (c) data lama gagal validasi kualitas terbaru.
        // Di ketiga kasus itu kita memang MAU menimpa dengan hasil enrich yang baru,
        // jadi tidak perlu lagi cek per-kolom "apakah sudah terisi sebelumnya".
        const updatePayload = {
          meaning: enriched.meaning,
          formation: enriched.formation,
          formation_furigana: enriched.formation_furigana,
          formation_romaji: enriched.formation_romaji,
          examples: enriched.examples,
          notes: enriched.notes,
          grammar_family: enriched.grammar_family,
          related_grammar: enriched.related_grammar,
        };

        logInfo(`  ✨ [Update] ID: "${enriched.id}" (${titleLabel}) -> memperbarui kolom: ${Object.keys(updatePayload).join(", ")}`);

        const { error: updateError } = await supabase.from("grammar").update(updatePayload).eq("id", enriched.id);

        if (updateError) {
          stats.supabaseErrors += 1;
          logError(`  ❌ [Supabase] Gagal menyimpan ID "${enriched.id}": ${updateError.message}`);
        } else {
          stats.updated += 1;
        }
      }
    } catch (err) {
      logError(`❌ [Error] Gagal memproses hasil batch ${batchIndex}: ${err.message || err}`);
    }

    if (batchIndex < totalBatches) {
      await sleep(1500);
    }
  }

  logInfo("\n🎉 [Sukses] Pengayaan database tata bahasa selesai!");
  printSummary(stats);
  closeLogger();
  process.exit(0);
}

/**
 * Cetak ringkasan statistik run: berapa yang berhasil, berapa yang gagal validasi
 * (beserta breakdown alasannya), dan error lain — supaya sekali lihat langsung
 * kelihatan kesehatan keseluruhan run tanpa perlu scroll ke atas.
 */
function printSummary(stats) {
  const lines = [
    "",
    "======================= RINGKASAN RUN =======================",
    `Kandidat ditemukan (kosong/gagal kualitas) : ${stats.totalCandidates}`,
    `  - termasuk yang diminta reproses krn kualitas : ${stats.requeuedForQuality}`,
    `Diproses pada run ini (sesuai --limit)         : ${stats.processed}`,
    `Berhasil diupdate ke database                  : ${stats.updated}`,
    `Gagal validasi hasil LLM (dilewati)             : ${stats.validationFailed}`,
  ];

  const reasonEntries = Object.entries(stats.validationFailReasons).sort((a, b) => b[1] - a[1]);
  if (reasonEntries.length > 0) {
    lines.push("  Breakdown alasan gagal validasi:");
    for (const [reason, count] of reasonEntries) {
      lines.push(`    - (${count}x) ${reason}`);
    }
  }

  lines.push(
    `ID hasil LLM tidak cocok batch                  : ${stats.idMismatch}`,
    `Batch gagal format JSON                         : ${stats.formatErrors}`,
    `Batch gagal panggilan API (setelah retry)       : ${stats.batchApiErrors}`,
    `Gagal simpan ke Supabase                        : ${stats.supabaseErrors}`,
    "==============================================================="
  );

  if (logFilePath) lines.push(`Log lengkap run ini tersimpan di: ${logFilePath}`);

  logInfo(lines.join("\n"));
}

main();
