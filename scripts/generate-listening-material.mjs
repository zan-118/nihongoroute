#!/usr/bin/env node

/**
 * @file generate-listening-material.mjs
 * @description Script utilitas produksi untuk membuat (generate) dokumen `listeningMaterial` 
 * baru dari awal langsung ke Sanity CMS menggunakan AI (9router dengan fallback Gemini).
 * 
 * Melakukan transformasi struktur dari model AI menjadi Portable/Sanity Object dengan _type dan _key.
 * 
 * Penggunaan:
 *   node scripts/generate-listening-material.mjs --level N5 --topic "Belanja"
 */

import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { createClient } from "@sanity/client";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function printUsage() {
  console.log(
    [
      "=== NIHONGOROUTE LISTENING MATERIAL GENERATOR (SANITY) ===",
      "Penggunaan:",
      "  node scripts/generate-listening-material.mjs [options]",
      "",
      "Opsi:",
      "  --level <N5|N4|N3|N2|N1> Target level JLPT. Default: N5",
      "  --topic <string>          Tema/Topik dialog. Default: Kehidupan Sehari-hari",
      "  --help, -h                Tampilkan bantuan ini.",
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
    level: "N5",
    topic: "Kehidupan Sehari-hari",
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
      }
      index += 1;
      continue;
    }

    if (arg === "--topic") {
      options.topic = args[index + 1];
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
    throw new Error(
      "AI_BASE_URL/AI_API_KEY atau GEMINI_API_KEY wajib didefinisikan."
    );
  }

  let openAiClient = null;
  if (hasOpenAi) {
    const fetchFn = globalThis.fetch ?? (await import("node-fetch")).default;
    openAiClient = {
      async generateText(prompt) {
        const response = await fetchFn(
          `${openAiBaseUrl}/chat/completions`,
          {
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
          }
        );

        if (!response.ok) {
          const errText = await response.text();
          throw new Error(
            `OpenAI-compatible API error: ${response.status} - ${errText}`
          );
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
    let genAI = new GoogleGenerativeAI(geminiKeys[currentKeyIndex]);
    let model = genAI.getGenerativeModel({
      model: process.env.GEMINI_MODEL || "gemini-3-flash",
      generationConfig: { responseMimeType: "application/json" },
    });

    geminiClient = {
      async generateText(prompt) {
        for (let attempt = 0; attempt < geminiKeys.length; attempt += 1) {
          try {
            const result = await model.generateContent(prompt);
            return result.response.text();
          } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            const quotaLike =
              message.includes("429") ||
              message.toLowerCase().includes("quota") ||
              message.toLowerCase().includes("limit");
            if (!quotaLike || geminiKeys.length <= 1) throw error;

            currentKeyIndex = (currentKeyIndex + 1) % geminiKeys.length;
            genAI = new GoogleGenerativeAI(geminiKeys[currentKeyIndex]);
            model = genAI.getGenerativeModel({
              model: process.env.GEMINI_MODEL || "gemini-3-flash",
              generationConfig: { responseMimeType: "application/json" },
            });
          }
        }
        throw new Error("Gemini key rotation exhausted.");
      },
    };
  }

  return {
    provider: openAiClient
      ? `OpenAI-compatible ${process.env.AI_MODEL ?? "ag/gemini-3-flash"} (dengan fallback Gemini)`
      : `Gemini ${process.env.GEMINI_MODEL || "gemini-3-flash"}`,
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

function buildPrompt(level, topic) {
  return `
Anda adalah ahli materi audio bahasa Jepang (Native Japanese Speaker) yang mahir merancang ujian menyimak (Choukai) untuk pembelajar tingkat JLPT ${level}.
Tugas Anda adalah memproduksi satu materi menyimak terstruktur dengan topik: "${topic}".

PANDUAN DAFTAR TOKOH RESMI (OFFICIAL CAST SHEET):
Dalam menyusun dialog (body), Anda WAJIB HANYA menggunakan tokoh-tokoh resmi dari daftar berikut untuk menjamin kecocokan suara sintesis (TTS) dan stiker karakter:
1. Ayu (Remaja perempuan Jepang, rambut hitam kuncir dua, baju pelaut seifuku biru tua, ramah).
2. Lara (Remaja perempuan Indonesia, berhijab abu-abu muda, rok panjang, riang ceria).
3. Dito (Remaja laki-laki Indonesia, kulit sawo matang, rambut hitam bergelombang pendek, pembelajar aktif).
4. Takahashi (Pemuda/pekerja kantoran Jepang, rambut cokelat rapi, blazer hitam, sopan).
5. Zundamon (Maskot cilik fantasi kelas, telinga daun hijau, tubuh putih berbulu imut, pembawa trivia kebudayaan).
6. Indah / Budi (Guru/Narator utama wanita/pria).
7. Tanaka / Hayashi / Yamada (Tokoh pendukung paruh baya/lansia).
DILARANG membuat nama tokoh baru di luar daftar di atas.

Pedoman Penting Konten:
1. **Percakapan Natural & Sopan Santun (Keigo/Casual)**: Teks dialog ('body') harus menggambarkan percakapan nyata di Jepang dengan tingkat kesopanan yang sesuai level ${level} (misalnya: N5 menggunakan polite form desu/masu, N3-N2 mulai menyertakan percakapan santai atau ragam hormat ringan). Format wajib: 'Nama Pembicara: Dialog'.
2. **Kesesuaian Kosakata**: Gunakan kosakata yang sering diujikan pada porsi Choukai JLPT ${level} (misal: penyebutan arah, angka/waktu, atau lokasi).
3. **Terjemahan Alami**: Field 'translation' harus memuat terjemahan naskah lengkap ke Bahasa Indonesia secara santun dan luwes.
4. **Desain Evaluasi Menyimak (Quizzes)**:
   - Buat minimal 3 soal kuis pilihan ganda yang menguji detail penting percakapan (misalnya: 'Apa yang akhirnya dibeli oleh sang wanita?', 'Kapan mereka akan bertemu?').
   - Pengecoh (distractors) harus dirancang dari informasi yang didengar namun tidak tepat untuk menjawab pertanyaan (misal: menyebutkan harga barang lain yang didengar pembicara).
   - Penjelasan ('explanation') harus membeberkan kronologi percakapan dalam Bahasa Indonesia hingga menyimpulkan pilihan jawaban yang tepat.
5. **Ilustrasi Pendukung (illustrations)**:
   - Sediakan array 'illustrations' berisi minimal 1 dan maksimal 2 objek ilustrasi pendukung. Masing-masing objek harus memuat:
     - 'title': Caption singkat gambar dalam Bahasa Indonesia (maksimal 10 kata).
     - 'prompt': Prompt detail dalam Bahasa Inggris untuk digenerate oleh AI, wajib diawali dengan/menyertakan: "2D digital anime style illustration, clean line art, soft colors, high resolution, NihongoRoute educational theme: [deskripsi adegan]".
     - 'size': Ukuran visual pilihan (pilih: "1024x1024" untuk square, "1024x768" untuk landscape, atau "768x1024" untuk portrait).

Format output WAJIB berupa JSON murni tanpa markdown wrapper:
{
  "title": "Judul Dialog Jepang (Terjemahan Judul Bahasa Indonesia)",
  "slug": "slug-judul-dialog-romaji-atau-inggris",
  "difficulty": "Mudah / Sedang / Sulit",
  "estimated_minutes": 5,
  "body": "Takahashi: すみません、この靴はいくらですか。\nTenin: それは五千円です。",
  "translation": "Takahashi: Permisi, sepatu ini harganya berapa?\nTenin: Itu harganya 5000 yen.",
  "illustrations": [
    {
      "title": "Takahashi menanyakan harga sepatu kepada penjaga toko",
      "prompt": "2D digital anime style illustration, clean line art, soft colors, high resolution, NihongoRoute educational theme: Takahashi asking shopkeeper about shoes price in a modern clean Japanese store",
      "size": "1024x768"
    }
  ],
  "quizzes": [
    {
      "id": "q-1",
      "question": "Pertanyaan dalam bahasa Jepang mengenai detail isi dialog.",
      "options": ["Pilihan A (Bahasa Jepang)", "Pilihan B (Bahasa Jepang)", "Pilihan C (Bahasa Jepang)", "Pilihan D (Bahasa Jepang)"],
      "correct_answer": "Pilihan A (Tulis persis teks jawaban yang benar)",
      "explanation": "Penjelasan detail mengapa Pilihan A benar dan kesalahan opsi lainnya dalam bahasa Indonesia.",
      "type": "multiple-choice"
    }
  ]
}
`.trim();
}

async function main() {
  loadEnvFile();

  const options = parseArgs(process.argv.slice(2));

  const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "qoczxvvo";
  const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
  const token = process.env.SANITY_API_WRITE_TOKEN;

  if (!token) {
    console.error("❌ [Config] SANITY_API_WRITE_TOKEN wajib didefinisikan untuk menulis data ke Sanity!");
    process.exit(1);
  }

  const sanity = createClient({
    projectId,
    dataset,
    apiVersion: "2026-05-17",
    token,
    useCdn: false,
  });

  const aiClient = await createAiClient();
  console.log(`🤖 [AI] Model aktif: ${aiClient.provider}`);

  console.log(`📈 [Proses] Menghasilkan materi menyimak JLPT ${options.level} dengan topik "${options.topic}"...`);

  const prompt = buildPrompt(options.level, options.topic);

  let generated = null;
  try {
    const responseText = await aiClient.generateText(prompt);
    const cleanJson = responseText.trim().replace(/^```json|```$/g, "").trim();
    generated = JSON.parse(cleanJson);
  } catch (err) {
    console.error("❌ Gagal menghasilkan data dari AI:", err.message);
    process.exit(1);
  }

  if (!generated || !generated.title || !generated.body) {
    console.error("❌ Data hasil generate AI tidak lengkap.");
    process.exit(1);
  }

  const ninerouterUrl = process.env.NINEROUTER_URL;
  const ninerouterKey = process.env.NINEROUTER_KEY;
  const imgBaseUrl = ninerouterUrl ? (ninerouterUrl.endsWith("/v1") ? ninerouterUrl : `${ninerouterUrl}/v1`) : process.env.AI_BASE_URL;
  const imgApiKey = ninerouterKey ?? process.env.AI_API_KEY;

  // 🎨 Menggenerasi ilustrasi
  const transformedIllustrations = [];
  let legacyImageUrl = "";

  if (imgBaseUrl && Array.isArray(generated.illustrations)) {
    for (let idx = 0; idx < generated.illustrations.length; idx += 1) {
      const ill = generated.illustrations[idx];
      if (ill.prompt) {
        console.log(`🎨 [AI Image] Menggenerasi ilustrasi ${idx + 1}/${generated.illustrations.length}: "${ill.title}"...`);
        try {
          const response = await fetch(`${imgBaseUrl}/images/generations?response_format=binary`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              ...(imgApiKey ? { Authorization: `Bearer ${imgApiKey}` } : {}),
            },
            body: JSON.stringify({
              model: process.env.AI_IMAGE_MODEL || "gemini/gemini-3-pro-image-preview",
              prompt: ill.prompt,
              size: ill.size || "1024x1024"
            })
          });

          if (!response.ok) {
            throw new Error(`Status: ${response.status}`);
          }

          const buffer = Buffer.from(await response.arrayBuffer());
          const asset = await sanity.assets.upload("image", buffer, {
            filename: `${generated.slug || "listening"}-img-${idx}.png`
          });
          console.log(`✓ [AI Image] Gambar ${idx + 1} berhasil diunggah ke Sanity: ${asset.url}`);
          
          transformedIllustrations.push({
            _type: "illustrationItem",
            _key: `ill-${Date.now()}-${idx}`,
            title: ill.title || "",
            content: asset.url
          });

          if (idx === 0) {
            legacyImageUrl = asset.url;
          }
        } catch (err) {
          console.warn(`⚠️ [AI Image] Gagal menggenerasi gambar materi menyimak: ${err.message}`);
        }
      }
    }
  }

  console.log(`💾 Mengunggah dokumen baru ke Sanity CMS...`);
  try {
    const transformedQuizzes = (generated.quizzes || []).map((q, qIdx) => ({
      _type: "listeningQuiz",
      _key: `quiz-${Date.now()}-${qIdx}`,
      id: q.id || `q-${qIdx}`,
      question: q.question,
      options: q.options,
      correct_answer: q.correct_answer,
      explanation: q.explanation || "",
      type: q.type || "multiple-choice"
    }));

    const doc = {
      _type: "listeningMaterial",
      title: generated.title,
      slug: { _type: "slug", current: generated.slug },
      jlpt_level: options.level,
      difficulty: generated.difficulty,
      estimated_minutes: generated.estimated_minutes || 5,
      body: generated.body,
      translation: generated.translation,
      quizzes: transformedQuizzes,
      ...(legacyImageUrl ? { image_url: legacyImageUrl } : {}),
      illustrations: transformedIllustrations
    };

    const result = await sanity.create(doc);
    console.log(`🎉 [Sukses] Dokumen berhasil dibuat di Sanity! ID: ${result._id}`);
  } catch (err) {
    console.error("❌ Gagal membuat dokumen di Sanity:", err.message);
    process.exit(1);
  }
}

main();
