import { describe, it, expect } from "vitest";
import {
  asCounterLevel,
  detectCounter,
} from "@/lib/services/tools/counter-helpers";

describe("asCounterLevel", () => {
  it("returns N5 for n5", () => {
    expect(asCounterLevel("n5")).toBe("N5");
  });
  it("returns N4 for n4", () => {
    expect(asCounterLevel("N4")).toBe("N4");
  });
  it("falls back to N4 for invalid", () => {
    expect(asCounterLevel("N3")).toBe("N4");
    expect(asCounterLevel(null)).toBe("N4");
  });
});

describe("detectCounter", () => {
  it("detects 人 counter for person kanji", () => {
    const result = detectCounter("友達");
    expect(result).not.toBeNull();
    expect(result!.answer).toBe("人");
    expect(result!.category).toBe("orang");
  });

  it("detects 冊 counter for book kanji", () => {
    const result = detectCounter("辞典");
    expect(result).not.toBeNull();
    expect(result!.answer).toBe("冊");
  });

  it("detects 本 counter for long objects", () => {
    const result = detectCounter("傘");
    expect(result).not.toBeNull();
    expect(result!.answer).toBe("本");
  });

  it("detects 枚 counter for flat objects", () => {
    const result = detectCounter("写真");
    expect(result).not.toBeNull();
    expect(result!.answer).toBe("枚");
  });

  it("detects 匹 counter for small animals", () => {
    const result = detectCounter("猫");
    expect(result).not.toBeNull();
    expect(result!.answer).toBe("匹");
  });

  it("detects 台 counter for machines", () => {
    const result = detectCounter("車");
    expect(result).not.toBeNull();
    expect(result!.answer).toBe("台");
  });

  it("detects 杯 counter for drinks", () => {
    const result = detectCounter("茶");
    expect(result).not.toBeNull();
    expect(result!.answer).toBe("杯");
  });

  it("returns null for unmatched word", () => {
    expect(detectCounter("abc")).toBeNull();
    expect(detectCounter("")).toBeNull();
  });
});
