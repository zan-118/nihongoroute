"use client";

import React, { useState } from "react";
import { m, AnimatePresence } from "framer-motion";
import { Sparkles, Languages, Check, CornerDownLeft, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface PresetItem {
  text: string;
  translation: string;
}

const PRESETS: PresetItem[] = [
  {
    text: "日本語の勉強はとても面白いです。",
    translation: "Belajar bahasa Jepang sangat menarik.",
  },
  {
    text: "毎朝七時に起きて、温かいお茶を飲みます。",
    translation: "Setiap pagi bangun jam 7 dan minum teh hangat.",
  },
  {
    text: "明日は友達と一緒に東京タワーへ遊びに行きます。",
    translation: "Besok akan pergi bermain ke Tokyo Tower bersama teman.",
  },
];

export function InteractivePlayground() {
  const [inputText, setInputText] = useState("");
  const [mode, setMode] = useState<"furigana" | "normal">("furigana");
  const [isLoading, setIsLoading] = useState(false);
  const [outputHtml, setOutputHtml] = useState("");
  const [error, setError] = useState("");

  const handleConvert = async (textToConvert = inputText, modeToUse = mode) => {
    const trimmed = textToConvert.trim();
    if (!trimmed) return;

    setIsLoading(true);
    setError("");

    try {
      const res = await fetch("/api/furigana", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: trimmed, mode: modeToUse }),
      });

      if (!res.ok) throw new Error("Gagal memproses teks");
      const data = await res.json();
      
      setOutputHtml(data.hiragana);
    } catch (err) {
      console.error(err);
      setError("Gagal terhubung ke parser. Pastikan internet stabil.");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePresetClick = (text: string) => {
    setInputText(text);
    handleConvert(text);
  };

  return (
    <section className="w-full mb-[120px] relative">
      {/* Ornamen visual background */}
      <div className="absolute top-1/2 left-1/3 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[250px] bg-primary/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="text-center max-w-3xl mx-auto mb-[50px]">
        <Badge className="bg-primary/10 text-primary border border-primary/20 px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] mb-4">
          Interactive Playground
        </Badge>
        <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-5">
          Coba Teknologi Kami <span className="brand-text-gradient">Secara Instan</span>
        </h2>
        <p className="text-muted-foreground text-base md:text-lg font-medium leading-relaxed">
          Ketik kalimat bahasa Jepang atau gunakan tombol prasetel di bawah untuk melihat keandalan parser konverter furigana kami secara langsung.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-[34px]">
        {/* INPUT PANEL - KOLOM KIRI */}
        <Card className="lg:col-span-6 p-6 sm:p-8 bg-card/10 backdrop-blur-xl border border-border rounded-[28px] glass flex flex-col justify-between h-[450px]">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                <Languages size={14} className="text-primary" /> Input Kalimat Jepang
              </span>
              <span className="text-[10px] font-bold text-muted-foreground">
                {inputText.length}/100 Karakter
              </span>
            </div>

            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value.substring(0, 100))}
              placeholder="Ketik bahasa Jepang di sini... (contoh: 私は猫が好きです)"
              className="w-full h-32 bg-background/50 border border-border/80 rounded-2xl p-4 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 text-sm font-semibold transition-all resize-none"
            />

            {/* Pilihan mode konversi */}
            <div className="flex items-center gap-2 pt-1">
              <span className="text-[10px] font-black text-muted-foreground uppercase tracking-wider mr-2">Mode Konversi:</span>
              <button
                type="button"
                onClick={() => {
                  setMode("furigana");
                  if (inputText.trim()) {
                    handleConvert(inputText, "furigana");
                  }
                }}
                className={`px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-wider rounded-lg border transition-all ${
                  mode === "furigana"
                    ? "bg-primary/10 border-primary text-primary"
                    : "border-border text-muted-foreground hover:border-border/80"
                }`}
              >
                Furigana (Ruby)
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode("normal");
                  if (inputText.trim()) {
                    handleConvert(inputText, "normal");
                  }
                }}
                className={`px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-wider rounded-lg border transition-all ${
                  mode === "normal"
                    ? "bg-primary/10 border-primary text-primary"
                    : "border-border text-muted-foreground hover:border-border/80"
                }`}
              >
                Hiragana (Kana)
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {/* Presets */}
            <div className="flex flex-col gap-2">
              <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Kalimat Presets:</span>
              <div className="flex flex-col gap-1.5">
                {PRESETS.map((preset) => (
                  <button
                    key={preset.text}
                    type="button"
                    onClick={() => handlePresetClick(preset.text)}
                    className="w-full text-left px-3 py-2 bg-background/30 hover:bg-background/80 border border-border/80 rounded-xl transition-all flex items-center justify-between text-xs text-foreground font-semibold group"
                  >
                    <span>{preset.text}</span>
                    <CornerDownLeft size={12} className="text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:translate-x-0 -translate-x-1 transition-all" />
                  </button>
                ))}
              </div>
            </div>

            <Button
              onClick={() => handleConvert()}
              disabled={isLoading || !inputText.trim()}
              className="w-full brand-button h-11 text-xs rounded-xl flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Sparkles size={14} />
              )}
              <span>Proses Kalimat Jepang</span>
            </Button>
          </div>
        </Card>

        {/* OUTPUT PANEL - KOLOM KANAN */}
        <Card className="lg:col-span-6 p-6 sm:p-8 bg-card/10 backdrop-blur-xl border border-border rounded-[28px] glass flex flex-col justify-between h-[450px] relative overflow-hidden group">
          {/* Efek glow visual neon */}
          <div className="absolute -top-16 -right-16 size-44 bg-primary/5 rounded-full blur-3xl pointer-events-none transition-opacity group-hover:opacity-80" />

          <div className="flex items-center justify-between relative z-10">
            <span className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
              <span className="size-2 rounded-full bg-success animate-pulse" /> Hasil Penguraian Teks
            </span>
            {outputHtml && (
              <Badge className="bg-success/10 text-success border-success/20 font-bold uppercase tracking-widest text-[8px] shadow-none">
                Berhasil
              </Badge>
            )}
          </div>

          <div className="flex-1 my-6 p-6 bg-background/40 border border-border/80 rounded-2xl flex items-center justify-center relative z-10 glass min-h-48 overflow-y-auto">
            <AnimatePresence mode="wait">
              {isLoading ? (
                <m.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center gap-3"
                >
                  <Loader2 size={32} className="text-primary animate-spin" />
                  <span className="text-xs text-muted-foreground font-bold uppercase tracking-wider animate-pulse">Menghubungkan ke Parser...</span>
                </m.div>
              ) : error ? (
                <m.div
                  key="error"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-center text-xs font-bold text-destructive"
                >
                  {error}
                </m.div>
              ) : outputHtml ? (
                <m.div
                  key="output"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="w-full text-center"
                >
                  <div
                    className="text-2xl sm:text-3xl font-bold font-japanese tracking-wide text-foreground leading-[2.2] [&_ruby]:font-japanese [&_rt]:text-[0.55em] [&_rt]:font-bold [&_rt]:text-primary [&_rt]:leading-none [&_rt]:select-none [&_rt]:tracking-normal"
                    dangerouslySetInnerHTML={{ __html: outputHtml }}
                  />
                </m.div>
              ) : (
                <m.div
                  key="idle"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-center text-xs font-semibold text-muted-foreground max-w-xs leading-relaxed"
                >
                  Ketik teks bahasa Jepang di kolom input sebelah kiri atau klik tombol prasetel kalimat contoh.
                </m.div>
              )}
            </AnimatePresence>
          </div>

          <div className="pt-4 border-t border-border/60 flex items-center justify-between text-[9px] font-bold text-muted-foreground uppercase tracking-widest relative z-10">
            <span>Powered by Kuroshiro Parser</span>
            <span className="flex items-center gap-1.5">
              <Check size={10} className="text-success" /> Offline Caching Ready
            </span>
          </div>
        </Card>
      </div>
    </section>
  );
}
