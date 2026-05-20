import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import { useHeatmap, getBoxStyle } from "@/components/features/dashboard/heatmap/useHeatmap";

describe("useHeatmap and getBoxStyle", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-05-20T12:00:00Z").getTime());
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("getBoxStyle", () => {
    it("mengembalikan style redup untuk nilai 0", () => {
      expect(getBoxStyle(0)).toContain("opacity-30");
    });

    it("mengembalikan style intensitas rendah untuk nilai < 10", () => {
      expect(getBoxStyle(5)).toContain("bg-primary/20");
    });

    it("mengembalikan style intensitas sedang untuk nilai < 30", () => {
      expect(getBoxStyle(20)).toContain("bg-primary/50");
    });

    it("mengembalikan style intensitas tinggi untuk nilai >= 30", () => {
      expect(getBoxStyle(35)).toContain("bg-primary");
      expect(getBoxStyle(35)).not.toContain("bg-primary/");
    });
  });

  describe("useHeatmap Hook", () => {
    it("mengembalikan daftar 35 hari terakhir dengan format YYYY-MM-DD", () => {
      const { result } = renderHook(() => useHeatmap());
      
      expect(result.current.days.length).toBe(35);
      
      // Hari terakhir haruslah hari ini ("2026-05-20")
      expect(result.current.days[34]).toBe("2026-05-20");
      // Hari pertama haruslah 34 hari sebelum hari ini ("2026-04-16")
      expect(result.current.days[0]).toBe("2026-04-16");
    });
  });
});
