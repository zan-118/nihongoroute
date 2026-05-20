import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { createNewCardState, updateCardState, SRSState } from "@/lib/srs";

describe("SRS - Spaced Repetition System", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-05-20T12:00:00Z").getTime());
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("createNewCardState membuat state default untuk kartu baru", () => {
    const card = createNewCardState();
    expect(card.interval).toBe(1);
    expect(card.repetition).toBe(0);
    expect(card.easeFactor).toBe(2.5);
    expect(card.nextReview).toBe(Date.now());
    expect(card.updatedAt).toBe(Date.now());
  });

  describe("updateCardState - Penalti (Grade < 2)", () => {
    it("Grade 0 (Lupa Total) melakukan halving interval, reset repetition, dan kurangi easeFactor", () => {
      const initialCard: SRSState = {
        interval: 10,
        repetition: 4,
        easeFactor: 2.5,
        nextReview: Date.now() - 1000,
        updatedAt: Date.now() - 10000,
      };

      const newCard = updateCardState(initialCard, 0);

      expect(newCard.interval).toBe(5); // 10 / 2
      expect(newCard.repetition).toBe(0);
      expect(newCard.easeFactor).toBe(2.3); // 2.5 - 0.2
    });

    it("Grade 1 (Sulit) mengalikan interval dengan 0.7, menjaga repetition, dan kurangi easeFactor", () => {
      const initialCard: SRSState = {
        interval: 10,
        repetition: 4,
        easeFactor: 2.5,
        nextReview: Date.now() - 1000,
        updatedAt: Date.now() - 10000,
      };

      const newCard = updateCardState(initialCard, 1);

      expect(newCard.interval).toBe(7); // ceil(10 * 0.7) = 7
      expect(newCard.repetition).toBe(4);
      expect(newCard.easeFactor).toBe(2.35); // 2.5 - 0.15
    });

    it("menjaga easeFactor tidak turun di bawah minimum 1.3", () => {
      const initialCard: SRSState = {
        interval: 4,
        repetition: 2,
        easeFactor: 1.4,
        nextReview: Date.now() - 1000,
        updatedAt: Date.now() - 10000,
      };

      const newCard = updateCardState(initialCard, 0); // Grade 0
      expect(newCard.easeFactor).toBe(1.3); // Min 1.3, bukan 1.2
    });
  });

  describe("updateCardState - Pertumbuhan (Grade >= 2)", () => {
    it("Repetition 1 dan Interval 1: Grade 2 (Bisa) -> Interval 1, Grade 3 (Mudah) -> Interval 2", () => {
      const initialCard: SRSState = {
        interval: 1,
        repetition: 0,
        easeFactor: 2.5,
        nextReview: Date.now() - 1000,
        updatedAt: Date.now() - 10000,
      };

      const cardGrade2 = updateCardState(initialCard, 2);
      expect(cardGrade2.interval).toBe(1);
      expect(cardGrade2.repetition).toBe(1);
      expect(cardGrade2.easeFactor).toBe(2.55); // 2.5 + 0.05

      const cardGrade3 = updateCardState(initialCard, 3);
      expect(cardGrade3.interval).toBe(2);
      expect(cardGrade3.repetition).toBe(1);
      expect(cardGrade3.easeFactor).toBe(2.65); // 2.5 + 0.15
    });

    it("Repetition 2 dan Interval <= 2: Grade 2 (Bisa) -> Interval 3, Grade 3 (Mudah) -> Interval 5", () => {
      const initialCard: SRSState = {
        interval: 1,
        repetition: 1,
        easeFactor: 2.5,
        nextReview: Date.now() - 1000,
        updatedAt: Date.now() - 10000,
      };

      const cardGrade2 = updateCardState(initialCard, 2);
      expect(cardGrade2.interval).toBe(3);
      expect(cardGrade2.repetition).toBe(2);

      const cardGrade3 = updateCardState(initialCard, 3);
      expect(cardGrade3.interval).toBe(5);
      expect(cardGrade3.repetition).toBe(2);
    });

    it("Repetition > 2: Interval dihitung dengan perkalian easeFactor", () => {
      const initialCard: SRSState = {
        interval: 5,
        repetition: 2,
        easeFactor: 2.6,
        nextReview: Date.now() - 1000,
        updatedAt: Date.now() - 10000,
      };

      const cardGrade2 = updateCardState(initialCard, 2);
      // ceil(5 * 2.6) = ceil(13) = 13
      expect(cardGrade2.interval).toBe(13);

      const cardGrade3 = updateCardState(initialCard, 3);
      // ceil(5 * 2.6 * 1.3) = ceil(16.9) = 17
      expect(cardGrade3.interval).toBe(17);
    });

    it("Early Study (tidak Due): Tidak menambah interval / repetition, hanya menambah sedikit easeFactor (0.02)", () => {
      const initialCard: SRSState = {
        interval: 10,
        repetition: 3,
        easeFactor: 2.5,
        nextReview: Date.now() + 2 * 24 * 60 * 60 * 1000, // 2 hari lagi
        updatedAt: Date.now() - 10000,
      };

      const newCard = updateCardState(initialCard, 3); // Mudah

      expect(newCard.interval).toBe(10); // Tetap 10
      expect(newCard.repetition).toBe(3); // Tetap 3
      expect(newCard.easeFactor).toBe(2.52); // + 0.02
    });
  });
});
