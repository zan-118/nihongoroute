"use client";

/**
 * @file KanjiProgressGrid.tsx
 * @description Dashboard visual grid widget displaying N5 Kanji mastery status.
 * Matches Kanji dataset from Supabase against SRS repetition levels in Zustand store to color-code mastery states.
 * @module features/dashboard/components
 */

// Import & Dependencies

import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader, Information } from "@/components/ui/icons";
import { useKanjiProgressQuery } from "./useKanjiProgressQuery";
import { useAddToSRSInternal } from "@/features/srs/actions/AddToSRSButton";

// Component Interfaces

interface KanjiGridItemData {
 _id: string;
 kanji: string;
 meaning: string;
 isLearning?: boolean;
 isMastered?: boolean;
}

function KanjiGridItem({ item }: { item: KanjiGridItemData }) {
 const { isAdded, handleAdd } = useAddToSRSInternal(item._id);
 const activeIsAdded = item.isLearning || item.isMastered || isAdded;

 return (
 <div
 title={`${item.kanji}: ${item.meaning} (${activeIsAdded ? (item.isMastered ? "Mahir" : "Latihan") : "Belum"})`}
 className={`
 aspect-square rounded-lg flex flex-col items-center justify-center text-lg font-japanese font-bold transition-all duration-300 border cursor-default relative group/item
 ${item.isMastered
 ? 'bg-success border-success text-success-foreground' 
 : activeIsAdded
 ? 'bg-primary/20 border-primary/40 text-primary' 
 : 'bg-muted/50 border-border/50 text-muted-foreground/30 hover:border-muted-foreground/50 hover:bg-muted/70'}
 `}
 >
 <span>{item.kanji}</span>
 
 {!activeIsAdded && (
 <button
 onClick={(e) => {
 e.preventDefault();
 e.stopPropagation();
 handleAdd();
 }}
 className="absolute -top-1 -right-1 opacity-0 group-hover/item:opacity-100 transition-opacity bg-primary text-primary-foreground size-5 rounded-full flex items-center justify-center text-[10px] shadow-md border border-background hover:scale-110 active:scale-95"
 title="Tambah ke SRS"
 >
 +
 </button>
 )}
 </div>
 );
}

// KOMPONEN UTAMA

/**
 * Grid component showing Kanji learning progress with level tabs.
 * Maps database kanji items against local SRS intervals.
 */
export default function KanjiProgressGrid() {
 const [level, setLevel] = useState<"N5" | "N4" | "N3">("N5");
 const { kanjis, kanjiProgress, isLoading } = useKanjiProgressQuery(level);

 if (isLoading) {
 return (
 <Card className="p-8 flex items-center justify-center bg-card/50 border-border">
 <Loader className="animate-spin text-primary" size={24} />
 </Card>
 );
 }

 return (
 <Card className="bg-card border border-border rounded-lg p-6 md:p-8 shadow-lg overflow-hidden relative">
 <div className="absolute top-0 right-0 size-32 bg-primary/5 blur-3xl rounded-full" />
 
 {/* BAGIAN HEADER GRID */}
 <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
 <div>
 <h2 className="text-muted-foreground uppercase tracking-wider text-xs mb-2 flex items-center gap-2">
 <div className="size-1.5 rounded-full bg-primary animate-pulse" />
 Peta Penguasaan Kanji {level}
 </h2>
 <p className="text-sm font-black text-foreground uppercase tracking-tight">
 {kanjiProgress.masteredCount} <span className="text-muted-foreground font-medium text-xs">Dikuasai</span> / {kanjis.length} <span className="text-muted-foreground font-medium text-xs">Total</span>
 </p>
 </div>

 {/* Tab Selector Level */}
 <div className="flex items-center gap-4">
 <div className="flex gap-1 bg-muted/65 p-1 rounded-xl border border-border">
 {(["N5", "N4", "N3"] as const).map((lvl) => (
 <button
 key={lvl}
 onClick={() => setLevel(lvl)}
 className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${
 level === lvl
 ? "bg-background text-foreground shadow-sm border border-border/40"
 : "text-muted-foreground hover:text-foreground"
 }`}
 >
 {lvl}
 </button>
 ))}
 </div>
 
 <div className="flex gap-3">
 <Badge variant="outline" className="bg-primary/10 border-primary/20 text-primary text-[8px] font-bold uppercase tracking-wider px-3 py-1 rounded-lg">
 {kanjiProgress.learningCount} Belajar
 </Badge>
 <Badge variant="outline" className="bg-success/10 border-success/20 text-success text-[8px] font-bold uppercase tracking-wider px-3 py-1 rounded-lg">
 {kanjiProgress.masteredCount} Mahir
 </Badge>
 </div>
 </div>
 </div>

 {/* GRID VISUAL KANJI */}
 <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12 gap-2">
 {kanjiProgress.items.map((item) => (
 <KanjiGridItem key={item._id} item={item} />
 ))}
 </div>

 {/* TIPS HARI INI */}
 <div className="mt-8 flex items-center gap-2 text-muted-foreground">
 <Information size={12} />
 <p className="text-xs font-bold uppercase tracking-wider">
 Tip: Dekatkan kursor ke kotak kanji abu-abu dan klik tombol (+) untuk memasukkannya ke antrean SRS.
 </p>
 </div>
 </Card>
 );
}