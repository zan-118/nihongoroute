/**
 * @file FlashcardSetup.tsx
 * @description Configuration panel component before starting Flashcard quizzes. Enables selecting JLPT levels, practice modes (vocab/kanji/survival/pronunciation/sentence), and card counts.
 */

// Import & Dependencies

import React, { useState } from "react";
import { m } from "framer-motion";
import { Zap, Fire, Pencil, Hashtag, LayoutGrid, Stack, PlayCircle, Mic, BookOpen } from "@/components/ui/icons";
import { Button } from "@/components/ui/button";

// Component Props Interface

/**
 * Props for FlashcardSetup component.
 */
interface FlashcardSetupProps {
 /** Callback triggered when setup completes. Passes selected level, mode, and card count. */
 onStart: (level: string, mode: "vocab" | "kanji" | "survival" | "pronunciation" | "sentence", amount: number) => void;
 /** Initial JLPT level selection. */
 defaultLevel?: string | null;
 /** Initial study mode selection. */
 defaultMode?: "vocab" | "kanji" | "survival" | "pronunciation" | "sentence" | null;
}

/** JLPT level options with styling classes. */
const JLPT_LEVELS = [
  { id: "all", label: "Campur (Semua)", color: "bg-muted text-muted-foreground border-border" },
  { id: "N5", label: "N5", color: "bg-primary/10 text-primary border-primary/20" },
  { id: "N4", label: "N4", color: "bg-success/10 text-success border-success/20" },
  { id: "N3", label: "N3", color: "bg-warning/10 text-warning border-warning/20" },
  { id: "N2", label: "N2", color: "bg-secondary/10 text-secondary border-secondary/20" },
  { id: "N1", label: "N1", color: "bg-destructive/10 text-destructive border-destructive/20" }
];

/** Study mode options with icons and descriptions. */
const MODES = [
 { id: "vocab" as const, label: "Kosakata", icon: <Zap size={18} />, desc: "Latihan bacaan & makna kata" },
 { id: "kanji" as const, label: "Kanji", icon: <Pencil size={18} />, desc: "Hafalkan bentuk & On/Kun" },
 { id: "sentence" as const, label: "Kalimat", icon: <BookOpen size={18} />, desc: "Pahami kalimat contoh" },
 { id: "survival" as const, label: "Survival", icon: <Fire size={18} />, desc: "Tantangan berbatas waktu" },
 { id: "pronunciation" as const, label: "Pelafalan", icon: <Mic size={18} />, desc: "Uji akurasi bicaramu" }
];

/** Card count options. */
const AMOUNTS = [10, 20, 50, 100];

// Main Component

/**
 * Flashcard configuration panel.
 * Let user choose JLPT level, study mode, and card count.
 */
export function FlashcardSetup({ onStart, defaultLevel, defaultMode }: FlashcardSetupProps) {
 // Selected JLPT level state.
 const [level, setLevel] = useState<string>(defaultLevel || "all");
 
 // Selected study mode state.
 const [mode, setMode] = useState<"vocab" | "kanji" | "survival" | "pronunciation" | "sentence">(
 defaultMode ?? "vocab"
 );
 
 // Selected card count state.
 const [amount, setAmount] = useState<number>(20);

 // RENDER KOMPONEN

 return (
 <m.div
 key="flashcard-setup"
 initial={{ opacity: 0, y: 20 }}
 animate={{ opacity: 1, y: 0 }}
 exit={{ opacity: 0, y: -20 }}
 className="flex-1 w-full max-w-3xl mx-auto px-4 py-8 flex flex-col justify-center"
 >
 <div className="text-center mb-10">
 <h1 className="text-3xl md:text-4xl uppercase tracking-widest mb-3 text-foreground">
 Atur <span className="text-primary">Flashcard</span>
 </h1>
 <p className="text-muted-foreground text-sm md:text-base">
 Sesuaikan sesi latihan memorimu. Pilih level, mode, dan jumlah kartu.
 </p>
 </div>

 <div className="space-y-8 glass p-6 md:p-8 rounded-xl border border-border shadow-lg">

 {/* Level Selection */}
 <div className="space-y-4">
 <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-muted-foreground mb-2">
 <Stack size={16} />
 <h2>JLPT Level</h2>
 </div>
 <div className="flex flex-wrap gap-3">
 {JLPT_LEVELS.map((lvl) => (
 <button type="button"
 key={lvl.id}
 onClick={() => setLevel(lvl.id)}
 className={`flex flex-col items-center justify-center p-3 rounded-lg border transition-all duration-200
 ${level === lvl.id
 ? `shadow-md ${lvl.color.replace('text-', 'bg-').replace('/10', '/20')} border-primary`
 : "bg-background/50 border-border hover:bg-muted"
 }
 `}
 >
 {/* Highlight text if level is active */}
 <span className={`font-black text-lg ${level === lvl.id ? 'text-primary' : ''}`}>{lvl.label}</span>
 </button>
 ))}
 </div>
 </div>

 {/* Mode Selection */}
 <div className="space-y-4">
 <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-muted-foreground mb-2">
 <LayoutGrid size={16} />
 <h2>Mode Latihan</h2>
 </div>
 <div className="flex flex-wrap gap-4">
 {MODES.map((modeItem) => (
 <button type="button"
 key={modeItem.id}
 onClick={() => setMode(modeItem.id)}
 className={`relative flex flex-col items-center justify-center p-6 rounded-lg border transition-all duration-200 overflow-hidden group
 ${mode === modeItem.id
 ? "bg-primary/10 border-primary shadow-md text-primary"
 : "bg-background/50 border-border hover:bg-muted text-muted-foreground"
 }
 `}
 >
 {/* Shared layout animation for active mode background */}
 {mode === modeItem.id && (
 <m.div layoutId="mode-active-bg" className="absolute inset-0 bg-primary/5 pointer-events-none" />
 )}
 <div className={`p-3 rounded-full mb-3 ${mode === modeItem.id ? 'bg-primary text-background' : 'bg-muted text-muted-foreground'}`}>
 {modeItem.icon}
 </div>
 <span className={`font-black uppercase tracking-wider mb-1 ${mode === modeItem.id ? 'text-primary' : 'text-foreground'}`}>{modeItem.label}</span>
 <span className="text-xs text-center opacity-80">{modeItem.desc}</span>
 </button>
 ))}
 </div>
 </div>

 {/* Amount Selection */}
 <div className="space-y-4">
 <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-muted-foreground mb-2">
 <Hashtag size={16} />
 <h2>Jumlah Kartu</h2>
 </div>
 <div className="flex flex-wrap gap-3">
 {AMOUNTS.map((amt) => (
 <button type="button"
 key={amt}
 onClick={() => setAmount(amt)}
 className={`flex-1 min-w-[80px] py-3 px-4 rounded-lg border font-bold transition-all duration-200
 ${amount === amt
 ? "bg-secondary text-secondary-foreground border-secondary shadow-md"
 : "bg-background/50 text-muted-foreground border-border hover:bg-muted"
 }
 `}
 >
 {amt} Kartu
 </button>
 ))}
 </div>
 </div>

 {/* Start Button */}
 <div className="pt-6 border-t border-border mt-8">
 <Button
 onClick={() => onStart(level, mode, amount)}
 className="w-full py-6 rounded-lg text-lg font-black uppercase tracking-widest bg-primary hover:bg-primary/90 text-primary-foreground shadow-md group transition-all"
 >
 Mulai Sesi <PlayCircle size={18} className="ml-2 group-hover:translate-x-1 transition-transform" />
 </Button>
 </div>

 </div>
 </m.div>
 );
}