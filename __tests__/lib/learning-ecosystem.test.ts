import { describe, expect, it } from "vitest";
import {
  buildDailyRoute,
  buildEcosystemRecommendations,
  buildWeakPointInsights,
  createLearningEvent,
  type LearningEvent,
} from "@/lib/learning-ecosystem";

describe("learning ecosystem recommendations", () => {
  it("mengubah reading selesai menjadi rekomendasi shadowing dan analyzer", () => {
    const event = createLearningEvent({
      type: "reading_completed",
      source: {
        type: "reading",
        slug: "tanaka-no-ichinichi",
        title: "Tanaka no Ichinichi",
        href: "/library/reading/tanaka-no-ichinichi",
        level: "N5",
      },
    });

    const recommendations = buildEcosystemRecommendations({ events: [event] });

    expect(recommendations.some((item) => item.href.includes("/tools/shadowing"))).toBe(true);
    expect(recommendations.some((item) => item.href.includes("/tools/text-analyzer"))).toBe(true);
  });

  it("memprioritaskan review ketika jawaban drill salah", () => {
    const event: LearningEvent = createLearningEvent({
      type: "jlpt_drill_answered",
      source: {
        type: "grammar",
        slug: "te-iru",
        title: "ている",
        href: "/library/grammar/te-iru",
        level: "N5",
      },
      details: {
        kind: "grammar",
        prompt: "ている",
        answer: "sedang",
        isCorrect: false,
      },
    });

    const [first] = buildEcosystemRecommendations({ events: [event] });

    expect(first.category).toBe("review");
    expect(first.href).toContain("kind=grammar");
  });

  it("menawarkan lanjut reading dari progress yang belum selesai", () => {
    const recommendations = buildEcosystemRecommendations({
      events: [],
      readingProgressMap: {
        "easy-story": {
          sourceId: "easy-story",
          sourceTitle: "Easy Story",
          lastParagraphIndex: 2,
          totalParagraphs: 5,
          elapsedSeconds: 90,
          updatedAt: Date.now(),
        },
      },
    });

    expect(recommendations[0].href).toBe("/library/reading/easy-story");
    expect(recommendations[0].category).toBe("continue");
  });

  it("mengubah kesalahan konjugasi menjadi retry dengan konteks verba", () => {
    const event = createLearningEvent({
      type: "conjugation_checked",
      source: {
        type: "vocab",
        slug: "kaku",
        title: "書く",
        href: "/library/vocab/kaku",
      },
      details: {
        kind: "conjugation",
        prompt: "書く",
        answer: "書て",
        isCorrect: false,
        focus: "godan",
        text: "te",
      },
    });

    const [first] = buildEcosystemRecommendations({ events: [event] });

    expect(first.category).toBe("review");
    expect(first.href).toContain("/tools/conjugation");
    expect(first.href).toContain("verb=%E6%9B%B8%E3%81%8F");
    expect(first.href).toContain("group=godan");
    expect(first.href).toContain("form=te");
  });

  it("mendeteksi titik lemah dari kesalahan berulang", () => {
    const events = [
      createLearningEvent({
        type: "counter_answered",
        source: {
          type: "tool",
          id: "counter-trainer",
          title: "Counter Trainer",
        },
        details: {
          kind: "counter",
          prompt: "ほん",
          answer: "枚",
          isCorrect: false,
        },
      }),
      createLearningEvent({
        type: "jlpt_drill_answered",
        source: {
          type: "grammar",
          slug: "te-iru",
          title: "ている",
          href: "/library/grammar/te-iru",
        },
        details: {
          kind: "grammar",
          prompt: "ている",
          answer: "lampau",
          isCorrect: false,
        },
      }),
    ];

    const insights = buildWeakPointInsights({ events });

    expect(insights.map((item) => item.category)).toContain("counter");
    expect(insights.map((item) => item.category)).toContain("grammar");
  });

  it("menyusun daily route dari progress reading dan titik lemah", () => {
    const event = createLearningEvent({
      type: "jlpt_drill_answered",
      source: {
        type: "grammar",
        slug: "te-iru",
        title: "ている",
        href: "/library/grammar/te-iru",
      },
      details: {
        kind: "grammar",
        prompt: "ている",
        answer: "lampau",
        isCorrect: false,
      },
    });

    const route = buildDailyRoute({
      events: [event],
      readingProgressMap: {
        story: {
          sourceId: "story",
          sourceTitle: "Story",
          lastParagraphIndex: 1,
          totalParagraphs: 4,
          elapsedSeconds: 60,
          updatedAt: Date.now(),
        },
      },
      readingVocabularyBank: {
        "story|朝|": {
          id: "story|朝|",
          word: "朝",
          slug: "asa",
          hitCount: 2,
          addedAt: Date.now(),
        },
      },
    });

    expect(route[0].category).toBe("continue");
    expect(route.some((step) => step.category === "review")).toBe(true);
    expect(route.some((step) => step.href.includes("kind=vocab"))).toBe(true);
  });
});
