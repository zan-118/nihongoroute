import { describe, expect, it } from "vitest";
import {
  validateJlptImportPackage,
  type JlptImportPackage,
} from "@/lib/exams/import-pipeline";

const validPackage: JlptImportPackage = {
  template: {
    slug: "jlpt-n5-import-sample",
    title: "JLPT N5 Import Sample",
    description: "Fixture import pipeline Phase 6",
    jlptLevel: "N5",
    timeLimitMinutes: 50,
    passingScore: 80,
    generationMode: "fixed",
    isPublished: false,
  },
  assets: ["passages/n5/listening-1.mp3", "questions/n5/q2.webp"],
  passages: [
    {
      key: "listen-p1",
      sessionType: "listening",
      mondaiNumber: 1,
      transcriptHtml: "<p>A: こんにちは。</p>",
      audioPath: "exam-assets/passages/n5/listening-1.mp3",
    },
  ],
  questions: [
    {
      key: "q-vocab-1",
      sessionType: "vocabulary",
      mondaiNumber: 1,
      questionNumber: 1,
      promptHtml: "<p>ことばを選びなさい。</p>",
      choices: [
        { type: "text", value: "あさ" },
        { type: "text", value: "よる" },
      ],
      correctChoiceIndex: 0,
      sourceType: "vocab",
      sourceId: "n5-noun-asa",
    },
    {
      key: "q-listening-1",
      sessionType: "listening",
      mondaiNumber: 1,
      questionNumber: 2,
      passageKey: "listen-p1",
      visualPath: "questions/n5/q2.webp",
      choices: [
        { type: "text", value: "A" },
        { type: "text", value: "B" },
      ],
      correctChoiceIndex: 1,
      sourceType: "listening",
      sourceId: "listen-p1",
    },
  ],
  templateQuestions: [
    { questionKey: "q-vocab-1", position: 1, sectionOrder: 0 },
    { questionKey: "q-listening-1", position: 2, sectionOrder: 3 },
  ],
};

describe("validateJlptImportPackage", () => {
  it("accepts a fixed-template import package and summarizes it", () => {
    const report = validateJlptImportPackage(validPackage);

    expect(report.ok).toBe(true);
    expect(report.errors).toEqual([]);
    expect(report.summary).toMatchObject({
      templateSlug: "jlpt-n5-import-sample",
      jlptLevel: "N5",
      generationMode: "fixed",
      totalPassages: 1,
      totalQuestions: 2,
      totalTemplateQuestions: 2,
      sectionCounts: {
        vocabulary: 1,
        grammar: 0,
        reading: 0,
        listening: 1,
      },
    });
    expect(report.summary.assetReferences.map((asset) => asset.path)).toEqual([
      "passages/n5/listening-1.mp3",
      "questions/n5/q2.webp",
    ]);
  });

  it("rejects broken question references and invalid answer indexes", () => {
    const report = validateJlptImportPackage({
      ...validPackage,
      assets: [],
      passages: [],
      questions: [
        {
          key: "q-broken",
          sessionType: "reading",
          mondaiNumber: 1,
          passageKey: "missing-passage",
          choices: [{ type: "text", value: "A" }],
          correctChoiceIndex: 2,
          sourceType: "grammar",
        },
      ],
      templateQuestions: [
        { questionKey: "q-broken", position: 1 },
        { questionKey: "missing-question", position: 1 },
      ],
    });

    expect(report.ok).toBe(false);
    expect(report.errors.map((error) => error.code)).toEqual(
      expect.arrayContaining([
        "question_choices_min",
        "question_correct_choice_index_invalid",
        "question_passage_missing",
        "template_question_unknown",
        "template_question_position_duplicate",
      ])
    );
    expect(report.warnings.map((warning) => warning.code)).toContain(
      "question_source_id_missing"
    );
  });

  it("validates random quota packages against available question counts", () => {
    const report = validateJlptImportPackage({
      ...validPackage,
      template: {
        ...validPackage.template,
        generationMode: "random_by_quota",
        quotaConfig: {
          vocabulary: { total: 2 },
          listening: { total: 1 },
        },
      },
      templateQuestions: undefined,
    });

    expect(report.ok).toBe(false);
    expect(report.errors).toContainEqual(
      expect.objectContaining({
        code: "quota_config_insufficient_questions",
        path: "template.quotaConfig.vocabulary.total",
      })
    );
  });
});
