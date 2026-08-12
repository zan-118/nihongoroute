/**
 * @file reading-metrics.ts
 * @description Pure helpers untuk menghitung metrik progres membaca (Dokkai).
 * Dipisah dari ReadingPageClient agar bisa diuji secara unit.
 */

/**
 * Input untuk menghitung metrik progres membaca.
 */
export interface ReadingMetricsInput {
  /** Indeks paragraf aktif (0-based). */
  activeParagraphIndex: number;
  /** Durasi membaca dalam detik. */
  elapsedSeconds: number;
  /** Jumlah paragraf dari snapshot (bisa 0 bila belum tersimpan). */
  totalParagraphs: number;
  /** Jumlah paragraf sebenarnya dari konten — fallback bila snapshot kosong. */
  fallbackParagraphCount: number;
  /** Jumlah karakter artikel tanpa spasi. */
  characterCount: number;
}

/**
 * Metrik progres membaca yang dihitung.
 */
export interface ReadingMetrics {
  /** Estimasi unit baca (karakter / 5). */
  estimatedReadingUnits: number;
  /** Pace baca dalam unit per menit (0 bila belum 15 detik). */
  readingPace: number;
  /** Paragraf yang sedang dibaca (1-based, dibatasi maksimum). */
  currentParagraph: number;
  /** Total paragraf efektif. */
  totalParagraphs: number;
  /** Persentase penyelesaian bacaan. */
  readingCompletionPercent: number;
}

/**
 * Format seconds into readable duration string.
 * @param seconds Time in seconds.
 */
export function formatReadingDuration(seconds: number): string {
  const safeSeconds = Math.max(0, Math.floor(seconds));
  const minutes = Math.floor(safeSeconds / 60);
  const remainingSeconds = safeSeconds % 60;

  if (minutes < 60) {
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  }

  const hours = Math.floor(minutes / 60);
  const leftoverMinutes = minutes % 60;
  return `${hours}j ${leftoverMinutes}m`;
}

/**
 * Menghitung metrik progres membaca dari snapshot + konten.
 * Murni (pure) — tidak menyentuh state/effect sehingga mudah diuji.
 */
export function computeReadingMetrics(
  input: ReadingMetricsInput
): ReadingMetrics {
  const {
    activeParagraphIndex,
    elapsedSeconds,
    totalParagraphs,
    fallbackParagraphCount,
    characterCount,
  } = input;

  const estimatedReadingUnits = Math.max(1, Math.round(characterCount / 5));
  const elapsedMinutes = elapsedSeconds / 60;
  const readingPace =
    elapsedMinutes >= 0.25 ? Math.round(estimatedReadingUnits / elapsedMinutes) : 0;

  const resolvedTotal = totalParagraphs || fallbackParagraphCount;
  const currentParagraph = Math.min(
    activeParagraphIndex + 1,
    Math.max(resolvedTotal, 1)
  );
  const readingCompletionPercent =
    resolvedTotal > 0 ? Math.round((currentParagraph / resolvedTotal) * 100) : 0;

  return {
    estimatedReadingUnits,
    readingPace,
    currentParagraph,
    totalParagraphs: resolvedTotal,
    readingCompletionPercent,
  };
}
