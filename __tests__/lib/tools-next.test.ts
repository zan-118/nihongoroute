import { describe, expect, it } from "vitest";
import {
  createMiniDrill,
  isMiniDrillAnswerCorrect,
  MINI_DRILL_BANK,
} from "@/lib/jlpt-mini-drill";
import {
  COUNTER_QUESTIONS,
  formatCounterPrompt,
  getCounterQuestion,
  isCounterAnswerCorrect,
  normalizeCounterAnswer,
} from "@/lib/counter-trainer";
import {
  formatShadowingDuration,
  getShadowingPaceLabel,
  getShadowingPreset,
  SHADOWING_PRESETS,
} from "@/lib/shadowing-recorder";

describe("jlpt mini drill", () => {
  it("membuat drill sesuai filter level dan tipe", () => {
    const drill = createMiniDrill({
      level: "N5",
      kind: "grammar",
      amount: 4,
      seed: "test",
    });

    expect(drill).toHaveLength(4);
    expect(drill.every((question) => question.level === "N5")).toBe(true);
    expect(drill.every((question) => question.kind === "grammar")).toBe(true);
  });

  it("membatasi jumlah soal dan menormalisasi jawaban", () => {
    const drill = createMiniDrill({ level: "all", kind: "mixed", amount: 99 });

    expect(drill).toHaveLength(20);
    expect(isMiniDrillAnswerCorrect("Air", " air ")).toBe(true);
    expect(MINI_DRILL_BANK.length).toBeGreaterThan(10);
  });

  it("bisa memakai bank soal eksternal dari database", () => {
    const drill = createMiniDrill({
      level: "N5",
      kind: "vocab",
      amount: 1,
      bank: [
        {
          id: "db-vocab-test",
          level: "N5",
          kind: "vocab",
          prompt: "水",
          reading: "みず",
          answer: "air",
          options: ["air", "api"],
          explanation: "水 berarti air.",
          sourceHref: "/library/vocab/mizu",
          sourceType: "database",
        },
      ],
    });

    expect(drill[0].id).toBe("db-vocab-test");
    expect(drill[0].sourceHref).toBe("/library/vocab/mizu");
  });
});

describe("counter trainer", () => {
  it("mengambil soal counter secara melingkar", () => {
    expect(getCounterQuestion(COUNTER_QUESTIONS.length).id).toBe(COUNTER_QUESTIONS[0].id);
    expect(getCounterQuestion(-1).id).toBe(COUNTER_QUESTIONS[COUNTER_QUESTIONS.length - 1].id);
  });

  it("menormalisasi jawaban counter dan membentuk prompt", () => {
    const question = COUNTER_QUESTIONS[0];

    expect(normalizeCounterAnswer(" 人 ")).toBe("人");
    expect(isCounterAnswerCorrect("人", " 人 ")).toBe(true);
    expect(formatCounterPrompt(question)).toContain("___");
  });

  it("bisa mengambil soal counter dari bank eksternal", () => {
    const custom = {
      ...COUNTER_QUESTIONS[0],
      id: "db-counter-test",
      sourceHref: "/library/vocab/tomodachi",
      sourceType: "database" as const,
    };

    expect(getCounterQuestion(0, [custom]).id).toBe("db-counter-test");
    expect(getCounterQuestion(1, [custom]).sourceHref).toBe("/library/vocab/tomodachi");
  });
});

describe("shadowing recorder data", () => {
  it("menyediakan preset shadowing dengan chunk latihan", () => {
    const preset = getShadowingPreset(SHADOWING_PRESETS.length);

    expect(preset.id).toBe(SHADOWING_PRESETS[0].id);
    expect(SHADOWING_PRESETS.every((item) => item.chunks.length > 0)).toBe(true);
  });

  it("memformat durasi dan memberi label tempo", () => {
    expect(formatShadowingDuration(65)).toBe("01:05");
    expect(getShadowingPaceLabel(0, 5)).toBe("Belum direkam");
    expect(getShadowingPaceLabel(2, 5)).toBe("Terlalu cepat");
    expect(getShadowingPaceLabel(5, 5)).toBe("Tempo mendekati target");
    expect(getShadowingPaceLabel(9, 5)).toBe("Terlalu lambat");
  });
});
