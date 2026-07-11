import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createNewCardState, updateCardState, type SRSState } from '@/lib/learning/srs';

const DAY = 24 * 60 * 60 * 1000;

describe('Spaced Repetition System (SRS)', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-07-12T00:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('createNewCardState', () => {
    it('harus mengembalikan state awal yang benar', () => {
      const state = createNewCardState();
      expect(state.interval).toBe(1);
      expect(state.repetition).toBe(0);
      expect(state.easeFactor).toBe(2.5);
      expect(state.nextReview).toBe(Date.now());
      expect(state.updatedAt).toBe(Date.now());
    });
  });

  describe('updateCardState - Penalti (Grade < 2)', () => {
    it('Grade 0 (Lupa): Memotong interval setengah, reset repetition, kurang EF 0.2', () => {
      const state: SRSState = {
        interval: 10,
        repetition: 4,
        easeFactor: 2.5,
        nextReview: Date.now() - DAY,
        updatedAt: Date.now() - DAY,
      };
      
      const nextState = updateCardState(state, 0);
      expect(nextState.interval).toBe(5);
      expect(nextState.repetition).toBe(0);
      expect(nextState.easeFactor).toBe(2.3);
    });

    it('Grade 1 (Sulit): Mengurangi interval 30%, kurang EF 0.15', () => {
      const state: SRSState = {
        interval: 10,
        repetition: 4,
        easeFactor: 2.5,
        nextReview: Date.now() - DAY,
        updatedAt: Date.now() - DAY,
      };
      
      const nextState = updateCardState(state, 1);
      expect(nextState.interval).toBe(7);
      expect(nextState.repetition).toBe(4); // Repetition tidak direset pada grade 1
      expect(nextState.easeFactor).toBe(2.35);
    });

    it('Batas bawah EF (Ease Factor Hell) tidak boleh kurang dari 1.3', () => {
      const state: SRSState = {
        interval: 10,
        repetition: 4,
        easeFactor: 1.4,
        nextReview: Date.now() - DAY,
        updatedAt: Date.now() - DAY,
      };
      
      const nextState = updateCardState(state, 0);
      expect(nextState.easeFactor).toBe(1.3);
    });
  });

  describe('updateCardState - Pertumbuhan (Grade >= 2)', () => {
    it('Bisa (Grade 2) pada iterasi awal: Interval=1, EF+0.05', () => {
      const state = createNewCardState();
      state.nextReview = Date.now() - DAY;
      
      const nextState = updateCardState(state, 2);
      expect(nextState.interval).toBe(1);
      expect(nextState.repetition).toBe(1);
      expect(nextState.easeFactor).toBe(2.55);
    });

    it('Sangat Mudah (Grade 3) pada iterasi awal: Interval=2, EF+0.15', () => {
      const state = createNewCardState();
      state.nextReview = Date.now() - DAY;
      
      const nextState = updateCardState(state, 3);
      expect(nextState.interval).toBe(2);
      expect(nextState.repetition).toBe(1);
      expect(nextState.easeFactor).toBe(2.65);
    });

    it('Bisa (Grade 2) pada iterasi lanjut: Interval berlipat sesuai EF', () => {
      const state: SRSState = {
        interval: 10,
        repetition: 3,
        easeFactor: 2.5,
        nextReview: Date.now() - DAY,
        updatedAt: Date.now() - DAY,
      };
      
      const nextState = updateCardState(state, 2);
      expect(nextState.repetition).toBe(4);
      // Math.ceil(10 * 2.5 * 1.0) = 25
      expect(nextState.interval).toBe(25);
      expect(nextState.easeFactor).toBe(2.55);
    });

    it('Due-Date Guard: Ulasan prematur tidak menaikkan interval/repetition, hanya EF mikro +0.02', () => {
      const state: SRSState = {
        interval: 10,
        repetition: 3,
        easeFactor: 2.5,
        // Belum waktunya (masih kurang 1 hari)
        nextReview: Date.now() + DAY,
        updatedAt: Date.now() - DAY,
      };
      
      const nextState = updateCardState(state, 2);
      expect(nextState.repetition).toBe(3); // Tidak naik
      expect(nextState.interval).toBe(10); // Tidak naik
      expect(nextState.easeFactor).toBe(2.52); // Bonus mikro +0.02
    });
  });
});
