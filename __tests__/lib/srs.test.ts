import { describe, it, expect } from "vitest";
import { createNewCardState, updateCardState, SRSState } from "@/lib/srs";

describe("lib/srs", () => {
  // ========================================
  // createNewCardState
  // ========================================
  describe("createNewCardState", () => {
    it("membuat state default dengan interval 1", () => {
      const state = createNewCardState();
      expect(state.interval).toBe(1);
    });

    it("membuat state default dengan repetition 0", () => {
      const state = createNewCardState();
      expect(state.repetition).toBe(0);
    });

    it("membuat state default dengan easeFactor 2.5", () => {
      const state = createNewCardState();
      expect(state.easeFactor).toBe(2.5);
    });

    it("membuat state dengan nextReview mendekati waktu sekarang", () => {
      const before = Date.now();
      const state = createNewCardState();
      const after = Date.now();
      expect(state.nextReview).toBeGreaterThanOrEqual(before);
      expect(state.nextReview).toBeLessThanOrEqual(after);
    });
  });

  // ========================================
  // updateCardState - Jawaban BENAR
  // ========================================
  describe("updateCardState - jawaban benar", () => {
    it("menaikkan repetition sebesar 1", () => {
      const state = createNewCardState();
      const updated = updateCardState(state, true);
      expect(updated.repetition).toBe(1);
    });

    it("mempertahankan interval 1 pada repetition pertama kartu baru", () => {
      const state = createNewCardState(); // interval=1, rep=0
      const updated = updateCardState(state, true); // rep menjadi 1
      // repetition === 1 && interval === 1 -> interval tetap 1
      expect(updated.interval).toBe(1);
    });

    it("menaikkan interval ke 3 pada repetition kedua kartu baru", () => {
      const state: SRSState = { interval: 1, repetition: 1, easeFactor: 2.55, nextReview: Date.now() };
      const updated = updateCardState(state, true); // rep menjadi 2
      // repetition === 2 && interval === 1 -> interval = 3
      expect(updated.interval).toBe(3);
    });

    it("mengalikan interval dengan easeFactor setelah fase awal", () => {
      const state: SRSState = { interval: 3, repetition: 2, easeFactor: 2.5, nextReview: Date.now() };
      const updated = updateCardState(state, true);
      // interval = round(3 * 2.5) = round(7.5) = 8
      expect(updated.interval).toBe(8);
    });

    it("menaikkan easeFactor sebesar 0.05 setiap jawaban benar", () => {
      const state: SRSState = { interval: 1, repetition: 0, easeFactor: 2.5, nextReview: Date.now() };
      const updated = updateCardState(state, true);
      expect(updated.easeFactor).toBeCloseTo(2.55, 2);
    });

    it("mengatur nextReview di masa depan berdasarkan interval", () => {
      const DAY = 24 * 60 * 60 * 1000;
      const state: SRSState = { interval: 3, repetition: 2, easeFactor: 2.5, nextReview: Date.now() };
      const before = Date.now();
      const updated = updateCardState(state, true);
      const expectedMin = before + updated.interval * DAY;
      expect(updated.nextReview).toBeGreaterThanOrEqual(expectedMin - 100);
    });
  });

  // ========================================
  // updateCardState - Jawaban SALAH
  // ========================================
  describe("updateCardState - jawaban salah", () => {
    it("membagi dua interval (halving strategy)", () => {
      const state: SRSState = { interval: 10, repetition: 5, easeFactor: 2.5, nextReview: Date.now() };
      const updated = updateCardState(state, false);
      expect(updated.interval).toBe(5); // floor(10/2)
    });

    it("menjaga interval minimum 1", () => {
      const state: SRSState = { interval: 1, repetition: 1, easeFactor: 2.5, nextReview: Date.now() };
      const updated = updateCardState(state, false);
      expect(updated.interval).toBe(1); // max(1, floor(1/2)) = max(1, 0) = 1
    });

    it("mereset repetition ke 0", () => {
      const state: SRSState = { interval: 10, repetition: 5, easeFactor: 2.5, nextReview: Date.now() };
      const updated = updateCardState(state, false);
      expect(updated.repetition).toBe(0);
    });

    it("menurunkan easeFactor sebesar 0.2", () => {
      const state: SRSState = { interval: 10, repetition: 5, easeFactor: 2.5, nextReview: Date.now() };
      const updated = updateCardState(state, false);
      expect(updated.easeFactor).toBeCloseTo(2.3, 2);
    });

    it("tidak menurunkan easeFactor di bawah 1.3 (MIN_EASE_FACTOR)", () => {
      const state: SRSState = { interval: 10, repetition: 5, easeFactor: 1.4, nextReview: Date.now() };
      const updated = updateCardState(state, false);
      // max(1.3, 1.4 - 0.2) = max(1.3, 1.2) = 1.3
      expect(updated.easeFactor).toBe(1.3);
    });
  });

  // ========================================
  // Skenario Realistis Multi-Step
  // ========================================
  describe("skenario multi-step (simulasi sesi belajar)", () => {
    it("memprogresikan kartu baru melalui fase awal dengan benar", () => {
      let state = createNewCardState();

      // Jawab benar 1x: rep=1, interval=1
      state = updateCardState(state, true);
      expect(state.repetition).toBe(1);
      expect(state.interval).toBe(1);

      // Jawab benar 2x: rep=2, interval=3
      state = updateCardState(state, true);
      expect(state.repetition).toBe(2);
      expect(state.interval).toBe(3);

      // Jawab benar 3x: interval = round(3 * easeFactor)
      state = updateCardState(state, true);
      expect(state.repetition).toBe(3);
      expect(state.interval).toBeGreaterThan(3);
    });

    it("merecover interval setelah jawaban salah lalu benar", () => {
      let state: SRSState = { interval: 20, repetition: 5, easeFactor: 2.5, nextReview: Date.now() };

      // Jawab salah: interval di-halve
      state = updateCardState(state, false);
      expect(state.interval).toBe(10);
      expect(state.repetition).toBe(0);

      // Jawab benar setelahnya: fase awal lagi (rep=1, interval masih 10 karena bukan kartu baru)
      state = updateCardState(state, true);
      expect(state.repetition).toBe(1);
      // rep === 1 tapi interval !== 1, jadi masuk else: round(10 * easeFactor)
      expect(state.interval).toBeGreaterThan(10);
    });

    it("easeFactor terus naik dengan jawaban benar berturut-turut", () => {
      let state = createNewCardState();
      const initialEF = state.easeFactor;

      for (let i = 0; i < 10; i++) {
        state = updateCardState(state, true);
      }

      expect(state.easeFactor).toBeCloseTo(initialEF + 10 * 0.05, 2);
    });
  });
});
