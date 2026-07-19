/**
 * @file tts.ts
 * @description Utilitas Text-to-Speech via Edge TTS API Route.
 * Menangani deteksi suara pria/wanita berdasarkan nama pembicara,
 * caching audio di IndexedDB, dan fallback ke Web Speech API.
 * 
 * ============================================================================
 * DAFTAR TOKOH / KARAKTER PERMANEN & PERAN SUARA (TTS_VOICES CASTING SHEET)
 * ============================================================================
 * 
 * TOKOH WANITA:
 * 1. INDAH    -> Peran: Narator Utama / Guru Wanita. 
 *                Karakteristik: Tenang, dewasa, artikulasi sangat jelas, intonasi formal & natural.
 *                *Digunakan sebagai default pengucapan seluruh kosakata (vocab)*.
 * 2. LALA     -> Peran: Siswi SMA / Remaja.
 *                Karakteristik: Ceria, ramah, riang, bernada cerah.
 * 3. SITI     -> Peran: Teman Sekolah / Wanita Muda.
 *                Karakteristik: Lembut, ramah, jernih.
 * 4. DEWI     -> Peran: Gadis Kecil / Karakter Imut.
 *                Karakteristik: Manja, energetik, ekspresif.
 * 5. HAYASHI  -> Peran: Ibu Rumah Tangga / Wanita Karir.
 *                Karakteristik: Dewasa, bijaksana, berwibawa.
 * 6. SATO     -> Peran: Petugas Toko / Resepsionis.
 *                Karakteristik: Sopan, intonasi formal, ramah.
 * 7. AYU      -> Peran: Remaja Santai / Teman Wanita.
 *                Karakteristik: Intonasi tenang, suara jernih, modern.
 * 8. ZUNDAMON -> VOICEVOX: Zundamon (ID 3). Peran: Maskot Cilik / Anak-anak.
 *                Karakteristik: Nada sangat tinggi, kekanak-kanakan, energetik.
 * 9. RITSU    -> Peran: Wanita Misterius / Bernada Khas.
 *                Karakteristik: Unik, ekspresif, bernada khas.
 * 10. SAKURA  -> Peran: Remaja Gadis / Baik Hati.
 *                Karakteristik: Suara lembut, ramah, penolong.
 * 11. ANI     -> Peran: Remaja Gadis / Pemalu.
 *                Karakteristik: Suara manis, pemalu, santun.
 * 
 * TOKOH PRIA:
 * 1. BUDI     -> Peran: Narator Utama Pria / Guru Pria.
 *                Karakteristik: Suara bariton, tenang, berwibawa, intonasi mantap & formal.
 * 2. DITO     -> Peran: Member SMA / Pemuda.
 *                Karakteristik: Tenang, kasual, ramah.
 * 3. SUZUKI   -> Peran: Pekerja Kantor / Pegawai Stasiun.
 *                Karakteristik: Formal, tegas, intonasi profesional.
 * 4. TANAKA   -> Peran: Ayah / Pria Paruh Baya.
 *                Karakteristik: Berat, tenang, berwibawa.
 * 5. YAMADA   -> Peran: Kakek / Pria Lanjut Usia.
 *                Karakteristik: Berat, serak, berwibawa.
 * 6. KIMURA   -> Peran: Pemuda Gaul / Sahabat Dekat.
 *                Karakteristik: Cepat, energetik, sangat santai.
 * 7. ANDI     -> Peran: Pemuda Keren / Nada Dramatis.
 *                Karakteristik: Suara khas pemuda, bernada dramatis & penuh semangat.
 * 8. FAISAL   -> Peran: Pria Dewasa / Kalem.
 *                Karakteristik: Tenang, bijaksana, intonasi seimbang.
 * 9. TAKAHASHI -> Peran: Pekerja Kantoran Muda / Sopan.
 *                Karakteristik: Ramah, sopan, intonasi profesional santai.
 * 10. KOBAYASHI -> Peran: Pria Dewasa / Suara Serius.
 *                Karakteristik: Dalam, berwibawa, bernada serius.
 * ============================================================================
 */import {
  TTS_VOICES,
  type TtsVoice,
  type VoiceCharacter,
  VOICE_CHARACTERS,
  SPEAKER_MAP
} from "@/lib/constants/tts";

export {
  TTS_VOICES,
  type TtsVoice,
  type VoiceCharacter,
  VOICE_CHARACTERS,
  SPEAKER_MAP
};

// Auto-purge old cache storage once to clean up potential corrupted Edge TTS fallbacks.
if (typeof window !== "undefined" && "caches" in window) {
  const PURGE_KEY = "nihongoroute_tts_cache_cleaned_july2026";
  if (!localStorage.getItem(PURGE_KEY)) {
    caches.delete("nihongoroute_tts_cache")
      .then(() => {
        localStorage.setItem(PURGE_KEY, "true");
      })
      .catch(() => {});
  }
}

export const FEMALE_VOICES: readonly TtsVoice[] = [
  TTS_VOICES.LALA,
  TTS_VOICES.SITI,
  TTS_VOICES.SAKURA,
  TTS_VOICES.AYU,
  TTS_VOICES.ANI,
  TTS_VOICES.DEWI,
  TTS_VOICES.INDAH,
  TTS_VOICES.HAYASHI,
  TTS_VOICES.SATO,
  TTS_VOICES.RITSU,
  TTS_VOICES.ZUNDAMON,
];

export const MALE_VOICES: readonly TtsVoice[] = [
  TTS_VOICES.DITO,
  TTS_VOICES.ANDI,
  TTS_VOICES.KIMURA,
  TTS_VOICES.BUDI,
  TTS_VOICES.SUZUKI,
  TTS_VOICES.TANAKA,
  TTS_VOICES.YAMADA,
  TTS_VOICES.TAKAHASHI,
  TTS_VOICES.KOBAYASHI,
  TTS_VOICES.FAISAL,
];



// ============================================
// DETEKSI GENDER BERDASARKAN NAMA PEMBICARA
// ============================================

/**
 * Keywords indicating female speakers.
 */
const FEMALE_KEYWORDS = [
  "女", "母", "姉", "妹", "奥", "彼女", "娘", "ちゃん", "chan",
  "先生",
  "ゆき", "はな", "さき", "あおい", "みく", "ゆみ", "けいこ", "みさ",
  "Yuki", "Hana", "Saki", "Aoi", "Miku", "Yumi", "Keiko", "Misa",
];

/**
 * Keywords indicating male speakers.
 */
const MALE_KEYWORDS = [
  "男", "父", "兄", "弟", "夫", "彼", "くん", "君", "kun",
  "たろう", "けんじ", "ひろし", "けん", "しんじ", "だいち", "ケン",
  "Taro", "Kenji", "Hiroshi", "Ken", "Shinji", "Daichi",
];

/**
 * Detects appropriate voice based on speaker name.
 * Falls back to rotation if name is unrecognized.
 *
 * @param speaker - Speaker name from transcript.
 * @param fallbackIndex - Index for default voice rotation.
 * @returns Detected TTS voice.
 */
export function detectVoice(speaker?: string, fallbackIndex = 0): TtsVoice {
  const allVoices = [...FEMALE_VOICES, ...MALE_VOICES];

  // Fallback rotation for empty speaker names
  if (!speaker || speaker === "???" || speaker.trim() === "") {
    return allVoices[fallbackIndex % allVoices.length];
  }

  // Clean honorifics and split compound names
  const firstSpeaker = speaker.split(/[・、/&,]/)[0].split(/\s+dan\s+/i)[0].split(/\s+and\s+/i)[0].trim();
  const cleanSpeaker = firstSpeaker.replace(/[- ]?(さん|くん|ちゃん|様|君|先生|sama|san|kun|chan|sensei)$/i, "").trim().toLowerCase();

  // Check explicit speaker map
  if (SPEAKER_MAP[cleanSpeaker]) {
    return SPEAKER_MAP[cleanSpeaker];
  }

  // Check direct match with voice keys
  const voiceValues = Object.values(TTS_VOICES) as string[];
  if (voiceValues.includes(cleanSpeaker)) {
    return cleanSpeaker as TtsVoice;
  }

  // Detect gender from suffix
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

  // Generate deterministic hash from name
  let hash = 0;
  for (let i = 0; i < cleanSpeaker.length; i++) {
    hash = cleanSpeaker.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash);

  // Return voice based on suffix gender
  if (preDetectedGender === "female") {
    return FEMALE_VOICES[index % FEMALE_VOICES.length];
  }
  if (preDetectedGender === "male") {
    return MALE_VOICES[index % MALE_VOICES.length];
  }

  // Check exact gender lists
  const EXACT_FEMALE = [
    "ayu", "siti", "dewi", "ani", "indah", "sakura", "lala", "sato", "hayashi",
    "アユ", "シティ", "デウィ", "ララ", "インダ", "さくら", "サクラ", "さとう", "はやし"
  ];
  const EXACT_MALE = [
    "budi", "faisal", "andi", "dito", "suzuki", "tanaka", "yamada", "kimura", "takahashi", "kobayashi",
    "ブディ", "ファイサル", "アンディ", "ディト", "すずき", "たなか", "やまだ", "きむら", "たかはし", "こばやし"
  ];

  if (EXACT_FEMALE.includes(cleanSpeaker)) {
    return FEMALE_VOICES[index % FEMALE_VOICES.length];
  }
  if (EXACT_MALE.includes(cleanSpeaker)) {
    return MALE_VOICES[index % MALE_VOICES.length];
  }

  // Check keyword matches
  const isFemale = FEMALE_KEYWORDS.some(k => cleanSpeaker.includes(k));
  const isMale   = MALE_KEYWORDS.some(k => cleanSpeaker.includes(k));

  if (isFemale && !isMale) {
    return FEMALE_VOICES[index % FEMALE_VOICES.length];
  }
  if (isMale && !isFemale) {
    return MALE_VOICES[index % MALE_VOICES.length];
  }

  // Fallback to deterministic rotation
  return allVoices[index % allVoices.length];
}

/**
 * Builds unique cache key for TTS requests.
 * 
 * @param text - Input text.
 * @param voice - Target voice.
 * @param rate - Speech rate.
 * @returns Cache key string.
 */
function buildCacheKey(text: string, voice: TtsVoice, rate: string): string {
  return `tts:${voice}:${rate}:${text}`;
}

// ============================================
// FETCH AUDIO DARI API ROUTE + CACHE
// ============================================

/**
 * Fetches TTS audio URL. Caches response in CacheStorage.
 *
 * @param text - Text to synthesize.
 * @param voice - Target voice.
 * @param rate - Speech rate.
 * @returns Blob URL or null if failed.
 */
export async function fetchTTSAudio(
  text: string,
  voice: TtsVoice,
  rate = "medium"
): Promise<string | null> {
  const cleanText = text.trim();
  if (!cleanText) return null;

  const params = new URLSearchParams({ text: cleanText, voice, rate });
  const apiUrl = `/api/tts?${params.toString()}`;
  const cacheName = "nihongoroute_tts_cache";

  if (typeof window === "undefined") return null;

  try {
    if ("caches" in window) {
      const cache = await caches.open(cacheName);
      const cachedResponse = await cache.match(apiUrl);

      // Check CacheStorage for existing audio
      if (cachedResponse) {
        const blob = await cachedResponse.blob();
        return URL.createObjectURL(blob);
      }

      // Fetch from API route
      try {
        const res = await fetch(apiUrl);
        if (res.ok) {
          const blob = await res.blob();
          
          const cacheControl = res.headers.get("Cache-Control") || "";
          const isNoStore = cacheControl.includes("no-store");

          if (!isNoStore) {
            const responseToCache = new Response(blob, {
              headers: { "Content-Type": "audio/mpeg" }
            });
            await cache.put(apiUrl, responseToCache);

            // Limit cache size to 200 items
            const keys = await cache.keys();
            if (keys.length > 200) {
              for (let i = 0; i < keys.length - 200; i++) {
                await cache.delete(keys[i]);
              }
            }
          }

          return URL.createObjectURL(blob);
        }
      } catch {
        // Fetch failed, fallback to null
      }
    }
  } catch (err) {
    console.warn("[TTS fetch] CacheStorage error:", err);
  }

  return null;
}

// ============================================
// FALLBACK: WEB SPEECH API
// ============================================

/**
 * Plays text using Web Speech API fallback.
 * 
 * @param text - Text to speak.
 * @param voice - Target voice.
 * @param rate - Speech rate multiplier.
 * @param onEnd - Callback on completion.
 * @param onError - Callback on error.
 * @returns Cancel function.
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

  // Cancel ongoing speech
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "ja-JP";
  
  // Adjust rate based on gender
  const isMaleVoice = MALE_VOICES.includes(voice);
  utterance.rate = isMaleVoice ? rate * 0.9 : rate * 0.95;

  // Match system Japanese voice by gender
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