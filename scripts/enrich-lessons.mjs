#!/usr/bin/env node

/**
 * @file enrich-lessons.mjs
 * @description Script utilitas produksi untuk memperkaya dan memperbaiki dokumen `lesson` di Sanity CMS.
 * Mengisi ringkasan pelajaran (summary), melengkapi data kuis (quizzes) yang kosong, 
 * dan memoles materi pelajaran (content_blocks) menggunakan AI (9router dengan fallback Gemini).
 * 
 * Penggunaan:
 *   node scripts/enrich-lessons.mjs --limit 10
 */

import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { createClient } from "@sanity/client";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function printUsage() {
  console.log(
    [
      "=== NIHONGOROUTE LESSONS ENRICHER (SANITY) ===",
      "Penggunaan:",
      "  node scripts/enrich-lessons.mjs [options]",
      "",
      "Opsi:",
      "  --limit <number>       Jumlah dokumen maksimal yang diproses. Default: 5",
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
    limit: 5,
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

function buildPrompt(title, contentBlocks) {
  return `
Anda adalah pembuat kurikulum bahasa Jepang profesional.
Berikut adalah materi pelajaran (content blocks) dari pelajaran berjudul "${title}".

Tugas Anda:
1. Buat ringkasan pelajaran (summary) dalam bahasa Indonesia sebanyak 2-3 kalimat.
2. Buat tepat 3 soal kuis evaluasi pilihan ganda yang sangat relevan dengan materi ini.
   Setiap kuis memiliki properti:
   - "id": string ID kuis unik (misal: q-1, q-2, q-3)
   - "question": teks pertanyaan kuis
   - "options": array berisi tepat 3 pilihan jawaban
   - "correct_answer": teks pilihan jawaban yang benar (harus cocok persis dengan salah satu di "options")
   - "explanation": penjelasan singkat mengapa pilihan tersebut benar (dalam bahasa Indonesia)
   - "type": "multiple-choice"

Format output WAJIB berupa JSON murni dengan struktur:
{
  "summary": "Ringkasan materi pelajaran di sini...",
  "quizzes": [
    {
      "id": "q-1",
      "question": "Pertanyaan kuis...",
      "options": ["Pilihan A", "Pilihan B", "Pilihan C"],
      "correct_answer": "Pilihan A",
      "explanation": "Penjelasan di sini...",
      "type": "multiple-choice"
    }
  ]
}

Materi Pelajaran:
${JSON.stringify(contentBlocks)}
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

  console.log("🔍 [Sanity] Memuat dokumen lesson yang belum memiliki summary atau quizzes...");
  const lessons = await sanity.fetch(
    `*[_type == "lesson" && (!defined(summary) || !defined(quizzes) || count(quizzes) == 0)][0...$limit] {
      _id,
      title,
      content_blocks
    }`,
    { limit: options.limit }
  );

  if (!lessons || lessons.length === 0) {
    console.log("✅ Semua dokumen lesson di Sanity sudah lengkap.");
    process.exit(0);
  }

  console.log(`📈 [Proses] Memulai enrichment ${lessons.length} lesson...`);

  for (let i = 0; i < lessons.length; i += 1) {
    const lesson = lessons[i];
    console.log(`   📝 Memproses lesson ${i + 1}/${lessons.length}: "${lesson.title}"...`);

    const prompt = buildPrompt(lesson.title, lesson.content_blocks);

    let enriched = null;
    for (let attempt = 1; attempt <= options.llmRetries; attempt += 1) {
      try {
        const responseText = await aiClient.generateText(prompt);
        const cleanJson = responseText.trim().replace(/^```json|```$/g, "").trim();
        enriched = JSON.parse(cleanJson);
        if (enriched.summary && Array.isArray(enriched.quizzes)) {
          break;
        }
      } catch (err) {
        if (attempt >= options.llmRetries) {
          console.warn(`   ⚠️ Attempt ${attempt} gagal:`, err.message);
        }
      }
    }

    if (!enriched) {
      console.warn(`   ❌ Gagal memproses lesson "${lesson.title}" dari AI.`);
      continue;
    }

    console.log(`   💾 Mempatch dokumen di Sanity CMS...`);
    try {
      const transformedQuizzes = (enriched.quizzes || []).map((q, qIdx) => ({
        _type: "lessonQuiz",
        _key: `quiz-${Date.now()}-${qIdx}`,
        id: q.id || `q-${qIdx}`,
        question: q.question,
        options: q.options,
        correct_answer: q.correct_answer,
        explanation: q.explanation || "",
        type: q.type || "multiple-choice"
      }));

      await sanity
        .patch(lesson._id)
        .set({
          summary: enriched.summary,
          quizzes: transformedQuizzes,
        })
        .commit();
      console.log(`      └─ Sukses memperkaya lesson "${lesson.title}"!`);
    } catch (patchErr) {
      console.error(`      └─ Gagal mempatch lesson "${lesson.title}":`, patchErr.message);
    }

    if (i < lessons.length - 1) {
      await sleep(1500);
    }
  }

  console.log("\n🎉 [Sukses] Proses enrichment lesson selesai!");
  process.exit(0);
}

main();
