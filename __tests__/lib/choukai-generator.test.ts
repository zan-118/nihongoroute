import { describe, expect, it } from "vitest";
import { validateJlptImportPackage } from "@/lib/exams/import-pipeline";
import {
  buildChoukaiImportPackage,
  getChoukaiMondaiNumber,
  type ChoukaiEnhancedQuestion,
} from "@/lib/exams/choukai-generator";

const sampleEnhancedQuestions: ChoukaiEnhancedQuestion[] = [
  {
    type: "task_comprehension",
    sourceType: "listening",
    sourceId: "listening-hash-1",
    promptHtml: "<p>男の人はこのあとどうしますか。</p>",
    dialogue: [
      { speaker: "narrator", text: "男の人と女の人が話しています。" },
      { speaker: "woman", text: "すみません、その本をとってください。" },
      { speaker: "man", text: "はい、どうぞ。" },
    ],
    audioPath: "listening/n5-choukai-task-1.mp3",
    choices: ["本をわたす", "本をよむ", "図書館にいく", "かえる"],
    correctChoiceIndex: 0,
    explanationHtml: "<p>女の人に頼まれて本を手渡しました。</p>",
    sourceReference: "本を渡す動作",
  },
  {
    type: "quick_response",
    sourceType: "listening",
    sourceId: "listening-hash-2",
    promptHtml: "",
    dialogue: [
      { speaker: "man", text: "はじめまして、どうぞよろしく。" },
    ],
    audioPath: "listening/n5-choukai-quick-1.mp3",
    choices: ["こちらこそ、よろしく。", "どういたしまして。", "さようなら。"],
    correctChoiceIndex: 0,
    explanationHtml: "<p>自己紹介に対する標準的な挨拶です。</p>",
    sourceReference: "はじめましての返答",
  },
];

describe("choukai question type matrix and mondai numbers", () => {
  it("resolves official mondai numbers for various levels", () => {
    // N5
    expect(getChoukaiMondaiNumber("N5", "task_comprehension")).toBe(1);
    expect(getChoukaiMondaiNumber("N5", "point_comprehension")).toBe(2);
    expect(getChoukaiMondaiNumber("N5", "verbal_expressions")).toBe(3);
    expect(getChoukaiMondaiNumber("N5", "quick_response")).toBe(4);

    // N3
    expect(getChoukaiMondaiNumber("N3", "task_comprehension")).toBe(1);
    expect(getChoukaiMondaiNumber("N3", "point_comprehension")).toBe(2);
    expect(getChoukaiMondaiNumber("N3", "summary_comprehension")).toBe(3);
    expect(getChoukaiMondaiNumber("N3", "verbal_expressions")).toBe(4);
    expect(getChoukaiMondaiNumber("N3", "quick_response")).toBe(5);

    // N1
    expect(getChoukaiMondaiNumber("N1", "task_comprehension")).toBe(1);
    expect(getChoukaiMondaiNumber("N1", "point_comprehension")).toBe(2);
    expect(getChoukaiMondaiNumber("N1", "summary_comprehension")).toBe(3);
    expect(getChoukaiMondaiNumber("N1", "quick_response")).toBe(4);
  });
});

describe("buildChoukaiImportPackage", () => {
  it("generates a valid import package from enhanced questions", () => {
    const { importPackage, stats } = buildChoukaiImportPackage({
      jlptLevel: "N5",
      seed: "stable-seed",
      enhancedQuestions: sampleEnhancedQuestions,
      isPublished: false,
    });

    const report = validateJlptImportPackage(importPackage);
    expect(report.ok).toBe(true);

    expect(importPackage.template).toMatchObject({
      slug: "jlpt-n5-listening-draft",
      jlptLevel: "N5",
      generationMode: "fixed",
      isPublished: false,
    });

    expect(importPackage.passages).toHaveLength(2);
    expect(importPackage.questions).toHaveLength(2);

    expect(stats.generatedQuestions).toBe(2);
    expect(stats.generatedByType.task_comprehension).toBe(1);
    expect(stats.generatedByType.quick_response).toBe(1);

    const firstQuestion = importPackage.questions[0];
    expect(firstQuestion).toMatchObject({
      sessionType: "listening",
      mondaiNumber: 1,
      passageKey: "p-n5-listening-task_comprehension-1",
      sourceType: "listening",
      sourceId: "listening-hash-1",
      questionNumber: 1,
    });
    expect(firstQuestion.choices).toHaveLength(4);
    expect(firstQuestion.choices[firstQuestion.correctChoiceIndex].value).toBe("本をわたす");
  });

  it("handles duplicate questions gracefully", () => {
    const duplicates = [sampleEnhancedQuestions[0], sampleEnhancedQuestions[0]];
    const { importPackage, stats } = buildChoukaiImportPackage({
      jlptLevel: "N5",
      enhancedQuestions: duplicates,
    });

    expect(importPackage.questions).toHaveLength(1);
    expect(stats.skippedByReason.duplicate_question).toBe(1);
  });

  it("skips questions with invalid choices or correct choice indices", () => {
    const invalidQuestions: ChoukaiEnhancedQuestion[] = [
      {
        ...sampleEnhancedQuestions[0],
        choices: ["Only one choice"],
      },
      {
        ...sampleEnhancedQuestions[0],
        correctChoiceIndex: 10, // out of bounds
      },
    ];

    const { importPackage, stats } = buildChoukaiImportPackage({
      jlptLevel: "N5",
      enhancedQuestions: invalidQuestions,
    });

    expect(importPackage.questions).toHaveLength(0);
    expect(stats.skippedByReason.insufficient_choices).toBe(1);
    expect(stats.skippedByReason.invalid_correct_index).toBe(1);
  });
});
