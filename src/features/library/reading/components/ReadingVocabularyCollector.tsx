"use client";

/**
 * @file ReadingVocabularyCollector.tsx
 * @description Panel bank kosakata yang dikoleksi dari satu materi reading.
 */

import Link from "next/link";
import { BookMarked, ExternalLink, Trash2 } from "@/components/ui/icons";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useUIStore } from "@/store/useUIStore";

/**
 * Props for ReadingVocabularyCollector component.
 */
interface ReadingVocabularyCollectorProps {
 /** Source reading material ID. */
 sourceId: string;
}

/**
 * Render collected vocabulary list for reading material.
 * Allow delete and detail view.
 */
export function ReadingVocabularyCollector({ sourceId }: ReadingVocabularyCollectorProps) {
 const vocabularyBank = useUIStore((state) => state.readingVocabularyBank);
 const removeReadingVocabulary = useUIStore((state) => state.removeReadingVocabulary);
 const clearReadingVocabulary = useUIStore((state) => state.clearReadingVocabulary);

 // Filter words by source ID. Sort by newest first.
 const entries = Object.values(vocabularyBank)
 .filter((entry) => entry.sourceId === sourceId)
 .sort((left, right) => right.addedAt - left.addedAt);

 // Show empty state if no words saved.
 if (entries.length === 0) {
 return (
 <Card className="mt-16 rounded-2xl md:rounded-3xl border border-dashed border-border bg-card/30 p-6 text-center">
 <BookMarked size={28} aria-hidden="true" className="mx-auto mb-3 text-muted-foreground/50" />
 <p className="text-xs font-black uppercase tracking-[0.22em] text-muted-foreground">
 Bank kosakata bacaan masih kosong
 </p>
 </Card>
 );
 }

 return (
 <Card className="mt-16 rounded-2xl md:rounded-3xl border border-border bg-card/45 p-6 shadow-2xl">
 <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
 <div className="flex items-center gap-3">
 <div className="flex size-11 items-center justify-center rounded-lg border border-primary/20 bg-primary/10 text-primary">
 <BookMarked size={20} aria-hidden="true" />
 </div>
 <div className="flex flex-col gap-1">
 <span className="text-sm font-black uppercase tracking-widest text-foreground">
 Bank Kosakata Bacaan
 </span>
 <span className="text-xs font-medium text-muted-foreground">
 {entries.length} kata disimpan dari materi ini
 </span>
 </div>
 </div>
 <Button
 type="button"
 variant="ghost"
 size="sm"
 onClick={() => clearReadingVocabulary(sourceId)}
 className="rounded-xl"
 >
 <Trash2 data-icon="inline-start" />
 Bersihkan
 </Button>
 </div>

 <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
 {entries.map((entry) => (
 <div
 key={entry.id}
 className="rounded-lg border border-border bg-background/45 p-4"
 >
 <div className="mb-3 flex items-start justify-between gap-3">
 <div className="min-w-0">
 <p className="truncate text-xl font-black text-foreground font-japanese">
 {entry.word}
 </p>
 {entry.reading ? (
 <p className="truncate text-xs font-bold text-muted-foreground">
 {entry.reading}
 </p>
 ) : null}
 </div>
 {entry.jlpt ? (
 <Badge variant="outline" className="shrink-0 rounded-full border-primary/20 bg-primary/10 text-primary">
 {entry.jlpt}
 </Badge>
 ) : null}
 </div>

 {entry.meaning ? (
 <p className="mb-4 line-clamp-2 text-sm font-medium leading-relaxed text-muted-foreground">
 {entry.meaning}
 </p>
 ) : null}

 <div className="flex items-center gap-2">
 {entry.slug ? (
 <Button asChild variant="outline" size="sm" className="flex-1 rounded-xl">
 <Link href={`/library/vocab/${entry.slug}`}>
 <ExternalLink data-icon="inline-start" />
 Detail
 </Link>
 </Button>
 ) : null}
 <Button
 type="button"
 variant="ghost"
 size="sm"
 onClick={() => removeReadingVocabulary(entry.id)}
 className="rounded-xl"
 >
 <Trash2 data-icon="inline-start" />
 Hapus
 </Button>
 </div>
 </div>
 ))}
 </div>
 </Card>
 );
}