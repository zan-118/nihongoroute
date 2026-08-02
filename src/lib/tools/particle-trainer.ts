/** Valid Japanese particle options. */
export const PARTICLE_OPTIONS = ["は", "が", "を", "に", "へ", "で", "と", "も", "から", "まで"] as const;

/** Union type of valid Japanese particles. */
export type ParticleOption = (typeof PARTICLE_OPTIONS)[number];

/** Structure of particle training question. */
export interface ParticleQuestion {
 id: string;
 level: "N5" | "N4" | "N3";
 sentence: string;
 answer: ParticleOption;
 translation: string;
 hint: string;
 explanation: string;
 options: ParticleOption[];
}

/** List of particle training questions. */
export const PARTICLE_QUESTIONS: ParticleQuestion[] = [
 {
 id: "topic-wa",
 level: "N5",
 sentence: "私___学生です。",
 answer: "は",
 translation: "Saya adalah pelajar.",
 hint: "Menandai topik kalimat.",
 explanation: "は dipakai untuk memperkenalkan topik yang sedang dibicarakan.",
 options: ["は", "が", "を", "で"],
 },
 {
 id: "subject-ga",
 level: "N5",
 sentence: "雨___降っています。",
 answer: "が",
 translation: "Hujan sedang turun.",
 hint: "Menandai subjek kejadian.",
 explanation: "が menandai subjek langsung dari kejadian atau kondisi.",
 options: ["が", "は", "に", "を"],
 },
 {
 id: "object-wo",
 level: "N5",
 sentence: "本___読みます。",
 answer: "を",
 translation: "Saya membaca buku.",
 hint: "Menandai objek tindakan.",
 explanation: "を dipakai untuk objek langsung dari verba transitif.",
 options: ["を", "に", "で", "と"],
 },
 {
 id: "place-de",
 level: "N5",
 sentence: "図書館___勉強します。",
 answer: "で",
 translation: "Saya belajar di perpustakaan.",
 hint: "Menandai tempat berlangsungnya aksi.",
 explanation: "で menandai lokasi tempat suatu aksi dilakukan.",
 options: ["で", "に", "へ", "を"],
 },
 {
 id: "time-ni",
 level: "N5",
 sentence: "七時___起きます。",
 answer: "に",
 translation: "Saya bangun jam tujuh.",
 hint: "Menandai waktu spesifik.",
 explanation: "に dipakai untuk titik waktu spesifik seperti jam, tanggal, atau hari tertentu.",
 options: ["に", "で", "から", "まで"],
 },
 {
 id: "destination-e",
 level: "N5",
 sentence: "日本___行きます。",
 answer: "へ",
 translation: "Saya pergi ke Jepang.",
 hint: "Menandai arah tujuan.",
 explanation: "へ menekankan arah pergerakan menuju suatu tempat.",
 options: ["へ", "を", "で", "も"],
 },
 {
 id: "with-to",
 level: "N5",
 sentence: "友達___映画を見ました。",
 answer: "と",
 translation: "Saya menonton film dengan teman.",
 hint: "Menandai pasangan bersama.",
 explanation: "と dipakai untuk menunjukkan orang yang melakukan aktivitas bersama.",
 options: ["と", "も", "は", "が"],
 },
 {
 id: "also-mo",
 level: "N5",
 sentence: "私___行きたいです。",
 answer: "も",
 translation: "Saya juga ingin pergi.",
 hint: "Menunjukkan juga.",
 explanation: "も berarti juga dan menggantikan partikel topik/subjek/objek sederhana.",
 options: ["も", "は", "を", "から"],
 },
 {
 id: "",
 level: "N5",
 sentence: "学校___駅まで歩きます。",
 answer: "から",
 translation: "Saya berjalan dari sekolah sampai stasiun.",
 hint: "Menandai titik awal.",
 explanation: "から menunjukkan titik awal waktu atau tempat.",
 options: ["から", "まで", "に", "で"],
 },
 {
 id: "until-made",
 level: "N5",
 sentence: "九時___勉強しました。",
 answer: "まで",
 translation: "Saya belajar sampai jam sembilan.",
 hint: "Menandai batas akhir.",
 explanation: "まで menunjukkan batas akhir waktu atau tempat.",
 options: ["まで", "から", "へ", "が"],
 },
 {
 id: "existence-ni",
 level: "N5",
 sentence: "机の上___猫がいます。",
 answer: "に",
 translation: "Ada kucing di atas meja.",
 hint: "Menandai lokasi keberadaan.",
 explanation: "に dipakai untuk lokasi keberadaan dengan いる atau ある.",
 options: ["に", "で", "を", "へ"],
 },
 {
 id: "means-de",
 level: "N5",
 sentence: "電車___会社へ行きます。",
 answer: "で",
 translation: "Saya pergi ke kantor dengan kereta.",
 hint: "Menandai alat atau cara.",
 explanation: "de juga dipakai untuk alat, cara, atau sarana melakukan sesuatu.",
 options: ["で", "に", "と", "は"],
 },
];

/** Normalize input string. Trim whitespace and standardize character width. */
export function normalizeParticleAnswer(value: string) {
 // NFKC normalizes Japanese character widths.
 return value.normalize("NFKC").trim();
}

/** Compare expected answer with user answer. Return true if match. */
export function isParticleAnswerCorrect(expected: string, answer: string) {
 return normalizeParticleAnswer(expected) === normalizeParticleAnswer(answer);
}

/** Get question by index. Wrap around if index exceeds array length. */
export function getParticleQuestion(index: number) {
 // Modulo operator prevents out-of-bounds errors.
 return PARTICLE_QUESTIONS[index % PARTICLE_QUESTIONS.length];
}