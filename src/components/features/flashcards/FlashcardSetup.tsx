"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Zap, Flame, PenTool, Hash, LayoutGrid, Layers, Play } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FlashcardSetupProps {
  onStart: (level: string, mode: "vocab" | "kanji" | "survival", amount: number) => void;
  defaultLevel?: string | null;
}

const JLPT_LEVELS = [
  { id: "all", label: "Campur (Semua)", color: "bg-muted text-muted-foreground border-border" },
  { id: "N5", label: "N5", color: "bg-blue-500/10 text-blue-500 border-blue-500/20" },
  { id: "N4", label: "N4", color: "bg-green-500/10 text-green-500 border-green-500/20" },
  { id: "N3", label: "N3", color: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20" },
  { id: "N2", label: "N2", color: "bg-orange-500/10 text-orange-500 border-orange-500/20" },
  { id: "N1", label: "N1", color: "bg-red-500/10 text-red-500 border-red-500/20" }
];

const MODES = [
  { id: "vocab" as const, label: "Kosakata", icon: <Zap size={18} />, desc: "Latihan bacaan & makna kata" },
  { id: "kanji" as const, label: "Kanji", icon: <PenTool size={18} />, desc: "Hafalkan bentuk & On/Kun" },
  { id: "survival" as const, label: "Survival", icon: <Flame size={18} />, desc: "Tantangan berbatas waktu" }
];

const AMOUNTS = [10, 20, 50, 100];

export function FlashcardSetup({ onStart, defaultLevel }: FlashcardSetupProps) {
  const [level, setLevel] = useState<string>(defaultLevel || "all");
  const [mode, setMode] = useState<"vocab" | "kanji" | "survival">("vocab");
  const [amount, setAmount] = useState<number>(20);

  return (
    <motion.div 
      key="flashcard-setup"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="flex-1 w-full max-w-3xl mx-auto px-4 py-8 flex flex-col justify-center"
    >
      <div className="text-center mb-10">
        <h1 className="text-3xl md:text-4xl font-black uppercase tracking-widest mb-3 text-foreground">
          Flashcard <span className="text-primary">Setup</span>
        </h1>
        <p className="text-muted-foreground text-sm md:text-base">
          Sesuaikan sesi latihan memori Anda. Pilih level, mode, dan jumlah kartu.
        </p>
      </div>

      <div className="space-y-8 glass p-6 md:p-8 rounded-3xl border border-border shadow-[0_0_40px_rgba(var(--primary-rgb),0.05)]">
        
        {/* Level Selection */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-muted-foreground mb-2">
            <Layers size={16} />
            <h2>JLPT Level</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {JLPT_LEVELS.map((lvl) => (
              <button
                key={lvl.id}
                onClick={() => setLevel(lvl.id)}
                className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition-all duration-300
                  ${level === lvl.id 
                    ? `shadow-[0_0_20px_rgba(var(--primary-rgb),0.2)] ${lvl.color.replace('text-', 'bg-').replace('/10', '/20')} border-primary` 
                    : "bg-background/50 border-border hover:bg-muted"
                  }
                `}
              >
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {MODES.map((m) => (
              <button
                key={m.id}
                onClick={() => setMode(m.id)}
                className={`relative flex flex-col items-center justify-center p-6 rounded-2xl border transition-all duration-300 overflow-hidden group
                  ${mode === m.id 
                    ? "bg-primary/10 border-primary shadow-[0_0_20px_rgba(var(--primary-rgb),0.15)] text-primary" 
                    : "bg-background/50 border-border hover:bg-muted text-muted-foreground"
                  }
                `}
              >
                {mode === m.id && (
                  <motion.div layoutId="mode-active-bg" className="absolute inset-0 bg-primary/5 pointer-events-none" />
                )}
                <div className={`p-3 rounded-full mb-3 ${mode === m.id ? 'bg-primary text-background' : 'bg-muted text-muted-foreground'}`}>
                  {m.icon}
                </div>
                <span className={`font-black uppercase tracking-wider mb-1 ${mode === m.id ? 'text-primary' : 'text-foreground'}`}>{m.label}</span>
                <span className="text-xs text-center opacity-80">{m.desc}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Amount Selection */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-muted-foreground mb-2">
            <Hash size={16} />
            <h2>Jumlah Kartu</h2>
          </div>
          <div className="flex flex-wrap gap-3">
            {AMOUNTS.map((amt) => (
              <button
                key={amt}
                onClick={() => setAmount(amt)}
                className={`flex-1 min-w-[80px] py-3 px-4 rounded-2xl border font-bold transition-all duration-300
                  ${amount === amt 
                    ? "bg-secondary text-secondary-foreground border-secondary shadow-[0_0_20px_rgba(var(--secondary-rgb),0.2)]" 
                    : "bg-background/50 text-muted-foreground border-border hover:bg-muted"
                  }
                `}
              >
                {amt} Kartu
              </button>
            ))}
          </div>
        </div>

        <div className="pt-6 border-t border-border mt-8">
          <Button 
            onClick={() => onStart(level, mode, amount)}
            className="w-full py-6 rounded-2xl text-lg font-black uppercase tracking-widest bg-primary hover:bg-primary/90 text-primary-foreground shadow-[0_0_30px_rgba(var(--primary-rgb),0.3)] group transition-all"
          >
            Mulai Sesi <Play size={18} className="ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>

      </div>
    </motion.div>
  );
}
