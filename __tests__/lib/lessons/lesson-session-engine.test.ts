import { describe, it, expect } from "vitest";
import { LessonSessionEngine, LessonSectionItem } from "@/lib/lessons/lesson-session-engine";

const MOCK_SECTIONS: LessonSectionItem[] = [
  { id: "dialogue", title: "Percakapan", itemCount: 5 },
  { id: "vocab", title: "Kosakata", itemCount: 10 },
  { id: "kanji", title: "Kanji", itemCount: 4 },
  { id: "practice", title: "Latihan", itemCount: 3 },
];

describe("LessonSessionEngine Seam", () => {
  it("harus menginisialisasi sesi pelajaran dan seksi aktif", () => {
    const engine = new LessonSessionEngine({
      lessonId: "n5-lesson-1",
      sections: MOCK_SECTIONS,
    });

    expect(engine.getLessonId()).toBe("n5-lesson-1");
    expect(engine.getActiveSectionIndex()).toBe(0);
    expect(engine.getActiveSection()?.id).toBe("dialogue");
    expect(engine.getProgressPercentage()).toBe(0);
    expect(engine.isFullyCompleted()).toBe(false);
  });

  it("harus menandai seksi selesai dan menghitung persentase progres", () => {
    const engine = new LessonSessionEngine({
      lessonId: "n5-lesson-1",
      sections: MOCK_SECTIONS,
    });

    engine.markSectionComplete("dialogue");
    expect(engine.isSectionCompleted("dialogue")).toBe(true);
    expect(engine.getProgressPercentage()).toBe(25);

    engine.markSectionComplete("vocab");
    expect(engine.getProgressPercentage()).toBe(50);
  });

  it("harus mendukung navigasi seksi dan lompatan antar seksi", () => {
    const engine = new LessonSessionEngine({
      lessonId: "n5-lesson-1",
      sections: MOCK_SECTIONS,
    });

    expect(engine.nextSection()).toBe(true);
    expect(engine.getActiveSection()?.id).toBe("vocab");

    expect(engine.jumpToSection("practice")).toBe(true);
    expect(engine.getActiveSection()?.id).toBe("practice");

    expect(engine.previousSection()).toBe(true);
    expect(engine.getActiveSection()?.id).toBe("kanji");
  });

  it("harus memverifikasi kelengkapan total bab saat semua seksi selesai", () => {
    const engine = new LessonSessionEngine({
      lessonId: "n5-lesson-1",
      sections: MOCK_SECTIONS,
    });

    MOCK_SECTIONS.forEach((s) => engine.markSectionComplete(s.id));
    expect(engine.getProgressPercentage()).toBe(100);
    expect(engine.isFullyCompleted()).toBe(true);
  });
});
