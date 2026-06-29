export * from "./learning-events";
import { LearningEvent } from "./learning-events";
export interface EcosystemRecommendation {
  id: string;
  title: string;
  description: string;
  href: string;
  category: "review" | "library" | "tool" | "continue";
  priority: number;
}

export interface EcosystemReadingProgress {
  sourceId: string;
  sourceTitle?: string;
  lastParagraphIndex: number;
  totalParagraphs: number;
  elapsedSeconds: number;
  completedAt?: number;
  updatedAt: number;
}

export interface EcosystemVocabEntry {
  word: string;
  slug?: string;
  jlpt?: string;
  sourceTitle?: string;
  sourceHref?: string;
  hitCount: number;
}

export type WeakPointCategory =
  | "reading"
  | "listening"
  | "vocab"
  | "kanji"
  | "grammar"
  | "counter"
  | "conjugation"
  | "sentence"
  | "mixed";

export interface WeakPointInsight {
  id: string;
  category: WeakPointCategory;
  label: string;
  description: string;
  href: string;
  mistakes: number;
  attempts: number;
  score: number;
  lastSeenAt: number;
  sourceTitle?: string;
}

export type DailyRouteCategory = EcosystemRecommendation["category"] | "warmup";

export interface DailyRouteStep {
  id: string;
  order: number;
  title: string;
  description: string;
  href: string;
  category: DailyRouteCategory;
  reason: string;
  priority: number;
}

const WEAK_POINT_META: Record<
  WeakPointCategory,
  { label: string; href: string; description: string }
> = {
  reading: {
    label: "Reading",
    href: "/library/reading",
    description: "Pemahaman bacaan butuh penguatan konteks.",
  },
  listening: {
    label: "Listening",
    href: "/library/listening",
    description: "Pemahaman audio butuh pengulangan aktif.",
  },
  vocab: {
    label: "Kosakata",
    href: "/tools/jlpt-drill?kind=vocab",
    description: "Arti, bacaan, atau konteks kata masih rapuh.",
  },
  kanji: {
    label: "Kanji",
    href: "/tools/jlpt-drill?kind=kanji",
    description: "Arti atau bacaan kanji perlu dilatih ulang.",
  },
  grammar: {
    label: "Grammar",
    href: "/tools/jlpt-drill?kind=grammar",
    description: "Pola kalimat perlu dipakai lagi dalam soal singkat.",
  },
  counter: {
    label: "Counter",
    href: "/tools/counter-trainer",
    description: "Pilihan kata bantu bilangan masih perlu pemanasan.",
  },
  conjugation: {
    label: "Konjugasi",
    href: "/tools/conjugation",
    description: "Bentuk verba perlu dicek ulang.",
  },
  sentence: {
    label: "Kalimat",
    href: "/tools/jlpt-drill?kind=sentence",
    description: "Pemahaman kalimat contoh perlu dilatih lagi.",
  },
  mixed: {
    label: "Campuran",
    href: "/tools/jlpt-drill",
    description: "Ada beberapa area kecil yang perlu distabilkan.",
  },
};

function safeQuery(value: string | undefined) {
  return encodeURIComponent(value || "");
}

function normalizedLevel(level: string | undefined) {
  const upper = String(level || "").toUpperCase();
  return ["N5", "N4", "N3", "N2", "N1"].includes(upper) ? upper : "";
}

function sourceSlug(source: any) {
  return source.slug || source.id || "";
}

function sourceParams(source: any) {
  const params = new URLSearchParams();
  params.set("source", source.type);
  if (sourceSlug(source)) params.set("slug", sourceSlug(source));
  if (normalizedLevel(source.level)) params.set("level", normalizedLevel(source.level));
  return params.toString();
}

function drillHref(source: any, kind?: string) {
  const params = new URLSearchParams(sourceParams(source));
  if (kind) params.set("kind", kind);
  return `/tools/jlpt-drill?${params.toString()}`;
}

function pushUnique(
  items: EcosystemRecommendation[],
  recommendation: EcosystemRecommendation
) {
  const existingIndex = items.findIndex(
    (item) => item.href === recommendation.href || item.id === recommendation.id
  );
  if (existingIndex >= 0) {
    if (recommendation.priority > items[existingIndex].priority) {
      items[existingIndex] = recommendation;
    }
    return;
  }
  items.push(recommendation);
}

function latestEvents(events: LearningEvent[]) {
  return [...events].sort((a, b) => b.createdAt - a.createdAt);
}

function recommendationsFromEvent(event: LearningEvent): EcosystemRecommendation[] {
  const items: EcosystemRecommendation[] = [];
  const source = event.source;
  const params = sourceParams(source);
  const title = source.title || "materi ini";
  const kind = event.details?.kind;
  const sourceHref = source.href;

  if (source.type === "reading") {
    pushUnique(items, {
      id: `${event.id}-shadowing`,
      title: "Latih Baca Nyaring",
      description: `Ambil kalimat dari ${title} untuk shadowing.`,
      href: `/tools/shadowing?${params}`,
      category: "tool",
      priority: event.type === "reading_completed" ? 98 : 80,
    });
    pushUnique(items, {
      id: `${event.id}-analyzer`,
      title: "Bongkar Teks",
      description: "Temukan vocab, kanji, dan grammar dari bacaan terakhir.",
      href: `/tools/text-analyzer?${params}`,
      category: "tool",
      priority: 88,
    });
  }

  if (source.type === "listening") {
    pushUnique(items, {
      id: `${event.id}-shadowing`,
      title: "Ulangi dengan Shadowing",
      description: `Latih intonasi dari ${title}.`,
      href: `/tools/shadowing?${params}`,
      category: "tool",
      priority: event.type === "listening_completed" ? 98 : 82,
    });
    pushUnique(items, {
      id: `${event.id}-analyzer`,
      title: "Analisis Transkrip",
      description: "Buka kosakata dan pola grammar dari transkrip.",
      href: `/tools/text-analyzer?${params}`,
      category: "tool",
      priority: 84,
    });
  }

  if (source.type === "vocab") {
    pushUnique(items, {
      id: `${event.id}-vocab-drill`,
      title: "Drill Kosakata Ini",
      description: `Tes ulang arti dan bacaan ${title}.`,
      href: drillHref(source, "vocab"),
      category: "tool",
      priority: 90,
    });
    pushUnique(items, {
      id: `${event.id}-counter`,
      title: "Cek Counter",
      description: "Latih kata bantu bilangan yang cocok jika kata ini punya konteks benda.",
      href: `/tools/counter-trainer?${params}`,
      category: "tool",
      priority: 72,
    });
  }

  if (source.type === "kanji") {
    pushUnique(items, {
      id: `${event.id}-kanji-writing`,
      title: "Tulis Kanji",
      description: "Latih urutan goresan dari kanji yang baru muncul.",
      href: `/tools/writing?char=${safeQuery(source.slug || source.title || source.id)}`,
      category: "tool",
      priority: 90,
    });
    pushUnique(items, {
      id: `${event.id}-kanji-drill`,
      title: "Drill Kanji",
      description: "Uji arti dan bacaan kanji ini.",
      href: drillHref(source, "kanji"),
      category: "tool",
      priority: 82,
    });
  }

  if (source.type === "grammar") {
    pushUnique(items, {
      id: `${event.id}-grammar-drill`,
      title: "Drill Grammar",
      description: `Uji pola ${title} dalam sesi singkat.`,
      href: drillHref(source, "grammar"),
      category: "tool",
      priority: 90,
    });
  }

  if (event.type === "jlpt_drill_answered" && event.details?.isCorrect === false) {
    pushUnique(items, {
      id: `${event.id}-retry-drill`,
      title: "Ulangi Titik Salah",
      description: event.details.prompt
        ? `Jawaban tadi meleset pada ${event.details.prompt}.`
        : "Ulangi drill dengan tipe yang sama.",
      href: drillHref(source, kind && kind !== "mixed" ? kind : undefined),
      category: "review",
      priority: 100,
    });
    if (sourceHref) {
      pushUnique(items, {
        id: `${event.id}-open-source`,
        title: "Buka Sumber",
        description: "Balik sebentar ke materi asal untuk menguatkan konteks.",
        href: sourceHref,
        category: "library",
        priority: 94,
      });
    }
  }

  if (event.type === "counter_answered" && event.details?.isCorrect === false) {
    pushUnique(items, {
      id: `${event.id}-counter-retry`,
      title: "Ulangi Counter",
      description: "Perkuat kategori counter yang baru salah.",
      href: `/tools/counter-trainer?${params}`,
      category: "review",
      priority: 98,
    });
  }

  if (event.type === "conjugation_checked" && event.details?.isCorrect === false) {
    const params = new URLSearchParams();
    if (event.details.prompt) params.set("verb", event.details.prompt);
    if (event.details.focus) params.set("group", event.details.focus);
    if (event.details.text) params.set("form", event.details.text);
    if (source.title) params.set("sourceTitle", source.title);
    if (source.href) params.set("sourceHref", source.href);

    pushUnique(items, {
      id: `${event.id}-conjugation-retry`,
      title: "Ulangi Konjugasi",
      description: "Jawaban bentuk kata kerja belum tepat. Coba target bentuk ini lagi.",
      href: `/tools/conjugation?${params.toString()}`,
      category: "review",
      priority: 98,
    });
    if (source.href) {
      pushUnique(items, {
        id: `${event.id}-conjugation-source`,
        title: "Buka Vocab",
        description: "Balik ke detail kata untuk melihat bentuk dan contoh.",
        href: source.href,
        category: "library",
        priority: 76,
      });
    }
  }

  if (
    event.type === "jlpt_drill_completed" &&
    typeof event.metrics?.accuracy === "number" &&
    event.metrics.accuracy < 80
  ) {
    pushUnique(items, {
      id: `${event.id}-accuracy-retry`,
      title: "Perbaiki Akurasi",
      description: `Akurasi sesi ${event.metrics.accuracy}%. Ulangi dengan set kecil.`,
      href: drillHref(source, kind && kind !== "mixed" ? kind : undefined),
      category: "review",
      priority: 96,
    });
  }

  if (event.type === "shadowing_recorded") {
    pushUnique(items, {
      id: `${event.id}-shadowing-again`,
      title: "Rekam Sekali Lagi",
      description: "Bandingkan tempo baru dengan target.",
      href: `/tools/shadowing?${params}`,
      category: "review",
      priority: 86,
    });
    if (sourceHref) {
      pushUnique(items, {
        id: `${event.id}-source`,
        title: "Buka Materi Asal",
        description: "Dengar atau baca ulang sumber kalimat shadowing.",
        href: sourceHref,
        category: "library",
        priority: 76,
      });
    }
  }

  return items;
}

function recommendationsFromReadingProgress(
  readingProgressMap: Record<string, EcosystemReadingProgress>
): EcosystemRecommendation[] {
  return Object.values(readingProgressMap)
    .filter((entry) => !entry.completedAt && entry.totalParagraphs > 0)
    .sort((a, b) => b.updatedAt - a.updatedAt)
    .slice(0, 2)
    .map((entry) => ({
      id: `continue-reading-${entry.sourceId}`,
      title: "Lanjutkan Reading",
      description: `Terakhir di paragraf ${entry.lastParagraphIndex + 1}/${entry.totalParagraphs}.`,
      href: `/library/reading/${safeQuery(entry.sourceId)}`,
      category: "continue" as const,
      priority: 78,
    }));
}

function recommendationsFromVocabBank(
  bank: Record<string, EcosystemVocabEntry>
): EcosystemRecommendation[] {
  return Object.values(bank)
    .filter((entry) => entry.slug || entry.jlpt)
    .sort((a, b) => b.hitCount - a.hitCount)
    .slice(0, 2)
    .map((entry, index) => {
      const level = normalizedLevel(entry.jlpt);
      const params = new URLSearchParams({
        source: "vocab",
        slug: entry.slug || entry.word,
      });
      if (level) params.set("level", level);

      return {
        id: `vocab-bank-${entry.slug || entry.word}-${index}`,
        title: "Ubah Kata Jadi Latihan",
        description: `${entry.word} sering muncul di reading kamu.`,
        href: `/tools/jlpt-drill?kind=vocab&${params.toString()}`,
        category: "tool" as const,
        priority: 74 - index,
      };
    });
}

export function buildEcosystemRecommendations({
  events,
  readingProgressMap,
  readingVocabularyBank,
  limit = 5,
}: {
  events: LearningEvent[];
  readingProgressMap?: Record<string, EcosystemReadingProgress>;
  readingVocabularyBank?: Record<string, EcosystemVocabEntry>;
  limit?: number;
}) {
  const recommendations: EcosystemRecommendation[] = [];
  const sortedEvents = latestEvents(events);

  sortedEvents.slice(0, 8).forEach((event) => {
    recommendationsFromEvent(event).forEach((item) => pushUnique(recommendations, item));
  });

  recommendationsFromReadingProgress(readingProgressMap || {}).forEach((item) =>
    pushUnique(recommendations, item)
  );
  recommendationsFromVocabBank(readingVocabularyBank || {}).forEach((item) =>
    pushUnique(recommendations, item)
  );

  return recommendations
    .sort((a, b) => b.priority - a.priority)
    .slice(0, limit);
}

function weakPointCategory(event: LearningEvent): WeakPointCategory {
  const detailKind = event.details?.kind;
  if (detailKind === "counter" || detailKind === "conjugation") return detailKind;
  if (detailKind === "vocab" || detailKind === "kanji" || detailKind === "grammar") {
    return detailKind;
  }
  if (event.source.type === "vocab" || event.source.type === "kanji" || event.source.type === "grammar") {
    return event.source.type;
  }
  if (event.source.type === "reading" || event.source.type === "listening") {
    return event.source.type;
  }
  return "mixed";
}

function categoryHref(category: WeakPointCategory, event?: LearningEvent) {
  if (category === "counter") return "/tools/counter-trainer";
  if (category === "conjugation") {
    const params = new URLSearchParams();
    if (event?.details?.prompt) params.set("verb", event.details.prompt);
    if (event?.details?.focus) params.set("group", event.details.focus);
    if (event?.details?.text) params.set("form", event.details.text);
    return params.size > 0 ? `/tools/conjugation?${params.toString()}` : "/tools/conjugation";
  }
  if (category === "vocab" || category === "kanji" || category === "grammar") {
    return drillHref(event?.source || { type: category }, category);
  }
  return WEAK_POINT_META[category].href;
}

export function buildWeakPointInsights({
  events,
  limit = 5,
}: {
  events: LearningEvent[];
  limit?: number;
}): WeakPointInsight[] {
  const buckets = new Map<
    WeakPointCategory,
    {
      attempts: number;
      mistakes: number;
      lastEvent?: LearningEvent;
      lastSeenAt: number;
      sourceTitle?: string;
    }
  >();

  latestEvents(events).slice(0, 40).forEach((event) => {
    const isAnswerEvent =
      event.type === "jlpt_drill_answered" ||
      event.type === "counter_answered" ||
      event.type === "conjugation_checked";
    const lowAccuracy =
      event.type === "jlpt_drill_completed" &&
      typeof event.metrics?.accuracy === "number" &&
      event.metrics.accuracy < 80;

    if (!isAnswerEvent && !lowAccuracy) return;

    const category = weakPointCategory(event);
    const existing = buckets.get(category) || {
      attempts: 0,
      mistakes: 0,
      lastSeenAt: 0,
    };
    const isMistake = event.details?.isCorrect === false || lowAccuracy;

    buckets.set(category, {
      attempts: existing.attempts + 1,
      mistakes: existing.mistakes + (isMistake ? 1 : 0),
      lastEvent: event.createdAt >= existing.lastSeenAt ? event : existing.lastEvent,
      lastSeenAt: Math.max(existing.lastSeenAt, event.createdAt),
      sourceTitle: event.source.title || existing.sourceTitle,
    });
  });

  return Array.from(buckets.entries())
    .filter(([, bucket]) => bucket.mistakes > 0)
    .map(([category, bucket]) => {
      const meta = WEAK_POINT_META[category];
      const score = bucket.mistakes * 10 + Math.min(bucket.attempts, 6) * 2 + bucket.lastSeenAt / 1_000_000_000_000;
      return {
        id: `weak-${category}`,
        category,
        label: meta.label,
        description:
          bucket.mistakes > 1
            ? `${bucket.mistakes} sinyal salah terakhir muncul di area ini.`
            : meta.description,
        href: categoryHref(category, bucket.lastEvent),
        mistakes: bucket.mistakes,
        attempts: bucket.attempts,
        score,
        lastSeenAt: bucket.lastSeenAt,
        sourceTitle: bucket.sourceTitle,
      };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

function pushRouteStep(steps: DailyRouteStep[], step: Omit<DailyRouteStep, "order">) {
  const existingIndex = steps.findIndex((item) => item.href === step.href || item.id === step.id);
  if (existingIndex >= 0) {
    if (step.priority > steps[existingIndex].priority) {
      steps[existingIndex] = { ...step, order: steps[existingIndex].order };
    }
    return;
  }
  steps.push({ ...step, order: steps.length + 1 });
}

export function buildDailyRoute({
  events,
  readingProgressMap,
  readingVocabularyBank,
  limit = 5,
}: {
  events: LearningEvent[];
  readingProgressMap?: Record<string, EcosystemReadingProgress>;
  readingVocabularyBank?: Record<string, EcosystemVocabEntry>;
  limit?: number;
}): DailyRouteStep[] {
  const steps: DailyRouteStep[] = [];
  const recommendations = buildEcosystemRecommendations({
    events,
    readingProgressMap,
    readingVocabularyBank,
    limit: 8,
  });
  const weakPoints = buildWeakPointInsights({ events, limit: 3 });
  const unfinishedReading = Object.values(readingProgressMap || {})
    .filter((entry) => !entry.completedAt && entry.totalParagraphs > 0)
    .sort((a, b) => b.updatedAt - a.updatedAt)[0];

  if (unfinishedReading) {
    pushRouteStep(steps, {
      id: `daily-continue-${unfinishedReading.sourceId}`,
      title: "Lanjutkan Bacaan Aktif",
      description: `Mulai dari paragraf ${unfinishedReading.lastParagraphIndex + 1}/${unfinishedReading.totalParagraphs}.`,
      href: `/library/reading/${safeQuery(unfinishedReading.sourceId)}`,
      category: "continue",
      reason: "Ada sesi reading yang belum selesai.",
      priority: 120,
    });
  } else {
    pushRouteStep(steps, {
      id: "daily-warmup-library",
      title: "Mulai dari Library",
      description: "Pilih satu reading atau listening pendek sebagai pemanasan.",
      href: "/library",
      category: "warmup",
      reason: "Belum ada sesi terbuka hari ini.",
      priority: 68,
    });
  }

  weakPoints.forEach((weakPoint, index) => {
    pushRouteStep(steps, {
      id: `daily-weak-${weakPoint.category}`,
      title: `Stabilkan ${weakPoint.label}`,
      description: weakPoint.sourceTitle
        ? `Review konteks terakhir: ${weakPoint.sourceTitle}.`
        : weakPoint.description,
      href: weakPoint.href,
      category: "review",
      reason: `${weakPoint.mistakes} sinyal salah dari ${weakPoint.attempts} aktivitas terkait.`,
      priority: 112 - index,
    });
  });

  recommendations.forEach((recommendation, index) => {
    pushRouteStep(steps, {
      id: `daily-${recommendation.id}`,
      title: recommendation.title,
      description: recommendation.description,
      href: recommendation.href,
      category: recommendation.category,
      reason:
        recommendation.category === "review"
          ? "Direkomendasikan dari kesalahan terbaru."
          : "Direkomendasikan dari aktivitas library dan tools.",
      priority: recommendation.priority - index,
    });
  });

  if (Object.keys(readingVocabularyBank || {}).length > 0) {
    pushRouteStep(steps, {
      id: "daily-vocab-bank",
      title: "Ubah Bank Kata Jadi Drill",
      description: "Ambil kosakata yang sering muncul dari reading kamu.",
      href: "/tools/jlpt-drill?kind=vocab&source=reading",
      category: "tool",
      reason: "Bank vocab reading sudah punya bahan latihan.",
      priority: 72,
    });
  }

  pushRouteStep(steps, {
    id: "daily-finish-shadowing",
    title: "Tutup dengan Shadowing",
    description: "Rekam satu kalimat untuk mengunci bunyi dan ritme.",
    href: "/tools/shadowing",
    category: "tool",
    reason: "Sesi singkat berbasis output menjaga learning loop tetap aktif.",
    priority: 58,
  });

  return steps
    .sort((a, b) => b.priority - a.priority)
    .slice(0, limit)
    .map((step, index) => ({ ...step, order: index + 1 }));
}

