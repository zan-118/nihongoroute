import { describe, it, expect } from "vitest";
import { splitFurigana } from "@/components/ui/japanese/splitFurigana";

describe("splitFurigana", () => {
  it("should return single chunk if text has no furigana or matches reading", () => {
    expect(splitFurigana("ねこ", "ねこ")).toEqual([{ text: "ねこ" }]);
    expect(splitFurigana("たべる", "")).toEqual([{ text: "たべる" }]);
  });

  it("should correctly pair kanji with furigana reading", () => {
    const result = splitFurigana("日本語", "にほんご");
    expect(result).toEqual([
      { text: "日本語", furi: "にほんご" },
    ]);
  });

  it("should correctly separate kanji and trailing hiragana okurigana", () => {
    const result = splitFurigana("食べる", "たべる");
    expect(result).toEqual([
      { text: "食", furi: "た" },
      { text: "べる" },
    ]);
  });

  it("should handle compound kanji-hiragana-kanji words", () => {
    const result = splitFurigana("取り出し", "とりだし");
    expect(result.length).toBeGreaterThan(0);
    expect(result[0].text).toBe("取");
    expect(result[0].furi).toBe("と");
  });
});
