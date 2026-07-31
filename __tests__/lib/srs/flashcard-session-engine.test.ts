import { describe, it, expect } from "vitest";
import { FlashcardSessionEngine } from "@/lib/srs/flashcard-session-engine";
import { createNewCardState } from "@/lib/learning/srs";
import type { MasterCardData } from "@/features/review/flashcards/master/types";

const MOCK_CARDS: MasterCardData[] = [
  {
    id: "card-1",
    docType: "vocab",
    word: "食べる",
    meaning: "Makan",
  },
  {
    id: "card-2",
    docType: "vocab",
    word: "飲む",
    meaning: "Minum",
  },
];

describe("FlashcardSessionEngine Seam", () => {
  it("harus menginisialisasi sesi flashcard dan kartu aktif", () => {
    const engine = new FlashcardSessionEngine(MOCK_CARDS);
    expect(engine.getCurrentIndex()).toBe(0);
    expect(engine.getCurrentCard()?.word).toBe("食べる");
    expect(engine.isFinished()).toBe(false);
  });

  it("harus memproses grade SRS dan mengakumulasi statistik kombo & XP", () => {
    const engine = new FlashcardSessionEngine(MOCK_CARDS);
    const initialSRS = createNewCardState();

    // Grade 3 (Easy = 20 XP)
    const result1 = engine.processGrade(3, initialSRS);
    expect(result1.isCorrect).toBe(true);
    expect(result1.xpReward).toBe(20);
    expect(result1.stats.known).toBe(1);
    expect(result1.stats.combo).toBe(1);
    expect(result1.stats.accuracy).toBe(100);

    // Navigasi ke kartu 2
    expect(engine.next()).toBe(true);
    expect(engine.getCurrentIndex()).toBe(1);

    // Grade 0 (Again = 5 XP, reset combo)
    const result2 = engine.processGrade(0, initialSRS);
    expect(result2.isCorrect).toBe(false);
    expect(result2.stats.learning).toBe(1);
    expect(result2.stats.combo).toBe(0);
    expect(result2.stats.maxCombo).toBe(1);
    expect(result2.stats.accuracy).toBe(50);
    expect(engine.getMistakeIndices()).toEqual([1]);
  });

  it("harus menandai sesi selesai ketika melebihi kartu terakhir", () => {
    const engine = new FlashcardSessionEngine(MOCK_CARDS);
    expect(engine.next()).toBe(true);
    expect(engine.next()).toBe(false);
    expect(engine.isFinished()).toBe(true);
  });
});
