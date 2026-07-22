"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowDown, CheckCircle2, RotateCcw, Shuffle, Sparkles, XCircle } from "@/components/ui/icons";
import {
  isBuiltSentenceCorrect,
  SENTENCE_BUILDER_PROMPTS,
  shuffleSentenceTokens,
  tokenizeSentence,
  type SentenceBuilderPrompt,
} from "@/lib/sentence-builder";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { getRandomSentencesForDrill } from "@/actions/sentences.actions";

import { ROUTES } from "@/lib/core/routes";
/**
 * SentenceBuilderClient component.
 * Provides interactive UI to build Japanese sentences from tokens.
 * Supports local static prompts and dynamic database prompts.
 */
export default function SentenceBuilderClient() {
  // Active prompt index in current list
  const [promptIndex, setPromptIndex] = useState(0);
  // Tokens selected by user in order
  const [selectedTokens, setSelectedTokens] = useState<string[]>([]);
  // Counter to force token reshuffle
  const [shuffleRound, setShuffleRound] = useState(0);
  // Flag indicating if user checked answer
  const [hasChecked, setHasChecked] = useState(false);

  // DB Mode States
  const [isDbMode, setIsDbMode] = useState(false);
  const [dbLevel, setDbLevel] = useState("all");
  const [dbPrompts, setDbPrompts] = useState<SentenceBuilderPrompt[]>([]);
  const [loading, setLoading] = useState(false);

  // Resolve active prompt list and current prompt
  const activePrompts = isDbMode && dbPrompts.length > 0 ? dbPrompts : SENTENCE_BUILDER_PROMPTS;
  const prompt = activePrompts[promptIndex] || activePrompts[0] || SENTENCE_BUILDER_PROMPTS[0];

  // Shuffle tokens based on prompt ID and shuffle round
  const shuffledTokens = useMemo(
    () => shuffleSentenceTokens(prompt.tokens, `${prompt.id}-${shuffleRound}`),
    [prompt.id, prompt.tokens, shuffleRound]
  );

  // Filter out tokens already selected, accounting for duplicates
  const availableTokens = useMemo(() => {
    return shuffledTokens.filter((token, index) => {
      const usedCount = selectedTokens.filter((selected) => selected === token).length;
      const seenSoFar = shuffledTokens.slice(0, index + 1).filter((item) => item === token).length;
      return usedCount < seenSoFar;
    });
  }, [shuffledTokens, selectedTokens]);

  // Check if built sentence matches target
  const isCorrect = hasChecked && isBuiltSentenceCorrect(prompt.tokens, selectedTokens);

  /**
   * Fetches random sentences from database for drill.
   * Maps database schema to SentenceBuilderPrompt structure.
   * 
   * @param lvl - JLPT level filter
   */
  const fetchDbSentences = async (lvl: string) => {
    setLoading(true);
    try {
      const data = await getRandomSentencesForDrill(lvl === "all" ? "" : lvl, 10);
      if (data.length === 0) {
        toast.error("Maaf ya, kalimat contoh di database belum ketemu.");
        return;
      }
      const mapped: SentenceBuilderPrompt[] = data.map((s, i) => ({
        id: `db-${s.id}-${i}`,
        level: s.jlpt_level || lvl.toUpperCase(),
        target: s.japanese,
        translation: s.translation,
        tokens: tokenizeSentence(s.japanese),
        explanation: "Kalimat contoh dari database.",
        pattern: "Konteks Kalimat"
      }));
      setDbPrompts(mapped);
      setPromptIndex(0);
      setSelectedTokens([]);
      setShuffleRound((prev) => prev + 1);
      setHasChecked(false);
      setIsDbMode(true);
      toast.success("Oke, kalimat contoh udah dimuat!");
    } catch (e) {
      console.error(e);
      toast.error("Waduh, gagal mengambil kalimat dari database.");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Switches active prompt and resets state.
   * 
   * @param nextIndex - Index of next prompt
   */
  const handlePromptChange = (nextIndex: number) => {
    setPromptIndex(nextIndex);
    setSelectedTokens([]);
    setShuffleRound((prev) => prev + 1);
    setHasChecked(false);
  };

  /**
   * Resets selected tokens and check state.
   */
  const handleReset = () => {
    setSelectedTokens([]);
    setHasChecked(false);
  };

  /**
   * Triggers reshuffle of tokens and resets selection.
   */
  const handleShuffle = () => {
    setShuffleRound((prev) => prev + 1);
    setSelectedTokens([]);
    setHasChecked(false);
  };

  return (
    <div className="min-h-screen bg-background/95 px-4 py-12 md:px-8">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
        <header className="flex flex-col gap-5">
          <Button variant="outline" asChild className="w-fit rounded-xl">
            <Link href={ROUTES.TOOLS.ROOT}>Kembali ke Peralatan</Link>
          </Button>
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <div className="flex size-12 items-center justify-center rounded-lg border border-success/20 bg-success/10 text-success">
                <Sparkles size={24} aria-hidden="true" />
              </div>
              <Badge className="w-fit rounded-xl px-3 py-1">Sentence Builder</Badge>
            </div>
            <h1 className="max-w-3xl text-4xl uppercase tracking-tight text-foreground md:text-6xl">
              Susun Kalimat
            </h1>
            <p className="max-w-2xl text-sm font-medium leading-relaxed text-muted-foreground">
              Susun token menjadi kalimat Jepang yang benar. Cocok untuk melatih grammar pattern tanpa harus menulis dari nol.
            </p>
          </div>
        </header>

        <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
          <Card className="rounded-2xl md:rounded-3xl border border-border bg-card/45 p-4 shadow-xl">
            <div className="mb-4 flex items-center gap-2 px-2">
              <ArrowDown size={16} className="text-primary" aria-hidden="true" />
              <h2 className="text-xs uppercase tracking-[0.2em] text-foreground">
                Prompt
              </h2>
            </div>
            <div className="flex gap-2 mb-4 p-1 bg-muted rounded-xl">
              <button
                type="button"
                onClick={() => {
                  setIsDbMode(false);
                  setPromptIndex(0);
                  setSelectedTokens([]);
                  setHasChecked(false);
                }}
                className={cn(
                  "flex-1 py-2 text-xs font-bold rounded-lg transition-all",
                  !isDbMode ? "bg-background shadow text-foreground" : "text-muted-foreground hover:text-foreground"
                )}
              >
                Bawaan
              </button>
              <button
                type="button"
                onClick={() => {
                  if (dbPrompts.length === 0) {
                    fetchDbSentences(dbLevel);
                  } else {
                    setIsDbMode(true);
                    setPromptIndex(0);
                    setSelectedTokens([]);
                    setHasChecked(false);
                  }
                }}
                className={cn(
                  "flex-1 py-2 text-xs font-bold rounded-lg transition-all",
                  isDbMode ? "bg-background shadow text-foreground" : "text-muted-foreground hover:text-foreground"
                )}
              >
                Database (DB)
              </button>
            </div>

            {isDbMode && (
              <div className="mb-4 space-y-2 p-2.5 border border-border/60 rounded-lg bg-background/25">
                <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground block">JLPT Level</span>
                <div className="flex flex-wrap items-center justify-center gap-1.5">
                  {["all", "N5", "N4", "N3", "N2", "N1"].map((l) => (
                    <button
                      key={l}
                      type="button"
                      onClick={() => {
                        setDbLevel(l);
                        fetchDbSentences(l);
                      }}
                      className={cn(
                        "py-1.5 text-[9px] font-black uppercase rounded-lg border transition-all",
                        dbLevel === l
                          ? "border-success bg-success/15 text-success font-bold"
                          : "border-border bg-background/50 hover:bg-muted text-muted-foreground"
                      )}
                    >
                      {l}
                    </button>
                  ))}
                </div>
                <Button
                  onClick={() => fetchDbSentences(dbLevel)}
                  disabled={loading}
                  size="sm"
                  className="w-full text-[9px] font-black uppercase tracking-widest py-2 h-auto rounded-lg bg-success text-success-foreground hover:bg-success/90"
                >
                  {loading ? "Loading..." : "Ambil Baru"}
                </Button>
              </div>
            )}

            <div className="flex flex-col gap-2 max-h-[300px] lg:max-h-[500px] overflow-y-auto pr-1">
              {activePrompts.map((item, index) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handlePromptChange(index)}
                  className={cn(
                    "rounded-lg border p-4 text-left transition-all",
                    prompt.id === item.id
                      ? "border-primary/40 bg-primary/10 text-primary"
                      : "border-border bg-background/35 text-muted-foreground hover:text-foreground"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className="block text-sm font-black uppercase tracking-widest">
                      {item.level}
                    </span>
                    {isDbMode && (
                      <span className="text-[9px] font-mono opacity-50">#{index + 1}</span>
                    )}
                  </div>
                  <span className="mt-1 block text-sm font-bold leading-relaxed line-clamp-2">
                    {item.translation}
                  </span>
                </button>
              ))}
            </div>
          </Card>

          <div className="flex flex-col gap-6">
            <Card className="rounded-2xl md:rounded-3xl border border-border bg-card/45 p-5 shadow-2xl md:p-6">
              <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <Badge variant="outline" className="mb-3 rounded-xl">
                    {prompt.level} · {prompt.pattern}
                  </Badge>
                  <h2 className="text-2xl text-foreground">{prompt.translation}</h2>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button type="button" variant="outline" onClick={handleShuffle} className="rounded-xl">
                    <Shuffle data-icon="inline-start" />
                    Acak
                  </Button>
                  <Button type="button" variant="ghost" onClick={handleReset} className="rounded-xl">
                    <RotateCcw data-icon="inline-start" />
                    Reset
                  </Button>
                </div>
              </div>

              <div className="rounded-lg border border-dashed border-primary/30 bg-primary/10 p-4">
                <p className="mb-3 text-[10px] font-black uppercase tracking-widest text-primary">
                  Susunan Kamu
                </p>
                <div className="flex min-h-20 flex-wrap gap-2">
                  {selectedTokens.length > 0 ? (
                    selectedTokens.map((token, index) => (
                      <button
                        key={`${token}-${index}`}
                        type="button"
                        onClick={() => {
                          // Remove token at specific index to handle duplicates correctly
                          setSelectedTokens((prev) => prev.filter((_, itemIndex) => itemIndex !== index));
                          setHasChecked(false);
                        }}
                        className="rounded-xl border border-primary/25 bg-background/70 px-4 py-2 font-japanese text-lg font-black text-foreground transition-all hover:border-destructive/40 hover:text-destructive"
                      >
                        {token}
                      </button>
                    ))
                  ) : (
                    <p className="text-sm font-medium text-muted-foreground">
                      Pilih token di bawah untuk mulai menyusun.
                    </p>
                  )}
                </div>
              </div>

              <div className="mt-5">
                <p className="mb-3 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                  Token
                </p>
                <div className="flex flex-wrap gap-2">
                  {availableTokens.map((token, index) => (
                    <button
                      key={`${token}-${index}`}
                      type="button"
                      onClick={() => {
                        setSelectedTokens((prev) => [...prev, token]);
                        setHasChecked(false);
                      }}
                      className="rounded-xl border border-border bg-background/45 px-4 py-2 font-japanese text-lg font-black text-foreground transition-all hover:border-primary/40 hover:bg-primary/10"
                    >
                      {token}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm font-medium italic text-muted-foreground">
                  {prompt.explanation}
                </p>
                <Button
                  type="button"
                  onClick={() => setHasChecked(true)}
                  disabled={selectedTokens.length === 0}
                  className="rounded-xl"
                >
                  Cek Kalimat
                </Button>
              </div>
            </Card>

            <Card className="rounded-2xl md:rounded-3xl border border-border bg-card/45 p-5 shadow-xl">
              <div className="mb-4 flex items-center gap-2">
                {hasChecked ? (
                  isCorrect ? (
                    <CheckCircle2 size={16} className="text-success" />
                  ) : (
                    <XCircle size={16} className="text-warning" />
                  )
                ) : (
                  <Sparkles size={16} className="text-primary" />
                )}
                <h2 className="text-xs uppercase tracking-[0.2em] text-foreground">
                  Feedback
                </h2>
              </div>
              {hasChecked ? (
                <div
                  className={cn(
                    "rounded-lg border p-5",
                    isCorrect
                      ? "border-success/25 bg-success/10"
                      : "border-warning/25 bg-warning/10"
                  )}
                >
                  <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">
                    {isCorrect ? "Benar" : "Kalimat Target"}
                  </p>
                  <p className="mt-2 font-japanese text-2xl font-black text-foreground">
                    {prompt.target}
                  </p>
                  <p className="mt-2 text-sm font-medium leading-relaxed text-muted-foreground">
                    {isCorrect
                      ? "Urutannya sudah tepat."
                      : "Bandingkan urutan partikel, objek, dan predikatnya."}
                  </p>
                </div>
              ) : (
                <p className="rounded-lg border border-dashed border-border bg-muted/15 p-5 text-sm font-medium text-muted-foreground">
                  Susun token lalu cek untuk melihat jawaban target.
                </p>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}