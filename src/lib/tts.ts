/**
 * @file tts.ts
 * @description Utilitas Text-to-Speech via Edge TTS API Route.
 * Menangani deteksi suara pria/wanita berdasarkan nama pembicara,
 * caching audio di IndexedDB, dan fallback ke Web Speech API.
 */

// ============================================
// DAFTAR SUARA YANG TERSEDIA
// ============================================
export const TTS_VOICES = {
  // Wanita
  NANAMI:  "ja-JP-NanamiNeural",  // Default wanita — hangat, natural
  MAYU:    "ja-JP-NanamiNeural",    // Map ke Nanami (Mayu tidak didukung Edge TTS)
  SHIORI:  "ja-JP-NanamiNeural",  // Map ke Nanami (Shiori tidak didukung Edge TTS)
  // Pria
  KEITA:   "ja-JP-KeitaNeural",   // Default pria — dewasa, natural
  DAICHI:  "ja-JP-KeitaNeural",  // Map ke Keita (Daichi tidak didukung Edge TTS)
  NAOKI:   "ja-JP-KeitaNeural",   // Map ke Keita (Naoki tidak didukung Edge TTS)
} as const;

export type TtsVoice = typeof TTS_VOICES[keyof typeof TTS_VOICES];

// ============================================
// DETEKSI GENDER BERDASARKAN NAMA PEMBICARA
// ============================================

// Kata kunci yang mengindikasikan pembicara wanita
const FEMALE_KEYWORDS = [
  // Kanji/karakter gender
  "女", "母", "姉", "妹", "奥", "彼女", "娘", "ちゃん", "chan",
  // Profesi sering wanita dalam konteks N5-N3
  "先生",
  // Nama wanita umum dalam materi JLPT
  "ゆき", "はな", "さき", "あおい", "みく", "ゆみ", "けいこ", "みさ",
  "Yuki", "Hana", "Saki", "Aoi", "Miku", "Yumi", "Keiko", "Misa",
];

// Kata kunci yang mengindikasikan pembicara pria
const MALE_KEYWORDS = [
  // Kanji/karakter gender
  "男", "父", "兄", "弟", "夫", "彼", "くん", "君", "kun",
  // Nama pria umum dalam materi JLPT
  "たろう", "けんじ", "ひろし", "けん", "しんじ", "だいち", "ケン",
  "Taro", "Kenji", "Hiroshi", "Ken", "Shinji", "Daichi",
];

/**
 * Mendeteksi suara yang tepat berdasarkan nama pembicara.
 * Mengembalikan suara wanita atau pria secara bergantian
 * kalau nama tidak dikenali (untuk dialog multi-karakter tanpa nama jelas).
 *
 * @param speaker - Nama pembicara dari transkrip
 * @param fallbackIndex - Index baris (dipakai untuk rotasi default pria/wanita)
 */
export function detectVoice(speaker?: string, fallbackIndex = 0): TtsVoice {
  const femaleVoices = [TTS_VOICES.NANAMI];
  const maleVoices = [TTS_VOICES.KEITA];
  const allVoices = [...femaleVoices, ...maleVoices];

  if (!speaker || speaker === "???" || speaker.trim() === "") {
    // Rotasi dinamis melintasi suara yang didukung
    return allVoices[fallbackIndex % allVoices.length];
  }

  // Bersihkan gelar kehormatan Jepang/Romaji agar tidak mengganggu pencocokan gender (misal: "渡辺さん" -> "渡辺")
  const cleanSpeaker = speaker.replace(/[- ]?(さん|くん|ちゃん|様|君|sama|san|kun|chan)$/i, "").trim();

  // Hitung hash deterministik sederhana dari nama speaker untuk pilihan suara yang konsisten
  let hash = 0;
  for (let i = 0; i < cleanSpeaker.length; i++) {
    hash = cleanSpeaker.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash);

  // Daftar nama tokoh dengan gender pasti (Katakana & Romaji dari lessons/listening)
  const EXACT_FEMALE = [
    "Ayu", "Siti", "Dewi", "Rara", "Indah", "Sato", "Kimura", "Hayashi", "Kobayashi", "Sakura",
    "アユ", "シティ", "デウィ", "ララ", "インダ", "佐藤", "木村", "林", "小林", "さくら", "サクラ",
    "さとう", "きむら", "はやし", "こばやし"
  ];
  const EXACT_MALE = [
    "Budi", "Faisal", "Andi", "Dito", "Adit", "Tanaka", "Suzuki", "Takahashi", "Watanabe", "Yamada", "Ken",
    "ブディ", "ファイサル", "アンディ", "ディト", "アディット", "田中", "鈴木", "高橋", "渡辺", "山田", "ケン",
    "たなか", "すずき", "たかはし", "わたなべ", "やまだ", "田中部長", "山田部長"
  ];

  if (EXACT_FEMALE.includes(cleanSpeaker)) {
    return femaleVoices[index % femaleVoices.length];
  }
  if (EXACT_MALE.includes(cleanSpeaker)) {
    return maleVoices[index % maleVoices.length];
  }

  const speakerLower = cleanSpeaker.toLowerCase();
  const isFemale = FEMALE_KEYWORDS.some(k => cleanSpeaker.includes(k) || speakerLower.includes(k.toLowerCase()));
  const isMale   = MALE_KEYWORDS.some(k => cleanSpeaker.includes(k) || speakerLower.includes(k.toLowerCase()));

  if (isFemale && !isMale) {
    return femaleVoices[index % femaleVoices.length];
  }
  if (isMale && !isFemale) {
    return maleVoices[index % maleVoices.length];
  }

  // Jika gender tidak terdeteksi secara spesifik, petakan secara deterministik ke seluruh pilihan suara
  return allVoices[index % allVoices.length];
}

// ============================================
// CACHE KEY UNTUK INDEXEDDB
// ============================================
function buildCacheKey(text: string, voice: TtsVoice, rate: string): string {
  // Key deterministik agar audio yang sama tidak di-fetch ulang
  return `tts:${voice}:${rate}:${text}`;
}

// ============================================
// FETCH AUDIO DARI API ROUTE + CACHE
// ============================================

// Map in-memory untuk de-duplikasi request yang sedang berjalan
const pendingRequests = new Map<string, Promise<string>>();

/**
 * Mengambil URL audio TTS yang bisa diputar oleh elemen <audio>.
 * Menyimpan audio ke CacheStorage, mengembalikan URL API route asli
 * (bukan blob URL) agar Range requests tetap berfungsi.
 *
 * @returns URL string yang siap dipakai sebagai src audio, atau null jika gagal
 */
export async function fetchTTSAudio(
  text: string,
  voice: TtsVoice,
  rate = "medium"
): Promise<string | null> {
  if (!text.trim()) return null;

  // Bangun URL API route — ini yang dikembalikan sebagai src
  const params = new URLSearchParams({ text, voice, rate, v: "3" });
  const apiUrl = `/api/tts?${params.toString()}`;

  const cacheKey = buildCacheKey(text, voice, rate);
  const cacheName = "nihongoroute_tts_cache_v3";

  // 1. Prefetch ke CacheStorage di background (non-blocking)
  //    Ini memastikan audio tersedia offline setelah pertama kali diputar
  if (!pendingRequests.has(cacheKey)) {
    const prefetchPromise = (async () => {
      try {
        if (typeof window === "undefined" || !("caches" in window)) return;
        const cache = await caches.open(cacheName);
        const existing = await cache.match(apiUrl);
        if (existing) return; // Sudah ada

        const res = await fetch(apiUrl);
        if (!res.ok) return;
        await cache.put(apiUrl, res);

        // Batasi cache TTS maks 200 item
        const keys = await cache.keys();
        if (keys.length > 200) {
          for (let i = 0; i < keys.length - 200; i++) {
            await cache.delete(keys[i]);
          }
        }
      } catch {
        // Prefetch gagal — audio masih bisa diputar dari network
      } finally {
        pendingRequests.delete(cacheKey);
      }
    })();

    pendingRequests.set(cacheKey, prefetchPromise.then(() => apiUrl));
  }

  // 2. Kembalikan URL API route — bukan blob URL
  //    Browser/CacheStorage akan serve dari cache jika tersedia
  return apiUrl;
}

// ============================================
// FALLBACK: WEB SPEECH API
// ============================================

/**
 * Memutar teks menggunakan Web Speech API sebagai fallback
 * ketika Edge TTS tidak tersedia.
 */
export function speakWithWebSpeech(
  text: string,
  voice: TtsVoice,
  rate = 1,
  onEnd?: () => void,
  onError?: () => void
): () => void {
  if (typeof window === "undefined" || !window.speechSynthesis) {
    onError?.();
    return () => {};
  }

  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "ja-JP";
  // Sesuaikan rate — suara pria sedikit lebih lambat agar terdengar lebih natural
  utterance.rate = voice.includes("Keita") || voice.includes("Daichi") || voice.includes("Naoki")
    ? rate * 0.9
    : rate * 0.95;

  // Pilih suara sistem yang paling mendekati gender yang diminta
  const voices = window.speechSynthesis.getVoices();
  const isMaleVoice = [TTS_VOICES.KEITA, TTS_VOICES.DAICHI, TTS_VOICES.NAOKI].includes(voice as typeof TTS_VOICES.KEITA);
  const japaneseVoices = voices.filter(v => v.lang.startsWith("ja"));

  if (japaneseVoices.length > 0) {
    // Coba temukan suara yang sesuai gender
    const genderMatch = japaneseVoices.find(v => {
      const name = v.name.toLowerCase();
      return isMaleVoice ? name.includes("male") || name.includes("otoko") : name.includes("female") || name.includes("onna");
    });
    utterance.voice = genderMatch || japaneseVoices[0];
  }

  utterance.onend  = () => onEnd?.();
  utterance.onerror = (e) => {
    if (e.error !== "interrupted") onError?.();
  };

  window.speechSynthesis.speak(utterance);

  return () => window.speechSynthesis.cancel();
}
