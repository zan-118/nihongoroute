#!/usr/bin/env node

/**
 * @file generate-lessons.mjs
 * @description Script utilitas produksi untuk membuat (generate) dokumen `lesson` 
 * baru dari awal langsung ke Sanity CMS menggunakan AI (9router dengan fallback Gemini).
 * 
 * Melakukan transformasi struktur dari model AI menjadi Portable Text standard Sanity
 * dengan proper _type dan _key untuk mencegah schema mismatch.
 * 
 * Penggunaan:
 *   node scripts/generate-lessons.mjs --title "Perkenalan Diri (Jikoshoukai)" --category-id "cat-123"
 */

import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { createClient } from "@sanity/client";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function printUsage() {
  console.log(
    [
      "=== NIHONGOROUTE LESSON GENERATOR (SANITY) ===",
      "Penggunaan:",
      "  node scripts/generate-lessons.mjs [options]",
      "",
      "Opsi:",
      "  --title <string>       Judul pelajaran baru. Wajib ada.",
      "  --category-id <string> ID Kategori kursus di Supabase. Wajib ada.",
      "  --order <number>       Urutan pelajaran (Order Number). Default: 1",
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
    title: null,
    categoryId: null,
    order: 1,
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

    if (arg === "--category-id") {
      options.categoryId = args[index + 1];
      index += 1;
      continue;
    }

    if (arg === "--order") {
      options.order = Number.parseInt(args[index + 1], 10);
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
}function buildPrompt(title) {
  return `
Anda adalah ahli kurikulum bahasa Jepang tingkat tinggi (Native Japanese Educator) yang berspesialisasi dalam merancang materi untuk pembelajar asal Indonesia.
Tugas Anda adalah menyusun satu modul pelajaran (lesson) Bahasa Jepang terstruktur lengkap dengan judul: "${title}".

PANDUAN DAFTAR TOKOH RESMI (OFFICIAL CAST SHEET):
Dalam menyusun dialog (dialogue) atau deskripsi gambar (image), Anda WAJIB HANYA menggunakan tokoh-tokoh resmi dari daftar berikut untuk menjamin kecocokan suara sintesis (TTS) dan stiker karakter:
1. Ayu (Remaja perempuan Jepang, rambut hitam kuncir dua, baju pelaut seifuku biru tua, ramah).
2. Lara (Remaja perempuan Indonesia, berhijab abu-abu muda, rok panjang, riang ceria).
3. Dito (Remaja laki-laki Indonesia, kulit sawo matang, rambut hitam bergelombang pendek, pembelajar aktif).
4. Takahashi (Pemuda/pekerja kantoran Jepang, rambut cokelat rapi, blazer hitam, sopan).
5. Zundamon (Maskot cilik fantasi kelas, telinga daun hijau, tubuh putih berbulu imut, pembawa trivia kebudayaan).
6. Indah / Budi (Guru/Narator utama wanita/pria).
7. Tanaka / Hayashi / Yamada (Tokoh pendukung paruh baya/lansia).
DILARANG membuat nama tokoh baru di luar daftar di atas (seperti "Ken", "Rara", "Budi-san", dll.).

Pedoman Pedagogi Wajib:
1. **Kesesuaian Level**: Sesuaikan tingkat kesulitan kosakata, kanji, dan tata bahasa dengan topik pelajaran. Jika topik adalah dasar (pemula), batasi penggunaan kanji rumit tanpa kana pendukung.
2. **Struktur Aliran Konten (content_blocks)**:
   - Buat minimal 4 blok konten yang mengalir logis.
   - Gunakan tipe "text" untuk penjelasan teori tata bahasa (sertakan sub-judul pada field 'title' jika memulai topik baru).
   - Gunakan tipe "dialogue" untuk menunjukkan percakapan praktis sehari-hari (format 'Nama: Ucapan').
   - Gunakan tipe "grammar" untuk mendeskripsikan formula formal pola kalimat Jepang (sertakan 'examples' minimal 2 kalimat contoh).
   - Gunakan tipe "callout" untuk memberikan peringatan kesalahan umum (pitfalls) atau catatan kebudayaan menarik.
   - Gunakan tipe "image" untuk menyertakan gambar/ilustrasi pendukung materi pelajaran. Anda wajib menyertakan minimal 1 dan maksimal 3 blok gambar sepanjang materi pelajaran. Isi bidang 'title' dengan caption gambar singkat dalam Bahasa Indonesia (maksimal 10 kata), bidang 'content' dengan prompt detail dalam Bahasa Inggris untuk digenerate oleh AI, dan bidang 'size' untuk ukuran yang diinginkan (pilih: "1024x1024" untuk square, "1024x768" untuk landscape, atau "768x1024" untuk portrait). Semua prompt gambar wajib diawali dengan atau menyertakan arahan gaya visual yang konsisten: "2D digital anime style illustration, clean line art, soft colors, high resolution, NihongoRoute educational theme: [deskripsi adegan]".
3. **Kualitas Soal Kuis (quizzes)**:
   - Hasilkan minimal 3 soal evaluasi pilihan ganda.
   - Pilihan salah (distractors) wajib masuk akal dan menguji pemahaman gramatikal nyata (misal: konjugasi kata kerja, penyusunan partikel), bukan sekadar kata acak.
   - Penjelasan ('explanation') harus memuat ulasan taktis mengapa jawaban tersebut benar dan di mana letak kesalahan opsi lainnya dalam Bahasa Indonesia.

Format output WAJIB berupa JSON murni tanpa markdown wrapper:
{
  "slug": "slug-pelajaran-romaji-atau-inggris",
  "summary": "Ringkasan ringkas pelajaran dalam bahasa Indonesia (2-3 kalimat).",
  "content_blocks": [
    {
      "type": "text",
      "title": "Judul Seksi (atau null jika melanjutkan seksi sebelumnya)",
      "content": "Isi teks penjelasan materi menggunakan Bahasa Indonesia. Gunakan **teks tebal** untuk menekankan pola kalimat."
    },
    {
      "type": "image",
      "title": "Ayu dan Takahashi saling menyapa di kelas",
      "content": "2D digital anime style illustration, clean line art, soft colors, high resolution, NihongoRoute educational theme: Ayu politely bowing and greeting Takahashi in a bright Japanese classroom",
      "size": "1024x768"
    },
    {
      "type": "dialogue",
      "title": "Judul Dialog Praktis",
      "content": "Takahashi: 初めまして、高橋です。どうぞよろしく。\nAyu: 初めまして、アユです。こちらこそよろしく。",
      "translation": "Takahashi: Perkenalkan, saya Takahashi. Senang bertemu dengan Anda.\nAyu: Perkenalkan, saya Ayu. Sama-sama senang bertemu dengan Anda.",
      "furigana": "Takahashi: はじめまして、たかはしです。どうぞよろしく。\nAyu: はじめまして、アユです。こちらこそよろしく。"
    },
    {
      "type": "grammar",
      "title": "Pola Kalimat: 〜ほうがいい",
      "content": "Kata Kerja (Bentuk Lampau -Ta) + ほうがいいです",
      "translation": "Sebaiknya... (digunakan untuk memberikan saran/rekomendasi)",
      "examples": [
        {
          "jp": "風邪をひいたときは, 早く寝たほうがいいですよ。",
          "id": "Saat sedang flu, sebaiknya tidur lebih cepat lho.",
          "romaji": "Kaze o hiita toki wa, hayaku neta hou ga ii desu yo.",
          "furigana": "かぜをひいたときは、はやくねたほうがいいですよ。"
        }
      ]
    },
    {
      "type": "callout",
      "title": "Perbedaan Nuansa & Pitfalls",
      "content": "Pola '〜ほうがいい' mengandung nuansa saran yang cukup kuat dan mendesak. Jika ingin menyarankan sesuatu secara lebih sopan kepada atasan, lebih baik gunakan '〜たらどうですか' (Bagaimana kalau...)."
    }
  ],
  "quizzes": [
    {
      "id": "quiz-1",
      "question": "Pertanyaan evaluasi pilihan ganda",
      "options": ["Pilihan A", "Pilihan B", "Pilihan C"],
      "correct_answer": "Pilihan A",
      "explanation": "Penjelasan detail mengapa pilihan tersebut benar",
      "type": "multiple-choice"
    }
  ]
}
`.trim();
}

function transformContentBlocks(blocks) {
  return blocks.map((block, idx) => {
    const key = `block-${Date.now()}-${idx}`;
    if (block.type === "text") {
      return {
        _type: "block",
        _key: key,
        style: block.title ? "h2" : "normal",
        children: [
          {
            _type: "span",
            _key: `span-${key}`,
            text: block.content || "",
            marks: []
          }
        ],
        markDefs: []
      };
    }

    if (block.type === "image" || block.type === "imageBlock") {
      return {
        _type: "imageBlock",
        _key: key,
        title: block.title || "",
        content: block.content || ""
      };
    }

    if (block.type === "dialogue") {
      return {
        _type: "dialogueBlock",
        _key: key,
        title: block.title || "",
        content: block.content || "",
        translation: block.translation || "",
        furigana: block.furigana || ""
      };
    }

    if (block.type === "grammar") {
      return {
        _type: "grammarBlock",
        _key: key,
        title: block.title || "",
        content: block.content || "",
        translation: block.translation || "",
        examples: (block.examples || []).map((ex, exIdx) => ({
          _type: "exampleSentence",
          _key: `ex-${key}-${exIdx}`,
          jp: ex.jp || "",
          id: ex.id || "",
          romaji: ex.romaji || "",
          furigana: ex.furigana || ""
        }))
      };
    }

    if (block.type === "callout") {
      return {
        _type: "calloutBlock",
        _key: key,
        title: block.title || "",
        content: block.content || "",
        translation: block.translation || ""
      };
    }

    // Default fallback
    return {
      _type: "block",
      _key: key,
      style: "normal",
      children: [{ _type: "span", _key: `span-${key}`, text: String(block.content || ""), marks: [] }]
    };
  });
}

async function main() {
  loadEnvFile();

  const options = parseArgs(process.argv.slice(2));

  if (!options.title || !options.categoryId) {
    console.error("❌ Parameter --title dan --category-id wajib disertakan.");
    printUsage();
    process.exit(1);
  }

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

  console.log(`📈 [Proses] Menghasilkan konten pelajaran "${options.title}"...`);

  const prompt = buildPrompt(options.title);

  let generated = null;
  try {
    const responseText = await aiClient.generateText(prompt);
    const cleanJson = responseText.trim().replace(/^```json|```$/g, "").trim();
    generated = JSON.parse(cleanJson);
  } catch (err) {
    console.error("❌ Gagal menghasilkan data dari AI:", err.message);
    process.exit(1);
  }

  if (!generated || !generated.summary || !Array.isArray(generated.content_blocks)) {
    console.error("❌ Data hasil generate AI tidak lengkap.");
    process.exit(1);
  }

  // 🎨 Menggenerasi ilustrasi jika ada blok bertipe image
  const ninerouterUrl = process.env.NINEROUTER_URL;
  const ninerouterKey = process.env.NINEROUTER_KEY;
  const imgBaseUrl = ninerouterUrl ? (ninerouterUrl.endsWith("/v1") ? ninerouterUrl : `${ninerouterUrl}/v1`) : process.env.AI_BASE_URL;
  const imgApiKey = ninerouterKey ?? process.env.AI_API_KEY;

  if (imgBaseUrl) {
    for (let idx = 0; idx < generated.content_blocks.length; idx += 1) {
      const block = generated.content_blocks[idx];
      if (block.type === "image" && block.content) {
        console.log(`🎨 [AI Image] Menggenerasi ilustrasi untuk: "${block.title || 'Gambar Pelajaran'}"...`);
        try {
          const response = await fetch(`${imgBaseUrl}/images/generations?response_format=binary`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              ...(imgApiKey ? { Authorization: `Bearer ${imgApiKey}` } : {}),
            },
            body: JSON.stringify({
              model: process.env.AI_IMAGE_MODEL || "gemini/gemini-3-pro-image-preview",
              prompt: block.content,
              size: block.size || "1024x1024"
            })
          });

          if (!response.ok) {
            throw new Error(`Status: ${response.status}`);
          }

          const buffer = Buffer.from(await response.arrayBuffer());
          const asset = await sanity.assets.upload("image", buffer, {
            filename: `${generated.slug || "lesson"}-img-${idx}.png`
          });
          console.log(`✓ [AI Image] Gambar berhasil diunggah ke Sanity: ${asset.url}`);
          block.content = asset.url;
        } catch (err) {
          console.warn(`⚠️ [AI Image] Gagal menggenerasi gambar: ${err.message}. Menggunakan gambar fallback.`);
          block.content = "https://images.unsplash.com/photo-1528459801416-a9e53bbf4e17?auto=format&fit=crop&w=800&q=80";
        }
      }
    }
  }

  console.log(`💾 Mengunggah dokumen lesson baru ke Sanity CMS...`);
  try {
    const transformedBlocks = transformContentBlocks(generated.content_blocks);
    const transformedQuizzes = (generated.quizzes || []).map((q, qIdx) => ({
      _type: "lessonQuiz",
      _key: `quiz-${Date.now()}-${qIdx}`,
      id: q.id || `q-${qIdx}`,
      question: q.question,
      options: q.options,
      correct_answer: q.correct_answer,
      explanation: q.explanation || "",
      type: q.type || "multiple-choice"
    }));

    const doc = {
      _type: "lesson",
      title: options.title,
      slug: { _type: "slug", current: generated.slug || options.title.toLowerCase().replace(/[^a-z0-9]+/g, "-") },
      category_id: options.categoryId,
      order_number: options.order,
      summary: generated.summary,
      estimated_minutes: 10,
      is_premium: false,
      is_published: false,
      content_blocks: transformedBlocks,
      quizzes: transformedQuizzes,
    };

    const result = await sanity.create(doc);
    console.log(`🎉 [Sukses] Pelajaran berhasil dibuat di Sanity! ID: ${result._id}`);
  } catch (err) {
    console.error("❌ Gagal membuat pelajaran di Sanity:", err.message);
    process.exit(1);
  }
}

main();
