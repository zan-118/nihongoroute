"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import {
  BookOpen,
  Clock,
  FileText,
  Hash,
  Loader2,
  Search,
  SlidersHorizontal,
  Sparkles,
  X,
} from "lucide-react";
import {
  emptyToolSearchResult,
  flattenToolSearchResult,
  type ToolSearchCategory,
  type ToolSearchItem,
} from "@/lib/tools-search";
import { searchToolDictionaryAction } from "@/actions/dictionary.actions";
import { AddToSRSButton } from "@/components/features/srs/button/AddToSRSButton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

/**
 * Filter options for dictionary search results.
 */
type DictionaryFilter = "all" | "vocab" | "grammar" | "kanji";

/**
 * Configuration for search filter buttons.
 */
const FILTERS: Array<{ id: DictionaryFilter; label: string; icon: typeof Search }> = [
  { id: "all", label: "Semua", icon: Search },
  { id: "vocab", label: "Kosakata", icon: FileText },
  { id: "grammar", label: "Tata Bahasa", icon: BookOpen },
  { id: "kanji", label: "Kanji", icon: Hash },
];

/**
 * Local storage key for dictionary search history.
 */
const HISTORY_KEY = "nihongoroute_dictionary_history";

/**
 * Loads search history from localStorage.
 * Safe for SSR environments.
 * 
 * @returns Array of historical search query strings.
 */
function loadHistory() {
  // Prevent execution during server-side rendering
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((item) => typeof item === "string") : [];
  } catch {
    return [];
  }
}

/**
 * Saves search history to localStorage.
 * Limits history size to 8 items.
 * 
 * @param history - Array of search query strings.
 */
function saveHistory(history: string[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(0, 8)));
}

/**
 * Maps search category to Indonesian label.
 * 
 * @param category - The tool search category.
 * @returns Indonesian label string.
 */
function getCategoryLabel(category: ToolSearchCategory) {
  if (category === "vocab") return "Kosakata";
  if (category === "grammar") return "Tata Bahasa";
  return "Kanji";
}

/**
 * Card component displaying a single dictionary search result.
 * Includes category badges, readings, and action buttons.
 */
function DictionaryResultCard({ item }: { item: ToolSearchItem }) {
  const Icon = item.icon;

  return (
    <Card className="group rounded-2xl md:rounded-3xl border border-border/80 bg-card/35 p-6 transition-all duration-300 hover:border-primary/45 shadow-[0_0_30px_rgba(var(--primary-rgb),0.015)] glass">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 items-start gap-4">
          <div
            className={cn(
              "flex size-12 shrink-0 items-center justify-center rounded-lg border",
              item.category === "vocab" && "border-primary/20 bg-primary/10 text-primary",
              item.category === "grammar" && "border-success/20 bg-success/10 text-success",
              item.category === "kanji" && "border-warning/20 bg-warning/10 text-warning"
            )}
          >
            <Icon size={22} aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <Link
                href={item.href}
                className="font-japanese text-2xl font-black leading-tight text-foreground transition-colors hover:text-primary"
              >
                {item.title}
              </Link>
              <Badge variant="outline" className="rounded-lg">
                {getCategoryLabel(item.category)}
              </Badge>
              {item.jlptLevel ? (
                <Badge className="rounded-lg">{item.jlptLevel}</Badge>
              ) : null}
            </div>
            <p className="mt-2 text-sm font-medium leading-relaxed text-muted-foreground">
              {item.description}
            </p>
            {(item.reading || item.romaji || item.formation || item.hinshi?.length) && (
              <div className="mt-3 flex flex-wrap gap-2">
                {item.reading ? (
                  <span className="rounded-lg border border-border bg-muted/20 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                    {item.reading}
                  </span>
                ) : null}
                {item.romaji ? (
                  <span className="rounded-lg border border-border bg-muted/20 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                    {item.romaji}
                  </span>
                ) : null}
                {item.formation ? (
                  <span className="rounded-lg border border-border bg-muted/20 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                    {item.formation}
                  </span>
                ) : null}
                {item.hinshi?.slice(0, 2).map((hinshi) => (
                  <span
                    key={hinshi}
                    className="rounded-lg border border-border bg-muted/20 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-muted-foreground"
                  >
                    {hinshi}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2 self-end sm:self-start">
          {item.category === "vocab" ? <AddToSRSButton wordId={item.id} /> : null}
          <Button variant="outline" size="sm" asChild className="rounded-xl">
            <Link href={item.href}>Buka</Link>
          </Button>
        </div>
      </div>
    </Card>
  );
}

/**
 * Client component for the integrated dictionary search page.
 * Handles query input, filtering, search history, and result rendering.
 */
export default function DictionaryPageClient() {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<DictionaryFilter>("all");
  const [result, setResult] = useState(emptyToolSearchResult);
  const [history, setHistory] = useState<string[]>(() => loadHistory());
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  // Filter results based on selected category
  const displayedResults = useMemo(() => {
    if (filter === "all") return flattenToolSearchResult(result);
    return result[filter];
  }, [filter, result]);

  // Calculate result counts for each category tab
  const counts = useMemo(
    () => ({
      all: flattenToolSearchResult(result).length,
      grammar: result.grammar.length,
      kanji: result.kanji.length,
      vocab: result.vocab.length,
    }),
    [result]
  );

  /**
   * Executes search query and updates history.
   * 
   * @param nextQuery - Query string to search. Defaults to current state query.
   */
  const runSearch = (nextQuery = query) => {
    const trimmed = nextQuery.trim();
    if (!trimmed) {
      setResult(emptyToolSearchResult());
      return;
    }

    setError("");
    startTransition(async () => {
      try {
        const nextResult = await searchToolDictionaryAction(trimmed, 12);
        const mappedResult = {
          ...emptyToolSearchResult(),
          vocab: nextResult.vocab.map((item) => ({ ...item, icon: FileText })),
          grammar: nextResult.grammar.map((item) => ({ ...item, icon: BookOpen })),
          kanji: nextResult.kanji.map((item) => ({ ...item, icon: Hash })),
        };
        setResult(mappedResult);
        setHistory((prev) => {
          // Move current query to front and limit history size
          const nextHistory = [trimmed, ...prev.filter((item) => item !== trimmed)].slice(0, 8);
          saveHistory(nextHistory);
          return nextHistory;
        });
      } catch (err) {
        console.error("Gagal memuat dictionary:", err);
        setError("Pencarian gagal dimuat. Coba ulangi sebentar lagi.");
      }
    });
  };

  /**
   * Clears search history from state and localStorage.
   */
  const clearHistory = () => {
    setHistory([]);
    saveHistory([]);
  };

  return (
    <div className="min-h-screen bg-background/95 px-4 py-12 md:px-8">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
        <header className="flex flex-col gap-5">
          <Button variant="outline" asChild className="w-fit rounded-xl">
            <Link href="/tools">Kembali ke Peralatan</Link>
          </Button>
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <div className="flex size-12 items-center justify-center rounded-lg border border-warning/20 bg-warning/10 text-warning">
                <Search size={24} aria-hidden="true" />
              </div>
              <Badge className="w-fit rounded-xl px-3 py-1">Kamus</Badge>
            </div>
            <h1 className="max-w-3xl text-4xl uppercase tracking-tight text-foreground md:text-6xl">
              Kamus Terpadu
            </h1>
            <p className="max-w-2xl text-sm font-medium leading-relaxed text-muted-foreground">
              Cari kosakata, grammar, dan kanji dari satu halaman, lalu tambahkan vocab ke SRS tanpa pindah konteks.
            </p>
          </div>
        </header>

        <Card className="rounded-2xl md:rounded-3xl border border-border/80 bg-card/35 p-6 shadow-[0_0_50px_rgba(var(--primary-rgb),0.02)] md:p-8 glass">
          <form
            className="grid gap-3 md:grid-cols-[1fr_auto]"
            onSubmit={(event) => {
              event.preventDefault();
              runSearch();
            }}
          >
            <div className="relative">
              <Search
                size={18}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"
                aria-hidden="true"
              />
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                className="pl-11 font-japanese text-lg font-bold"
                placeholder="Cari: 食べる, N5, 〜てもいい, air..."
                autoFocus
              />
            </div>
            <Button type="submit" disabled={isPending || !query.trim()} className="rounded-xl">
              {isPending ? (
                <Loader2 data-icon="inline-start" className="animate-spin" />
              ) : (
                <Search data-icon="inline-start" />
              )}
              Cari
            </Button>
          </form>

          {error ? (
            <p className="mt-4 rounded-xl border border-destructive/25 bg-destructive/10 p-3 text-sm font-bold text-destructive">
              {error}
            </p>
          ) : null}

          <div className="mt-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap items-center gap-2">
              <SlidersHorizontal size={16} className="text-primary" aria-hidden="true" />
              {FILTERS.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setFilter(item.id)}
                    className={cn(
                      "inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-[10px] font-black uppercase tracking-widest transition-all",
                      filter === item.id
                        ? "border-primary/40 bg-primary/10 text-primary"
                        : "border-border bg-muted/10 text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <Icon size={12} aria-hidden="true" />
                    {item.label}
                    <span className="font-mono">{counts[item.id]}</span>
                  </button>
                );
              })}
            </div>
            {history.length > 0 ? (
              <div className="flex flex-wrap items-center gap-2">
                <Clock size={14} className="text-muted-foreground" aria-hidden="true" />
                {history.slice(0, 4).map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => {
                      setQuery(item);
                      runSearch(item);
                    }}
                    className="rounded-xl border border-border bg-muted/15 px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground transition-all hover:text-foreground"
                  >
                    {item}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={clearHistory}
                  className="rounded-xl p-2 text-muted-foreground transition-all hover:bg-muted hover:text-foreground"
                  aria-label="Hapus history pencarian"
                >
                  <X size={14} />
                </button>
              </div>
            ) : null}
          </div>
        </Card>

        <div className="grid gap-4">
          {displayedResults.length > 0 ? (
            displayedResults.map((item) => (
              <DictionaryResultCard key={`${item.category}-${item.id}`} item={item} />
            ))
          ) : (
            <Card className="rounded-2xl md:rounded-3xl border border-dashed border-border/80 bg-card/25 p-12 text-center glass shadow-[0_0_30px_rgba(var(--primary-rgb),0.015)] relative overflow-hidden">
              <div className="mx-auto mb-5 flex size-16 items-center justify-center rounded-lg border border-primary/20 bg-primary/10 text-primary">
                <Sparkles size={26} aria-hidden="true" />
              </div>
              <h2 className="text-xl uppercase tracking-tight text-foreground">
                Mulai Dari Pencarian
              </h2>
              <p className="mx-auto mt-2 max-w-md text-sm font-medium leading-relaxed text-muted-foreground">
                Masukkan kata Jepang, romaji, arti Indonesia, atau pola grammar untuk melihat hasil.
              </p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}