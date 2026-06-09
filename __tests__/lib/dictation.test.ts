import { describe, expect, it } from "vitest";
import {
  evaluateDictation,
  extractDictationText,
  normalizeDictationText,
} from "@/lib/dictation";

describe("dictation helpers", () => {
  it("menormalisasi spasi, tanda baca, dan variasi width", () => {
    expect(normalizeDictationText(" こんにちは、世界！ ")).toBe("こんにちは世界");
    expect(normalizeDictationText("ｶﾀｶﾅ")).toBe("かたかな");
  });

  it("menilai jawaban exact setelah normalisasi", () => {
    const result = evaluateDictation("すみません、駅はどこですか。", "すみません 駅はどこですか");

    expect(result.isExact).toBe(true);
    expect(result.accuracy).toBe(100);
    expect(result.isPassed).toBe(true);
  });

  it("memberi skor parsial untuk jawaban yang hampir benar", () => {
    const result = evaluateDictation("きょうはとても寒いです", "きょうは寒いです");

    expect(result.isExact).toBe(false);
    expect(result.accuracy).toBeGreaterThan(50);
    expect(result.accuracy).toBeLessThan(100);
  });

  it("mengekstrak teks dari portable text sederhana", () => {
    expect(
      extractDictationText([
        {
          children: [{ text: "駅まで" }, { text: "お願いします" }],
        },
      ])
    ).toBe("駅までお願いします");
  });
});
