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
 * 1. INDAH    -> VOICEVOX: Shikoku Metan (ID 2). Peran: Narator Utama / Guru Wanita. 
 *                Karakteristik: Tenang, dewasa, artikulasi sangat jelas, intonasi formal & natural.
 *                *Digunakan sebagai default pengucapan seluruh kosakata (vocab)*.
 * 2. LARA     -> VOICEVOX: Kasukabe Tsumugi (ID 8). Peran: Siswi SMA / Remaja.
 *                Karakteristik: Ceria, ramah, riang, bernada cerah.
 * 3. SITI     -> VOICEVOX: Amehare Hau (ID 10). Peran: Teman Sekolah / Wanita Muda.
 *                Karakteristik: Lembut, ramah, jernih.
 * 4. DEWI     -> VOICEVOX: Meimei Himari (ID 14). Peran: Gadis Kecil / Karakter Imut.
 *                Karakteristik: Manja, energetik, ekspresif.
 * 5. HAYASHI  -> VOICEVOX: Kyushu Sora (ID 16). Peran: Ibu Rumah Tangga / Wanita Karir.
 *                Karakteristik: Dewasa, bijaksana, berwibawa.
 * 6. SATO     -> VOICEVOX: Mochiko-san (ID 20). Peran: Petugas Toko / Resepsionis.
 *                Karakteristik: Sopan, intonasi formal, ramah.
 * 7. AYU      -> VOICEVOX: Zundamon (ID 3). Peran: Maskot Cilik / Anak-anak.
 *                Karakteristik: Nada sangat tinggi, kekanak-kanakan, energetik.
 * 
 * TOKOH PRIA:
 * 1. BUDI     -> VOICEVOX: Aoyama Ryuusei (ID 13). Peran: Narator Utama Pria / Guru Pria.
 *                Karakteristik: Suara bariton, tenang, berwibawa, intonasi mantap & formal.
 * 2. DITO     -> VOICEVOX: Kuronou Takehiro (ID 11). Peran: Siswa SMA / Pemuda.
 *                Karakteristik: Tenang, kasual, ramah.
 * 3. SUZUKI   -> VOICEVOX: Kenzaki Mesu (ID 21). Peran: Pekerja Kantor / Pegawai Kereta.
 *                Karakteristik: Formal, tegas, intonasi profesional.
 * 4. TANAKA   -> VOICEVOX: Sakamatsuri Shuji (ID 52). Peran: Ayah / Pria Paruh Baya.
 *                Karakteristik: Berat, tenang, berwibawa.
 * 5. YAMADA   -> VOICEVOX: Kigasajima Sourin (ID 53). Peran: Kakek / Orang Lanjut Usia.
 *                Karakteristik: Berat, serak, berwibawa.
 * 6. KIMURA   -> VOICEVOX: Shirakami Koutarou (ID 12). Peran: Pemuda Gaul / Sahabat Laki-laki.
 *                Karakteristik: Cepat, energetik, sangat santai.
 * ============================================================================
 */

export interface VoiceCharacter {
  readonly name: string;
  readonly voicevoxName: string;
  readonly speakerId: number;
  readonly gender: "female" | "male";
  readonly role: string;
  readonly description: string;
}

export const VOICE_CHARACTERS: Record<string, VoiceCharacter> = {
  // Wanita
  indah: {
    name: "indah",
    voicevoxName: "Shikoku Metan",
    speakerId: 2,
    gender: "female",
    role: "Narator Utama / Guru Wanita",
    description: "Tenang, dewasa, artikulasi sangat jelas, intonasi formal & natural. Default pengucapan kosakata.",
  },
  lara: {
    name: "lara",
    voicevoxName: "Kasukabe Tsumugi",
    speakerId: 8,
    gender: "female",
    role: "Remaja / Siswi SMA",
    description: "Ceria, ramah, riang, bernada cerah.",
  },
  siti: {
    name: "siti",
    voicevoxName: "Amehare Hau",
    speakerId: 10,
    gender: "female",
    role: "Teman Sekolah / Wanita Muda",
    description: "Lembut, ramah, jernih.",
  },
  dewi: {
    name: "dewi",
    voicevoxName: "Meimei Himari",
    speakerId: 14,
    gender: "female",
    role: "Gadis Kecil / Karakter Imut",
    description: "Manja, energetik, ekspresif.",
  },
  hayashi: {
    name: "hayashi",
    voicevoxName: "Kyushu Sora",
    speakerId: 16,
    gender: "female",
    role: "Ibu Rumah Tangga / Wanita Karir",
    description: "Dewasa, bijaksana, berwibawa.",
  },
  sato: {
    name: "sato",
    voicevoxName: "Mochiko-san",
    speakerId: 20,
    gender: "female",
    role: "Petugas Toko / Resepsionis",
    description: "Sopan, intonasi formal, ramah.",
  },
  ayu: {
    name: "ayu",
    voicevoxName: "WhiteCUL",
    speakerId: 23,
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
    voicevoxName: "Namine Ritsu",
    speakerId: 9,
    gender: "female",
    role: "Wanita Misterius / Bernada Khas",
    description: "Unik, ekspresif, bernada khas.",
  },
  // Pria
  budi: {
    name: "budi",
    voicevoxName: "Aoyama Ryuusei",
    speakerId: 13,
    gender: "male",
    role: "Narator Utama Pria / Guru Pria",
    description: "Suara bariton, tenang, berwibawa, intonasi mantap & formal.",
  },
  dito: {
    name: "dito",
    voicevoxName: "Kuronou Takehiro",
    speakerId: 11,
    gender: "male",
    role: "Remaja / Siswa SMA",
    description: "Tenang, kasual, ramah.",
  },
  suzuki: {
    name: "suzuki",
    voicevoxName: "Kenzaki Mesu",
    speakerId: 21,
    gender: "male",
    role: "Pekerja Kantor / Pegawai Stasiun",
    description: "Formal, tegas, intonasi profesional.",
  },
  tanaka: {
    name: "tanaka",
    voicevoxName: "Sakamatsuri Shuji",
    speakerId: 52,
    gender: "male",
    role: "Ayah / Pria Paruh Baya",
    description: "Berat, tenang, berwibawa.",
  },
  yamada: {
    name: "yamada",
    voicevoxName: "Kigasajima Sourin",
    speakerId: 53,
    gender: "male",
    role: "Kakek / Pria Lanjut Usia",
    description: "Berat, serak, berwibawa.",
  },
  kimura: {
    name: "kimura",
    voicevoxName: "Shirakami Koutarou",
    speakerId: 12,
    gender: "male",
    role: "Pemuda Gaul / Sahabat Dekat",
    description: "Cepat, energetik, sangat santai.",
  },
  andi: {
    name: "andi",
    voicevoxName: "Holy Knight Red Sakura",
    speakerId: 51,
    gender: "male",
    role: "Pemuda Keren / Nada Dramatis",
    description: "Suara khas pemuda, bernada dramatis & penuh semangat.",
  },
  faisal: {
    name: "faisal",
    voicevoxName: "Nakae Tsurugi",
    speakerId: 94,
    gender: "male",
    role: "Pria Dewasa / Kalem",
    description: "Tenang, bijaksana, intonasi seimbang.",
  },
  takahashi: {
    name: "takahashi",
    voicevoxName: "Kurosawa Kohaku",
    speakerId: 100,
    gender: "male",
    role: "Pekerja Kantoran Muda / Sopan",
    description: "Ramah, sopan, intonasi profesional santai.",
  },
  kobayashi: {
    name: "kobayashi",
    voicevoxName: "Rito",
    speakerId: 99,
    gender: "male",
    role: "Pria Dewasa / Suara Serius",
    description: "Dalam, berwibawa, bernada serius.",
  },
  namonashi: {
    name: "namonashi",
    voicevoxName: "Ankomon",
    speakerId: 113,
    gender: "male",
    role: "Pria Anonim / Kasual",
    description: "Santai, bersahabat, suara paruh baya natural.",
  },
  ooba: {
    name: "ooba",
    voicevoxName: "Chibi Shikiji",
    speakerId: 42,
    gender: "male",
    role: "Pria Tua Cilik / Suara Klasik",
    description: "Suara khas pria berumur dengan karakter unik.",
  },
};

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
  RITSU: "ritsu",
  
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
  OOBA: "ooba",
} as const;

export const SPEAKER_MAP: Record<string, TtsVoice> = {
  // === INDAH (四国めたん / Shikoku Metan) — Narator Wanita ===
  "indah": TTS_VOICES.INDAH,
  "インダ": TTS_VOICES.INDAH,
  "インダハ": TTS_VOICES.INDAH,

  // === LARA (春日部つむぎ / Kasukabe Tsumugi) — Siswi SMA ===
  "lara": TTS_VOICES.LARA,
  "ララ": TTS_VOICES.LARA,

  // === SITI (雨晴はう / Amehare Hau) — Wanita Muda ===
  "siti": TTS_VOICES.SITI,
  "シティ": TTS_VOICES.SITI,

  // === DEWI (冥鳴ひまり / Meimei Himari) — Gadis Kecil ===
  "dewi": TTS_VOICES.DEWI,
  "デウィ": TTS_VOICES.DEWI,

  // === HAYASHI (九州そら / Kyushu Sora) — Ibu / Wanita Karir ===
  "hayashi": TTS_VOICES.HAYASHI,
  "林": TTS_VOICES.HAYASHI,
  "はやし": TTS_VOICES.HAYASHI,

  // === SATO (もち子さん / Mochiko-san) — Resepsionis ===
  "sato": TTS_VOICES.SATO,
  "佐藤": TTS_VOICES.SATO,
  "さとう": TTS_VOICES.SATO,

  // === AYU (WhiteCUL) — Remaja Santai ===
  "ayu": TTS_VOICES.AYU,
  "アユ": TTS_VOICES.AYU,

  // === ZUNDAMON (ずんだもん) — Maskot Cilik ===
  "zundamon": TTS_VOICES.ZUNDAMON,
  "ずんだもん": TTS_VOICES.ZUNDAMON,
  "ズンダモン": TTS_VOICES.ZUNDAMON,

  // === RITSU (波音リツ / Namine Ritsu) — Wanita Misterius ===
  "ritsu": TTS_VOICES.RITSU,
  "リツ": TTS_VOICES.RITSU,
  "りつ": TTS_VOICES.RITSU,

  // === BUDI (青山龍星 / Aoyama Ryuusei) — Narator Pria ===
  "budi": TTS_VOICES.BUDI,
  "ブディ": TTS_VOICES.BUDI,

  // === DITO (玄野武宏 / Kuronou Takehiro) — Siswa SMA ===
  "dito": TTS_VOICES.DITO,
  "ディト": TTS_VOICES.DITO,

  // === SUZUKI (剣崎雌雄 / Kenzaki Mesu) — Pekerja Kantor ===
  "suzuki": TTS_VOICES.SUZUKI,
  "鈴木": TTS_VOICES.SUZUKI,
  "すずき": TTS_VOICES.SUZUKI,

  // === TANAKA (雀松朱司 / Sakamatsuri Shuji) — Ayah / Pria Paruh Baya ===
  "tanaka": TTS_VOICES.TANAKA,
  "田中": TTS_VOICES.TANAKA,
  "たなか": TTS_VOICES.TANAKA,

  // === YAMADA (麒ヶ島宗麟 / Kigasajima Sourin) — Kakek ===
  "yamada": TTS_VOICES.YAMADA,
  "山田": TTS_VOICES.YAMADA,
  "やまだ": TTS_VOICES.YAMADA,

  // === KIMURA (白上虎太郎 / Shirakami Koutarou) — Pemuda Gaul ===
  "kimura": TTS_VOICES.KIMURA,
  "木村": TTS_VOICES.KIMURA,
  "きむら": TTS_VOICES.KIMURA,

  // === ANDI (†聖騎士 紅桜† / Holy Knight Red Sakura) — Pemuda Dramatis ===
  "andi": TTS_VOICES.ANDI,
  "アンディ": TTS_VOICES.ANDI,

  // === FAISAL (中部つるぎ / Nakae Tsurugi) — Pria Dewasa Kalem ===
  "faisal": TTS_VOICES.FAISAL,
  "ファイサル": TTS_VOICES.FAISAL,

  // === TAKAHASHI (黒沢冴白 / Kurosawa Kohaku) — Pekerja Kantoran Muda ===
  "takahashi": TTS_VOICES.TAKAHASHI,
  "高橋": TTS_VOICES.TAKAHASHI,
  "たかはし": TTS_VOICES.TAKAHASHI,

  // === KOBAYASHI (離途 / Rito) — Pria Serius ===
  "kobayashi": TTS_VOICES.KOBAYASHI,
  "小林": TTS_VOICES.KOBAYASHI,
  "こばやし": TTS_VOICES.KOBAYASHI,

  // === NAMONASHI (あんこもん / Ankomon) — Pria Anonim ===
  "namonashi": TTS_VOICES.NAMONASHI,
  "名無し": TTS_VOICES.NAMONASHI,

  // === OOBA (ちび式じい / Chibi Shikiji) — Pria Tua ===
  "ooba": TTS_VOICES.OOBA,
  "大庭": TTS_VOICES.OOBA,
  "おおば": TTS_VOICES.OOBA,
};

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
    TTS_VOICES.RITSU,
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
    TTS_VOICES.OOBA,
  ];
  const allVoices = [...femaleVoices, ...maleVoices];

  if (!speaker || speaker === "???" || speaker.trim() === "") {
    // Rotasi dinamis melintasi seluruh suara
    return allVoices[fallbackIndex % allVoices.length];
  }

  // 1. Bersihkan gelar kehormatan Jepang/Romaji agar tidak mengganggu pencocokan
  const cleanSpeaker = speaker.replace(/[- ]?(さん|くん|ちゃん|様|君|sama|san|kun|chan)$/i, "").trim().toLowerCase();

  // 1b. Cek kamus pemetaan eksplisit
  if (SPEAKER_MAP[cleanSpeaker]) {
    return SPEAKER_MAP[cleanSpeaker];
  }

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

      // 1. Jika ada di CacheStorage, buat Blob URL lokal
      if (cachedResponse) {
        const blob = await cachedResponse.blob();
        return URL.createObjectURL(blob);
      }

      // 2. Selalu coba fetch dari API Route — tidak menggunakan navigator.onLine
      // karena browser di Windows sering salah mendeteksi localhost sebagai "offline",
      // yang menyebabkan fetch tidak pernah dipanggil dan audio fallback ke Web Speech API.
      // Kegagalan fetch nyata (jaringan mati) sudah ditangani oleh blok try/catch di bawah.
      try {
        const res = await fetch(apiUrl);
        if (res.ok) {
          // 1. Ekstrak Blob terlebih dahulu sampai selesai
          const blob = await res.blob();
          
          // 2. Bungkus ke Response baru dan simpan ke Cache
          const responseToCache = new Response(blob, {
            headers: { "Content-Type": "audio/mpeg" }
          });
          await cache.put(apiUrl, responseToCache);

          // Batasi cache TTS maks 200 item
          const keys = await cache.keys();
          if (keys.length > 200) {
            for (let i = 0; i < keys.length - 200; i++) {
              await cache.delete(keys[i]);
            }
          }

          return URL.createObjectURL(blob);
        }
      } catch {
        // Fetch gagal (misal: server down atau offline total) — lanjut ke fallback null
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
