import { describe, it, expect } from "vitest";
import {
  calculateLevel,
  xpForLevel,
  xpForNextLevel,
  xpForCurrentLevel,
  getLevelProgressPercent,
} from "@/lib/level";

describe("lib/level", () => {
  // ========================================
  // calculateLevel
  // ========================================
  describe("calculateLevel", () => {
    it("mengembalikan level 1 untuk XP 0", () => {
      expect(calculateLevel(0)).toBe(1);
    });

    it("mengembalikan level 1 untuk XP negatif", () => {
      expect(calculateLevel(-100)).toBe(1);
    });

    it("mengembalikan level 2 untuk XP = 50 (BASE_XP)", () => {
      // sqrt(50/50) + 1 = sqrt(1) + 1 = 2
      expect(calculateLevel(50)).toBe(2);
    });

    it("mengembalikan level 3 untuk XP = 200", () => {
      // sqrt(200/50) + 1 = sqrt(4) + 1 = 3
      expect(calculateLevel(200)).toBe(3);
    });

    it("mengembalikan level 5 untuk XP = 800", () => {
      // sqrt(800/50) + 1 = sqrt(16) + 1 = 5
      expect(calculateLevel(800)).toBe(5);
    });

    it("mengembalikan level 11 untuk XP = 5000", () => {
      // sqrt(5000/50) + 1 = sqrt(100) + 1 = 11
      expect(calculateLevel(5000)).toBe(11);
    });

    it("tidak melampaui MAX_LEVEL (100)", () => {
      // XP sangat tinggi harus di-cap di 100
      expect(calculateLevel(999999999)).toBe(100);
    });

    it("menghitung level dengan benar untuk XP di batas level", () => {
      // XP = 49 -> sqrt(49/50) + 1 = sqrt(0.98) + 1 = floor(0.9899) + 1 = 1
      expect(calculateLevel(49)).toBe(1);
      // XP = 51 -> sqrt(51/50) + 1 = sqrt(1.02) + 1 = floor(1.0099) + 1 = 2
      expect(calculateLevel(51)).toBe(2);
    });
  });

  // ========================================
  // xpForLevel
  // ========================================
  describe("xpForLevel", () => {
    it("mengembalikan 0 untuk level 1", () => {
      expect(xpForLevel(1)).toBe(0);
    });

    it("mengembalikan 0 untuk level <= 0", () => {
      expect(xpForLevel(0)).toBe(0);
      expect(xpForLevel(-5)).toBe(0);
    });

    it("mengembalikan 50 untuk level 2", () => {
      // (2-1)^2 * 50 = 1 * 50 = 50
      expect(xpForLevel(2)).toBe(50);
    });

    it("mengembalikan 200 untuk level 3", () => {
      // (3-1)^2 * 50 = 4 * 50 = 200
      expect(xpForLevel(3)).toBe(200);
    });

    it("mengembalikan 800 untuk level 5", () => {
      // (5-1)^2 * 50 = 16 * 50 = 800
      expect(xpForLevel(5)).toBe(800);
    });
  });

  // ========================================
  // xpForNextLevel
  // ========================================
  describe("xpForNextLevel", () => {
    it("mengembalikan 50 untuk level 1 (target level 2)", () => {
      // 1^2 * 50 = 50
      expect(xpForNextLevel(1)).toBe(50);
    });

    it("mengembalikan 200 untuk level 2 (target level 3)", () => {
      // 2^2 * 50 = 200
      expect(xpForNextLevel(2)).toBe(200);
    });

    it("mengembalikan 1250 untuk level 5 (target level 6)", () => {
      // 5^2 * 50 = 1250
      expect(xpForNextLevel(5)).toBe(1250);
    });
  });

  // ========================================
  // xpForCurrentLevel (alias)
  // ========================================
  describe("xpForCurrentLevel", () => {
    it("merupakan alias dari xpForLevel", () => {
      expect(xpForCurrentLevel(3)).toBe(xpForLevel(3));
      expect(xpForCurrentLevel(10)).toBe(xpForLevel(10));
    });
  });

  // ========================================
  // getLevelProgressPercent
  // ========================================
  describe("getLevelProgressPercent", () => {
    it("mengembalikan 0% di awal level", () => {
      // Level 2 dimulai dari XP 50, next level di XP 200
      expect(getLevelProgressPercent(50, 2)).toBe(0);
    });

    it("mengembalikan 100% di puncak level", () => {
      // Level 2: current=50, next=200, range=150. XP=200 -> (200-50)/150*100 = 100%
      expect(getLevelProgressPercent(200, 2)).toBe(100);
    });

    it("mengembalikan persentase yang benar di tengah level", () => {
      // Level 2: current=50, next=200, range=150. XP=125 -> (125-50)/150*100 = 50%
      expect(getLevelProgressPercent(125, 2)).toBe(50);
    });

    it("tidak melampaui 100%", () => {
      // XP jauh lebih besar dari batas next level
      expect(getLevelProgressPercent(9999, 2)).toBe(100);
    });

    it("tidak di bawah 0%", () => {
      // XP lebih rendah dari batas current level (anomali)
      expect(getLevelProgressPercent(0, 2)).toBe(0);
    });

    it("mengembalikan 0% jika range adalah 0", () => {
      // Edge case: xpForCurrentLevel === xpForNextLevel (seharusnya tidak terjadi, tapi aman)
      expect(getLevelProgressPercent(0, 0)).toBe(0);
    });
  });
});
