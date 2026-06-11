import { describe, expect, it } from "vitest";
import { validateJlptImportPackage } from "@/lib/exams/import-pipeline";
import {
  buildBunpouImportPackage,
  getBunpouQuestionTypesForLevel,
  normalizeBunpouQuestionTypes,
  requiresBunpouLlm,
  type BunpouGrammarRow,
} from "@/lib/exams/bunpou-generator";

const rows: BunpouGrammarRow[] = [
  {
    id: "grammar-desu",
    title: "です",
    meaning: "digunakan untuk menyatakan kesopanan atau identitas",
    slug: "desu",
    jlpt_level: "N5",
    formation: "Noun + です",
    order_number: 1,
  },
  {
    id: "grammar-masu",
    title: "ます",
    meaning: "akhiran sopan untuk kata kerja",
    slug: "masu",
    jlpt_level: "N5",
    formation: "Verb stem + ます",
    order_number: 2,
  },
  {
    id: "grammar-masen",
    title: "ません",
    meaning: "bentuk negatif sopan dari kata kerja",
    slug: "masen",
    jlpt_level: "N5",
    formation: "Verb stem + ません",
    order_number: 3,
  },
  {
    id: "grammar-mashita",
    title: "ました",
    meaning: "bentuk lampau sopan dari kata kerja",
    slug: "mashita",
    jlpt_level: "N5",
    formation: "Verb stem + ました",
    order_number: 4,
  },
  {
    id: "grammar-te-kudasai",
    title: "てください",
    meaning: "digunakan untuk meminta seseorang melakukan sesuatu",
    slug: "te-kudasai",
    jlpt_level: "N5",
    formation: "Verb te-form + ください",
    order_number: 5,
  },
  {
    id: "grammar-ga-arimasu",
    title: "があります",
    meaning: "menyatakan keberadaan benda mati",
    slug: "ga-arimasu",
    jlpt_level: "N5",
    formation: "Noun + があります",
    order_number: 6,
  },
];

describe("bunpou question type matrix", () => {
  it("matches official grammar mondai for every JLPT level", () => {
    expect(getBunpouQuestionTypesForLevel()).toEqual([
      "sentential_grammar_1",
      "sentential_grammar_2",
      "text_grammar",
    ]);
    expect(normalizeBunpouQuestionTypes(["text_grammar"])).toEqual([
      "text_grammar",
    ]);
    expect(requiresBunpouLlm("sentential_grammar_1")).toBe(false);
    expect(requiresBunpouLlm("sentential_grammar_2")).toBe(true);
    expect(requiresBunpouLlm("text_grammar")).toBe(true);
  });
});

describe("buildBunpouImportPackage", () => {
  it("generates a valid draft import package for rule-based sentential grammar", () => {
    const { importPackage, stats } = buildBunpouImportPackage({
      grammarRows: rows,
      jlptLevel: "N5",
      seed: "stable",
      questionTypes: ["sentential_grammar_1"],
      maxQuestions: 4,
    });
    const report = validateJlptImportPackage(importPackage);

    expect(report.ok).toBe(true);
    expect(importPackage.template).toMatchObject({
      slug: "jlpt-n5-bunpou-draft",
      jlptLevel: "N5",
      generationMode: "fixed",
      isPublished: false,
    });
    expect(importPackage.questions).toHaveLength(4);
    expect(importPackage.passages).toEqual([]);
    expect(stats.generatedByType.sentential_grammar_1).toBe(4);

    for (const question of importPackage.questions) {
      const correctValue = question.choices[question.correctChoiceIndex]?.value;
      expect(question.sessionType).toBe("grammar");
      expect(question.mondaiNumber).toBe(1);
      expect(question.sourceType).toBe("grammar");
      expect(question.sourceId).toMatch(/^grammar-/);
      expect(question.isPublished).toBe(false);
      expect(question.choices).toHaveLength(4);
      expect(
        question.choices.filter((choice) => choice.value === correctValue)
      ).toHaveLength(1);
    }
  });

  it("injects LLM-enhanced sentential grammar 2 and validates the package", () => {
    const { importPackage, stats } = buildBunpouImportPackage({
      grammarRows: rows,
      jlptLevel: "N5",
      seed: "llm-ordering",
      questionTypes: ["sentential_grammar_2"],
      enhancedQuestions: [
        {
          type: "sentential_grammar_2",
          sourceId: "grammar-te-kudasai",
          promptHtml:
            "<p>正しい文になるように、ことばを並べなさい。</p><p>ここに名前を ____ ____ ____ ____ 。</p>",
          choices: ["書いて", "ください", "を", "ペンで"],
          correctChoiceIndex: 1,
          explanationHtml:
            "<p>「書いてください」は依頼を表す自然な形です。</p>",
        },
      ],
      maxQuestions: 1,
    });

    expect(validateJlptImportPackage(importPackage).ok).toBe(true);
    expect(importPackage.questions).toHaveLength(1);
    expect(importPackage.questions[0]).toMatchObject({
      sessionType: "grammar",
      mondaiNumber: 2,
      sourceType: "grammar",
      sourceId: "grammar-te-kudasai",
    });
    expect(stats.generatedByType.sentential_grammar_2).toBe(1);
  });

  it("injects LLM-enhanced text grammar with a passage", () => {
    const { importPackage, stats } = buildBunpouImportPackage({
      grammarRows: rows,
      jlptLevel: "N5",
      seed: "text-grammar",
      questionTypes: ["text_grammar"],
      enhancedQuestions: [
        {
          type: "text_grammar",
          sourceId: "grammar-desu",
          passage: {
            key: "p-n5-bunpou-self-intro",
            title: "自己紹介",
            contentHtml:
              "<p>はじめまして。わたしはアリです。インドネシア人です。どうぞよろしくお願いします。</p>",
          },
          passageKey: "p-n5-bunpou-self-intro",
          promptHtml: "<p>文中の「です」の使い方として正しいものはどれですか。</p>",
          choices: [
            "丁寧に説明する",
            "命令する",
            "過去を表す",
            "禁止する",
          ],
          correctChoiceIndex: 0,
          explanationHtml: "<p>「です」は丁寧な説明に使います。</p>",
        },
      ],
      maxQuestions: 1,
    });

    expect(validateJlptImportPackage(importPackage).ok).toBe(true);
    expect(importPackage.passages).toHaveLength(1);
    expect(importPackage.passages?.[0]).toMatchObject({
      key: "p-n5-bunpou-self-intro",
      sessionType: "grammar",
      mondaiNumber: 3,
    });
    expect(importPackage.questions[0]).toMatchObject({
      mondaiNumber: 3,
      passageKey: "p-n5-bunpou-self-intro",
    });
    expect(stats.generatedByType.text_grammar).toBe(1);
  });

  it("keeps output deterministic for the same seed", () => {
    const first = buildBunpouImportPackage({
      grammarRows: rows,
      jlptLevel: "N5",
      seed: "same-seed",
      questionTypes: ["sentential_grammar_1"],
      maxQuestions: 4,
    }).importPackage;
    const second = buildBunpouImportPackage({
      grammarRows: rows,
      jlptLevel: "N5",
      seed: "same-seed",
      questionTypes: ["sentential_grammar_1"],
      maxQuestions: 4,
    }).importPackage;

    expect(second).toEqual(first);
  });

  it("deduplicates identical enhanced question signatures", () => {
    const enhancedQuestion = {
      type: "sentential_grammar_2" as const,
      sourceId: "grammar-masu",
      promptHtml: "<p>明日、学校へ ____ 。</p>",
      choices: ["行きます", "行きません", "行きました", "行って"],
      correctChoiceIndex: 0,
      explanationHtml: "<p>未来の予定には「行きます」が自然です。</p>",
    };
    const { importPackage, stats } = buildBunpouImportPackage({
      grammarRows: rows,
      jlptLevel: "N5",
      seed: "dedupe",
      questionTypes: ["sentential_grammar_2"],
      enhancedQuestions: [enhancedQuestion, enhancedQuestion],
    });

    expect(validateJlptImportPackage(importPackage).ok).toBe(true);
    expect(importPackage.questions).toHaveLength(1);
    expect(stats.skippedByReason.duplicate_question_signature).toBe(1);
  });

  it("skips rows without enough distractors or required fields", () => {
    const { importPackage, stats } = buildBunpouImportPackage({
      grammarRows: [
        {
          id: "complete",
          title: "です",
          meaning: "sopan",
          slug: "desu",
          jlpt_level: "N5",
        },
        {
          id: "missing-meaning",
          title: "ます",
          meaning: "",
          slug: "masu",
          jlpt_level: "N5",
        },
      ],
      jlptLevel: "N5",
      seed: "small",
      questionTypes: ["sentential_grammar_1", "text_grammar"],
    });

    expect(importPackage.questions).toEqual([]);
    expect(stats.skippedByReason).toMatchObject({
      sentential_grammar_1_insufficient_distractors: 1,
      text_grammar_requires_llm: 1,
    });
  });
});
