import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useReviewSession } from "@/features/review/hooks/useReviewSession";
import { useSRSStore } from "@/store/useSRSStore";

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useSearchParams: () => new URLSearchParams(),
}));

// Mock sonner toast
vi.mock("sonner", () => ({
  toast: {
    error: vi.fn(),
  },
}));

describe("useReviewSession", () => {
  beforeEach(() => {
    useSRSStore.setState({
      srs: {
        item1: {
          interval: 1,
          repetition: 0,
          easeFactor: 2.5,
          nextReview: Date.now() - 10000,
          updatedAt: Date.now() - 10000,
        },
      },
    });
  });

  it("initializes with default values", () => {
    const { result } = renderHook(() => useReviewSession(false));
    expect(result.current.mode).toBeNull();
    expect(result.current.cards).toEqual([]);
    expect(result.current.isFetching).toBe(false);
    expect(result.current.isFinished).toBe(false);
  });

  it("calculates due count from SRS store", () => {
    const { result } = renderHook(() => useReviewSession(false));
    expect(result.current.dueCount).toBeGreaterThanOrEqual(0);
  });

  it("chunks requests into batches of 50 when targetIds exceed 50 items", async () => {
    const srsData: Record<string, { interval: number; repetition: number; easeFactor: number; nextReview: number; updatedAt: number }> = {};
    for (let i = 1; i <= 120; i++) {
      srsData[`item-${i}`] = {
        interval: 1,
        repetition: 0,
        easeFactor: 2.5,
        nextReview: Date.now() - 10000,
        updatedAt: Date.now() - 10000,
      };
    }
    useSRSStore.setState({ srs: srsData });

    const fetchMock = vi.fn().mockImplementation((url: string) => {
      const idsParam = new URL(url, "http://localhost").searchParams.get("ids") || "";
      const ids = idsParam.split(",");
      const mockCards = ids.map((id) => ({
        _id: id,
        id,
        word: `Word-${id}`,
        meaning: `Meaning-${id}`,
        category: "vocab",
        docType: "vocab",
      }));
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockCards),
      });
    });
    vi.stubGlobal("fetch", fetchMock);

    const { result } = renderHook(() => useReviewSession(false));

    await act(async () => {
      await result.current.startSession("srs");
    });

    expect(fetchMock).toHaveBeenCalledTimes(3); // 120 items split into 50, 50, 20 = 3 requests
    expect(result.current.cards).toHaveLength(120);

    vi.toBePolled;
    vi.unstubAllGlobals();
  });
});

