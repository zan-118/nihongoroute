import { describe, expect, it } from "vitest";
import {
  conjugateVerb,
  isConjugationAnswerCorrect,
} from "@/lib/verb-conjugation";
import { getJapaneseTextStats } from "@/lib/tools-search";

describe("verb conjugation helpers", () => {
  it("mengubah verba godan ke bentuk utama", () => {
    const result = conjugateVerb("\u66f8\u304f", "godan");

    expect(result.forms.masu).toBe("\u66f8\u304d\u307e\u3059");
    expect(result.forms.te).toBe("\u66f8\u3044\u3066");
    expect(result.forms.nai).toBe("\u66f8\u304b\u306a\u3044");
    expect(result.forms.potential).toBe("\u66f8\u3051\u308b");
  });

  it("menangani pengecualian iku untuk bentuk te dan ta", () => {
    const result = conjugateVerb("\u884c\u304f", "godan");

    expect(result.forms.te).toBe("\u884c\u3063\u3066");
    expect(result.forms.ta).toBe("\u884c\u3063\u305f");
  });

  it("mengubah verba ichidan ke bentuk utama", () => {
    const result = conjugateVerb("\u98df\u3079\u308b", "ichidan");

    expect(result.forms.masu).toBe("\u98df\u3079\u307e\u3059");
    expect(result.forms.te).toBe("\u98df\u3079\u3066");
    expect(result.forms.passive).toBe("\u98df\u3079\u3089\u308c\u308b");
  });

  it("menangani suru dan kuru sebagai irregular", () => {
    expect(conjugateVerb("\u3059\u308b", "irregular").forms.potential).toBe(
      "\u3067\u304d\u308b"
    );
    expect(conjugateVerb("\u6765\u308b", "irregular").forms.nai).toBe(
      "\u6765\u306a\u3044"
    );
  });

  it("menormalisasi jawaban user sebelum dibandingkan", () => {
    expect(isConjugationAnswerCorrect("\u66f8\u3044\u3066", " \u66f8\u3044\u3066 ")).toBe(true);
  });
});

describe("text analyzer stats", () => {
  it("menghitung karakter Jepang, kana, dan kanji unik", () => {
    const stats = getJapaneseTextStats("\u65e5\u672c\u8a9e\u3092\u8aad\u307f\u307e\u3059");

    expect(stats.japaneseCharCount).toBeGreaterThan(0);
    expect(stats.kanaCount).toBeGreaterThan(0);
    expect(stats.uniqueKanji).toContain("\u65e5");
    expect(stats.uniqueKanji).toContain("\u8a9e");
  });
});
