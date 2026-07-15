"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import Link from "next/link";
import {
  BookOpen,
  Clipboard,
  FileText,
  Hash,
  Languages,
  Loader2,
  Search,
  Sparkles,
} from "lucide-react";
import { analyzeTextWithDictionary, type ToolSearchItem } from "@/lib/tools-search";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AddToSRSButton } from "@/components/features/srs/button/AddToSRSButton";
import NextActionPanel from "@/components/features/ecosystem/NextActionPanel";
import { useUIStore } from "@/store/useUIStore";
import { cn } from "@/lib/utils";

/**
 * Default sample text for analyzer.
 */
const SAMPLE_TEXT =
  "昨日、友達と図書館で日本語の本を読みました。難しい言葉もありましたが、とても面白かったです。";

/**
 * Structure for text analysis results. Holds stats and matched items.
 */
interface AnalyzerState {
  stats: {
    charCount: number;
    japaneseCharCount: number;
    kanaCount: number;
    kanjiCount: number;
    uniqueKanji: string[];
    tokens: string[];
  };
  results: {
    vocab: ToolSearchItem[];
    grammar: ToolSearchItem[];
    kanji: ToolSearchItem[];
  };
}

/**
 * Render single search item result. Show title, badge, description, and action buttons.
 */
function ResultRow({ item }: { item: ToolSearchItem }) {
  const Icon = item.icon;

  return (
    <div className="group flex flex-col gap-3 rounded-lg border border-border bg-background/40 p-4 transition-all hover:border-primary/35 hover:bg-muted/20 sm:flex-row sm:items-center">
      <div className="flex min-w-0 flex-1 items-start gap-3">
        {/* Category icon with dynamic color styling */}
        <div
          className={cn(
            "flex size-11 shrink-0 items-center justify-center rounded-xl border",
            item.category === "vocab" && "border-primary/20 bg-primary/10 text-primary",
            item.category === "grammar" && "border-success/20 bg-success/10 text-success",
            item.category === "kanji" && "border-warning/20 bg-warning/10 text-warning"
          )}
        >
          <Icon size={18} aria-hidden="true" />
        </div>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href={item.href}
              className="font-japanese text-lg font-black leading-tight text-foreground transition-colors hover:text-primary"
            >
              {item.title}
            </Link>
            {item.jlptLevel ? (
              <Badge variant="outline" className="rounded-lg text-[9px]">
                {item.jlptLevel}
              </Badge>
            ) : null}
            {item.isCommon ? (
              <Badge className="rounded-lg text-[9px]">Umum</Badge>
            ) : null}
          </div>
          <p className="mt-1 line-clamp-2 text-sm font-medium text-muted-foreground">
            {item.description}
          </p>
          {(item.reading || item.romaji || item.formation) && (
            <p className="mt-2 line-clamp-1 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
              {item.reading || item.formation}
              {item.romaji ? ` / ${item.romaji}` : ""}
            </p>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2 self-end sm:self-center">
        {item.category === "vocab" ? <AddToSRSButton wordId={item.id} /> : null}
        <Button variant="outline" size="sm" asChild className="rounded-xl">
          <Link href={item.href}>Detail</Link>
        </Button>
      </div>
    </div>
  );
}

/**
 * Container for list of analysis results. Group by category.
 */
function ResultPanel({
  items,
  title,
  icon: Icon,
  empty,
}: {
  items: ToolSearchItem[];
  title: string;
  icon: typeof FileText;
  empty: string;
}) {
  return (
    <Card className="rounded-2xl md:rounded-3xl border border-border bg-card/45 p-5 shadow-xl">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Icon size={16} className="text-primary" aria-hidden="true" />
          <h2 className="text-xs uppercase tracking-[0.2em] text-foreground">
            {title}
          </h2>
        </div>
        <Badge variant="outline" className="rounded-lg">
          {items.length}
        </Badge>
      </div>
      {items.length > 0 ? (
        <div className="flex flex-col gap-3">
          {items.map((item) => (
            <ResultRow key={`${item.category}-${item.id}`} item={item} />
          ))}
        </div>
      ) : (
        <p className="rounded-lg border border-dashed border-border bg-muted/15 p-5 text-sm font-medium text-muted-foreground">
          {empty}
        </p>
      )}
    </Card>
  );
}

/**
 * Props for TextAnalyzerClient component.
 */
interface TextAnalyzerClientProps {
  initialText?: string;
  initialSourceTitle?: string;
  initialSourceHref?: string;
}

/**
 * Main client component for Japanese text analysis. Parse text, show stats, list vocabulary, grammar, and kanji.
 */
export default function TextAnalyzerClient({
  initialText,
  initialSourceTitle,
  initialSourceHref,
}: TextAnalyzerClientProps) {
  const [text, setText] = useState(initialText || SAMPLE_TEXT);
  const [analysis, setAnalysis] = useState<AnalyzerState | null>(null);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();
  const recordLearningEvent = useUIStore((state) => state.recordLearningEvent);

  const trimmedText = text.trim();
  const textPreview = useMemo(
    () => trimmedText || "Tempel teks Jepang untuk dianalisis.",
    [trimmedText]
  );

  // Validate that sourceHref is a safe internal path to prevent open redirect and XSS
  const safeSourceHref = useMemo(() => {
    if (!initialSourceHref) return "";
    // Allow only internal paths starting with single '/' and no backslashes
    if (/^\/[^\/\\]/u.test(initialSourceHref)) {
      return initialSourceHref;
    }
    return "";
  }, [initialSourceHref]);

  /**
   * Trigger text analysis. Call API, update state, record event.
   */
  const handleAnalyze = () => {
    if (!trimmedText) return;
    setError("");
    startTransition(async () => {
      try {
        const nextAnalysis = await analyzeTextWithDictionary(trimmedText);
        setAnalysis(nextAnalysis);
        
        // Record event for user progress tracking
        recordLearningEvent({
          type: "text_analyzed",
          source: {
            type: safeSourceHref.includes("/library/listening")
              ? "listening"
              : safeSourceHref.includes("/library/reading")
                ? "reading"
                : "tool",
            id: safeSourceHref.split("/").pop() || "text-analyzer",
            slug: safeSourceHref.split("/").pop(),
            title: initialSourceTitle || "Text Analyzer",
            href: safeSourceHref || "/tools/text-analyzer",
          },
          metrics: {
            total:
              nextAnalysis.results.vocab.length +
              nextAnalysis.results.grammar.length +
              nextAnalysis.results.kanji.length,
          },
        });
      } catch (err) {
        console.error("Gagal menganalisis teks:", err);
        setError("Analisis gagal dimuat. Coba lagi sebentar lagi.");
      }
    });
  };

  // Run analysis on initial text load if provided
  useEffect(() => {
    if (!initialText?.trim()) return;
    startTransition(async () => {
      try {
        const nextAnalysis = await analyzeTextWithDictionary(initialText.trim());
        setAnalysis(nextAnalysis);
        recordLearningEvent({
          type: "text_analyzed",
          source: {
            type: safeSourceHref.includes("/library/listening")
              ? "listening"
              : safeSourceHref.includes("/library/reading")
                ? "reading"
                : "tool",
            id: safeSourceHref.split("/").pop() || "text-analyzer",
            slug: safeSourceHref.split("/").pop(),
            title: initialSourceTitle || "Text Analyzer",
            href: safeSourceHref || "/tools/text-analyzer",
          },
          metrics: {
            total:
              nextAnalysis.results.vocab.length +
              nextAnalysis.results.grammar.length +
              nextAnalysis.results.kanji.length,
          },
        });
      } catch (err) {
        console.error("Gagal menganalisis teks sumber:", err);
        setError("Analisis teks sumber gagal dimuat. Coba jalankan ulang.");
      }
    });
  }, [safeSourceHref, initialSourceTitle, initialText, recordLearningEvent]);

  return (
    <div className="min-h-screen bg-background/95 px-4 py-12 md:px-8">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
        <header className="flex flex-col gap-5">
          <Button variant="outline" asChild className="w-fit rounded-xl">
            <Link href="/tools">Kembali ke Peralatan</Link>
          </Button>
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <div className="flex size-12 items-center justify-center rounded-lg border border-primary/20 bg-primary/10 text-primary">
                <Languages size={24} aria-hidden="true" />
              </div>
              <Badge className="w-fit rounded-xl px-3 py-1">Penganalisis Teks</Badge>
            </div>
            <h1 className="max-w-3xl text-4xl uppercase tracking-tight text-foreground md:text-6xl">
              Bongkar Teks Jepang
            </h1>
            <p className="max-w-2xl text-sm font-medium leading-relaxed text-muted-foreground">
              Tempel kalimat atau paragraf Jepang, lalu temukan kosakata, kanji, dan pola grammar yang bisa langsung dipelajari.
            </p>
            {initialSourceTitle ? (
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline" className="w-fit rounded-xl px-3 py-1 text-[10px]">
                  Sumber: {initialSourceTitle}
                </Badge>
                {safeSourceHref ? (
                  <Button variant="outline" size="sm" asChild className="rounded-xl">
                    <Link href={safeSourceHref}>Buka Sumber</Link>
                  </Button>
                ) : null}
              </div>
            ) : null}
          </div>
        </header>

        <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <Card className="rounded-2xl md:rounded-3xl border border-border bg-card/45 p-5 shadow-2xl md:p-6">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Clipboard size={16} className="text-primary" aria-hidden="true" />
                <span className="text-xs font-black uppercase tracking-[0.2em] text-foreground">
                  Input
                </span>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setText(SAMPLE_TEXT)}
                className="rounded-xl"
              >
                Contoh
              </Button>
            </div>
            <textarea
              value={text}
              onChange={(event) => setText(event.target.value)}
              className="min-h-[320px] w-full resize-y rounded-lg border border-border bg-muted/15 p-5 font-japanese text-lg font-medium leading-relaxed text-foreground outline-none transition-all placeholder:text-muted-foreground/50 focus:border-primary/40 focus:ring-2 focus:ring-primary/20"
              placeholder="例: 昨日、友達と図書館で..."
            />
            {error ? (
              <p className="mt-3 rounded-xl border border-destructive/25 bg-destructive/10 p-3 text-sm font-bold text-destructive">
                {error}
              </p>
            ) : null}
            <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="line-clamp-1 text-xs font-medium text-muted-foreground">
                {textPreview}
              </p>
              <Button
                type="button"
                onClick={handleAnalyze}
                disabled={!trimmedText || isPending}
                className="rounded-xl"
              >
                {isPending ? (
                  <Loader2 data-icon="inline-start" className="animate-spin" />
                ) : (
                  <Search data-icon="inline-start" />
                )}
                Analisis
              </Button>
            </div>
          </Card>

          <div className="flex flex-col gap-6">
            <Card className="rounded-2xl md:rounded-3xl border border-border bg-card/45 p-5 shadow-xl md:p-6">
              <div className="mb-5 flex items-center gap-2">
                <Sparkles size={16} className="text-primary" aria-hidden="true" />
                <h2 className="text-xs uppercase tracking-[0.2em] text-foreground">
                  Ringkasan
                </h2>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  ["Karakter", analysis?.stats.charCount || 0],
                  ["Jepang", analysis?.stats.japaneseCharCount || 0],
                  ["Kana", analysis?.stats.kanaCount || 0],
                  ["Kanji Unik", analysis?.stats.uniqueKanji.length || 0],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-lg border border-border bg-background/40 p-4">
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                      {label}
                    </p>
                    <p className="mt-1 font-mono text-2xl font-black text-foreground">
                      {value}
                    </p>
                  </div>
                ))}
              </div>
              {analysis?.stats.uniqueKanji.length ? (
                <div className="mt-4 flex flex-wrap gap-2">
                  {analysis.stats.uniqueKanji.map((kanji) => (
                    <Link
                      key={kanji}
                      href={`/library/kanji/${kanji}`}
                      className="rounded-xl border border-warning/25 bg-warning/10 px-3 py-2 font-japanese text-lg font-black text-warning transition-all hover:border-warning/45"
                    >
                      {kanji}
                    </Link>
                  ))}
                </div>
              ) : null}
            </Card>

            <Card className="rounded-2xl md:rounded-3xl border border-border bg-muted/15 p-5">
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                Tips: hasil analyzer memakai pencarian database per token dan kanji. Untuk parsing morfologi sempurna, tahap berikutnya bisa ditambah tokenizer Kuromoji.
              </p>
            </Card>

            {analysis ? <NextActionPanel compact /> : null}
          </div>
        </div>

        <div className="flex flex-col xl:flex-row gap-6">
          <ResultPanel
            title="Kosakata"
            icon={FileText}
            items={analysis?.results.vocab || []}
            empty="Belum ada kosakata terdeteksi. Jalankan analisis dulu."
          />
          <ResultPanel
            title="Tata Bahasa"
            icon={BookOpen}
            items={analysis?.results.grammar || []}
            empty="Belum ada pola tata bahasa terdeteksi dari teks ini."
          />
          <ResultPanel
            title="Kanji"
            icon={Hash}
            items={analysis?.results.kanji || []}
            empty="Belum ada hasil kanji dari database."
          />
        </div>
      </div>
    </div>
  );
}