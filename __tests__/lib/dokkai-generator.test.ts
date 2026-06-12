import { describe, expect, it } from "vitest";
import { validateJlptImportPackage } from "@/lib/exams/import-pipeline";
import {
  buildDokkaiImportPackage,
  getDokkaiMondaiNumber,
  type DokkaiEnhancedQuestion,
} from "@/lib/exams/dokkai-generator";

const sampleEnhancedQuestions: DokkaiEnhancedQuestion[] = [
  {
    type: "short_passage",
    sourceType: "vocab",
    sourceId: "vocab-hash-1",
    promptHtml: "<p>木村さんは何時に来ますか。</p>",
    passage: {
      key: "p-n5-short-1",
      title: "メールの連絡",
      contentHtml: "<p>木村さん、明日の会議は午後3時からです。遅れないでください。</p>",
      sourceLabel: "Test Case",
    },
    choices: ["午後3時", "午後4時", "午前3時", "午前10時"],
    correctChoiceIndex: 0,
    explanationHtml: "<p>メール本文に「午後3時から」とあります。</p>",
    sourceReference: "会議の時間",
  },
  {
    type: "information_retrieval",
    sourceType: "grammar",
    sourceId: "grammar-hash-1",
    promptHtml: "<p>月曜日の午前中に図書館は開いていますか。</p>",
    passage: {
      key: "p-n5-info-1",
      title: "図書館の案内",
      contentHtml: "<table><tr><td>月曜日</td><td>休館 (Closed)</td></tr></table>",
      sourceLabel: "Test Case",
    },
    choices: ["開いている", "閉まっている", "午後だけ開いている", "わからない"],
    correctChoiceIndex: 1,
    explanationHtml: "<p>月曜日は休館（閉まっている）と書かれています。</p>",
    sourceReference: "休館日の確認",
  },
];

describe("dokkai question type matrix and mondai numbers", () => {
  it("resolves official mondai numbers for various levels", () => {
    // N5
    expect(getDokkaiMondaiNumber("N5", "short_passage")).toBe(4);
    expect(getDokkaiMondaiNumber("N5", "medium_passage")).toBe(5);
    expect(getDokkaiMondaiNumber("N5", "information_retrieval")).toBe(6);

    // N3
    expect(getDokkaiMondaiNumber("N3", "short_passage")).toBe(4);
    expect(getDokkaiMondaiNumber("N3", "medium_passage")).toBe(5);
    expect(getDokkaiMondaiNumber("N3", "long_passage")).toBe(6);
    expect(getDokkaiMondaiNumber("N3", "information_retrieval")).toBe(7);

    // N1
    expect(getDokkaiMondaiNumber("N1", "short_passage")).toBe(8);
    expect(getDokkaiMondaiNumber("N1", "medium_passage")).toBe(9);
    expect(getDokkaiMondaiNumber("N1", "integrated_comprehension")).toBe(10);
    expect(getDokkaiMondaiNumber("N1", "long_passage")).toBe(11);
    expect(getDokkaiMondaiNumber("N1", "information_retrieval")).toBe(13);
  });
});

describe("buildDokkaiImportPackage", () => {
  it("generates a valid import package from enhanced questions", () => {
    const { importPackage, stats } = buildDokkaiImportPackage({
      jlptLevel: "N5",
      seed: "stable-seed",
      enhancedQuestions: sampleEnhancedQuestions,
      isPublished: false,
    });

    const report = validateJlptImportPackage(importPackage);
    expect(report.ok).toBe(true);

    expect(importPackage.template).toMatchObject({
      slug: "jlpt-n5-reading-draft",
      jlptLevel: "N5",
      generationMode: "fixed",
      isPublished: false,
    });

    expect(importPackage.passages).toHaveLength(2);
    expect(importPackage.questions).toHaveLength(2);

    expect(stats.generatedQuestions).toBe(2);
    expect(stats.generatedByType.short_passage).toBe(1);
    expect(stats.generatedByType.information_retrieval).toBe(1);

    const firstQuestion = importPackage.questions[0];
    expect(firstQuestion).toMatchObject({
      sessionType: "reading",
      mondaiNumber: 4,
      passageKey: "p-n5-short-1",
      sourceType: "vocab",
      sourceId: "vocab-hash-1",
      questionNumber: 1,
    });
    expect(firstQuestion.choices).toHaveLength(4);
    expect(firstQuestion.choices[firstQuestion.correctChoiceIndex].value).toBe("午後3時");
  });

  it("handles duplicate questions gracefully", () => {
    const duplicates = [sampleEnhancedQuestions[0], sampleEnhancedQuestions[0]];
    const { importPackage, stats } = buildDokkaiImportPackage({
      jlptLevel: "N5",
      enhancedQuestions: duplicates,
    });

    expect(importPackage.questions).toHaveLength(1);
    expect(stats.skippedByReason.duplicate_question).toBe(1);
  });

  it("skips questions with invalid choices or correct choice indices", () => {
    const invalidQuestions: DokkaiEnhancedQuestion[] = [
      {
        ...sampleEnhancedQuestions[0],
        choices: ["Only one choice"],
      },
      {
        ...sampleEnhancedQuestions[0],
        correctChoiceIndex: 10, // out of bounds
      },
    ];

    const { importPackage, stats } = buildDokkaiImportPackage({
      jlptLevel: "N5",
      enhancedQuestions: invalidQuestions,
    });

    expect(importPackage.questions).toHaveLength(0);
    expect(stats.skippedByReason.insufficient_choices).toBe(1);
    expect(stats.skippedByReason.invalid_correct_index).toBe(1);
  });
});
