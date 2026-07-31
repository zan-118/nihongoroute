import { describe, it, expect } from "vitest";
import {
  compactText,
  uniqueValues,
  uniqueRowsById,
  safeDecodeHref,
  asDrillLevel,
  getDrillLevelFilter,
  getDrillKindFilter,
  getToolsSource,
  shuffleBySeed,
  buildOptions,
  sourceHrefMatches,
  sortMiniDrillByContext,
} from "@/lib/services/tools/mini-drill-helpers";
import type { MiniDrillQuestion } from "@/lib/jlpt-mini-drill";

describe("compactText", () => {
  it("trims and collapses whitespace", () => {
    expect(compactText("  hello   world  ")).toBe("hello world");
  });
  it("handles null/undefined", () => {
    expect(compactText(null)).toBe("");
    expect(compactText(undefined)).toBe("");
  });
});

describe("uniqueValues", () => {
  it("deduplicates and filters empty", () => {
    expect(uniqueValues(["a", "b", "a", "", "b"])).toEqual(["a", "b"]);
  });
});

describe("uniqueRowsById", () => {
  it("keeps first occurrence by id", () => {
    const rows = [
      { id: "1", name: "first" },
      { id: "2", name: "second" },
      { id: "1", name: "duplicate" },
    ];
    const result = uniqueRowsById(rows);
    expect(result).toHaveLength(2);
    expect(result[0].name).toBe("first");
  });
});

describe("safeDecodeHref", () => {
  it("decodes encoded URI", () => {
    expect(safeDecodeHref("/path/%E6%97%A5")).toBe("/path/日");
  });
  it("returns empty for undefined", () => {
    expect(safeDecodeHref(undefined)).toBe("");
  });
});

describe("asDrillLevel", () => {
  it("returns valid level", () => {
    expect(asDrillLevel("n3")).toBe("N3");
  });
  it("falls back to N5", () => {
    expect(asDrillLevel("invalid")).toBe("N5");
    expect(asDrillLevel(null)).toBe("N5");
  });
});

describe("getDrillLevelFilter", () => {
  it("returns DrillLevel for valid input", () => {
    expect(getDrillLevelFilter("N4")).toBe("N4");
  });
  it("returns undefined for empty/invalid", () => {
    expect(getDrillLevelFilter("")).toBeUndefined();
    expect(getDrillLevelFilter("X1")).toBeUndefined();
  });
});

describe("getDrillKindFilter", () => {
  it("returns DrillKind for valid input", () => {
    expect(getDrillKindFilter("vocab")).toBe("vocab");
    expect(getDrillKindFilter("KANJI")).toBe("kanji");
  });
  it("returns undefined for invalid", () => {
    expect(getDrillKindFilter("math")).toBeUndefined();
  });
});

describe("getToolsSource", () => {
  it("returns ToolsSource for valid input", () => {
    expect(getToolsSource("reading")).toBe("reading");
  });
  it("returns undefined for invalid", () => {
    expect(getToolsSource("video")).toBeUndefined();
  });
});

describe("shuffleBySeed", () => {
  it("is deterministic — same seed same result", () => {
    const items = [1, 2, 3, 4, 5];
    const a = shuffleBySeed(items, "test-seed");
    const b = shuffleBySeed(items, "test-seed");
    expect(a).toEqual(b);
  });
  it("different seeds produce different results", () => {
    const items = [1, 2, 3, 4, 5, 6, 7, 8];
    const a = shuffleBySeed(items, "seed-a");
    const b = shuffleBySeed(items, "seed-b");
    expect(a).not.toEqual(b);
  });
  it("does not mutate original", () => {
    const items = [1, 2, 3];
    shuffleBySeed(items, "x");
    expect(items).toEqual([1, 2, 3]);
  });
});

describe("buildOptions", () => {
  it("includes correct answer", () => {
    const opts = buildOptions("kucing", ["anjing", "burung", "kucing", "ikan"], "seed");
    expect(opts).toContain("kucing");
  });
  it("has at least 2 options", () => {
    const opts = buildOptions("a", ["b", "c", "d"], "x");
    expect(opts.length).toBeGreaterThanOrEqual(2);
  });
});

describe("sourceHrefMatches", () => {
  it("matches slug at end of href", () => {
    expect(sourceHrefMatches("/library/vocab/neko", "neko")).toBe(true);
  });
  it("rejects non-matching slug", () => {
    expect(sourceHrefMatches("/library/vocab/inu", "neko")).toBe(false);
  });
  it("handles undefined", () => {
    expect(sourceHrefMatches(undefined, "neko")).toBe(false);
    expect(sourceHrefMatches("/path", undefined)).toBe(false);
  });
});

describe("sortMiniDrillByContext", () => {
  it("prioritizes matching slug", () => {
    const questions = [
      { id: "1", sourceHref: "/library/vocab/other", kind: "vocab", level: "N5" },
      { id: "2", sourceHref: "/library/vocab/target", kind: "vocab", level: "N5" },
    ] as MiniDrillQuestion[];

    const sorted = sortMiniDrillByContext(questions, { slug: "target" });
    expect(sorted[0].id).toBe("2");
  });
});
