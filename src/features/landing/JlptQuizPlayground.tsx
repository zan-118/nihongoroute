"use client";

/**
 * @file JlptQuizPlayground.tsx
 * @description Interactive JLPT N5 grammar quiz playground mini component for landing page feature grid.
 */

import React, { useState } from "react";

/**
 * Interactive JLPT N5 grammar quiz playground.
 * Small Client Component isolated for interactive quiz functionality.
 */
export function JlptQuizPlayground() {
 // Track selected answer key
 const [selected, setSelected] = useState<string | null>(null);
 // Check if selected answer is correct (A is correct)
 const isCorrect = selected === "A";

 return (
 <div className="flex flex-col items-center gap-3">
 <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Kuis Latihan Ujian N5</span>
 <div className="w-full p-3 bg-background/80 border border-border rounded-xl text-center shadow-inner">
 <span className="text-xs font-bold text-foreground">
 私は昨日デパート <span className="text-primary font-bold">[ ? ]</span> 行きました。
 </span>
 </div>
 <div className="grid grid-cols-2 gap-2 w-full">
 {[
 { key: "A", label: "に (ni)" },
 { key: "B", label: "を (wo)" },
 { key: "C", label: "が (ga)" },
 { key: "D", label: "は (ha)" },
 ].map((opt) => (
 <button
 key={opt.key}
 type="button"
 aria-pressed={selected === opt.key}
 aria-label={`Pilih jawaban ${opt.key}: ${opt.label}`}
 onClick={() => setSelected(opt.key)}
 className={`py-1.5 px-3 rounded-lg border text-xs font-bold transition-all ${
 selected === opt.key
 ? opt.key === "A"
 ? "bg-success/15 border-success text-success shadow-sm"
 : "bg-destructive/15 border-destructive text-destructive"
 : "border-border bg-background/50 hover:border-foreground/20 text-muted-foreground hover:text-foreground"
 }`}
 >
 {opt.label}
 </button>
 ))}
 </div>
 {selected && (
 <span className={`text-[10px] font-bold uppercase tracking-wider ${isCorrect ? "text-success animate-pulse" : "text-destructive"}`}>
 {isCorrect ? "✓ Tepat! 'ni' menyatakan arah/tujuan." : "✗ Salah, coba lagi!"}
 </span>
 )}
 </div>
 );
}
