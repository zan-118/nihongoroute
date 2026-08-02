/**
 * @file src/lib/constants/tts.ts
 * @description Konstanta statis konfigurasi persona pengisi suara dan mapping karakter TTS.
 * Disinkronkan dengan data standar di scripts/tts/generate_dialogue_tts_direct.js.
 */

export interface VoiceCharacter {
 readonly name: string;
 readonly voicevoxName?: string;
 readonly speakerId?: number;
 readonly gender: "female" | "male";
 readonly role: string;
 readonly description: string;
}

export const TTS_VOICES = {
 // Wanita / Maskot
 LALA: "lala",
 SITI: "siti",
 SAKURA: "sakura",
 AYU: "ayu",
 ANI: "ani",
 DEWI: "dewi",
 INDAH: "indah",
 HAYASHI: "hayashi",
 SATO: "sato",
 RITSU: "ritsu",
 ZUNDAMON: "zundamon",

 // Pria
 DITO: "dito",
 ANDI: "andi",
 KIMURA: "kimura",
 BUDI: "budi",
 SUZUKI: "suzuki",
 TANAKA: "tanaka",
 YAMADA: "yamada",
 TAKAHASHI: "takahashi",
 KOBAYASHI: "kobayashi",
 FAISAL: "faisal",
} as const;

export type TtsVoice = typeof TTS_VOICES[keyof typeof TTS_VOICES];

export const VOICE_CHARACTERS: Record<string, VoiceCharacter> = {
 // === WANITA / MASKOT ===
 lala: {
 name: "lala",
 gender: "female",
 role: "Remaja / Siswi SMA",
 description: "Ceria, ramah, riang, bernada cerah.",
 },
 siti: {
 name: "siti",
 gender: "female",
 role: "Teman Sekolah / Remaja",
 description: "Lembut, santun, dan menenangkan.",
 },
 sakura: {
 name: "sakura",
 gender: "female",
 role: "Remaja Gadis / Baik Hati",
 description: "Suara lembut, ramah, dan murni.",
 },
 ayu: {
 name: "ayu",
 gender: "female",
 role: "Remaja Santai / Teman Wanita",
 description: "Kasual, modern, dan ramah.",
 },
 ani: {
 name: "ani",
 gender: "female",
 role: "Remaja Gadis / Pemalu",
 description: "Suara manis, pemalu, dan santun.",
 },
 dewi: {
 name: "dewi",
 gender: "female",
 role: "Gadis Cilik / Karakter Imut",
 description: "Manja, energetik, nada tinggi.",
 },
 indah: {
 name: "indah",
 gender: "female",
 role: "Narator Utama / Guru Wanita",
 description: "Tenang, dewasa, artikulasi jelas & formal.",
 },
 hayashi: {
 name: "hayashi",
 gender: "female",
 role: "Ibu Rumah Tangga / Guru Wanita Senior",
 description: "Dewasa, bijaksana, dan hangat.",
 },
 sato: {
 name: "sato",
 gender: "female",
 role: "Petugas Toko / Resepsionis",
 description: "Sopan, formal, dan profesional.",
 },
 ritsu: {
 name: "ritsu",
 gender: "female",
 role: "Wanita Dewasa / Bernada Khas",
 description: "Unik, ekspresif, dan misterius.",
 },
 zundamon: {
 name: "zundamon",
 voicevoxName: "Zundamon",
 speakerId: 3,
 gender: "female",
 role: "Maskot Cilik / Karakter Anime",
 description: "Nada sangat tinggi, kekanak-kanakan, energetik.",
 },

 // === PRIA ===
 dito: {
 name: "dito",
 gender: "male",
 role: "Remaja / Siswa SMA",
 description: "Tenang, kasual, dan ramah.",
 },
 andi: {
 name: "andi",
 gender: "male",
 role: "Pemuda Keren / Nada Dramatis",
 description: "Dramatis, percaya diri, dan penuh semangat.",
 },
 kimura: {
 name: "kimura",
 gender: "male",
 role: "Pemuda Gaul / Sahabat Dekat",
 description: "Cepat, energetik, dan sangat santai.",
 },
 budi: {
 name: "budi",
 gender: "male",
 role: "Narator Utama Pria / Guru Pria",
 description: "Suara bariton, tenang, berwibawa & formal.",
 },
 suzuki: {
 name: "suzuki",
 gender: "male",
 role: "Pekerja Kantor / Pegawai Stasiun",
 description: "Formal, tegas, dan profesional.",
 },
 tanaka: {
 name: "tanaka",
 gender: "male",
 role: "Ayah / Pria Paruh Baya",
 description: "Berat, tenang, dan berwibawa.",
 },
 yamada: {
 name: "yamada",
 gender: "male",
 role: "Kakek / Pria Lanjut Usia",
 description: "Berat, serak, dan hangat.",
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
 faisal: {
 name: "faisal",
 gender: "male",
 role: "Pria Dewasa / Kalem",
 description: "Tenang, bijaksana, intonasi seimbang.",
 },
};

/**
 * Peta canonical pencocokan nama karakter / pembicara teks ke ID persona TTS resmi.
 * Diimpor dari direktori scripts/tts/generate_dialogue_tts_direct.js.
 */
export const SPEAKER_MAP: Record<string, TtsVoice> = {
 // English/Romaji (21)
 ani: TTS_VOICES.ANI,
 ayu: TTS_VOICES.AYU,
 andi: TTS_VOICES.ANDI,
 indah: TTS_VOICES.INDAH,
 kimura: TTS_VOICES.KIMURA,
 kobayashi: TTS_VOICES.KOBAYASHI,
 sakura: TTS_VOICES.SAKURA,
 sato: TTS_VOICES.SATO,
 siti: TTS_VOICES.SITI,
 suzuki: TTS_VOICES.SUZUKI,
 zundamon: TTS_VOICES.ZUNDAMON,
 takahashi: TTS_VOICES.TAKAHASHI,
 tanaka: TTS_VOICES.TANAKA,
 dito: TTS_VOICES.DITO,
 dewi: TTS_VOICES.DEWI,
 hayashi: TTS_VOICES.HAYASHI,
 budi: TTS_VOICES.BUDI,
 lala: TTS_VOICES.LALA,
 ritsu: TTS_VOICES.RITSU,
 yamada: TTS_VOICES.YAMADA,
 faisal: TTS_VOICES.FAISAL,

 // Japanese Katakana/Kanji dari database
 "アニ": TTS_VOICES.ANI,
 "アユ": TTS_VOICES.AYU,
 "アンディ": TTS_VOICES.ANDI,
 "インダ": TTS_VOICES.INDAH,
 "インダハ": TTS_VOICES.INDAH,
 "キムラ": TTS_VOICES.KIMURA,
 "コバヤシ": TTS_VOICES.KOBAYASHI,
 "サクラ": TTS_VOICES.SAKURA,
 "サト": TTS_VOICES.SATO,
 "サトウ": TTS_VOICES.SATO,
 "シティ": TTS_VOICES.SITI,
 "スズキ": TTS_VOICES.SUZUKI,
 "ずんだもん": TTS_VOICES.ZUNDAMON,
 "ズンダモン": TTS_VOICES.ZUNDAMON,
 "タカハシ": TTS_VOICES.TAKAHASHI,
 "タナカ": TTS_VOICES.TANAKA,
 "ディト": TTS_VOICES.DITO,
 "デウィ": TTS_VOICES.DEWI,
 "ハヤシ": TTS_VOICES.HAYASHI,
 "ブディ": TTS_VOICES.BUDI,
 "ララ": TTS_VOICES.LALA,
 "ララ・ディト・シティ": TTS_VOICES.LALA,
 "ララ・ディト・シティ ": TTS_VOICES.LALA,
 "lala・dito・siti": TTS_VOICES.LALA,
 "リツ": TTS_VOICES.RITSU,
 "佐藤": TTS_VOICES.SATO,
 "小林": TTS_VOICES.KOBAYASHI,
 "林": TTS_VOICES.HAYASHI,
 "鈴木": TTS_VOICES.SUZUKI,
 "高橋": TTS_VOICES.TAKAHASHI,
 "山田": TTS_VOICES.YAMADA,
 "ヤマダ": TTS_VOICES.YAMADA,
 "やまだ": TTS_VOICES.YAMADA,
 "ファイサル": TTS_VOICES.FAISAL,
};
