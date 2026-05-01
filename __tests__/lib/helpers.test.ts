import { describe, it, expect } from "vitest";
import { getTodayDateString, formatTime, shuffleArray } from "@/lib/helpers";

describe("lib/helpers", () => {
  // ========================================
  // getTodayDateString
  // ========================================
  describe("getTodayDateString", () => {
    it("mengembalikan string dengan format YYYY-MM-DD", () => {
      const result = getTodayDateString();
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });

    it("mengembalikan tanggal hari ini", () => {
      const result = getTodayDateString();
      const expected = new Date().toISOString().split("T")[0];
      expect(result).toBe(expected);
    });
  });

  // ========================================
  // formatTime
  // ========================================
  describe("formatTime", () => {
    it("memformat 0 detik menjadi '00:00'", () => {
      expect(formatTime(0)).toBe("00:00");
    });

    it("memformat 5 detik menjadi '00:05'", () => {
      expect(formatTime(5)).toBe("00:05");
    });

    it("memformat 60 detik menjadi '01:00'", () => {
      expect(formatTime(60)).toBe("01:00");
    });

    it("memformat 90 detik menjadi '01:30'", () => {
      expect(formatTime(90)).toBe("01:30");
    });

    it("memformat 3661 detik menjadi '61:01'", () => {
      expect(formatTime(3661)).toBe("61:01");
    });

    it("memformat 599 detik menjadi '09:59'", () => {
      expect(formatTime(599)).toBe("09:59");
    });
  });

  // ========================================
  // shuffleArray
  // ========================================
  describe("shuffleArray", () => {
    it("mengembalikan array dengan panjang yang sama", () => {
      const arr = [1, 2, 3, 4, 5];
      const result = shuffleArray(arr);
      expect(result).toHaveLength(arr.length);
    });

    it("mempertahankan semua elemen yang sama", () => {
      const arr = [1, 2, 3, 4, 5];
      const result = shuffleArray(arr);
      expect(result.sort()).toEqual(arr.sort());
    });

    it("tidak mengubah array asli (immutable)", () => {
      const arr = [1, 2, 3, 4, 5];
      const original = [...arr];
      shuffleArray(arr);
      expect(arr).toEqual(original);
    });

    it("mengembalikan array kosong untuk input kosong", () => {
      expect(shuffleArray([])).toEqual([]);
    });

    it("mengembalikan array 1 elemen tanpa perubahan", () => {
      expect(shuffleArray([42])).toEqual([42]);
    });

    it("menghasilkan urutan berbeda setidaknya sekali dalam 50 percobaan (probabilistik)", () => {
      const arr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
      let hasDifference = false;
      for (let i = 0; i < 50; i++) {
        const result = shuffleArray(arr);
        if (JSON.stringify(result) !== JSON.stringify(arr)) {
          hasDifference = true;
          break;
        }
      }
      expect(hasDifference).toBe(true);
    });
  });
});
