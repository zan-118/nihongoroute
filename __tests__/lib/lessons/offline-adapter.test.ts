import { describe, it, expect } from "vitest";
import { extractLessonAssetUrls, type LessonDataPayload } from "@/lib/lessons/lesson-offline-adapter";

describe("Lesson Offline Adapter", () => {
  describe("extractLessonAssetUrls", () => {
    it("harus mengekstrak URL audio, kata TTS, dan karakter Kanji dengan benar", () => {
      const mockLesson: LessonDataPayload = {
        listeningList: [{ audioUrl: "/audio/l1.mp3" }],
        readingList: [{ audio_url: "/audio/r1.mp3" }],
        vocabList: [{ vocab: "日本語" }, { word: "ルート" }],
        kanjiList: [{ kanji: "日" }, { character: "本" }],
      };

      const result = extractLessonAssetUrls(mockLesson);

      expect(result.audioUrls).toEqual(["/audio/l1.mp3", "/audio/r1.mp3"]);
      expect(result.ttsWords).toEqual(["日本語", "ルート"]);
      expect(result.kanjiChars).toEqual(["日", "本"]);
    });

    it("harus menangani payload kosong atau undefined dengan aman", () => {
      const emptyResult = extractLessonAssetUrls(null);
      expect(emptyResult.audioUrls).toEqual([]);
      expect(emptyResult.ttsWords).toEqual([]);
      expect(emptyResult.kanjiChars).toEqual([]);
    });
  });
});
