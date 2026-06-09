export type LearningEventType =
  | "reading_started"
  | "reading_completed"
  | "listening_started"
  | "listening_completed"
  | "jlpt_drill_answered"
  | "jlpt_drill_completed"
  | "counter_answered"
  | "counter_completed"
  | "shadowing_recorded"
  | "conjugation_checked"
  | "text_analyzed";

export type LearningSourceType =
  | "reading"
  | "listening"
  | "vocab"
  | "kanji"
  | "grammar"
  | "tool";

export interface LearningEventSource {
  type: LearningSourceType;
  id?: string;
  slug?: string;
  title?: string;
  href?: string;
  level?: string;
}

export interface LearningEventMetrics {
  correct?: number;
  total?: number;
  accuracy?: number;
  elapsedSeconds?: number;
  targetSeconds?: number;
}

export interface LearningEvent {
  id: string;
  type: LearningEventType;
  source: LearningEventSource;
  createdAt: number;
  metrics?: LearningEventMetrics;
  details?: {
    kind?: "vocab" | "kanji" | "grammar" | "mixed" | "counter" | "shadowing" | "conjugation";
    prompt?: string;
    answer?: string;
    isCorrect?: boolean;
    focus?: string;
    text?: string;
  };
}

export type LearningEventInput = Omit<LearningEvent, "id" | "createdAt"> & {
  id?: string;
  createdAt?: number;
};

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

function safeQuery(value: string | undefined) {
  return encodeURIComponent(value || "");
}

function normalizedLevel(level: string | undefined) {
  const upper = String(level || "").toUpperCase();
  return ["N5", "N4", "N3", "N2", "N1"].includes(upper) ? upper : "";
}

function sourceSlug(source: LearningEventSource) {
  return source.slug || source.id || "";
}

function sourceParams(source: LearningEventSource) {
  const params = new URLSearchParams();
  params.set("source", source.type);
  if (sourceSlug(source)) params.set("slug", sourceSlug(source));
  if (normalizedLevel(source.level)) params.set("level", normalizedLevel(source.level));
  return params.toString();
}

function drillHref(source: LearningEventSource, kind?: string) {
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

export function createLearningEvent(input: LearningEventInput): LearningEvent {
  const createdAt = input.createdAt || Date.now();
  return {
    ...input,
    id:
      input.id ||
      `${input.type}-${input.source.type}-${input.source.id || input.source.slug || "source"}-${createdAt}`,
    createdAt,
  };
}
