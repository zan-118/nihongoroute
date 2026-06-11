#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const {
  buildMojiGoiImportPackage,
  getMojiGoiQuestionTypesForLevel,
  normalizeMojiGoiQuestionTypes,
  requiresMojiGoiLlm,
} = await import("../src/lib/exams/moji-goi-generator.ts");
const { validateJlptImportPackage } = await import(
  "../src/lib/exams/import-pipeline.ts"
);

const JLPT_LEVELS = new Set(["N5", "N4", "N3", "N2", "N1"]);
const QUESTION_TYPES = new Set([
  "kanji_reading",
  "orthography",
  "word_formation",
  "context",
  "paraphrase",
  "usage",
  "reading",
  "meaning",
]);

function printUsage() {
  console.error(
    [
      "Usage:",
      "  npm run exam:generate:moji-goi -- [options]",
      "",
      "Options:",
      "  --level <N5|N4|N3|N2|N1>       JLPT level. Default: N5",
      "  --limit <number>                 Maximum generated questions. Default: 100",
      "  --offset <number>                Candidate vocab offset after sorting. Default: 0",
      "  --candidate-limit <number>       Candidate vocab rows to consider. Default: auto",
      "  --pool-limit <number>            Vocab rows fetched for distractors. Default: 1000",
      "  --types <official|rule|llm|...>  Question types. Default: official",
      "  --llm-enhance                    Generate context/usage/word_formation with AI",
      "  --llm-limit <number>             Max AI-generated questions. Default: quota estimate",
      "  --llm-batch-size <number>        Vocab rows per AI request. Default: 6",
      "  --llm-retries <number>           AI retries per batch. Default: 2",
      "  --allow-partial-llm              Keep rule-based output if AI enhancement is incomplete",
      "  --seed <value>                   Deterministic shuffle seed. Default: level-based",
      "  --output <file>                  Output JSON path. Default: data/imports/<slug>.json",
      "  --template-slug <slug>           Import template slug. Default: jlpt-<level>-moji-goi-draft",
      "  --title <title>                  Template title. Default: JLPT <level> Moji/Goi Draft",
      "  --common-only                    Fetch only vocab rows marked is_common=true",
      "",
      "Type examples:",
      "  --types official",
      "  --types rule",
      "  --types kanji_reading,orthography,context,paraphrase,usage",
      "",
      "Example:",
      "  npm run exam:generate:moji-goi -- --level N5 --limit 100 --llm-enhance",
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
    limit: 100,
    offset: 0,
    candidateLimit: null,
    poolLimit: 1000,
    typesRaw: "official",
    llmEnhance: false,
    llmLimit: null,
    llmBatchSize: 6,
    llmRetries: 2,
    allowPartialLlm: false,
    seed: null,
    output: null,
    templateSlug: null,
    title: null,
    description: null,
    commonOnly: false,
  };

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];

    if (arg === "--help" || arg === "-h") {
      printUsage();
      process.exit(0);
    }

    if (arg === "--level") {
      options.level = normalizeLevel(readFlagValue(args, index, arg));
      index += 1;
      continue;
    }

    if (arg === "--limit" || arg === "--max-questions") {
      options.limit = parseInteger(readFlagValue(args, index, arg), arg);
      index += 1;
      continue;
    }

    if (arg === "--offset") {
      options.offset = parseInteger(readFlagValue(args, index, arg), arg);
      index += 1;
      continue;
    }

    if (arg === "--candidate-limit") {
      options.candidateLimit = parseInteger(readFlagValue(args, index, arg), arg);
      index += 1;
      continue;
    }

    if (arg === "--pool-limit") {
      options.poolLimit = parseInteger(readFlagValue(args, index, arg), arg);
      index += 1;
      continue;
    }

    if (arg === "--types") {
      options.typesRaw = readFlagValue(args, index, arg);
      index += 1;
      continue;
    }

    if (arg === "--llm-enhance") {
      options.llmEnhance = true;
      continue;
    }

    if (arg === "--llm-limit") {
      options.llmLimit = parseInteger(readFlagValue(args, index, arg), arg);
      index += 1;
      continue;
    }

    if (arg === "--llm-batch-size") {
      options.llmBatchSize = parseInteger(readFlagValue(args, index, arg), arg);
      index += 1;
      continue;
    }

    if (arg === "--llm-retries") {
      options.llmRetries = parseInteger(readFlagValue(args, index, arg), arg);
      index += 1;
      continue;
    }

    if (arg === "--allow-partial-llm") {
      options.allowPartialLlm = true;
      continue;
    }

    if (arg === "--seed") {
      options.seed = readFlagValue(args, index, arg);
      index += 1;
      continue;
    }

    if (arg === "--output") {
      options.output = readFlagValue(args, index, arg);
      index += 1;
      continue;
    }

    if (arg === "--template-slug") {
      options.templateSlug = readFlagValue(args, index, arg);
      index += 1;
      continue;
    }

    if (arg === "--title") {
      options.title = readFlagValue(args, index, arg);
      index += 1;
      continue;
    }

    if (arg === "--description") {
      options.description = readFlagValue(args, index, arg);
      index += 1;
      continue;
    }

    if (arg === "--common-only") {
      options.commonOnly = true;
      continue;
    }

    throw new Error(`Argumen tidak dikenal: ${arg}`);
  }

  if (options.limit < 1) throw new Error("--limit harus lebih besar dari 0.");
  if (options.llmBatchSize < 1) {
    throw new Error("--llm-batch-size harus lebih besar dari 0.");
  }

  return options;
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

function resolveQuestionTypes(options) {
  const raw = options.typesRaw.trim();
  const officialTypes = getMojiGoiQuestionTypesForLevel(options.level);

  if (raw === "official" || raw === "all") return officialTypes;
  if (raw === "rule") {
    return officialTypes.filter((type) => !requiresMojiGoiLlm(type));
  }
  if (raw === "llm") {
    return officialTypes.filter((type) => requiresMojiGoiLlm(type));
  }

  const requested = raw
    .split(",")
    .map((type) => type.trim())
    .filter(Boolean);

  if (
    requested.length === 0 ||
    requested.some((type) => !QUESTION_TYPES.has(type))
  ) {
    throw new Error(
      "--types hanya menerima official, rule, llm, atau daftar tipe mondai yang valid."
    );
  }

  return normalizeMojiGoiQuestionTypes(requested, options.level);
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
      "NEXT_PUBLIC_SUPABASE_URL dan SUPABASE_SERVICE_ROLE_KEY/NEXT_PUBLIC_SUPABASE_ANON_KEY wajib tersedia."
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
  let query = supabase
    .from("vocab")
    .select(
      "id,word,furigana,romaji,meaning_id,jlpt_level,hinshi,slug,is_common,examples,synonyms"
    )
    .eq("jlpt_level", options.level)
    .order("word", { ascending: true })
    .range(0, rangeLimit - 1);

  if (options.commonOnly) {
    query = query.eq("is_common", true);
  }

  const { data, error } = await query;
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

  if (process.env.AI_BASE_URL && process.env.AI_API_KEY) {
    const fetchFn =
      globalThis.fetch ?? (await import("node-fetch")).default;
    return {
      provider: `OpenAI-compatible ${process.env.AI_MODEL ?? "ag/gemini-3-flash"}`,
      async generateText(prompt) {
        const response = await fetchFn(
          `${process.env.AI_BASE_URL}/chat/completions`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${process.env.AI_API_KEY}`,
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
            `OpenAI-compatible API error: ${response.status} ${response.statusText} - ${errText}`
          );
        }

        const data = await response.json();
        return data.choices?.[0]?.message?.content ?? "";
      },
    };
  }

  const geminiKeys = collectGeminiKeys();
  if (geminiKeys.length === 0) {
    throw new Error(
      "--llm-enhance membutuhkan AI_BASE_URL/AI_API_KEY atau GEMINI_API_KEY."
    );
  }

  const { GoogleGenerativeAI } = await import("@google/generative-ai");
  let currentKeyIndex = 0;
  let genAI = new GoogleGenerativeAI(geminiKeys[currentKeyIndex]);
  let model = genAI.getGenerativeModel({
    model: process.env.GEMINI_MODEL || "gemini-2.5-flash",
    generationConfig: { responseMimeType: "application/json" },
  });

  return {
    provider: `Gemini ${process.env.GEMINI_MODEL || "gemini-2.5-flash"}`,
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
            model: process.env.GEMINI_MODEL || "gemini-2.5-flash",
            generationConfig: { responseMimeType: "application/json" },
          });
        }
      }

      throw new Error("Gemini key rotation exhausted.");
    },
  };
}

function compactString(value) {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function summarizeJson(value, maxLength = 320) {
  if (value === null || value === undefined) return null;
  const text = JSON.stringify(value);
  return text.length > maxLength ? `${text.slice(0, maxLength)}...` : text;
}

function normalizeLlmRow(row) {
  return {
    id: row.id,
    word: row.word,
    furigana: row.furigana ?? null,
    meaning: row.meaning_id ?? null,
    hinshi: row.hinshi ?? null,
    examples: summarizeJson(row.examples, 260),
    synonyms: summarizeJson(row.synonyms, 180),
  };
}

function buildLlmPrompt(input) {
  const typeGuidance = {
    kanji_reading:
      "Buat soal 漢字読み: satu kalimat Jepang yang mengandung kata target; kata target harus diberi garis bawah dengan tag <u> (misal: <u>漢字</u>); choices berisi 4 cara baca kata target tersebut dalam hiragana/katakana, hanya satu yang benar.",
    orthography:
      "Buat soal 表記: satu kalimat Jepang dengan kata target ditulis dalam hiragana/katakana dan diberi garis bawah (misal: <u>かんじ</u>); choices berisi 4 penulisan Kanji/katakana kata target tersebut, hanya satu yang benar.",
    paraphrase:
      "Buat soal 類義表現: satu kalimat Jepang dengan kata target diberi garis bawah (misal: <u>昨日</u>); choices berisi 4 frasa/kosakata Jepang pengganti yang maknanya paling dekat, hanya satu yang benar.",
    context:
      "Buat soal 文脈規定: satu kalimat Jepang dengan blank '____'; pilihan berupa kosakata Jepang; jawaban benar adalah kata target atau bentuk yang natural.",
    usage:
      "Buat soal 用法: prompt menanyakan penggunaan kata target; choices berisi 4 kalimat Jepang, hanya satu yang memakai kata target secara natural.",
    word_formation:
      "Buat soal 語形成 N2: uji pembentukan kata/afiks/kolokasi dari kata target; choices berupa bentuk kata Jepang, hanya satu yang tepat.",
  };

  return `
Anda adalah pembuat soal JLPT profesional untuk bagian Language Knowledge (Vocabulary / 文字・語彙) level ${input.level}.
Target pengguna adalah pelajar Indonesia, tetapi soal dan pilihan harus bergaya JLPT dalam bahasa Jepang.

Tipe mondai yang harus dibuat:
${input.questionTypes.map((type) => `- ${type}: ${typeGuidance[type]}`).join("\n")}

Aturan wajib:
1. Gunakan hanya sourceId dari daftar targetRows.
2. Buat maksimal ${input.maxQuestions} soal total.
3. Setiap soal punya 4 pilihan unik.
4. correctChoiceIndex memakai index 0-based.
5. promptHtml harus HTML sederhana dengan tag <p>, <u>, <strong>, atau <br>. Jangan markdown.
6. Jangan menyalin contoh dari JLPT resmi; buat soal baru.
7. Pilihan pengecoh harus masuk akal untuk level ${input.level}, bukan pilihan asal.
8. Jangan membuat dua soal dengan prompt dan jawaban benar yang sama.

Kembalikan JSON murni dengan struktur persis:
{
  "questions": [
    {
      "type": "kanji_reading | orthography | paraphrase | context | usage | word_formation",
      "sourceId": "id dari targetRows",
      "promptHtml": "<p>...</p>",
      "choices": ["...", "...", "...", "..."],
      "correctChoiceIndex": 0,
      "explanationHtml": "<p>Penjelasan singkat dalam Bahasa Indonesia.</p>",
      "sourceReference": "kata / bacaan / arti"
    }
  ]
}

targetRows:
${JSON.stringify(input.targetRows.map(normalizeLlmRow), null, 2)}

distractorPool:
${JSON.stringify(input.distractorRows.map(normalizeLlmRow), null, 2)}
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

function validateEnhancedQuestions(raw, allowedTypes, targetRows, maxQuestions) {
  const targetIds = new Set(targetRows.map((row) => row.id));
  const allowedTypeSet = new Set(allowedTypes);
  const questions = Array.isArray(raw?.questions) ? raw.questions : [];
  const accepted = [];

  for (const question of questions) {
    const type = compactString(question?.type);
    const sourceId = compactString(question?.sourceId);
    const promptHtml = compactString(question?.promptHtml);
    const choices = Array.isArray(question?.choices)
      ? question.choices.map(compactString).filter(Boolean)
      : [];
    const correctChoiceIndex = question?.correctChoiceIndex;

    if (!type || !allowedTypeSet.has(type)) continue;
    if (!sourceId || !targetIds.has(sourceId)) continue;
    if (!promptHtml) continue;
    if (choices.length !== 4 || new Set(choices).size !== 4) continue;
    if (
      !Number.isInteger(correctChoiceIndex) ||
      correctChoiceIndex < 0 ||
      correctChoiceIndex >= choices.length
    ) {
      continue;
    }

    accepted.push({
      type,
      sourceId,
      promptHtml,
      choices,
      correctChoiceIndex,
      explanationHtml: compactString(question?.explanationHtml),
      sourceReference: compactString(question?.sourceReference),
    });

    if (accepted.length >= maxQuestions) break;
  }

  return accepted;
}

async function generateEnhancedQuestions(input) {
  if (input.questionTypes.length === 0 || input.maxQuestions <= 0) return [];

  const aiClient = await createAiClient();
  console.log(`LLM enhancement enabled: ${aiClient.provider}`);

  const targetRows = stableShuffle(
    input.candidateRows.filter((row) => row.meaning_id && row.word),
    `${input.seed}:llm-targets`
  );
  const distractorRows = stableShuffle(
    input.vocabRows.filter((row) => row.meaning_id && row.word),
    `${input.seed}:llm-distractors`
  ).slice(0, 80);
  const enhancedQuestions = [];

  for (
    let offset = 0;
    offset < targetRows.length && enhancedQuestions.length < input.maxQuestions;
    offset += input.batchSize
  ) {
    const batchRows = targetRows.slice(offset, offset + input.batchSize);
    const remaining = input.maxQuestions - enhancedQuestions.length;
    const prompt = buildLlmPrompt({
      level: input.level,
      questionTypes: input.questionTypes,
      targetRows: batchRows,
      distractorRows,
      maxQuestions: Math.min(remaining, batchRows.length * input.questionTypes.length),
    });

    let accepted = [];
    for (let attempt = 0; attempt <= input.retries; attempt += 1) {
      try {
        const responseText = await aiClient.generateText(prompt);
        accepted = validateEnhancedQuestions(
          parseJsonObject(responseText),
          input.questionTypes,
          batchRows,
          remaining
        );
        if (accepted.length > 0) break;
      } catch (error) {
        if (attempt >= input.retries) {
          const message = error instanceof Error ? error.message : String(error);
          console.warn(`LLM batch gagal: ${message}`);
        }
      }
    }

    enhancedQuestions.push(...accepted);
    console.log(
      `LLM batch ${Math.floor(offset / input.batchSize) + 1}: +${accepted.length} soal (${enhancedQuestions.length}/${input.maxQuestions})`
    );
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

  if (input.enhancedQuestions.length === 0) {
    throw new Error(
      `LLM enhancement gagal menghasilkan soal untuk tipe: ${input.questionTypes.join(", ")}. Periksa AI_BASE_URL/AI_API_KEY atau GEMINI_API_KEY, atau pakai --allow-partial-llm untuk menyimpan output rule-based sementara.`
    );
  }

  if (input.maxQuestions < input.questionTypes.length) return;

  const generatedTypes = new Set(
    input.enhancedQuestions.map((question) => question.type)
  );
  const missingTypes = input.questionTypes.filter(
    (type) => !generatedTypes.has(type)
  );

  if (missingTypes.length > 0) {
    throw new Error(
      `LLM enhancement belum mencakup tipe: ${missingTypes.join(", ")}. Pakai --llm-limit lebih besar, review provider LLM, atau pakai --allow-partial-llm jika memang ingin draft parsial.`
    );
  }
}

function printStats(report, stats, outputPath, extra = {}) {
  const reasons = Object.entries(stats.skippedByReason)
    .sort(([reasonA], [reasonB]) => reasonA.localeCompare(reasonB))
    .map(([reason, count]) => `- ${reason}: ${count}`);
  const byType = Object.entries(stats.generatedByType).map(
    ([type, count]) => `- ${type}: ${count}`
  );

  console.log(
    [
      `Generated moji/goi draft: ${outputPath}`,
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
  const seed = options.seed ?? `${options.level}:moji-goi:v2`;
  const questionTypes = resolveQuestionTypes(options);
  const llmQuestionTypes = options.llmEnhance ? questionTypes : [];
  const templateSlug =
    options.templateSlug ?? `jlpt-${options.level.toLowerCase()}-moji-goi-draft`;
  const outputPath = path.resolve(
    options.output ?? `data/imports/${templateSlug}.json`
  );
  const supabase = await createSupabaseReadClient();
  const vocabRows = await fetchVocabRows(supabase, options);
  const candidateRows = vocabRows.slice(
    options.offset,
    options.offset + (options.candidateLimit ?? vocabRows.length)
  );
  const estimatedLlmQuota =
    questionTypes.length > 0
      ? Math.ceil(options.limit / questionTypes.length) * llmQuestionTypes.length
      : 0;
  const llmLimit = options.llmLimit ?? estimatedLlmQuota;
  const enhancedQuestions =
    options.llmEnhance && llmQuestionTypes.length > 0
      ? await generateEnhancedQuestions({
          level: options.level,
          questionTypes: llmQuestionTypes,
          vocabRows,
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
    questionTypes: llmQuestionTypes,
    maxQuestions: llmLimit,
    enhancedQuestions,
  });

  const { importPackage, stats } = buildMojiGoiImportPackage({
    vocabRows,
    candidateIds: candidateRows.map((row) => row.id),
    jlptLevel: options.level,
    templateSlug,
    title: options.title ?? `JLPT ${options.level} Moji/Goi Draft`,
    description: options.description,
    questionTypes,
    maxQuestions: options.limit,
    enhancedQuestions,
    seed,
    isPublished: false,
  });
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
