import { describe, it, expect } from "vitest";
import { calculateLevel, xpForLevel, xpForNextLevel, getLevelProgressPercent } from "@/lib/level";

describe("Level System Helpers", () => {
  describe("calculateLevel", () => {
    it("mengembalikan Level 1 untuk XP <= 0", () => {
      expect(calculateLevel(0)).toBe(1);
      expect(calculateLevel(-10)).toBe(1);
    });

    it("menghitung level dengan formula scaling kuadratik (BASE_XP = 50)", () => {
      // Formula: L = sqrt(XP / 50) + 1
      expect(calculateLevel(49)).toBe(1);
      expect(calculateLevel(50)).toBe(2);  // sqrt(1) + 1 = 2
      expect(calculateLevel(199)).toBe(2);
      expect(calculateLevel(200)).toBe(3); // sqrt(4) + 1 = 3
      expect(calculateLevel(450)).toBe(4); // sqrt(9) + 1 = 4
    });

    it("membatasi level maksimal pada Level 100", () => {
      // Level 100 butuh: (99^2) * 50 = 9801 * 50 = 490050 XP
      expect(calculateLevel(1000000)).toBe(100);
    });
  });

  describe("xpForLevel", () => {
    it("mengembalikan 0 untuk level <= 1", () => {
      expect(xpForLevel(1)).toBe(0);
      expect(xpForLevel(0)).toBe(0);
    });

    it("menghitung XP minimal untuk level tertentu", () => {
      // Formula: (L - 1)^2 * 50
      expect(xpForLevel(2)).toBe(50);
      expect(xpForLevel(3)).toBe(200);
      expect(xpForLevel(4)).toBe(450);
    });
  });

  describe("xpForNextLevel", () => {
    it("menghitung total XP kumulatif untuk mencapai level berikutnya", () => {
      // Formula: L^2 * 50
      expect(xpForNextLevel(1)).toBe(50);
      expect(xpForNextLevel(2)).toBe(200);
      expect(xpForNextLevel(3)).toBe(450);
    });
  });

  describe("getLevelProgressPercent", () => {
    it("mengembalikan persentase progres linear dalam level saat ini", () => {
      // Level 2: xpForCurrentLevel = 50, xpForNextLevel = 200. Rentang = 150.
      // Jika XP = 125, maka progres = (125 - 50) / 150 = 75 / 150 = 50%
      expect(getLevelProgressPercent(125, 2)).toBe(50);

      // Batas minimum 0%
      expect(getLevelProgressPercent(40, 2)).toBe(0);

      // Batas maksimum 100%
      expect(getLevelProgressPercent(250, 2)).toBe(100);
    });
  });
});
