import { describe, expect, it } from "vitest";
import {
  toLegacyExamData,
  type SupabaseExamPackage,
} from "@/lib/exams/supabase-adapter";

const packageFixture: SupabaseExamPackage = {
  id: "template-n4-1",
  templateId: "template-n4-1",
  sessionId: "session-1",
  title: "JLPT N4 Paket 1",
  description: "Paket bank soal Supabase",
  jlptLevel: "N4",
  timeLimitMinutes: 125,
  passingScore: 90,
  categorySlug: "n4",
  choukaiAudioUrl: "https://example.com/choukai.mp3",
  questions: [
    {
      id: "question-1",
      sessionType: "vocabulary",
      promptHtml: "Pilih arti kata berikut.",
      choices: [
        { type: "text", value: "makan" },
        { type: "text", value: "minum" },
      ],
      correctChoiceIndex: 1,
    },
    {
      id: "question-2",
      sessionType: "reading",
      promptHtml: "Pertanyaan bacaan",
      visualUrl: "https://example.com/question.webp",
      passage: {
        id: "passage-1",
        contentHtml: "<p>Bacaan pendek</p>",
        visualUrl: "https://example.com/passage.webp",
      },
      choices: [
        { type: "image", value: "exam-assets/a.webp", alt: "Gambar A" },
        { type: "image", value: "exam-assets/b.webp" },
      ],
      correctChoiceIndex: 0,
    },
  ],
};

describe("toLegacyExamData", () => {
  it("maps package metadata into the existing MockExamEngine contract", () => {
    const exam = toLegacyExamData(packageFixture);

    expect(exam).toMatchObject({
      id: "session-1",
      title: "JLPT N4 Paket 1",
      timeLimit: 125,
      passingScore: 90,
      description: "Paket bank soal Supabase",
      categorySlug: "n4",
      levelCode: "n4",
      choukaiAudioUrl: "https://example.com/choukai.mp3",
    });
  });

  it("maps questions into legacy question keys, sections, options, and answers", () => {
    const exam = toLegacyExamData(packageFixture);

    expect(exam.questions[0]).toMatchObject({
      _key: "question-1",
      section: "vocabulary",
      questionText: "Pilih arti kata berikut.",
      imageUrl: null,
      audioUrl: null,
      options: ["makan", "minum"],
      correctAnswer: 1,
      choices: [
        { type: "text", value: "makan" },
        { type: "text", value: "minum" },
      ],
      passage: null,
    });
  });

  it("keeps safe text fallbacks while passing rich image choices and passage data", () => {
    const exam = toLegacyExamData(packageFixture);

    expect(exam.questions[1]).toMatchObject({
      _key: "question-2",
      section: "reading",
      imageUrl: "https://example.com/question.webp",
      options: ["Gambar A", "Pilihan gambar 2"],
      correctAnswer: 0,
      choices: [
        { type: "image", value: "exam-assets/a.webp", alt: "Gambar A" },
        { type: "image", value: "exam-assets/b.webp" },
      ],
      passage: {
        id: "passage-1",
        contentHtml: "<p>Bacaan pendek</p>",
        visualUrl: "https://example.com/passage.webp",
      },
    });
  });
});
