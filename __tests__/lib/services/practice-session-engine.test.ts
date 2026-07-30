import { describe, it, expect } from "vitest";
import {
  assemblePracticeDeck,
  generateAdaptiveDistractors,
  evaluateSessionScore,
  shuffleArray,
} from "@/lib/services/practice-session-engine";

describe("PracticeSessionEngine Unit Tests", () => {
  describe("assemblePracticeDeck", () => {
    it("harus menyusun dek latihan dengan jumlah limit yang ditentukan", () => {
      const items = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
      const deck = assemblePracticeDeck({ items, limit: 5, shuffle: false });

      expect(deck).toHaveLength(5);
      expect(deck).toEqual([1, 2, 3, 4, 5]);
    });

    it("harus mengembalikan array kosong jika pool item kosong", () => {
      const deck = assemblePracticeDeck({ items: [], limit: 5 });
      expect(deck).toHaveLength(0);
    });
  });

  describe("generateAdaptiveDistractors", () => {
    it("harus menghasilkan opsi distraktor tanpa memasukkan item jawaban benar", () => {
      const target = { id: "1", word: "日本語" };
      const pool = [
        { id: "1", word: "日本語" },
        { id: "2", word: "英語" },
        { id: "3", word: "韓国語" },
        { id: "4", word: "中国語" },
      ];

      const distractors = generateAdaptiveDistractors({
        target,
        candidatePool: pool,
        getKey: (item) => item.id,
        count: 2,
      });

      expect(distractors).toHaveLength(2);
      expect(distractors.some((d) => d.id === "1")).toBe(false);
    });

    it("harus menyaring duplikasi opsi pengacau berdasarkan kunci unik", () => {
      const target = { id: "1", word: "A" };
      const pool = [
        { id: "2", word: "B" },
        { id: "2", word: "B" },
        { id: "3", word: "C" },
      ];

      const distractors = generateAdaptiveDistractors({
        target,
        candidatePool: pool,
        getKey: (item) => item.id,
        count: 3,
      });

      expect(distractors).toHaveLength(2);
    });
  });

  describe("evaluateSessionScore", () => {
    it("harus mengalkulasi akurasi persentase dan perolehan XP dengan benar", () => {
      const result = evaluateSessionScore({
        totalQuestions: 10,
        correctCount: 8,
        xpPerCorrect: 10,
      });

      expect(result.accuracy).toBe(80);
      expect(result.totalXp).toBe(80);
      expect(result.isPerfect).toBe(false);
    });

    it("harus memberikan bonus skor untuk hasil sempurna (perfect score)", () => {
      const result = evaluateSessionScore({
        totalQuestions: 5,
        correctCount: 5,
        durationSeconds: 15,
        xpPerCorrect: 10,
      });

      expect(result.accuracy).toBe(100);
      expect(result.isPerfect).toBe(true);
      expect(result.speedBonus).toBe(20);
      expect(result.totalXp).toBe(80); // 50 (base) + 20 (speed) + 10 (perfect)
    });
  });
});
