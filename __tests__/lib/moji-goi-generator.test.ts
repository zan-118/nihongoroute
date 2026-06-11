import { describe, expect, it } from "vitest";
import { validateJlptImportPackage } from "@/lib/exams/import-pipeline";
import {
  buildMojiGoiImportPackage,
  getMojiGoiQuestionTypesForLevel,
  normalizeMojiGoiQuestionTypes,
  requiresMojiGoiLlm,
  type MojiGoiVocabRow,
} from "@/lib/exams/moji-goi-generator";

const rows: MojiGoiVocabRow[] = [
  {
    id: "vocab-asa",
    word: "朝",
    furigana: "あさ",
    meaning_id: "pagi",
    jlpt_level: "N5",
    hinshi: ["noun"],
    slug: "asa",
    is_common: true,
  },
  {
    id: "vocab-hiru",
    word: "昼",
    furigana: "ひる",
    meaning_id: "siang",
    jlpt_level: "N5",
    hinshi: ["noun"],
    slug: "hiru",
    is_common: true,
  },
  {
    id: "vocab-yoru",
    word: "夜",
    furigana: "よる",
    meaning_id: "malam",
    jlpt_level: "N5",
    hinshi: ["noun"],
    slug: "yoru",
    is_common: true,
  },
  {
    id: "vocab-mizu",
    word: "水",
    furigana: "みず",
    meaning_id: "air",
    jlpt_level: "N5",
    hinshi: ["noun"],
    slug: "mizu",
    is_common: true,
  },
  {
    id: "vocab-taberu",
    word: "食べる",
    furigana: "たべる",
    meaning_id: "makan",
    jlpt_level: "N5",
    hinshi: ["verb"],
    slug: "taberu",
    is_common: true,
  },
  {
    id: "vocab-nomu",
    word: "飲む",
    furigana: "のむ",
    meaning_id: "minum",
    jlpt_level: "N5",
    hinshi: ["verb"],
    slug: "nomu",
    is_common: true,
  },
  {
    id: "vocab-iku",
    word: "行く",
    furigana: "いく",
    meaning_id: "pergi",
    jlpt_level: "N5",
    hinshi: ["verb"],
    slug: "iku",
    is_common: true,
  },
  {
    id: "vocab-kuru",
    word: "来る",
    furigana: "くる",
    meaning_id: "datang",
    jlpt_level: "N5",
    hinshi: ["verb"],
    slug: "kuru",
    is_common: true,
  },
];

describe("moji/goi question type matrix", () => {
  it("matches official vocabulary mondai availability by level", () => {
    expect(getMojiGoiQuestionTypesForLevel("N5")).toEqual([
      "kanji_reading",
      "orthography",
      "context",
      "paraphrase",
    ]);
    expect(getMojiGoiQuestionTypesForLevel("N2")).toEqual([
      "kanji_reading",
      "orthography",
      "word_formation",
      "context",
      "paraphrase",
      "usage",
    ]);
    expect(getMojiGoiQuestionTypesForLevel("N1")).toEqual([
      "kanji_reading",
      "context",
      "paraphrase",
      "usage",
    ]);
  });

  it("keeps old reading/meaning aliases compatible", () => {
    expect(normalizeMojiGoiQuestionTypes(["reading", "meaning"], "N5")).toEqual([
      "kanji_reading",
      "paraphrase",
    ]);
    expect(requiresMojiGoiLlm("context")).toBe(true);
    expect(requiresMojiGoiLlm("orthography")).toBe(false);
  });
});

describe("buildMojiGoiImportPackage", () => {
  it("generates a valid draft import package with rule-based official mondai", () => {
    const { importPackage, stats } = buildMojiGoiImportPackage({
      vocabRows: rows,
      jlptLevel: "N5",
      seed: "stable",
      questionTypes: ["kanji_reading", "orthography", "paraphrase"],
      maxQuestions: 6,
    });
    const report = validateJlptImportPackage(importPackage);

    expect(report.ok).toBe(true);
    expect(importPackage.template).toMatchObject({
      slug: "jlpt-n5-moji-goi-draft",
      jlptLevel: "N5",
      generationMode: "fixed",
      isPublished: false,
    });
    expect(importPackage.questions).toHaveLength(6);
    expect(importPackage.templateQuestions).toHaveLength(6);
    expect(stats.generatedByType).toMatchObject({
      kanji_reading: 2,
      orthography: 2,
      paraphrase: 2,
    });

    for (const question of importPackage.questions) {
      const correctValue = question.choices[question.correctChoiceIndex]?.value;
      expect(question.sessionType).toBe("vocabulary");
      expect(question.sourceType).toBe("vocab");
      expect(question.sourceId).toMatch(/^vocab-/);
      expect(question.isPublished).toBe(false);
      expect(question.choices).toHaveLength(4);
      expect(question.choices.filter((choice) => choice.value === correctValue)).toHaveLength(1);
    }
  });

  it("injects LLM-enhanced official mondai and validates the package", () => {
    const { importPackage, stats } = buildMojiGoiImportPackage({
      vocabRows: rows,
      jlptLevel: "N5",
      seed: "llm",
      questionTypes: ["context", "paraphrase"],
      enhancedQuestions: [
        {
          type: "context",
          sourceId: "vocab-asa",
          promptHtml: "<p>毎朝、____を食べます。</p>",
          choices: ["朝", "水", "夜", "昼"],
          correctChoiceIndex: 0,
          explanationHtml: "<p>朝 adalah pilihan yang paling natural.</p>",
        },
      ],
      maxQuestions: 3,
    });

    expect(validateJlptImportPackage(importPackage).ok).toBe(true);
    expect(importPackage.questions.some((question) => question.mondaiNumber === 3)).toBe(true);
    expect(stats.generatedByType.context).toBe(1);
    expect(stats.generatedByType.paraphrase).toBe(2);
  });

  it("keeps output deterministic for the same seed", () => {
    const first = buildMojiGoiImportPackage({
      vocabRows: rows,
      jlptLevel: "N5",
      seed: "same-seed",
      questionTypes: ["kanji_reading", "orthography", "paraphrase"],
      maxQuestions: 4,
    }).importPackage;
    const second = buildMojiGoiImportPackage({
      vocabRows: rows,
      jlptLevel: "N5",
      seed: "same-seed",
      questionTypes: ["kanji_reading", "orthography", "paraphrase"],
      maxQuestions: 4,
    }).importPackage;

    expect(second).toEqual(first);
  });

  it("can generate legacy meaning-only questions for selected candidate ids", () => {
    const { importPackage, stats } = buildMojiGoiImportPackage({
      vocabRows: rows,
      jlptLevel: "N5",
      seed: "meaning-only",
      questionTypes: ["meaning"],
      candidateIds: ["vocab-asa", "vocab-taberu"],
    });

    expect(validateJlptImportPackage(importPackage).ok).toBe(true);
    expect(importPackage.questions).toHaveLength(2);
    expect(importPackage.questions.every((question) => question.mondaiNumber === 4)).toBe(true);
    expect(stats.candidateRows).toBe(2);
  });

  it("deduplicates identical question signatures from duplicate vocab rows", () => {
    const { importPackage, stats } = buildMojiGoiImportPackage({
      vocabRows: [
        ...rows,
        {
          id: "vocab-asa-copy",
          word: "朝",
          furigana: "あさ",
          meaning_id: "pagi",
          jlpt_level: "N5",
          hinshi: ["noun"],
        },
      ],
      jlptLevel: "N5",
      seed: "dedupe",
      questionTypes: ["meaning"],
    });
    const signatures = importPackage.questions.map((question) => {
      const correct = question.choices[question.correctChoiceIndex]?.value;
      return `${question.promptHtml}|${correct}`;
    });

    expect(new Set(signatures).size).toBe(signatures.length);
    expect(stats.skippedByReason.duplicate_question_signature).toBe(1);
  });

  it("skips rows without enough distractors or required fields", () => {
    const { importPackage, stats } = buildMojiGoiImportPackage({
      vocabRows: [
        {
          id: "complete",
          word: "朝",
          furigana: "あさ",
          meaning_id: "pagi",
          jlpt_level: "N5",
        },
        {
          id: "missing-meaning",
          word: "夜",
          furigana: "よる",
          jlpt_level: "N5",
        },
      ],
      jlptLevel: "N5",
      seed: "small",
      questionTypes: ["reading", "meaning"],
    });

    expect(importPackage.questions).toEqual([]);
    expect(stats.skippedByReason).toMatchObject({
      kanji_reading_insufficient_distractors: 2,
      paraphrase_insufficient_distractors: 1,
      paraphrase_missing_meaning: 1,
    });
  });
});
