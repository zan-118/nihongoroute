import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { useWritingCanvas } from "@/components/features/tools/canvas/useWritingCanvas";
import { useUserStore } from "@/store/useUserStore";

// Mock API browser yang tidak tersedia di jsdom
if (typeof window !== "undefined") {
  global.caches = {
    open: vi.fn().mockResolvedValue({
      match: vi.fn().mockResolvedValue(null),
      put: vi.fn().mockResolvedValue(undefined),
    }),
   } as unknown as CacheStorage;

  // Mock navigator.vibrate
  navigator.vibrate = vi.fn().mockReturnValue(true);
}

describe("useWritingCanvas Hook", () => {
  beforeEach(() => {
    useUserStore.setState({
      xp: 0,
      level: 1,
    });
    
    // Mock global fetch
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      text: vi.fn().mockResolvedValue(`
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 109 109">
          <path d="M10,20 C30,40 50,60 70,80" />
        </svg>
      `),
    } as unknown as Response);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("diinisialisasi dengan status awal yang benar", async () => {
    const { result } = renderHook(() =>
      useWritingCanvas({ character: "水", strokeColor: "#ef4444" })
    );

    expect(result.current.showGuide).toBe(true);
    expect(result.current.replayKey).toBe(0);
    expect(result.current.showXP).toBe(false);
    expect(result.current.isCompleted).toBe(false);

    await waitFor(() => {
      expect(result.current.totalStrokes).toBe(1);
    });
    expect(result.current.currentStrokeIndex).toBe(0);
    expect(result.current.strokeError).toBe(null);
  });

  it("handleReplay mengatur ulang kanvas dan menaikkan replayKey", async () => {
    const { result } = renderHook(() =>
      useWritingCanvas({ character: "水", strokeColor: "#ef4444" })
    );

    await waitFor(() => {
      expect(result.current.totalStrokes).toBe(1);
    });

    act(() => {
      result.current.handleReplay();
    });

    await waitFor(() => {
      expect(result.current.replayKey).toBe(1);
    });
    expect(result.current.isCompleted).toBe(false);
    expect(result.current.currentStrokeIndex).toBe(0);
  });

  it("clearCanvas membersihkan seluruh status kanvas", async () => {
    const { result } = renderHook(() =>
      useWritingCanvas({ character: "水", strokeColor: "#ef4444" })
    );

    await waitFor(() => {
      expect(result.current.totalStrokes).toBe(1);
    });

    act(() => {
      result.current.clearCanvas();
    });

    expect(result.current.isCompleted).toBe(false);
    expect(result.current.currentStrokeIndex).toBe(0);
    expect(result.current.strokeError).toBe(null);
  });
});
