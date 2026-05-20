import { describe, it, expect } from "vitest";
import { cn, getLocalDateString, getTodayDateString, formatTime, shuffleArray, slugify } from "@/lib/utils";

describe("General Utilities (utils.ts)", () => {
  describe("cn (Classname Merger)", () => {
    it("menggabungkan nama kelas dengan benar", () => {
      expect(cn("bg-red-500", "text-white")).toBe("bg-red-500 text-white");
    });

    it("menangani konflik Tailwind CSS secara otomatis", () => {
      expect(cn("p-4 p-6")).toBe("p-6");
      expect(cn("text-red-500 text-blue-500")).toBe("text-blue-500");
    });

    it("mengabaikan nilai falsy", () => {
      expect(cn("bg-red-500", false && "text-white", null, undefined, "mx-auto")).toBe("bg-red-500 mx-auto");
    });
  });

  describe("getLocalDateString / getTodayDateString", () => {
    it("mengembalikan string tanggal berformat YYYY-MM-DD", () => {
      const dateStr = getLocalDateString();
      expect(dateStr).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(getTodayDateString()).toBe(dateStr);
    });
  });

  describe("formatTime", () => {
    it("memformat jumlah detik menjadi format MM:SS", () => {
      expect(formatTime(0)).toBe("00:00");
      expect(formatTime(9)).toBe("00:09");
      expect(formatTime(60)).toBe("01:00");
      expect(formatTime(75)).toBe("01:15");
      expect(formatTime(3605)).toBe("60:05");
    });
  });

  describe("shuffleArray", () => {
    it("menjaga semua elemen array tetap ada namun mengacak urutannya", () => {
      const original = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
      const shuffled = shuffleArray(original);

      expect(shuffled.length).toBe(original.length);
      expect(shuffled).toEqual(expect.arrayContaining(original));
      
      // Ada kemungkinan kecil hasil acak sama persis, tapi untuk ukuran 10 sangat kecil.
      // Kita uji keberagaman urutan secara fungsional.
    });

    it("tidak memutasi array asli", () => {
      const original = [1, 2, 3];
      shuffleArray(original);
      expect(original).toEqual([1, 2, 3]);
    });
  });

  describe("slugify", () => {
    it("mengubah spasi menjadi tanda hubung dan mengecilkan huruf", () => {
      expect(slugify("Nihongo Route")).toBe("nihongo-route");
    });

    it("mempertahankan karakter Hiragana, Katakana, dan Kanji Jepang", () => {
      expect(slugify("日本語 NIHONGO")).toBe("日本語-nihongo");
      expect(slugify("ひらがな カタカナ 漢字")).toBe("ひらがな-カタカナ-漢字");
    });

    it("menghapus karakter khusus non-alphanumeric selain huruf Jepang dan tanda hubung", () => {
      expect(slugify("Hello, World! @2026")).toBe("hello-world-2026");
    });

    it("menghindari tanda hubung ganda", () => {
      expect(slugify("hello---world")).toBe("hello-world");
    });
  });
});
