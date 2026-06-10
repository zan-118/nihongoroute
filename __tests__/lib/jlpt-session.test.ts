import { describe, expect, it } from "vitest";
import {
  buildJlptSrsUpsertRows,
  buildSupabaseExamPackage,
  calculateJlptExamSubmission,
  packageSnapshotToLegacyExam,
  storedScoreSnapshotToResult,
  toJlptSrsWordId,
  toScoreBreakdownSnapshot,
  type JlptExamTemplateRow,
  type JlptQuestionRow,
  type JlptTemplateQuestionRow,
} from "@/lib/exams/jlpt-session";

const now = "2026-06-10T09:00:00.000Z";
const resolveAssetUrl = (path: string) => `https://cdn.test/${path}`;

const templateFixture: JlptExamTemplateRow = {
  id: "template-1",
  slug: "jlpt-n4-fixed",
  title: "JLPT N4 Fixed",
  description: "Template fixed untuk Phase 3",
  jlpt_level: "N4",
  time_limit_minutes: 125,
  passing_score: 90,
  is_published: true,
  generation_mode: "fixed",
  quota_config: {},
  category_id: "category-1",
  legacy_sanity_id: null,
  created_at: now,
  updated_at: now,
  category: { slug: "n4" },
};

function questionFixture(
  overrides: Partial<JlptQuestionRow> & Pick<JlptQuestionRow, "id" | "session_type">
): JlptQuestionRow {
  return {
    id: overrides.id,
    jlpt_level: "N4",
    session_type: overrides.session_type,
    mondai_number: 1,
    question_number: null,
    passage_id: null,
    prompt_html: "Pilih jawaban yang benar.",
    visual_path: null,
    audio_path: null,
    choices: [
      { type: "text", value: "A" },
      { type: "text", value: "B" },
    ],
    correct_choice_index: 0,
    explanation_html: null,
    difficulty: null,
    source_type: null,
    source_id: null,
    source_reference: null,
    is_published: true,
    created_at: now,
    updated_at: now,
    passage: null,
    ...overrides,
  };
}

function templateQuestionFixture(
  position: number,
  sectionOrder: number,
  question: JlptQuestionRow
): JlptTemplateQuestionRow {
  return {
    position,
    section_order: sectionOrder,
    question,
  };
}

describe("JLPT Supabase session helpers", () => {
  it("builds a fixed template package with stable ordering and resolved asset URLs", () => {
    const packageData = buildSupabaseExamPackage(
      templateFixture,
      [
        templateQuestionFixture(
          2,
          0,
          questionFixture({
            id: "question-2",
            session_type: "vocabulary",
            visual_path: "exam-assets/questions/q2.webp",
            choices: [
              { type: "text", value: "kata" },
              { type: "image", value: "exam-assets/choices/q2-b.webp", alt: "gambar" },
            ],
          })
        ),
        templateQuestionFixture(
          1,
          0,
          questionFixture({
            id: "question-1",
            session_type: "vocabulary",
            audio_path: "audio/q1.mp3",
            passage: {
              id: "passage-1",
              jlpt_level: "N4",
              session_type: "reading",
              mondai_number: 1,
              title: "Bacaan pendek",
              content_html: "<p>本文</p>",
              transcript_html: null,
              audio_path: "exam-assets/passages/p1.mp3",
              visual_path: null,
              source_label: null,
              is_published: true,
              created_at: now,
              updated_at: now,
            },
          })
        ),
      ],
      resolveAssetUrl
    );

    expect(packageData).toMatchObject({
      id: "template-1",
      title: "JLPT N4 Fixed",
      categorySlug: "n4",
      timeLimitMinutes: 125,
    });
    expect(packageData.questions.map((question) => question.id)).toEqual([
      "question-1",
      "question-2",
    ]);
    expect(packageData.questions[0].audioUrl).toBe("https://cdn.test/audio/q1.mp3");
    expect(packageData.questions[0].passage?.audioUrl).toBe(
      "https://cdn.test/passages/p1.mp3"
    );
    expect(packageData.questions[1].visualUrl).toBe(
      "https://cdn.test/questions/q2.webp"
    );
    expect(packageData.questions[1].choices[1]).toEqual({
      type: "image",
      value: "https://cdn.test/choices/q2-b.webp",
      alt: "gambar",
    });
  });

  it("scores submitted answers server-side and records wrong-answer SRS candidates", () => {
    const packageData = buildSupabaseExamPackage(
      templateFixture,
      [
        templateQuestionFixture(
          1,
          0,
          questionFixture({ id: "q-vocab", session_type: "vocabulary" })
        ),
        templateQuestionFixture(
          2,
          1,
          questionFixture({
            id: "q-grammar",
            session_type: "grammar",
            correct_choice_index: 1,
            source_type: "grammar",
            source_id: "te-form",
          })
        ),
        templateQuestionFixture(
          3,
          2,
          questionFixture({
            id: "q-reading",
            session_type: "reading",
            source_type: "reading",
            source_id: "reading-1",
          })
        ),
        templateQuestionFixture(
          4,
          3,
          questionFixture({ id: "q-listening", session_type: "listening" })
        ),
      ],
      resolveAssetUrl
    );

    const result = calculateJlptExamSubmission(packageData, {
      "q-vocab": 0,
      "q-grammar": 0,
      "q-listening": 0,
    });

    expect(result).toMatchObject({
      totalQuestions: 4,
      correctCount: 2,
      wrongCount: 1,
      unansweredCount: 1,
      totalScore: 90,
      failedSection: true,
      isPassed: false,
      answers: {
        "q-vocab": 0,
        "q-grammar": 0,
        "q-reading": null,
        "q-listening": 0,
      },
    });
    expect(result.answerRows).toContainEqual({
      questionId: "q-reading",
      selectedChoiceIndex: null,
      isCorrect: false,
    });
    expect(result.srsCandidates.map((item) => item.questionId)).toEqual([
      "q-grammar",
      "q-reading",
    ]);
  });

  it("maps SRS candidates into conservative new-card upsert rows", () => {
    expect(toJlptSrsWordId({ sourceType: "vocab", sourceId: "word-1" })).toBe(
      "word-1"
    );
    expect(
      toJlptSrsWordId({ sourceType: "grammar", sourceId: "te-form" })
    ).toBe("grammar:te-form");
    expect(
      toJlptSrsWordId({ sourceType: "reading", sourceId: "reading:essay-1" })
    ).toBe("reading:essay-1");
    expect(
      toJlptSrsWordId({ sourceType: "unsupported", sourceId: "source-1" })
    ).toBeNull();

    const rows = buildJlptSrsUpsertRows({
      userId: "user-1",
      completedAt: now,
      candidates: [
        {
          questionId: "q-vocab",
          sourceType: "vocab",
          sourceId: "word-1",
        },
        {
          questionId: "q-grammar",
          sourceType: "grammar",
          sourceId: "te-form",
        },
        {
          questionId: "q-grammar-duplicate",
          sourceType: "grammar",
          sourceId: "grammar:te-form",
        },
        {
          questionId: "q-reading",
          sourceType: "reading",
          sourceId: "reading-1",
        },
        {
          questionId: "q-empty",
          sourceType: "custom",
          sourceId: "  ",
        },
      ],
    });

    expect(rows).toEqual([
      {
        user_id: "user-1",
        word_id: "word-1",
        interval: 1,
        repetition: 0,
        ease_factor: 2.5,
        next_review: "2026-06-11T09:00:00.000Z",
        status: "learning",
        updated_at: now,
      },
      {
        user_id: "user-1",
        word_id: "grammar:te-form",
        interval: 1,
        repetition: 0,
        ease_factor: 2.5,
        next_review: "2026-06-11T09:00:00.000Z",
        status: "learning",
        updated_at: now,
      },
      {
        user_id: "user-1",
        word_id: "reading:reading-1",
        interval: 1,
        repetition: 0,
        ease_factor: 2.5,
        next_review: "2026-06-11T09:00:00.000Z",
        status: "learning",
        updated_at: now,
      },
    ]);
  });

  it("hydrates legacy exam and completed result from stored session snapshots", () => {
    const packageData = buildSupabaseExamPackage(
      templateFixture,
      [
        templateQuestionFixture(
          1,
          0,
          questionFixture({ id: "q-vocab", session_type: "vocabulary" })
        ),
      ],
      resolveAssetUrl
    );
    const score = calculateJlptExamSubmission(packageData, { "q-vocab": 0 });

    const legacyExam = packageSnapshotToLegacyExam(
      { ...packageData, sessionId: "session-1" },
      "session-1"
    );
    const storedResult = storedScoreSnapshotToResult({
      sessionId: "session-1",
      completedAt: now,
      scoreBreakdown: toScoreBreakdownSnapshot(score),
      answersSnapshot: score.answers,
    });

    expect(legacyExam).toMatchObject({
      id: "session-1",
      title: "JLPT N4 Fixed",
      levelCode: "n4",
    });
    expect(storedResult).toMatchObject({
      sessionId: "session-1",
      status: "completed",
      completedAt: now,
      totalScore: 180,
      isPassed: true,
      answers: { "q-vocab": 0 },
    });
  });
});
