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
 */

/**
 * Configuration metadata for a voice character.
 */
export interface VoiceCharacter {
  readonly name: string;
  readonly voicevoxName?: string;
  readonly speakerId?: number;
  readonly gender: "female" | "male";
  readonly role: string;
  readonly description: string;
}

/**
 * Database of voice characters mapped by name.
 */
export const VOICE_CHARACTERS: Record<string, VoiceCharacter> = {
  // Wanita
  indah: {
    name: "indah",
    gender: "female",
    role: "Narator Utama / Guru Wanita",
    description: "Tenang, dewasa, artikulasi sangat jelas, intonasi formal & natural. Default pengucapan kosakata.",
  },
  lala: {
    name: "lala",
    gender: "female",
    role: "Remaja / Siswi SMA",
    description: "Ceria, ramah, riang, bernada cerah.",
  },
  siti: {
    name: "siti",
    gender: "female",
    role: "Teman Sekolah / Wanita Muda",
    description: "Lembut, ramah, jernih.",
  },
  dewi: {
    name: "dewi",
    gender: "female",
    role: "Gadis Kecil / Karakter Imut",
    description: "Manja, energetik, ekspresif.",
  },
  hayashi: {
    name: "hayashi",
    gender: "female",
    role: "Ibu Rumah Tangga / Wanita Karir",
    description: "Dewasa, bijaksana, berwibawa.",
  },
  sato: {
    name: "sato",
    gender: "female",
    role: "Petugas Toko / Resepsionis",
    description: "Sopan, intonasi formal, ramah.",
  },
  ayu: {
    name: "ayu",
    gender: "female",
    role: "Remaja Santai / Teman Wanita",
    description: "Intonasi tenang, suara jernih, modern.",
  },
  zundamon: {
    name: "zundamon",
    voicevoxName: "Zundamon",
    speakerId: 3,
    gender: "female",
    role: "Maskot Cilik / Anak-anak",
    description: "Nada sangat tinggi, kekanak-kanakan, energetik.",
  },
  ritsu: {
    name: "ritsu",
    gender: "female",
    role: "Wanita Misterius / Bernada Khas",
    description: "Unik, ekspresif, bernada khas.",
  },
  sakura: {
    name: "sakura",
    gender: "female",
    role: "Remaja Gadis / Baik Hati",
    description: "Suara lembut, ramah, penolong.",
  },
  ani: {
    name: "ani",
    gender: "female",
    role: "Remaja Gadis / Pemalu",
    description: "Suara manis, pemalu, santun.",
  },
  // Pria
  budi: {
    name: "budi",
    gender: "male",
    role: "Narator Utama Pria / Guru Pria",
    description: "Suara bariton, tenang, berwibawa, intonasi mantap & formal.",
  },
  dito: {
    name: "dito",
    gender: "male",
    role: "Remaja / Member SMA",
    description: "Tenang, kasual, ramah.",
  },
  suzuki: {
    name: "suzuki",
    gender: "male",
    role: "Pekerja Kantor / Pegawai Stasiun",
    description: "Formal, tegas, intonasi profesional.",
  },
  tanaka: {
    name: "tanaka",
    gender: "male",
    role: "Ayah / Pria Paruh Baya",
    description: "Berat, tenang, berwibawa.",
  },
  yamada: {
    name: "yamada",
    gender: "male",
    role: "Kakek / Pria Lanjut Usia",
    description: "Berat, serak, berwibawa.",
  },
  kimura: {
    name: "kimura",
    gender: "male",
    role: "Pemuda Gaul / Sahabat Dekat",
    description: "Cepat, energetik, sangat santai.",
  },
  andi: {
    name: "andi",
    gender: "male",
    role: "Pemuda Keren / Nada Dramatis",
    description: "Suara khas pemuda, bernada dramatis & penuh semangat.",
  },
  faisal: {
    name: "faisal",
    gender: "male",
    role: "Pria Dewasa / Kalem",
    description: "Tenang, bijaksana, intonasi seimbang.",
  },
  takahashi: {
    name: "takahashi",
    gender: "male",
    role: "Pekerja Kantoran Muda / Sopan",
    description: "Ramah, sopan, intonasi profesional santai.",
  },
  kobayashi: {
    name: "kobayashi",
    gender: "male",
    role: "Pria Dewasa / Suara Serius",
    description: "Dalam, berwibawa, bernada serius.",
  },
};

/**
 * TTS voice identifiers.
 */
export const TTS_VOICES = {
  // Wanita (VOICEVOX)
  LALA: "lala",
  INDAH: "indah",
  SITI: "siti",
  DEWI: "dewi",
  HAYASHI: "hayashi",
  SATO: "sato",
  AYU: "ayu",
  ZUNDAMON: "zundamon",
  RITSU: "ritsu",
  SAKURA: "sakura",
  ANI: "ani",
  
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
} as const;

/**
 * Maps Japanese and Romaji speaker names to TTS voice identifiers.
 */
export const SPEAKER_MAP: Record<string, TtsVoice> = {
  // === INDAH — Narator Wanita ===
  "indah": TTS_VOICES.INDAH,
  "インダ": TTS_VOICES.INDAH,
  "インダハ": TTS_VOICES.INDAH,

  // === LALA — Siswi SMA ===
  "lala": TTS_VOICES.LALA,
  "lara": TTS_VOICES.LALA,
  "ララ": TTS_VOICES.LALA,


  // === SITI — Wanita Muda ===
  "siti": TTS_VOICES.SITI,
  "シティ": TTS_VOICES.SITI,

  // === DEWI — Gadis Kecil ===
  "dewi": TTS_VOICES.DEWI,
  "デウィ": TTS_VOICES.DEWI,

  // === HAYASHI — Ibu / Wanita Karir ===
  "hayashi": TTS_VOICES.HAYASHI,
  "林": TTS_VOICES.HAYASHI,
  "はやし": TTS_VOICES.HAYASHI,
  "ハヤシ": TTS_VOICES.HAYASHI,

  // === SATO — Resepsionis ===
  "sato": TTS_VOICES.SATO,
  "佐藤": TTS_VOICES.SATO,
  "さとう": TTS_VOICES.SATO,
  "サトウ": TTS_VOICES.SATO,
  "サト": TTS_VOICES.SATO,

  // === AYU — Remaja Santai ===
  "ayu": TTS_VOICES.AYU,
  "アユ": TTS_VOICES.AYU,

  // === ZUNDAMON (VOICEVOX) — Maskot Cilik ===
  "zundamon": TTS_VOICES.ZUNDAMON,
  "ずんだもん": TTS_VOICES.ZUNDAMON,
  "ズンダモン": TTS_VOICES.ZUNDAMON,

  // === RITSU — Wanita Misterius ===
  "ritsu": TTS_VOICES.RITSU,
  "リツ": TTS_VOICES.RITSU,
  "りつ": TTS_VOICES.RITSU,

  // === SAKURA — Remaja Baik Hati ===
  "sakura": TTS_VOICES.SAKURA,
  "サクラ": TTS_VOICES.SAKURA,
  "さくら": TTS_VOICES.SAKURA,

  // === ANI — Remaja Pemalu ===
  "ani": TTS_VOICES.ANI,
  "アニ": TTS_VOICES.ANI,
  "あに": TTS_VOICES.ANI,

  // === BUDI — Narator Pria ===
  "budi": TTS_VOICES.BUDI,
  "ブディ": TTS_VOICES.BUDI,

  // === DITO — Member SMA ===
  "dito": TTS_VOICES.DITO,
  "ディト": TTS_VOICES.DITO,

  // === SUZUKI — Pekerja Kantor ===
  "suzuki": TTS_VOICES.SUZUKI,
  "鈴木": TTS_VOICES.SUZUKI,
  "すずき": TTS_VOICES.SUZUKI,
  "スズキ": TTS_VOICES.SUZUKI,

  // === TANAKA — Ayah / Pria Paruh Baya ===
  "tanaka": TTS_VOICES.TANAKA,
  "田中": TTS_VOICES.TANAKA,
  "たなか": TTS_VOICES.TANAKA,
  "タナカ": TTS_VOICES.TANAKA,

  // === YAMADA — Kakek ===
  "yamada": TTS_VOICES.YAMADA,
  "山田": TTS_VOICES.YAMADA,
  "やまだ": TTS_VOICES.YAMADA,
  "ヤマダ": TTS_VOICES.YAMADA,

  // === KIMURA — Pemuda Gaul ===
  "kimura": TTS_VOICES.KIMURA,
  "木村": TTS_VOICES.KIMURA,
  "きむら": TTS_VOICES.KIMURA,
  "キムラ": TTS_VOICES.KIMURA,

  // === ANDI — Pemuda Dramatis ===
  "andi": TTS_VOICES.ANDI,
  "アンディ": TTS_VOICES.ANDI,

  // === FAISAL — Pria Dewasa Kalem ===
  "faisal": TTS_VOICES.FAISAL,
  "ファイサル": TTS_VOICES.FAISAL,

  // === TAKAHASHI — Pekerja Kantoran Muda ===
  "takahashi": TTS_VOICES.TAKAHASHI,
  "高橋": TTS_VOICES.TAKAHASHI,
  "たかはし": TTS_VOICES.TAKAHASHI,
  "タカハシ": TTS_VOICES.TAKAHASHI,

  // === KOBAYASHI — Pria Serius ===
  "kobayashi": TTS_VOICES.KOBAYASHI,
  "小林": TTS_VOICES.KOBAYASHI,
  "こばやし": TTS_VOICES.KOBAYASHI,
  "コバヤシ": TTS_VOICES.KOBAYASHI,
};

/**
 * Type representing valid TTS voice identifiers.
 */
export type TtsVoice = typeof TTS_VOICES[keyof typeof TTS_VOICES];

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
  const femaleVoices = [
    TTS_VOICES.ZUNDAMON,
    TTS_VOICES.LALA,
    TTS_VOICES.INDAH,
    TTS_VOICES.SITI,
    TTS_VOICES.DEWI,
    TTS_VOICES.HAYASHI,
    TTS_VOICES.SATO,
    TTS_VOICES.AYU,
    TTS_VOICES.RITSU,
    TTS_VOICES.SAKURA,
    TTS_VOICES.ANI,
  ];
  const maleVoices = [
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
    return femaleVoices[index % femaleVoices.length];
  }
  if (preDetectedGender === "male") {
    return maleVoices[index % maleVoices.length];
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
    return femaleVoices[index % femaleVoices.length];
  }
  if (EXACT_MALE.includes(cleanSpeaker)) {
    return maleVoices[index % maleVoices.length];
  }

  // Check keyword matches
  const isFemale = FEMALE_KEYWORDS.some(k => cleanSpeaker.includes(k));
  const isMale   = MALE_KEYWORDS.some(k => cleanSpeaker.includes(k));

  if (isFemale && !isMale) {
    return femaleVoices[index % femaleVoices.length];
  }
  if (isMale && !isFemale) {
    return maleVoices[index % maleVoices.length];
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
  
  const maleVoices = [
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
  
  // Adjust rate based on gender
  const isMaleVoice = maleVoices.includes(voice);
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