import { describe, it, expect, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useAddToSRS } from "@/components/features/srs/button/useAddToSRS";
import { useProgressStore } from "@/store/useProgressStore";
import { createNewCardState } from "@/lib/srs";

describe("useAddToSRS", () => {
  beforeEach(() => {
    useProgressStore.setState({
      progress: { xp: 0, level: 1, streak: 0, todayReviewCount: 0, lastStudyDate: null, studyDays: {}, srs: {} },
      loading: false,
      dirtySrs: new Set(),
      isAuthenticated: false,
      userFullName: null,
    });
  });

  it("dimulai dalam state belum ditambahkan", () => {
    const { result } = renderHook(() => useAddToSRS("word-abc"));
    expect(result.current.isAdded).toBe(false);
  });

  it("menandai isLoaded = true setelah mount", () => {
    const { result } = renderHook(() => useAddToSRS("word-abc"));
    expect(result.current.isLoaded).toBe(true);
  });

  it("handleAdd menambahkan kata ke SRS dan menandai isAdded = true", () => {
    const { result } = renderHook(() => useAddToSRS("word-new"));

    act(() => {
      result.current.handleAdd();
    });

    expect(result.current.isAdded).toBe(true);
    expect(useProgressStore.getState().progress.srs["word-new"]).toBeDefined();
  });

  it("mendeteksi kata yang sudah ada di SRS pada mount", () => {
    // Pre-populate SRS
    const existingState = createNewCardState();
    useProgressStore.setState({
      progress: {
        ...useProgressStore.getState().progress,
        srs: { "word-existing": existingState },
      },
    });

    const { result } = renderHook(() => useAddToSRS("word-existing"));
    expect(result.current.isAdded).toBe(true);
  });
});
