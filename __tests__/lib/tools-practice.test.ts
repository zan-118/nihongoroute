import { describe, expect, it } from "vitest";
import {
  getParticleQuestion,
  isParticleAnswerCorrect,
  normalizeParticleAnswer,
  PARTICLE_QUESTIONS,
} from "@/lib/particle-trainer";
import {
  isBuiltSentenceCorrect,
  normalizeBuiltSentence,
  SENTENCE_BUILDER_PROMPTS,
  shuffleSentenceTokens,
} from "@/lib/sentence-builder";
import { getSimilarKanjiPair, SIMILAR_KANJI_PAIRS } from "@/lib/kanji-similarity";

describe("particle trainer", () => {
  it("menormalisasi dan mengecek jawaban partikel", () => {
    expect(normalizeParticleAnswer(" は ")).toBe("は");
    expect(isParticleAnswerCorrect("は", " は ")).toBe(true);
    expect(isParticleAnswerCorrect("が", "は")).toBe(false);
  });

  it("mengambil soal secara melingkar", () => {
    expect(getParticleQuestion(PARTICLE_QUESTIONS.length).id).toBe(PARTICLE_QUESTIONS[0].id);
  });
});

describe("sentence builder", () => {
  it("menormalisasi token kalimat tanpa spasi", () => {
    expect(normalizeBuiltSentence(["日本語", "を", "勉強します", "。"])).toBe(
      "日本語を勉強します。"
    );
  });

  it("mengecek urutan token yang benar", () => {
    const prompt = SENTENCE_BUILDER_PROMPTS[0];

    expect(isBuiltSentenceCorrect(prompt.tokens, prompt.tokens)).toBe(true);
    expect(isBuiltSentenceCorrect(prompt.tokens, [...prompt.tokens].reverse())).toBe(false);
  });

  it("mengacak token tanpa mengubah jumlah token", () => {
    const prompt = SENTENCE_BUILDER_PROMPTS[1];
    const shuffled = shuffleSentenceTokens(prompt.tokens, prompt.id);

    expect(shuffled).toHaveLength(prompt.tokens.length);
    expect([...shuffled].sort()).toEqual([...prompt.tokens].sort());
  });
});

describe("kanji similarity", () => {
  it("mengembalikan pasangan default saat id tidak ditemukan", () => {
    expect(getSimilarKanjiPair("missing").id).toBe(SIMILAR_KANJI_PAIRS[0].id);
  });
});
