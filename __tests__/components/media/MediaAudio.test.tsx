import { describe, it, expect, vi } from "vitest";
import { render, screen, act } from "@testing-library/react";
import React from "react";
import { OfflineAudio, TTSReader } from "@/features/media";

// Mock useCachedAudio
vi.mock("@/hooks/useCachedAudio", () => ({
  useCachedAudio: (src: string) => src,
}));

// Mock tts lib
vi.mock("@/lib/tts", () => ({
  fetchTTSAudio: vi.fn(),
  speakWithWebSpeech: vi.fn(),
  detectVoice: vi.fn(),
  TTS_VOICES: { INDAH: "indah" },
}));

describe("Feature Media Module", () => {
  describe("OfflineAudio", () => {
    it("renders HTML5 audio element with src", () => {
      const { container } = render(<OfflineAudio src="/audio/sample.mp3" className="audio-player" />);
      const audioElement = container.querySelector("audio");
      expect(audioElement).toBeDefined();
      expect(audioElement?.getAttribute("src")).toBe("/audio/sample.mp3");
      expect(audioElement?.classList.contains("audio-player")).toBe(true);
    });
  });

  describe("TTSReader", () => {
    it("returns null if text lacks Japanese characters", () => {
      vi.useFakeTimers();
      const { container } = render(<TTSReader text="Hello World" />);
      act(() => {
        vi.runAllTimers();
      });
      expect(container.firstChild).toBeNull();
      vi.useRealTimers();
    });

    it("renders playback button if text has Japanese characters", () => {
      render(<TTSReader text="こんにちは" minimal={true} />);
      const button = screen.getByRole("button");
      expect(button).toBeDefined();
    });
  });
});
