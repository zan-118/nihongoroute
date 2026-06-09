"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  ClipboardList,
  GraduationCap,
  Loader2,
  RotateCcw,
  Sparkles,
  XCircle,
} from "lucide-react";
import {
  conjugateVerb,
  isConjugationAnswerCorrect,
  VERB_FORMS,
  type VerbFormId,
  type VerbGroup,
} from "@/lib/verb-conjugation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const SAMPLE_VERBS: Array<{ word: string; group: VerbGroup; label: string }> = [
  { word: "書く", group: "godan", label: "Godan" },
  { word: "読む", group: "godan", label: "Godan" },
  { word: "食べる", group: "ichidan", label: "Ichidan" },
  { word: "見る", group: "ichidan", label: "Ichidan" },
  { word: "する", group: "irregular", label: "Irregular" },
  { word: "来る", group: "irregular", label: "Irregular" },
];

const GROUPS: Array<{ id: VerbGroup; label: string; hint: string }> = [
  { id: "godan", label: "Godan", hint: "う-verbs" },
  { id: "ichidan", label: "Ichidan", hint: "る-verbs" },
  { id: "irregular", label: "Irregular", hint: "する / 来る" },
];

export default function ConjugationTrainerClient() {
  const [verb, setVerb] = useState("書く");
  const [group, setGroup] = useState<VerbGroup>("godan");
  const [targetForm, setTargetForm] = useState<VerbFormId>("te");
  const [answer, setAnswer] = useState("");
  const [hasChecked, setHasChecked] = useState(false);

  const conjugation = useMemo(() => {
    try {
      return { error: "", result: conjugateVerb(verb, group) };
    } catch (err) {
      return {
        error: err instanceof Error ? err.message : "Konjugasi tidak valid.",
        result: null,
      };
    }
  }, [group, verb]);

  const expected = conjugation.result?.forms[targetForm] || "";
  const isCorrect = hasChecked && expected
    ? isConjugationAnswerCorrect(expected, answer)
    : false;
  const targetMeta = VERB_FORMS.find((item) => item.id === targetForm);

  const handleSample = (sample: (typeof SAMPLE_VERBS)[number]) => {
    setVerb(sample.word);
    setGroup(sample.group);
    setAnswer("");
    setHasChecked(false);
  };

  const handleReset = () => {
    setAnswer("");
    setHasChecked(false);
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
              <div className="flex size-12 items-center justify-center rounded-2xl border border-success/20 bg-success/10 text-success">
                <GraduationCap size={24} aria-hidden="true" />
              </div>
              <Badge className="w-fit rounded-xl px-3 py-1">Verb Trainer</Badge>
            </div>
            <h1 className="max-w-3xl text-4xl font-black uppercase tracking-tight text-foreground md:text-6xl">
              Latihan Konjugasi
            </h1>
            <p className="max-w-2xl text-sm font-medium leading-relaxed text-muted-foreground">
              Masukkan verba bentuk kamus, pilih grup dan target bentuk, lalu latih jawaban tanpa membuka tabel terlebih dulu.
            </p>
          </div>
        </header>

        <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <Card className="rounded-[2rem] border border-border bg-card/45 p-5 shadow-2xl md:p-6">
            <div className="mb-5 flex items-center gap-2">
              <ClipboardList size={16} className="text-primary" aria-hidden="true" />
              <h2 className="text-xs font-black uppercase tracking-[0.2em] text-foreground">
                Setup
              </h2>
            </div>

            <div className="flex flex-col gap-5">
              <div>
                <label className="mb-2 block text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                  Verba Bentuk Kamus
                </label>
                <Input
                  value={verb}
                  onChange={(event) => {
                    setVerb(event.target.value);
                    setHasChecked(false);
                  }}
                  className="font-japanese text-xl font-black"
                  placeholder="書く"
                />
              </div>

              <div>
                <p className="mb-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                  Grup
                </p>
                <div className="grid gap-2 sm:grid-cols-3">
                  {GROUPS.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        setGroup(item.id);
                        setHasChecked(false);
                      }}
                      className={cn(
                        "rounded-2xl border p-4 text-left transition-all",
                        group === item.id
                          ? "border-primary/40 bg-primary/10 text-primary"
                          : "border-border bg-muted/15 text-muted-foreground hover:text-foreground"
                      )}
                    >
                      <span className="block text-sm font-black uppercase tracking-widest">
                        {item.label}
                      </span>
                      <span className="mt-1 block text-[10px] font-bold uppercase tracking-wider">
                        {item.hint}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="mb-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                  Target Bentuk
                </p>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {VERB_FORMS.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        setTargetForm(item.id);
                        setHasChecked(false);
                      }}
                      className={cn(
                        "rounded-xl border p-3 text-left transition-all",
                        targetForm === item.id
                          ? "border-success/40 bg-success/10 text-success"
                          : "border-border bg-background/35 text-muted-foreground hover:text-foreground"
                      )}
                    >
                      <span className="block font-japanese text-sm font-black">
                        {item.label}
                      </span>
                      <span className="line-clamp-1 text-[10px] font-medium">
                        {item.description}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="mb-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                  Contoh Cepat
                </p>
                <div className="flex flex-wrap gap-2">
                  {SAMPLE_VERBS.map((sample) => (
                    <Button
                      key={`${sample.word}-${sample.group}`}
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleSample(sample)}
                      className="rounded-xl font-japanese"
                    >
                      {sample.word}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </Card>

          <div className="flex flex-col gap-6">
            <Card className="rounded-[2rem] border border-border bg-card/45 p-5 shadow-2xl md:p-6">
              <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                    Target
                  </p>
                  <h2 className="font-japanese text-3xl font-black text-foreground">
                    {verb || "Verba"} → {targetMeta?.label}
                  </h2>
                </div>
                <Badge variant="outline" className="w-fit rounded-xl">
                  {targetMeta?.description}
                </Badge>
              </div>

              <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
                <Input
                  value={answer}
                  onChange={(event) => {
                    setAnswer(event.target.value);
                    setHasChecked(false);
                  }}
                  className="font-japanese text-xl font-black"
                  placeholder="Jawaban kamu..."
                />
                <Button
                  type="button"
                  onClick={() => setHasChecked(true)}
                  disabled={!answer.trim() || !conjugation.result}
                  className="rounded-xl"
                >
                  Cek
                </Button>
              </div>

              {conjugation.error ? (
                <div className="mt-4 rounded-2xl border border-destructive/25 bg-destructive/10 p-4 text-sm font-bold text-destructive">
                  {conjugation.error}
                </div>
              ) : null}

              {hasChecked && conjugation.result ? (
                <div
                  className={cn(
                    "mt-4 rounded-2xl border p-5",
                    isCorrect
                      ? "border-success/25 bg-success/10 text-success"
                      : "border-warning/25 bg-warning/10 text-warning"
                  )}
                >
                  <div className="flex items-center gap-2">
                    {isCorrect ? (
                      <CheckCircle2 size={18} aria-hidden="true" />
                    ) : (
                      <XCircle size={18} aria-hidden="true" />
                    )}
                    <span className="text-xs font-black uppercase tracking-widest">
                      {isCorrect ? "Benar" : "Belum Tepat"}
                    </span>
                  </div>
                  <p className="mt-3 font-japanese text-2xl font-black text-foreground">
                    {expected}
                  </p>
                  <p className="mt-1 text-sm font-medium text-muted-foreground">
                    Jawabanmu: <span className="font-japanese">{answer}</span>
                  </p>
                </div>
              ) : null}

              <div className="mt-5 flex flex-wrap gap-2">
                <Button type="button" variant="outline" onClick={handleReset} className="rounded-xl">
                  <RotateCcw data-icon="inline-start" />
                  Reset
                </Button>
              </div>
            </Card>

            <Card className="rounded-[2rem] border border-border bg-card/45 p-5 shadow-xl md:p-6">
              <div className="mb-4 flex items-center gap-2">
                {conjugation.result ? (
                  <Sparkles size={16} className="text-primary" aria-hidden="true" />
                ) : (
                  <Loader2 size={16} className="text-muted-foreground" aria-hidden="true" />
                )}
                <h2 className="text-xs font-black uppercase tracking-[0.2em] text-foreground">
                  Tabel Bentuk
                </h2>
              </div>
              {conjugation.result ? (
                <div className="grid gap-3 sm:grid-cols-2">
                  {VERB_FORMS.map((item) => (
                    <div
                      key={item.id}
                      className={cn(
                        "rounded-2xl border p-4",
                        item.id === targetForm
                          ? "border-primary/35 bg-primary/10"
                          : "border-border bg-background/40"
                      )}
                    >
                      <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                        {item.label}
                      </p>
                      <p className="mt-1 font-japanese text-xl font-black text-foreground">
                        {conjugation.result.forms[item.id]}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="rounded-2xl border border-dashed border-border bg-muted/15 p-5 text-sm font-medium text-muted-foreground">
                  Isi verba yang valid untuk melihat tabel konjugasi.
                </p>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
