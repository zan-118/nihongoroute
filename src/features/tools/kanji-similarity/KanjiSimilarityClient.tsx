"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Eye, Pencil, Search } from "@/components/ui/icons";
import { SIMILAR_KANJI_PAIRS, type SimilarKanjiPair } from "@/lib/kanji-similarity";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

import { ROUTES } from "@/lib/core/routes";
/**
 * Card component to display and compare single kanji details.
 * Shows character, meaning, reading, visual cue, and examples.
 */
function KanjiCompareCard({
 item,
 accent,
}: {
 item: SimilarKanjiPair["items"][number];
 accent: "primary" | "warning";
}) {
 return (
 <Card
 className={cn(
 "rounded-2xl md:rounded-3xl border bg-card/45 p-6 shadow-xl",
 // Apply accent color border based on primary/warning role
 accent === "primary" ? "border-primary/25" : "border-warning/25"
 )}
 >
 <div className="flex flex-col gap-5">
 <div className="flex items-start justify-between gap-4">
 <div>
 <p
 className={cn(
 "font-japanese text-8xl font-black leading-none",
 // Apply accent color text based on primary/warning role
 accent === "primary" ? "text-primary" : "text-warning"
 )}
 >
 {item.character}
 </p>
 <p className="mt-3 text-xl font-black text-foreground">{item.meaning}</p>
 <p className="font-japanese text-sm font-bold text-muted-foreground">
 {item.reading}
 </p>
 </div>
 <div className="flex gap-2">
 <Button variant="outline" size="icon" asChild className="rounded-xl">
 <Link href={`/library/kanji/${item.character}`} aria-label={`Buka detail ${item.character}`}>
 <Eye size={16} />
 </Link>
 </Button>
 <Button variant="outline" size="icon" asChild className="rounded-xl">
 <Link
 href={`/tools/writing?char=${encodeURIComponent(item.character)}`}
 aria-label={`Latihan menulis ${item.character}`}
 >
 <Pencil size={16} />
 </Link>
 </Button>
 </div>
 </div>

 <div className="rounded-lg border border-border bg-muted/15 p-4">
 <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
 Petunjuk Visual
 </p>
 <p className="mt-2 text-sm font-bold leading-relaxed text-foreground">{item.cue}</p>
 </div>

 <div className="flex flex-col gap-2">
 <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
 Contoh
 </p>
 {item.examples.map((example) => (
 <div
 key={example.word}
 className="flex items-center justify-between gap-3 rounded-xl border border-border bg-background/40 px-3 py-2"
 >
 <span className="font-japanese text-lg font-black text-foreground">
 {example.word}
 </span>
 <span className="text-right text-xs font-bold text-muted-foreground">
 {example.meaning}
 </span>
 </div>
 ))}
 </div>
 </div>
 </Card>
 );
}

/**
 * Client component for comparing similar Japanese kanji characters.
 * Allows selecting pairs, viewing differences, mnemonics, and navigating to writing practice.
 */
export default function KanjiSimilarityClient() {
 // Track currently selected kanji pair ID
 const [selectedId, setSelectedId] = useState(SIMILAR_KANJI_PAIRS[0].id);
 
 // Find active pair data, fallback to first pair if not found
 const selectedPair =
 SIMILAR_KANJI_PAIRS.find((pair) => pair.id === selectedId) || SIMILAR_KANJI_PAIRS[0];

 return (
 <div className="min-h-screen bg-background/95 px-4 py-12 md:px-8">
 <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
 <header className="flex flex-col gap-5">
 <Button variant="outline" asChild className="w-fit rounded-xl">
 <Link href={ROUTES.TOOLS.ROOT}>Kembali ke Peralatan</Link>
 </Button>
 <div className="flex flex-col gap-3">
 <div className="flex items-center gap-3">
 <div className="flex size-12 items-center justify-center rounded-lg border border-warning/20 bg-warning/10 text-warning">
 <Search size={24} aria-hidden="true" />
 </div>
 <Badge className="w-fit rounded-xl px-3 py-1">Kemiripan Kanji</Badge>
 </div>
 <h1 className="max-w-3xl text-4xl uppercase tracking-tight text-foreground md:text-6xl">
 Kanji Mirip
 </h1>
 <p className="max-w-2xl text-sm font-medium leading-relaxed text-muted-foreground">
 Bandingkan pasangan kanji yang sering tertukar, lihat petunjuk visual, contoh kosakata, dan langsung masuk latihan menulis.
 </p>
 </div>
 </header>

 <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
 <Card className="rounded-2xl md:rounded-3xl border border-border bg-card/45 p-4 shadow-xl">
 <div className="mb-4 flex items-center gap-2 px-2">
 
 <h2 className="text-xs uppercase tracking-[0.2em] text-foreground">
 Pasangan
 </h2>
 </div>
 <div className="flex flex-col gap-2">
 {SIMILAR_KANJI_PAIRS.map((pair) => (
 <button
 key={pair.id}
 type="button"
 onClick={() => setSelectedId(pair.id)}
 className={cn(
 "rounded-lg border p-4 text-left transition-all",
 selectedPair.id === pair.id
 ? "border-primary/40 bg-primary/10 text-primary"
 : "border-border bg-background/35 text-muted-foreground hover:text-foreground"
 )}
 >
 <span className="font-japanese text-2xl font-black">{pair.title}</span>
 <span className="mt-1 block text-[10px] font-bold uppercase tracking-widest">
 {pair.level}
 </span>
 </button>
 ))}
 </div>
 </Card>

 <div className="flex flex-col gap-6">
 <Card className="rounded-2xl md:rounded-3xl border border-border bg-card/45 p-5 shadow-2xl md:p-6">
 <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
 <div>
 <Badge variant="outline" className="mb-3 rounded-xl">
 {selectedPair.level}
 </Badge>
 <h2 className="font-japanese text-4xl text-foreground">
 {selectedPair.title}
 </h2>
 <p className="mt-3 text-sm font-bold leading-relaxed text-primary">
 {selectedPair.difference}
 </p>
 </div>
 <div className="rounded-lg border border-success/20 bg-success/10 p-4 text-success lg:max-w-sm">
 <p className="text-[10px] font-black uppercase tracking-widest">Mnemonic</p>
 <p className="mt-2 text-sm font-bold leading-relaxed text-foreground">
 {selectedPair.mnemonic}
 </p>
 </div>
 </div>
 </Card>

 <div className="grid gap-6 xl:grid-cols-2">
 <KanjiCompareCard item={selectedPair.items[0]} accent="primary" />
 <KanjiCompareCard item={selectedPair.items[1]} accent="warning" />
 </div>

 <Card className="rounded-2xl md:rounded-3xl border border-border bg-muted/15 p-5">
 <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
 <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
 Setelah lihat petunjuk visual, coba tulis keduanya bergantian di kanvas menulis.
 </p>
 <Button asChild className="rounded-xl">
 <Link href={`/tools/writing?char=${encodeURIComponent(selectedPair.items[0].character)}`}>
 Mulai Menulis
 <ArrowRight data-icon="inline-end" />
 </Link>
 </Button>
 </div>
 </Card>
 </div>
 </div>
 </div>
 </div>
 );
}