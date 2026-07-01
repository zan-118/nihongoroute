#!/usr/bin/env node

/**
 * @file generate-jlpt-dokkai.mjs
 * @description Script utilitas produksi berkualitas tinggi untuk menghasilkan paket impor ujian JLPT Dokkai (Membaca)
 * menggunakan AI (9router dengan fallback Gemini) berdasarkan kosakata/tata bahasa level JLPT aktif.
 * 
 * Desain mengikuti standar teruji generate-jlpt-bunpou.mjs:
 * - Determinisme acak berbasis seed (stableShuffle, createRandom).
 * - Pengecekan fetchFn fallback kompatibilitas Node.js.
 * - Pengecekan cakupan dan validasi pipeline lengkap.
 */

import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const {
  buildDokkaiImportPackage,
  DOKKAI_OFFICIAL_QUESTION_TYPES,
} = await import("../src/lib/exams/dokkai-generator.ts");
const { validateJlptImportPackage } = await import(
  "../src/lib/exams/import-pipeline.ts"
);

const JLPT_LEVELS = new Set(["N5", "N4", "N3", "N2", "N1"]);
const QUESTION_TYPES = new Set(DOKKAI_OFFICIAL_QUESTION_TYPES);

function printUsage() {
  console.error(
    [
      "Usage:",
      "  npm run exam:generate:dokkai -- [options]",
      "",
      "Options:",
      "  --level <N5|N4|N3|N2|N1>       JLPT level. Default: N5",
      "  --limit <number>                 Maximum generated questions. Default: 10",
      "  --offset <number>                Candidate vocabulary offset. Default: 0",
      "  --candidate-limit <number>       Candidate rows to consider. Default: auto",
      "  --pool-limit <number>            Vocabulary rows fetched. Default: 100",
      "  --types <official|all|...>       Question types. Default: official",
      "  --llm-enhance                    Use AI to generate passages and questions",
      "  --llm-limit <number>             Max AI-generated questions.",
      "  --llm-batch-size <number>        Vocab items per AI request. Default: 3",
      "  --llm-retries <number>           AI retries per batch. Default: 2",
      "  --allow-partial-llm              Keep output even if AI enhancement is incomplete",
      "  --seed <value>                   Deterministic shuffle seed.",
      "  --output <file>                  Output JSON path. Default: data/imports/<slug>.json",
      "  --template-slug <slug>           Import template slug.",
      "  --title <title>                  Template title.",
      "  --randomize                      Randomize candidates from database pool",
    ].join("\n")
  );
}

function readFlagValue(args, index, flag) {
  const value = args[index + 1];
  if (!value || value.startsWith("--")) {
    throw new Error(`${flag} membutuhkan nilai.`);
  }
  return value;
}

function parseInteger(value, flag) {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isInteger(parsed) || parsed < 0) {
    throw new Error(`${flag} harus berupa integer >= 0.`);
  }
  return parsed;
}

function normalizeLevel(value) {
  const level = value.trim().toUpperCase();
  if (!JLPT_LEVELS.has(level)) {
    throw new Error("--level harus salah satu N5, N4, N3, N2, atau N1.");
  }
  return level;
}

function parseArgs(args) {
  const options = {
    level: "N5",
    limit: 10,
    offset: 0,
    candidateLimit: null,
    poolLimit: 100,
    typesRaw: "official",
    llmEnhance: true,
    llmLimit: null,
    llmBatchSize: 3,
    llmRetries: 2,
    allowPartialLlm: false,
    seed: null,
    output: null,
    templateSlug: null,
    title: null,
    description: null,
    randomize: false,
  };

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];

    if (arg === "--help" || arg === "-h") {
      printUsage();
      process.exit(0);
    }

    if (arg === "--level") {
      options.level = normalizeLevel(readFlagValue(args, index, "--level"));
      index += 1;
      continue;
    }

    if (arg === "--limit") {
      options.limit = parseInteger(readFlagValue(args, index, "--limit"), "--limit");
      index += 1;
      continue;
    }

    if (arg === "--offset") {
      options.offset = parseInteger(readFlagValue(args, index, "--offset"), "--offset");
      index += 1;
      continue;
    }

    if (arg === "--candidate-limit") {
      options.candidateLimit = parseInteger(readFlagValue(args, index, "--candidate-limit"), "--candidate-limit");
      index += 1;
      continue;
    }

    if (arg === "--pool-limit") {
      options.poolLimit = parseInteger(readFlagValue(args, index, "--pool-limit"), "--pool-limit");
      index += 1;
      continue;
    }

    if (arg === "--types") {
      options.typesRaw = readFlagValue(args, index, "--types");
      index += 1;
      continue;
    }

    if (arg === "--llm-enhance") {
      options.llmEnhance = true;
      continue;
    }

    if (arg === "--llm-limit") {
      options.llmLimit = parseInteger(readFlagValue(args, index, "--llm-limit"), "--llm-limit");
      index += 1;
      continue;
    }

    if (arg === "--llm-batch-size") {
      options.llmBatchSize = parseInteger(readFlagValue(args, index, "--llm-batch-size"), "--llm-batch-size");
      index += 1;
      continue;
    }

    if (arg === "--llm-retries") {
      options.llmRetries = parseInteger(readFlagValue(args, index, "--llm-retries"), "--llm-retries");
      index += 1;
      continue;
    }

    if (arg === "--allow-partial-llm") {
      options.allowPartialLlm = true;
      continue;
    }

    if (arg === "--seed") {
      options.seed = readFlagValue(args, index, "--seed");
      index += 1;
      continue;
    }

    if (arg === "--output") {
      options.output = readFlagValue(args, index, "--output");
      index += 1;
      continue;
    }

    if (arg === "--template-slug") {
      options.templateSlug = readFlagValue(args, index, "--template-slug");
      index += 1;
      continue;
    }

    if (arg === "--title") {
      options.title = readFlagValue(args, index, "--title");
      index += 1;
      continue;
    }

    if (arg === "--randomize") {
      options.randomize = true;
      continue;
    }
  }

  return options;
}

function resolveQuestionTypes(options) {
  const raw = options.typesRaw.trim();
  if (raw === "official" || raw === "all") {
    return Array.from(QUESTION_TYPES);
  }

  const requested = raw
    .split(",")
    .map((t) => t.trim().toLowerCase())
    .filter(Boolean);

  for (const type of requested) {
    if (!QUESTION_TYPES.has(type)) {
      throw new Error(`Tipe soal Dokkai tidak valid: ${type}`);
    }
  }

  return requested;
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

async function createSupabaseReadClient() {
  loadEnvFile();

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
    process.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL dan SUPABASE_SERVICE_ROLE_KEY wajib tersedia."
    );
  }

  const { createClient } = await import("@supabase/supabase-js");
  return createClient(supabaseUrl, supabaseKey, {
    auth: { persistSession: false },
  });
}

async function fetchVocabRows(supabase, options) {
  const rangeLimit = Math.max(
    options.poolLimit,
    options.offset + (options.candidateLimit ?? options.limit) + 20
  );
  const { data, error } = await supabase
    .from("vocab")
    .select("id,word,meaning_id,jlpt_level,examples")
    .eq("jlpt_level", options.level)
    .range(0, rangeLimit - 1);

  if (error) throw new Error(`Gagal mengambil vocab: ${error.message}`);
  return data ?? [];
}

function hash32(value) {
  let hash = 0x811c9dc5;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

function createRandom(seed) {
  let state = hash32(String(seed));
  return () => {
    state += 0x6d2b79f5;
    let mixed = state;
    mixed = Math.imul(mixed ^ (mixed >>> 15), mixed | 1);
    mixed ^= mixed + Math.imul(mixed ^ (mixed >>> 7), mixed | 61);
    return ((mixed ^ (mixed >>> 14)) >>> 0) / 4294967296;
  };
}

function stableShuffle(items, seed) {
  const output = [...items];
  const random = createRandom(seed);

  for (let index = output.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [output[index], output[swapIndex]] = [output[swapIndex], output[index]];
  }

  return output;
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
          console.warn(`OpenAI provider gagal, mencoba fallback Gemini: ${error.message}`);
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

function buildLlmPrompt(input) {
  const typeGuidance = {
    short_passage: "Bacaan pendek (80-150 karakter) berisi petunjuk/pengumuman singkat.",
    medium_passage: "Bacaan menengah (200-350 karakter) opini/kehidupan sehari-hari.",
    long_passage: "Bacaan panjang (400-600 karakter) narasi/esai kompleks.",
    integrated_comprehension: "Bandingkan 2 teks pendek dari penulis berbeda mengenai tema serupa.",
    information_retrieval: "Brosur/iklan/pemberitahuan informasi yang membutuhkan pencarian info spesifik.",
  };

  return `
Anda adalah pembuat soal ujian membaca (Dokkai / 読解) JLPT tingkat ${input.level} profesional.
Target pengguna adalah pelajar Indonesia, tetapi soal, naskah bacaan, dan pilihan harus berbahasa Jepang bergaya JLPT resmi.

Tipe mondai yang harus dibuat:
${input.questionTypes.map((type) => `- ${type}: ${typeGuidance[type]}`).join("\n")}

Aturan wajib:
1. Gunakan kosakata/tata bahasa dari targetRows untuk menyusun naskah bacaan.
2. Setiap naskah bacaan ditulis dalam HTML sederhana (tag <p>, <br>, <strong>). DILARANG menggunakan tanda furigana ruby/kana dalam kurung. Tulis kanji normal.
3. Hasilkan maksimal ${input.maxQuestions} soal total.
4. Setiap soal memiliki tepat 4 pilihan jawaban Jepang unik, dengan correctChoiceIndex berbasis 0-based.
5. Bidang explanationHtml berisi penjelasan singkat dalam Bahasa Indonesia.

Kembalikan JSON murni dengan struktur:
{
  "questions": [
    {
      "type": "short_passage | medium_passage | long_passage | integrated_comprehension | information_retrieval",
      "promptHtml": "<p>Pertanyaan membaca Jepang di sini</p>",
      "passage": {
        "key": "p-dokkai-unique-key-di-sini",
        "title": "Judul Teks Bacaan",
        "contentHtml": "<p>Isi teks bacaan Jepang...</p>",
        "sourceLabel": "AI Generated"
      },
      "choices": ["...", "...", "...", "..."],
      "correctChoiceIndex": 0,
      "explanationHtml": "<p>Penjelasan dalam Bahasa Indonesia.</p>",
      "sourceReference": "Target Kosakata/Tata Bahasa Utama"
    }
  ]
}

targetRows:
${JSON.stringify(input.candidateRows.map((r) => ({ id: r.id, word: r.word, meaning_id: r.meaning_id })), null, 2)}
`.trim();
}

function parseJsonObject(text) {
  let clean = String(text).trim();
  if (clean.startsWith("```json")) clean = clean.slice(7);
  if (clean.startsWith("```")) clean = clean.slice(3);
  if (clean.endsWith("```")) clean = clean.slice(0, -3);
  clean = clean.trim();

  const firstBrace = clean.indexOf("{");
  const lastBrace = clean.lastIndexOf("}");
  if (firstBrace !== -1 && lastBrace !== -1) {
    clean = clean.slice(firstBrace, lastBrace + 1);
  }

  return JSON.parse(clean);
}

async function generateEnhancedQuestions(input) {
  const aiClient = await createAiClient();
  const enhancedQuestions = [];

  for (let offset = 0; offset < input.candidateRows.length; offset += input.batchSize) {
    const batch = input.candidateRows.slice(offset, offset + input.batchSize);
    const prompt = buildLlmPrompt({
      level: input.level,
      questionTypes: input.questionTypes,
      candidateRows: batch,
      maxQuestions: Math.min(input.batchSize, input.maxQuestions - enhancedQuestions.length),
    });

    let accepted = [];
    for (let attempt = 1; attempt <= input.retries; attempt += 1) {
      try {
        const responseText = await aiClient.generateText(prompt);
        const parsed = parseJsonObject(responseText);
        if (Array.isArray(parsed.questions)) {
          accepted = parsed.questions;
          break;
        }
      } catch (error) {
        if (attempt >= input.retries) {
          console.warn(`LLM batch gagal: ${error.message}`);
        }
      }
    }

    enhancedQuestions.push(...accepted);
    console.log(
      `LLM batch ${Math.floor(offset / input.batchSize) + 1}: +${accepted.length} soal (${enhancedQuestions.length}/${input.maxQuestions})`
    );

    if (enhancedQuestions.length >= input.maxQuestions) break;
    await sleep(1500);
  }

  return enhancedQuestions.slice(0, input.maxQuestions);
}

function assertLlmCoverage(input) {
  if (
    input.allowPartialLlm ||
    !input.llmEnhance ||
    input.questionTypes.length === 0 ||
    input.maxQuestions <= 0
  ) {
    return;
  }

  if (input.candidateRowsLength === 0) {
    throw new Error(
      `Gagal menghasilkan soal: candidateRows kosong untuk level ${input.level}.`
    );
  }

  if (input.enhancedQuestions.length === 0) {
    throw new Error(
      `LLM enhancement gagal menghasilkan soal membaca. Periksa API key atau gunakan --allow-partial-llm.`
    );
  }
}

function printStats(report, stats, outputPath, extra = {}) {
  const reasons = Object.entries(stats.skippedByReason)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([reason, count]) => `- ${reason}: ${count}`);
  const byType = Object.entries(stats.generatedByType).map(
    ([type, count]) => `- ${type}: ${count}`
  );

  console.log(
    [
      `Generated dokkai draft: ${outputPath}`,
      `Validation: ${report.ok ? "OK" : "FAILED"}`,
      `Template: ${report.summary.templateSlug ?? "-"}`,
      `Level: ${report.summary.jlptLevel ?? "-"}`,
      `Pool rows: ${stats.poolRows}`,
      `Candidate rows: ${stats.candidateRows}`,
      `Questions: ${stats.generatedQuestions}`,
      extra.llmGenerated !== undefined
        ? `LLM enhanced questions accepted: ${extra.llmGenerated}`
        : null,
      "Questions by type:",
      ...byType,
      reasons.length ? "Skipped:" : "Skipped: -",
      ...reasons,
    ]
      .filter(Boolean)
      .join("\n")
  );
}

try {
  const options = parseArgs(process.argv.slice(2));
  const seed = options.seed ?? `${options.level}:dokkai:v1`;
  const questionTypes = resolveQuestionTypes(options);
  
  const templateSlug =
    options.templateSlug ?? `jlpt-${options.level.toLowerCase()}-reading-draft`;
  const outputPath = path.resolve(
    options.output ?? `data/imports/${templateSlug}.json`
  );

  const supabase = await createSupabaseReadClient();
  const vocabRows = await fetchVocabRows(supabase, options);

  const candidateRows = options.randomize
    ? stableShuffle(vocabRows, seed).slice(0, options.candidateLimit ?? options.limit)
    : vocabRows.slice(options.offset, options.offset + (options.candidateLimit ?? vocabRows.length));

  const estimatedLlmQuota = Math.ceil(options.limit / questionTypes.length) * questionTypes.length;
  const llmLimit = options.llmLimit ?? estimatedLlmQuota;

  const enhancedQuestions = options.llmEnhance
    ? await generateEnhancedQuestions({
        level: options.level,
        questionTypes,
        candidateRows,
        maxQuestions: llmLimit,
        batchSize: options.llmBatchSize,
        retries: options.llmRetries,
        seed,
      })
    : [];

  assertLlmCoverage({
    allowPartialLlm: options.allowPartialLlm,
    llmEnhance: options.llmEnhance,
    questionTypes,
    maxQuestions: llmLimit,
    enhancedQuestions,
    candidateRowsLength: candidateRows.length,
    offset: options.offset,
    level: options.level,
  });

  const { importPackage, stats } = buildDokkaiImportPackage({
    jlptLevel: options.level,
    templateSlug,
    title: options.title ?? `JLPT ${options.level} Reading Draft`,
    description: options.description,
    enhancedQuestions,
    seed,
    isPublished: false,
  });

  // Tambahkan baris stats metadata yang dibutuhkan printStats
  stats.poolRows = vocabRows.length;
  stats.candidateRows = candidateRows.length;

  const report = validateJlptImportPackage(importPackage);

  if (!report.ok) {
    printStats(report, stats, outputPath, {
      llmGenerated: enhancedQuestions.length,
    });
    report.errors.forEach((error) => {
      console.error(`- [${error.code}] ${error.path}: ${error.message}`);
    });
    process.exit(1);
  }

  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, `${JSON.stringify(importPackage, null, 2)}\n`);

  printStats(report, stats, outputPath, {
    llmGenerated: enhancedQuestions.length,
  });
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
}
