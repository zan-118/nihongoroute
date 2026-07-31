/**
 * @file tools-service.test.ts
 * @description Unit & integration test untuk tools.service.ts — menguji getToolsIntegrationData,
 * fallback ke static presets saat database kosong, dan penanganan error Supabase.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock Supabase client
const mockSelect = vi.fn();
const mockFrom = vi.fn();

vi.mock("@/lib/supabase/server", () => ({
  createStaticClient: () => ({
    from: mockFrom,
  }),
}));

import {
  getToolsIntegrationData,
  getLibraryTextForTool,
} from "@/lib/services/tools.service";
import { MINI_DRILL_BANK } from "@/lib/jlpt-mini-drill";
import { COUNTER_QUESTIONS } from "@/lib/counter-trainer";
import { SHADOWING_PRESETS } from "@/lib/shadowing-recorder";

describe("tools.service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getToolsIntegrationData", () => {
    it("falls back to static banks when database returns empty results", async () => {
      const createChain = () => ({
        not: vi.fn().mockImplementation(createChain),
        or: vi.fn().mockImplementation(createChain),
        order: vi.fn().mockImplementation(createChain),
        eq: vi.fn().mockImplementation(createChain),
        limit: vi.fn().mockImplementation(createChain),
        maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
        then: (resolve: (val: unknown) => void) => resolve({ data: [], error: null }),
      });

      mockFrom.mockImplementation(() => ({
        select: vi.fn().mockImplementation(createChain),
      }));

      const data = await getToolsIntegrationData();

      expect(data).toBeDefined();
      expect(data.miniDrillQuestions).toEqual(MINI_DRILL_BANK);
      expect(data.counterQuestions).toEqual(COUNTER_QUESTIONS);
      expect(data.shadowingPresets).toEqual(SHADOWING_PRESETS);
      expect(data.stats).toEqual({
        miniDrillDatabaseCount: 0,
        counterDatabaseCount: 0,
        shadowingLibraryCount: 0,
      });
    });

    it("handles database query errors gracefully with fallbacks", async () => {
      mockFrom.mockReturnValue({
        select: vi.fn().mockImplementation(() => {
          throw new Error("Database connection error");
        }),
      });

      const data = await getToolsIntegrationData();

      expect(data.miniDrillQuestions).toEqual(MINI_DRILL_BANK);
      expect(data.counterQuestions).toEqual(COUNTER_QUESTIONS);
      expect(data.shadowingPresets).toEqual(SHADOWING_PRESETS);
      expect(data.stats.miniDrillDatabaseCount).toBe(0);
    });
  });

  describe("getLibraryTextForTool", () => {
    it("returns null when context slug is empty or invalid source", async () => {
      const result = await getLibraryTextForTool({ slug: "", source: "vocab" as unknown as "reading" });
      expect(result).toBeNull();
    });

    it("fetches and formats reading material text", async () => {
      mockFrom.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            maybeSingle: vi.fn().mockResolvedValue({
              data: {
                id: "read-1",
                title: "Cerita Pendek",
                slug: "cerita-pendek",
                body: "昔々、あるところにおじいさんとおばあさんがいました。\n毎日幸せでした。",
                translation: "Dahulu kala ada kakek dan nenek.",
              },
              error: null,
            }),
          }),
        }),
      });

      const result = await getLibraryTextForTool({
        source: "reading",
        slug: "cerita-pendek",
      });

      expect(result).not.toBeNull();
      expect(result?.title).toBe("Cerita Pendek");
      expect(result?.sourceHref).toBe("/library/reading/cerita-pendek");
      expect(result?.text).toContain("おじいさん");
    });
  });
});
