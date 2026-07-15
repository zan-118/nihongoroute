import { describe, it, expect } from "vitest";
import { createMiniDrill, MINI_DRILL_BANK } from "@/lib/tools/jlpt-mini-drill";

describe("jlpt-mini-drill", () => {
  describe("createMiniDrill", () => {
    it("harus membatasi jumlah soal sesuai ketersediaan pool dan tidak menduplikasi", () => {
      const customBank = [
        {
          id: "test-1",
          level: "N5" as const,
          kind: "vocab" as const,
          prompt: "Test 1",
          reading: "test 1",
          options: ["A", "B", "C", "D"],
          answer: "A",
          explanation: "Test 1 explanation",
        },
        {
          id: "test-2",
          level: "N5" as const,
          kind: "vocab" as const,
          prompt: "Test 2",
          reading: "test 2",
          options: ["A", "B", "C", "D"],
          answer: "B",
          explanation: "Test 2 explanation",
        },
      ];

      // Request 5 questions but only 2 exist in pool
      const questions = createMiniDrill({
        level: "N5",
        kind: "vocab",
        amount: 5,
        bank: customBank,
      });

      // Should be capped at 2 and have no duplicates
      expect(questions.length).toBe(2);
      expect(questions[0].id).not.toBe(questions[1].id);
    });

    it("harus menggunakan MINI_DRILL_BANK default jika tidak ada bank kustom yang diberikan", () => {
      const questions = createMiniDrill({
        level: "all",
        kind: "mixed",
        amount: 3,
      });

      expect(questions.length).toBe(3);
      expect(MINI_DRILL_BANK).toContain(questions[0]);
    });
  });
});
