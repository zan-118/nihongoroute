import { describe, it, expect, vi } from "vitest";
import { getSentencesByWord, getRandomSentencesForDrill } from "@/actions/sentences.actions";

vi.mock("@/lib/services/content-repository", () => ({
  getSentencesContainingWord: vi.fn().mockImplementation((word: string) => {
    if (word === "taberu") {
      return Promise.resolve([
        {
          id: "sent-1",
          japanese: "ご飯を食べる。",
          english: "Eat rice.",
          indonesia: "Makan nasi.",
          jlpt_level: "N5",
          furigana: "ごはんをたべる。",
        },
      ]);
    }
    return Promise.resolve([]);
  }),
  getRandomSentencesPool: vi.fn().mockResolvedValue([
    {
      id: "sent-1",
      japanese: "ご飯を食べる。",
      english: "Eat rice.",
      indonesia: "Makan nasi.",
      jlpt_level: "N5",
      furigana: "ごはんをたべる。",
    },
  ]),
}));

describe("Sentences Actions Integration Test", () => {
  it("harus mengambil kalimat berdasarkan kata", async () => {
    const sentences = await getSentencesByWord("taberu", 5);
    expect(sentences).toBeDefined();
    expect(sentences.length).toBe(1);
  });

  it("harus mengambil kalimat acak untuk latihan via getRandomSentencesForDrill", async () => {
    const sentences = await getRandomSentencesForDrill("N5", 5);
    expect(sentences).toBeDefined();
    expect(sentences.length).toBe(1);
  });
});
