import { describe, it, expect } from "vitest";
import {
  formatReadingDuration,
  computeReadingMetrics,
} from "@/features/library/reading/utils/reading-metrics";

describe("formatReadingDuration", () => {
  it("memformat detik dalam MM:SS", () => {
    expect(formatReadingDuration(0)).toBe("0:00");
    expect(formatReadingDuration(65)).toBe("1:05");
    expect(formatReadingDuration(3599)).toBe("59:59");
  });

  it("memformat durasi di atas satu jam menjadi Xj Ym", () => {
    expect(formatReadingDuration(3600)).toBe("1j 0m");
    expect(formatReadingDuration(3661)).toBe("1j 1m");
    expect(formatReadingDuration(7200 + 120)).toBe("2j 2m");
  });

  it("menangani nilai negatif dan desimal dengan aman", () => {
    expect(formatReadingDuration(-5)).toBe("0:00");
    expect(formatReadingDuration(90.9)).toBe("1:30");
  });
});

describe("computeReadingMetrics", () => {
  const base = {
    activeParagraphIndex: 0,
    elapsedSeconds: 0,
    totalParagraphs: 0,
    fallbackParagraphCount: 10,
    characterCount: 500,
  };

  it("menggunakan fallbackParagraphCount bila snapshot kosong", () => {
    const m = computeReadingMetrics(base);
    expect(m.totalParagraphs).toBe(10);
    expect(m.currentParagraph).toBe(1);
    expect(m.readingCompletionPercent).toBe(10);
  });

  it("menghitung pace 0 sebelum 15 detik berlalu", () => {
    const m = computeReadingMetrics({ ...base, elapsedSeconds: 14 });
    expect(m.readingPace).toBe(0);
  });

  it("menghitung pace setelah 15 detik (estimatedUnits / menit)", () => {
    // 500 karakter / 5 = 100 unit; 30 detik = 0.5 menit → pace = 200
    const m = computeReadingMetrics({ ...base, elapsedSeconds: 30 });
    expect(m.estimatedReadingUnits).toBe(100);
    expect(m.readingPace).toBe(200);
  });

  it("membatasi currentParagraph maksimum = total", () => {
    const m = computeReadingMetrics({
      ...base,
      activeParagraphIndex: 50,
      totalParagraphs: 10,
    });
    expect(m.currentParagraph).toBe(10);
    expect(m.readingCompletionPercent).toBe(100);
  });

  it("menghitung persentase dari indeks aktif", () => {
    const m = computeReadingMetrics({
      ...base,
      activeParagraphIndex: 4,
      totalParagraphs: 10,
    });
    expect(m.currentParagraph).toBe(5);
    expect(m.readingCompletionPercent).toBe(50);
  });
});
