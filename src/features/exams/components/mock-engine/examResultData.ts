/**
 * @file examResultData.ts
 * @description Logika murni perhitungan skor & data sertifikat hasil simulasi ujian (Mock Exam).
 * Dipisahkan dari komponen agar mudah diuji dan komponen tetap ramping.
 */

// TIPE

/** Skor per bagian ujian. */
export interface SectionScore {
 total: number;
 correct: number;
 passed: boolean;
}

/** Breakdown skor seluruh bagian ujian. */
export type SectionBreakdown = Record<string, SectionScore>;

/** Skor terhitung gaya JLPT. */
export interface JlptScores {
 scoreLang: number;
 scoreRead: number;
 scoreList: number;
 isN4N5: boolean;
 vocabGrade: string;
 grammarGrade: string;
 readingGrade: string;
}

/** Skor terhitung gaya JFT-Basic. */
export interface JftScores {
 score: number;
 passed: boolean;
 vocabRate: number;
 grammarRate: number;
 listeningRate: number;
 readingRate: number;
}

/** Payload data sertifikat untuk generator PDF. */
export interface CertificatePayload {
 userName: string;
 examTitle: string;
 score: number;
 date: string;
 level: string;
}

// HELPERS

/** Ambil data bagian dengan fallback kosong. */
function sectionData(
 breakdown: SectionBreakdown,
 key: string
): SectionScore {
 return breakdown[key] || { correct: 0, total: 0, passed: true };
}

/** Nilai huruf (A/B/C) berdasarkan rasio jawaban benar. */
function getGrade(correct: number, total: number): string {
 if (total === 0) return "-";
 const rate = correct / total;
 if (rate >= 0.67) return "A";
 if (rate >= 0.34) return "B";
 return "C";
}

// FUNGSI MURNI

/**
 * Deteksi apakah ujian berjenis JFT-Basic.
 */
export function isJftExam(
 examTitle: string,
 categorySlug?: string,
 levelCode?: string
): boolean {
 return (
  examTitle.toLowerCase().includes("jft") ||
  categorySlug?.toLowerCase().includes("jft") ||
  levelCode?.toLowerCase() === "a2"
 );
}

/**
 * Nomor registrasi deterministik dari nama peserta & judul ujian.
 */
export function buildRegistrationNumber(
 userFullName: string,
 examTitle: string
): string {
 const prefix = examTitle.toLowerCase().includes("jft") ? "JFT" : "JLPT";
 // Hashtag deterministik murni dari userFullName + exam.title.
 const str = `${userFullName}-${examTitle}`;
 let hash = 0;
 for (let i = 0; i < str.length; i++) {
  hash = str.charCodeAt(i) + ((hash << 5) - hash);
 }
 const rand = 1000 + Math.abs(hash % 9000);
 return `26-1A-${prefix}-${rand}`;
}

/**
 * Format tanggal tes dalam standar Jepang.
 */
export function formatTestDate(): string {
 return new Date()
  .toLocaleDateString("ja-JP", {
   year: "numeric",
   month: "2-digit",
   day: "2-digit",
  })
  .replace(/\//g, "/");
}

/**
 * Hitung skor bagian bergaya JLPT.
 * N4/N5 menggabungkan pengetahuan bahasa & membaca menjadi 120 poin;
 * N1/N2/N3 memisah pengetahuan bahasa, membaca, dan listening masing-masing 60 poin.
 */
export function computeJlptScores(
 sectionBreakdown: SectionBreakdown,
 levelCode?: string
): JlptScores {
 const vocab = sectionData(sectionBreakdown, "vocabulary");
 const grammar = sectionData(sectionBreakdown, "grammar");
 const reading = sectionData(sectionBreakdown, "reading");
 const listening = sectionData(sectionBreakdown, "listening");

 const langCorrect = vocab.correct + grammar.correct;
 const langTotal = vocab.total + grammar.total;

 const isN4N5 =
  levelCode?.toLowerCase() === "n4" || levelCode?.toLowerCase() === "n5";

 let scoreLang = 0;
 let scoreRead = 0;
 let scoreList = 0;

 if (isN4N5) {
  // 120 poin untuk Pengetahuan Bahasa & Membaca
  const langReadCorrect = langCorrect + reading.correct;
  const langReadTotal = langTotal + reading.total;
  scoreLang =
   langReadTotal > 0 ? Math.round((langReadCorrect / langReadTotal) * 120) : 0;
  scoreList =
   listening.total > 0
    ? Math.round((listening.correct / listening.total) * 60)
    : 0;
 } else {
  // Masing-masing 60 poin
  scoreLang = langTotal > 0 ? Math.round((langCorrect / langTotal) * 60) : 0;
  scoreRead =
   reading.total > 0 ? Math.round((reading.correct / reading.total) * 60) : 0;
  scoreList =
   listening.total > 0
    ? Math.round((listening.correct / listening.total) * 60)
    : 0;
 }

 return {
  scoreLang,
  scoreRead,
  scoreList,
  isN4N5,
  vocabGrade: getGrade(vocab.correct, vocab.total),
  grammarGrade: getGrade(grammar.correct, grammar.total),
  readingGrade: getGrade(reading.correct, reading.total),
 };
}

/**
 * Hitung skor bergaya JFT-Basic.
 * Skala skor 10–250; ambang lulus 200.
 */
export function computeJftScores(
 sectionBreakdown: SectionBreakdown,
 correctCount: number,
 totalQuestions: number,
 failedSection: boolean
): JftScores {
 const vocab = sectionData(sectionBreakdown, "vocabulary");
 const grammar = sectionData(sectionBreakdown, "grammar");
 const reading = sectionData(sectionBreakdown, "reading");
 const listening = sectionData(sectionBreakdown, "listening");

 const score =
  correctCount === 0
   ? 10
   : Math.round((correctCount / Math.max(1, totalQuestions)) * 250);
 const passed = score >= 200 && !failedSection;

 return {
  score,
  passed,
  vocabRate:
   vocab.total > 0 ? Math.round((vocab.correct / vocab.total) * 100) : 0,
  grammarRate:
   grammar.total > 0 ? Math.round((grammar.correct / grammar.total) * 100) : 0,
  listeningRate:
   listening.total > 0
    ? Math.round((listening.correct / listening.total) * 100)
    : 0,
  readingRate:
   reading.total > 0 ? Math.round((reading.correct / reading.total) * 100) : 0,
 };
}

/**
 * Bangun payload data sertifikat untuk generator PDF.
 */
export function buildCertificateData(params: {
 userName: string;
 examTitle: string;
 score: number;
 levelCode?: string;
 isJft: boolean;
}): CertificatePayload {
 return {
  userName: params.userName,
  examTitle: params.examTitle,
  score: params.score,
  date: new Date().toLocaleDateString("id-ID", {
   day: "numeric",
   month: "long",
   year: "numeric",
  }),
  level: params.levelCode?.toUpperCase() || (params.isJft ? "A2" : "JLPT"),
 };
}
