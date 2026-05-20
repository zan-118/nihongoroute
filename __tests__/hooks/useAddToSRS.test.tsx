import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useAddToSRS } from "@/components/features/srs/button/useAddToSRS";
import { useSRSStore } from "@/store/useSRSStore";
import { useUserStore } from "@/store/useUserStore";
import { createNewCardState } from "@/lib/srs";

describe("useAddToSRS Hook", () => {
  beforeEach(() => {
    useSRSStore.setState({
      srs: {},
      dirtySrs: new Set(),
    });
    useUserStore.setState({
      id: "guest",
      isGuest: true,
      name: null,
      xp: 0,
      level: 1,
      streak: 0,
      todayReviewCount: 0,
      lastStudyDate: null,
      studyDays: {},
      inventory: {
        streakFreeze: 0,
        claimedQuests: {
          date: "",
          quests: []
        }
      },
      completedLessons: {},
      dirtyLessons: new Set(),
    });
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("dimulai dalam state belum ditambahkan", () => {
    const { result } = renderHook(() => useAddToSRS("word-abc"));
    act(() => {
      vi.advanceTimersByTime(100);
    });
    expect(result.current.isAdded).toBe(false);
  });

  it("menandai isLoaded = true setelah mount", () => {
    const { result } = renderHook(() => useAddToSRS("word-abc"));
    act(() => {
      vi.advanceTimersByTime(100);
    });
    expect(result.current.isLoaded).toBe(true);
  });

  it("handleAdd menambahkan kata ke SRS dan menandai isAdded = true", () => {
    const { result } = renderHook(() => useAddToSRS("word-new"));
    act(() => {
      vi.advanceTimersByTime(100);
    });

    act(() => {
      result.current.handleAdd();
    });

    expect(result.current.isAdded).toBe(true);
    expect(useSRSStore.getState().srs["word-new"]).toBeDefined();
  });

  it("mendeteksi kata yang sudah ada di SRS pada mount", () => {
    // Pre-populate SRS
    const existingState = createNewCardState();
    useSRSStore.setState({
      srs: { "word-existing": existingState },
    });

    const { result } = renderHook(() => useAddToSRS("word-existing"));
    act(() => {
      vi.advanceTimersByTime(100);
    });
    expect(result.current.isAdded).toBe(true);
  });
});
