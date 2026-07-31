import { describe, it, expect } from "vitest";
import {
  asShadowingLevel,
  textFromPortable,
  splitJapaneseLines,
  splitTranslationLines,
  createShadowingChunks,
  estimateTargetSeconds,
  pushShadowingPresetsFromSource,
  type LibraryLineSource,
} from "@/lib/services/tools/shadowing-helpers";
import type { ShadowingPreset } from "@/lib/shadowing-recorder";

describe("asShadowingLevel", () => {
  it("returns valid level", () => {
    expect(asShadowingLevel("N5")).toBe("N5");
    expect(asShadowingLevel("n4")).toBe("N4");
  });
  it("falls back to N3", () => {
    expect(asShadowingLevel("N2")).toBe("N3");
    expect(asShadowingLevel(null)).toBe("N3");
  });
});

describe("textFromPortable", () => {
  it("returns string as-is", () => {
    expect(textFromPortable("hello")).toBe("hello");
  });
  it("returns empty for null/undefined", () => {
    expect(textFromPortable(null)).toBe("");
    expect(textFromPortable(undefined)).toBe("");
  });
  it("extracts text from Portable Text blocks", () => {
    const blocks = [
      { children: [{ text: "Hello" }, { text: " World" }] },
      { children: [{ text: "Line 2" }] },
    ];
    expect(textFromPortable(blocks)).toBe("Hello World\nLine 2");
  });
  it("handles block with direct text property", () => {
    expect(textFromPortable([{ text: "Direct" }])).toBe("Direct");
  });
  it("handles object with text property", () => {
    expect(textFromPortable({ text: "Single" })).toBe("Single");
  });
});

describe("splitJapaneseLines", () => {
  it("splits by newline and sentence-ending punctuation", () => {
    const text = "これは日本語です。こちらもそうです。";
    const result = splitJapaneseLines(text);
    expect(result.length).toBeGreaterThanOrEqual(1);
    result.forEach((line) => {
      expect(line.length).toBeGreaterThanOrEqual(6);
    });
  });
  it("filters out non-Japanese lines", () => {
    const result = splitJapaneseLines("Hello world\nThis is English");
    expect(result).toHaveLength(0);
  });
  it("filters out short lines", () => {
    const result = splitJapaneseLines("あい");
    expect(result).toHaveLength(0);
  });
  it("strips speaker prefix", () => {
    const result = splitJapaneseLines("田中：これは日本語の文章です。");
    expect(result[0]).not.toContain("田中");
  });
});

describe("splitTranslationLines", () => {
  it("splits by sentence endings", () => {
    const result = splitTranslationLines("Ini kalimat satu. Ini kalimat dua.");
    expect(result.length).toBeGreaterThanOrEqual(1);
  });
  it("handles undefined", () => {
    expect(splitTranslationLines(undefined)).toEqual([]);
  });
});

describe("createShadowingChunks", () => {
  it("splits by commas", () => {
    const result = createShadowingChunks("これは日本語、とても面白い、ですね");
    expect(result.length).toBeLessThanOrEqual(4);
    expect(result.length).toBeGreaterThanOrEqual(2);
  });
  it("falls back to half-split for no comma text", () => {
    const result = createShadowingChunks("これは短い文章です");
    expect(result).toHaveLength(2);
  });
});

describe("estimateTargetSeconds", () => {
  it("returns 3 for short text", () => {
    expect(estimateTargetSeconds("ab")).toBe(3);
  });
  it("caps at 14 for very long text", () => {
    expect(estimateTargetSeconds("a".repeat(200))).toBe(14);
  });
  it("scales with length", () => {
    const short = estimateTargetSeconds("短い文");
    const long = estimateTargetSeconds("これはかなり長い日本語の文章です");
    expect(long).toBeGreaterThanOrEqual(short);
  });
});

describe("pushShadowingPresetsFromSource", () => {
  it("pushes presets from source with body text", () => {
    const presets: ShadowingPreset[] = [];
    const item: LibraryLineSource = {
      _id: "test-1",
      title: "テスト",
      slug: "test-slug",
      jlpt_level: "N5",
      body: "これは日本語のテスト文章です。もう一つの文章もあります。",
      translation: "Ini kalimat tes. Ada satu lagi.",
    };

    pushShadowingPresetsFromSource(presets, item, "reading");
    expect(presets.length).toBeGreaterThanOrEqual(1);
    expect(presets[0].sourceType).toBe("reading");
    expect(presets[0].id).toContain("library-reading-test-1");
  });

  it("handles empty body", () => {
    const presets: ShadowingPreset[] = [];
    pushShadowingPresetsFromSource(presets, { _id: "e", body: "" }, "listening");
    expect(presets).toHaveLength(0);
  });
});
