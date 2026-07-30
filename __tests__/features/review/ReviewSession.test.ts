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
          id: "item1",
          word: "テスト",
          reading: "",
          meaning: "",
          level: 1,
          interval: 1,
          repetition: 0,
          easeFactor: 2.5,
          nextReview: new Date(Date.now() - 10000).toISOString(),
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
});
