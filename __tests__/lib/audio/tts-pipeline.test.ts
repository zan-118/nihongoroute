import { describe, it, expect } from "vitest";
import {
  resolveTtsVoice,
  generateTtsCacheKey,
  MAX_TTS_TEXT_LENGTH,
} from "@/lib/audio/tts-pipeline";
import { TTS_VOICES } from "@/lib/constants/tts";

describe("TTS Pipeline Seam", () => {
  describe("resolveTtsVoice", () => {
    it("harus meresolusi nama voice yang dikenal atau speaker alias", () => {
      expect(resolveTtsVoice("zundamon")).toBe(TTS_VOICES.ZUNDAMON);
      expect(resolveTtsVoice("lala")).toBe(TTS_VOICES.LALA);
      expect(resolveTtsVoice("budi")).toBe(TTS_VOICES.BUDI);
    });

    it("harus fallback ke zundamon jika voice tidak dikenal", () => {
      expect(resolveTtsVoice("unknown_voice_123")).toBe(TTS_VOICES.ZUNDAMON);
      expect(resolveTtsVoice("")).toBe(TTS_VOICES.ZUNDAMON);
      expect(resolveTtsVoice(undefined)).toBe(TTS_VOICES.ZUNDAMON);
    });
  });

  describe("generateTtsCacheKey", () => {
    it("harus menghasilkan hash MD5 deterministik berdasarkan text, voice, dan rate", () => {
      const key1 = generateTtsCacheKey("こんにちは", TTS_VOICES.LALA, "medium");
      const key2 = generateTtsCacheKey("こんにちは", TTS_VOICES.LALA, "medium");
      const key3 = generateTtsCacheKey("こんにちは", TTS_VOICES.BUDI, "medium");

      expect(key1).toBe(key2);
      expect(key1).not.toBe(key3);
      expect(key1).toMatch(/^[a-f0-9]{32}$/);
    });

    it("harus membedakan hash jika rate atau text berbeda", () => {
      const keyDefault = generateTtsCacheKey("ありがとう", TTS_VOICES.ZUNDAMON);
      const keyFast = generateTtsCacheKey("ありがとう", TTS_VOICES.ZUNDAMON, "fast");

      expect(keyDefault).not.toBe(keyFast);
    });
  });

  describe("MAX_TTS_TEXT_LENGTH", () => {
    it("harus membatasi panjang teks hingga 500 karakter", () => {
      expect(MAX_TTS_TEXT_LENGTH).toBe(500);
    });
  });
});
