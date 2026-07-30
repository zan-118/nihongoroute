/**
 * @file lesson-offline-adapter.ts
 * @description Domain adapter module for pre-caching and checking offline lesson assets in Cache Storage.
 * Decouples Cache Storage API interactions & URL extraction from React UI components.
 */

export interface LessonAudioItem {
  audioUrl?: string;
  audio_url?: string;
}

export interface LessonVocabItem {
  vocab?: string;
  japanese?: string;
  word?: string;
}

export interface LessonKanjiItem {
  kanji?: string;
  character?: string;
}

export interface LessonDataPayload {
  listeningList?: unknown[];
  listening_list?: unknown[];
  readingList?: unknown[];
  reading_list?: unknown[];
  vocabList?: unknown[];
  vocab_list?: unknown[];
  kanjiList?: unknown[];
  kanji_list?: unknown[];
}

export interface LessonAssetUrls {
  audioUrls: string[];
  ttsWords: string[];
  kanjiChars: string[];
}

/**
 * Extracts cacheable asset URLs (audio, TTS words, KanjiVG SVGs) from a lesson payload.
 * 
 * @param lesson - Lesson data payload.
 * @returns Struct containing arrays of audio URLs, TTS words, and Kanji characters.
 */
export function extractLessonAssetUrls(lesson: LessonDataPayload | undefined | null): LessonAssetUrls {
  const audioUrls: string[] = [];
  const ttsWords: string[] = [];
  const kanjiChars: string[] = [];

  if (!lesson) {
    return { audioUrls, ttsWords, kanjiChars };
  }

  // 1. Audio percakapan (listeningList / listening_list)
  const listeningItems = (lesson.listeningList || lesson.listening_list || []) as LessonAudioItem[];
  listeningItems.forEach((item) => {
    const url = item?.audioUrl || item?.audio_url;
    if (url && typeof url === "string") audioUrls.push(url);
  });

  // 2. Audio bacaan (readingList / reading_list)
  const readingItems = (lesson.readingList || lesson.reading_list || []) as LessonAudioItem[];
  readingItems.forEach((item) => {
    const url = item?.audioUrl || item?.audio_url;
    if (url && typeof url === "string") audioUrls.push(url);
  });

  // 3. Kata kosa kata untuk TTS caching (vocabList / vocab_list)
  const vocabItems = (lesson.vocabList || lesson.vocab_list || []) as LessonVocabItem[];
  vocabItems.forEach((item) => {
    const word = item?.vocab || item?.japanese || item?.word;
    if (word && typeof word === "string") {
      ttsWords.push(word);
    }
  });

  // 4. Huruf Kanji untuk latihan menulis canvas (kanjiList / kanji_list)
  const kanjiItems = (lesson.kanjiList || lesson.kanji_list || []) as LessonKanjiItem[];
  kanjiItems.forEach((item) => {
    const char = item?.kanji || item?.character;
    if (char && typeof char === "string") {
      kanjiChars.push(char.charAt(0));
    }
  });

  return { audioUrls, ttsWords, kanjiChars };
}

/**
 * Checks whether all specified lesson assets exist in Cache Storage.
 * 
 * @param assetUrls - Object containing arrays of URLs to check.
 * @returns True if all assets are present in cache.
 */
export async function checkLessonCacheStatus(assetUrls: LessonAssetUrls): Promise<boolean> {
  if (typeof window === "undefined" || !("caches" in window)) {
    return false;
  }

  const { audioUrls, ttsWords, kanjiChars } = assetUrls;
  if (audioUrls.length === 0 && ttsWords.length === 0 && kanjiChars.length === 0) {
    return false;
  }

  try {
    const audioCache = await caches.open("nihongoroute_audio_cache");
    const ttsCache = await caches.open("nihongoroute_tts_cache");
    const kanjiCache = await caches.open("nihongoroute_kanjivg_cache");

    // Check Audio
    for (const url of audioUrls) {
      const match = await audioCache.match(url);
      if (!match) return false;
    }

    // Check TTS
    for (const word of ttsWords) {
      const params = new URLSearchParams({ text: word, voice: "indah", rate: "medium" });
      const ttsUrl = `/api/tts?${params.toString()}`;
      const match = await ttsCache.match(ttsUrl);
      if (!match) return false;
    }

    // Check KanjiVG
    for (const char of kanjiChars) {
      const code = char.charCodeAt(0).toString(16).padStart(5, "0");
      const kanjivgUrl = `https://raw.githubusercontent.com/KanjiVG/kanjivg/master/kanji/${code}.svg`;
      const match = await kanjiCache.match(kanjivgUrl);
      if (!match) return false;
    }

    return true;
  } catch (err) {
    console.warn("Gagal memeriksa status cache luring:", err);
    return false;
  }
}

/**
 * Pre-fetches and caches all lesson assets into Cache Storage with progress updates.
 * 
 * @param assetUrls - Asset URLs to fetch and store.
 * @param onProgress - Callback receiving completion percentage (0-100).
 */
export async function downloadLessonAssets(
  assetUrls: LessonAssetUrls,
  onProgress?: (progressPercent: number) => void
): Promise<void> {
  const { audioUrls, ttsWords, kanjiChars } = assetUrls;
  const totalItems = audioUrls.length + ttsWords.length + kanjiChars.length;

  if (totalItems === 0) {
    onProgress?.(100);
    return;
  }

  let completedItems = 0;
  const updateProgress = () => {
    completedItems++;
    const percent = Math.min(Math.round((completedItems / totalItems) * 100), 100);
    onProgress?.(percent);
  };

  const audioCache = await caches.open("nihongoroute_audio_cache");
  const ttsCache = await caches.open("nihongoroute_tts_cache");
  const kanjiCache = await caches.open("nihongoroute_kanjivg_cache");

  const audioPromises = audioUrls.map(async (url) => {
    try {
      const match = await audioCache.match(url);
      if (!match) {
        const res = await fetch(url);
        if (res.ok) await audioCache.put(url, res);
      }
    } catch (e) {
      console.warn("Gagal pre-cache audio:", url, e);
    } finally {
      updateProgress();
    }
  });

  const ttsPromises = ttsWords.map(async (word) => {
    const params = new URLSearchParams({ text: word, voice: "indah", rate: "medium" });
    const ttsUrl = `/api/tts?${params.toString()}`;
    try {
      const match = await ttsCache.match(ttsUrl);
      if (!match) {
        const res = await fetch(ttsUrl);
        if (res.ok) await ttsCache.put(ttsUrl, res);
      }
    } catch (e) {
      console.warn("Gagal pre-cache TTS:", word, e);
    } finally {
      updateProgress();
    }
  });

  const kanjiPromises = kanjiChars.map(async (char) => {
    const code = char.charCodeAt(0).toString(16).padStart(5, "0");
    const kanjivgUrl = `https://raw.githubusercontent.com/KanjiVG/kanjivg/master/kanji/${code}.svg`;
    try {
      const match = await kanjiCache.match(kanjivgUrl);
      if (!match) {
        const res = await fetch(kanjivgUrl);
        if (res.ok) await kanjiCache.put(kanjivgUrl, res);
      }
    } catch (e) {
      console.warn("Gagal pre-cache Kanji SVG:", char, e);
    } finally {
      updateProgress();
    }
  });

  await Promise.all([...audioPromises, ...ttsPromises, ...kanjiPromises]);
}
