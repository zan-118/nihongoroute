import { describe, it, expect } from 'vitest';
import { calculateLevel, xpForLevel, xpForNextLevel, getLevelProgressPercent } from '@/lib/gamification/level';

describe('Level Calculation', () => {
  describe('calculateLevel', () => {
    it('harus mengembalikan level 1 jika XP 0', () => {
      expect(calculateLevel(0)).toBe(1);
      expect(calculateLevel(-50)).toBe(1);
    });

    it('harus mengkalkulasi level sesuai fungsi akar kuadrat (BASE = 50)', () => {
      // Level = sqrt(XP / 50) + 1
      // L=2 -> (2-1)^2 * 50 = 50
      expect(calculateLevel(50)).toBe(2);
      // L=3 -> (3-1)^2 * 50 = 200
      expect(calculateLevel(200)).toBe(3);
    });

    it('tidak boleh melebihi MAX_LEVEL (100)', () => {
      // L=100 -> 99^2 * 50 = 490050
      expect(calculateLevel(500000)).toBe(100);
    });
  });

  describe('xpForLevel / xpForNextLevel', () => {
    it('harus mengembalikan batas bawah XP yang benar untuk level', () => {
      expect(xpForLevel(2)).toBe(50);
      expect(xpForLevel(3)).toBe(200);
    });

    it('harus mengembalikan target XP untuk level berikutnya', () => {
      expect(xpForNextLevel(2)).toBe(200); // target ke L3
      expect(xpForNextLevel(3)).toBe(450); // target ke L4
    });
  });

  describe('getLevelProgressPercent', () => {
    it('harus menghitung persentase bar dengan benar', () => {
      // Di L2, batas XP = 50, Target L3 = 200. Range = 150.
      // Kalau kita punya XP = 125, itu berarti = (125-50) / 150 = 75 / 150 = 50%
      expect(getLevelProgressPercent(125, 2)).toBe(50);
      
      // Jika XP pas di batas bawah -> 0%
      expect(getLevelProgressPercent(50, 2)).toBe(0);
      
      // Jika XP melebihi rentang (karena mungkin belum level up visualnya) -> max 100%
      expect(getLevelProgressPercent(250, 2)).toBe(100);
    });
  });
});
