import { describe, it, expect, vi } from "vitest";
import { render, renderHook } from "@testing-library/react";
import React from "react";
import { WritingCanvas, AnimatedKanji, useWritingCanvas, useAnimatedKanji } from "@/components/features/tools/stroke-canvas";

// Mock user store
vi.mock("@/store/useUserStore", () => ({
  useUserStore: <T,>(selector: (state: { addXP: (amount: number) => void }) => T) => selector({ addXP: vi.fn() }),
}));

// Mock audio
vi.mock("@/lib/audio", () => ({
  sounds: {
    playSuccess: vi.fn(),
    playError: vi.fn(),
    playPop: vi.fn(),
  },
}));

describe("Stroke Canvas Module", () => {
  describe("useWritingCanvas", () => {
    it("initializes canvas state properly", () => {
      const { result } = renderHook(() => useWritingCanvas({ character: "漢", strokeColor: "#000" }));
      expect(result.current.showGuide).toBe(true);
      expect(result.current.isCompleted).toBe(false);
      expect(result.current.strokeError).toBeNull();
    });
  });

  describe("useAnimatedKanji", () => {
    it("returns containerRef and error status", () => {
      const { result } = renderHook(() => useAnimatedKanji("漢", 0, "#a855f7"));
      expect(result.current.containerRef).toBeDefined();
      expect(result.current.error).toBe(false);
    });
  });

  describe("AnimatedKanji", () => {
    it("renders container element", () => {
      const { container } = render(<AnimatedKanji character="漢" triggerKey={0} />);
      expect(container.querySelector("div")).toBeDefined();
    });
  });

  describe("WritingCanvas", () => {
    it("renders interactive canvas card", () => {
      const { container } = render(<WritingCanvas character="漢" />);
      expect(container.querySelector("canvas")).toBeDefined();
    });
  });
});
