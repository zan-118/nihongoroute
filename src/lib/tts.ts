/**
 * @file tts.ts
 * @description Utilitas Text-to-Speech via Edge TTS API Route.
 * Menangani deteksi suara pria/wanita berdasarkan nama pembicara,
 * caching audio di IndexedDB, dan fallback ke Web Speech API.
 */

// ============================================
// DAFTAR TOKOH / SUARA YANG TERSEDIA
// ============================================
export const TTS_VOICES = {
  // Wanita (VOICEVOX)
  LARA: "lara",
  INDAH: "indah",
  SITI: "siti",
  DEWI: "dewi",
  HAYASHI: "hayashi",
  SATO: "sato",
  AYU: "ayu",
  ZUNDAMON: "zundamon",
  
  // Pria (VOICEVOX)
  DITO: "dito",
  BUDI: "budi",
  SUZUKI: "suzuki",
  TANAKA: "tanaka",
  YAMADA: "yamada",
  KIMURA: "kimura",
  ANDI: "andi",
  FAISAL: "faisal",
  TAKAHASHI: "takahashi",
  KOBAYASHI: "kobayashi",
  NAMONASHI: "namonashi",
} as const;

export type TtsVoice = typeof TTS_VOICES[keyof typeof TTS_VOICES];

// ============================================
// DETEKSI GENDER BERDASARKAN NAMA PEMBICARA
// ============================================

// Kata kunci yang mengindikasikan pembicara wanita
const FEMALE_KEYWORDS = [
  "女", "母", "姉", "妹", "奥", "彼女", "娘", "ちゃん", "chan",
  "先生",
  "ゆき", "はな", "さき", "あおい", "みく", "ゆみ", "けいこ", "みさ",
  "Yuki", "Hana", "Saki", "Aoi", "Miku", "Yumi", "Keiko", "Misa",
];

// Kata kunci yang mengindikasikan pembicara pria
const MALE_KEYWORDS = [
  "男", "父", "兄", "弟", "夫", "彼", "くん", "君", "kun",
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
  const femaleVoices = [
    TTS_VOICES.ZUNDAMON,
    TTS_VOICES.LARA,
    TTS_VOICES.INDAH,
    TTS_VOICES.SITI,
    TTS_VOICES.DEWI,
    TTS_VOICES.HAYASHI,
    TTS_VOICES.SATO,
    TTS_VOICES.AYU,
  ];
  const maleVoices = [
    TTS_VOICES.NAMONASHI,
    TTS_VOICES.DITO,
    TTS_VOICES.BUDI,
    TTS_VOICES.SUZUKI,
    TTS_VOICES.TANAKA,
    TTS_VOICES.YAMADA,
    TTS_VOICES.KIMURA,
    TTS_VOICES.ANDI,
    TTS_VOICES.FAISAL,
    TTS_VOICES.TAKAHASHI,
    TTS_VOICES.KOBAYASHI,
  ];
  const allVoices = [...femaleVoices, ...maleVoices];

  if (!speaker || speaker === "???" || speaker.trim() === "") {
    // Rotasi dinamis melintasi seluruh suara
    return allVoices[fallbackIndex % allVoices.length];
  }

  // 1. Bersihkan gelar kehormatan Jepang/Romaji agar tidak mengganggu pencocokan
  const cleanSpeaker = speaker.replace(/[- ]?(さん|くん|ちゃん|様|君|sama|san|kun|chan)$/i, "").trim().toLowerCase();

  // 2. Jika nama pembicara cocok langsung dengan salah satu tokoh yang didaftarkan, gunakan suara tokoh tersebut!
  const voiceValues = Object.values(TTS_VOICES) as string[];
  if (voiceValues.includes(cleanSpeaker)) {
    return cleanSpeaker as TtsVoice;
  }

  // 3. Deteksi gender berdasarkan suffix/honorific asli jika tidak cocok nama langsung
  const speakerLowerOriginal = speaker.toLowerCase().trim();
  let preDetectedGender: "female" | "male" | null = null;

  if (
    speakerLowerOriginal.endsWith("ちゃん") ||
    speakerLowerOriginal.endsWith("chan")
  ) {
    preDetectedGender = "female";
  } else if (
    speakerLowerOriginal.endsWith("くん") ||
    speakerLowerOriginal.endsWith("kun") ||
    speakerLowerOriginal.endsWith("君")
  ) {
    preDetectedGender = "male";
  }

  // Hitung hash deterministik sederhana dari nama speaker untuk pilihan suara yang konsisten
  let hash = 0;
  for (let i = 0; i < cleanSpeaker.length; i++) {
    hash = cleanSpeaker.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash);

  // Jika terdeteksi via suffix, langsung return pilihan suara ter-hash sesuai gendernya
  if (preDetectedGender === "female") {
    return femaleVoices[index % femaleVoices.length];
  }
  if (preDetectedGender === "male") {
    return maleVoices[index % maleVoices.length];
  }

  // Daftar nama tokoh dengan gender pasti
  const EXACT_FEMALE = [
    "ayu", "siti", "dewi", "rara", "indah", "sakura", "lara", "sato", "hayashi",
    "アユ", "シティ", "デウィ", "ララ", "インダ", "さくら", "サクラ", "さとう", "はやし"
  ];
  const EXACT_MALE = [
    "budi", "faisal", "andi", "dito", "adit", "ken", "suzuki", "tanaka", "yamada", "kimura", "takahashi", "kobayashi",
    "ブディ", "ファイサル", "アンディ", "ディト", "アディット", "ケン", "すずき", "たなか", "やまだ", "きむら", "たかはし", "こばやし"
  ];

  if (EXACT_FEMALE.includes(cleanSpeaker)) {
    return femaleVoices[index % femaleVoices.length];
  }
  if (EXACT_MALE.includes(cleanSpeaker)) {
    return maleVoices[index % maleVoices.length];
  }

  const isFemale = FEMALE_KEYWORDS.some(k => cleanSpeaker.includes(k));
  const isMale   = MALE_KEYWORDS.some(k => cleanSpeaker.includes(k));

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
  return `tts:${voice}:${rate}:${text}`;
}

// ============================================
// FETCH AUDIO DARI API ROUTE + CACHE
// ============================================

/**
 * Mengambil URL audio TTS yang bisa diputar oleh elemen <audio>.
 * Mengembalikan Blob URL lokal agar berfungsi sepenuhnya offline.
 *
 * @returns URL string (Blob URL / API URL) yang siap dipakai sebagai src audio, atau null jika gagal
 */
export async function fetchTTSAudio(
  text: string,
  voice: TtsVoice,
  rate = "medium"
): Promise<string | null> {
  if (!text.trim()) return null;

  const params = new URLSearchParams({ text, voice, rate, v: "3" });
  const apiUrl = `/api/tts?${params.toString()}`;
  const cacheName = "nihongoroute_tts_cache_v3";

  if (typeof window === "undefined") return null;

  try {
    if ("caches" in window) {
      const cache = await caches.open(cacheName);
      const cachedResponse = await cache.match(apiUrl);

      // 1. Jika ada di CacheStorage, buat Blob URL lokal
      if (cachedResponse) {
        const blob = await cachedResponse.blob();
        return URL.createObjectURL(blob);
      }

      // 2. Jika tidak ada dan online, fetch dari API Route
      if (navigator.onLine) {
        const res = await fetch(apiUrl);
        if (res.ok) {
          await cache.put(apiUrl, res.clone());
          const blob = await res.blob();

          // Batasi cache TTS maks 200 item
          const keys = await cache.keys();
          if (keys.length > 200) {
            for (let i = 0; i < keys.length - 200; i++) {
              await cache.delete(keys[i]);
            }
          }

          return URL.createObjectURL(blob);
        }
      }
    }
  } catch (err) {
    console.warn("[TTS fetch] CacheStorage error, fallback ke URL direct:", err);
  }

  // 3. Fallback jika offline dan tidak tercache, kembalikan null untuk memicu Web Speech API
  return navigator.onLine ? apiUrl : null;
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
  
  // Tentukan apakah suara target bergender pria
  const maleVoices = [
    TTS_VOICES.NAMONASHI,
    TTS_VOICES.DITO,
    TTS_VOICES.BUDI,
    TTS_VOICES.SUZUKI,
    TTS_VOICES.TANAKA,
    TTS_VOICES.YAMADA,
    TTS_VOICES.KIMURA,
    TTS_VOICES.ANDI,
    TTS_VOICES.FAISAL,
    TTS_VOICES.TAKAHASHI,
    TTS_VOICES.KOBAYASHI,
  ] as string[];
  
  const isMaleVoice = maleVoices.includes(voice);
  utterance.rate = isMaleVoice ? rate * 0.9 : rate * 0.95;

  // Pilih suara sistem yang paling mendekati gender yang diminta
  const voices = window.speechSynthesis.getVoices();
  const japaneseVoices = voices.filter(v => v.lang.startsWith("ja"));

  if (japaneseVoices.length > 0) {
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
