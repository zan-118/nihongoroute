"use client";

/**
 * @file InteractivePlayground.tsx
 * @description Interactive furigana parser and translation playground component for the landing page.
 */

import React, { useState } from "react";
import { m, AnimatePresence } from "framer-motion";
import { Sparkles, Languages, Check, CornerDownLeft, Loader2 } from "@/components/ui/icons";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

/**
 * Structure for preset Japanese sentences.
 */
interface PresetItem {
 text: string;
 translation: string;
}

/**
 * Default Japanese sentences for quick testing.
 */
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

/**
 * Interactive playground component. Converts Japanese text to Furigana or Hiragana.
 */
export function InteractivePlayground() {
 const [inputText, setInputText] = useState("");
 const [mode, setMode] = useState<"furigana" | "normal">("furigana");
 const [isLoading, setIsLoading] = useState(false);
 const [outputHtml, setOutputHtml] = useState("");
 const [error, setError] = useState("");

 /**
 * Sends text to API for conversion.
 * 
 * @param textToConvert - Japanese text to parse.
 * @param modeToUse - Target conversion mode.
 */
 const handleConvert = async (textToConvert = inputText, modeToUse = mode) => {
 const trimmed = textToConvert.trim();
 if (!trimmed) return; // Skip empty input

 setIsLoading(true);
 setError("");

 try {
 // Request conversion from API
 const res = await fetch("/api/furigana", {
 method: "POST",
 headers: { "Content-Type": "application/json" },
 body: JSON.stringify({ text: trimmed, mode: modeToUse }),
 });

 if (!res.ok) throw new Error("Gagal proses teks");
 const data = await res.json();
 
 // Update state with parsed HTML containing ruby tags
 setOutputHtml(data.hiragana);
 } catch (err) {
 console.error(err);
 setError("Waduh, koneksi ke parser gagal. Cek koneksi internetmu ya.");
 } finally {
 setIsLoading(false);
 }
 };

 /**
 * Sets input text and triggers conversion.
 * 
 * @param text - Preset text to load.
 */
 const handlePresetClick = (text: string) => {
 setInputText(text);
 handleConvert(text);
 };

 return (
 <section className="w-full mb-[120px] relative">
 {/* Ornamen visual background */}
 <div className="absolute top-1/2 left-1/3 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[250px] bg-primary/5 rounded-full blur-[60px] pointer-events-none ambient-glow will-change-transform" />

 <div className="text-center max-w-3xl mx-auto mb-[50px]">
 <Badge className="bg-primary/10 text-primary border border-primary/20 px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] mb-4">
 Coba Langsung
 </Badge>
 <h2 className="text-4xl md:text-5xl tracking-tight mb-5">
 Coba Langsung, <span className="text-primary">Tanpa Ribet</span>
 </h2>
 <p className="text-muted-foreground text-base md:text-lg font-medium leading-relaxed">
 Penasaran? Ketik kalimat Jepang atau klik contoh di bawah — lihat sendiri hasilnya dalam hitungan detik.
 </p>
 </div>

 <div className="grid grid-cols-1 lg:grid-cols-12 gap-[34px]">
 {/* INPUT PANEL - KOLOM KIRI */}
 <div className="lg:col-span-6 relative group h-[450px]">
 {/* Tombou Register Mark */}
 <div className="absolute -top-[6px] -right-[6px] w-[14px] h-[14px] pointer-events-none z-20">
 <div className="absolute top-0 right-0 w-[14px] h-[1px] bg-primary/20 group-hover:bg-primary transition-colors duration-500" />
 <div className="absolute top-0 right-0 w-[1px] h-[14px] bg-primary/20 group-hover:bg-primary transition-colors duration-500" />
 </div>

 <Card className="p-6 sm:p-8 bg-card border border-border/50 dark:border-white/10 rounded-2xl flex flex-col justify-between h-full shadow-[0_4px_25px_rgba(0,0,0,0.015)] group-hover:border-primary/45 transition-colors duration-500">
 <div className="space-y-4">
 <div className="flex items-center justify-between">
 <span className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
 <Languages size={14} className="text-primary" /> Ketik Kalimat Jepang
 </span>
 <span className="text-[10px] font-bold text-muted-foreground">
 {inputText.length}/100 huruf
 </span>
 </div>

 <textarea
 value={inputText}
 onChange={(e) => setInputText(e.target.value.substring(0, 100))}
 placeholder="Ketik bahasa Jepang di sini... (contoh: 私は猫が好きです)"
 className="w-full h-32 bg-background/50 border border-border/80 rounded-lg p-4 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 text-sm font-semibold transition-all resize-none"
 />

 {/* Pilihan mode konversi */}
 <div className="flex items-center gap-2 pt-1">
 <span className="text-[10px] font-black text-muted-foreground uppercase tracking-wider mr-2">Mode Konversi:</span>
 <button
 type="button"
 aria-pressed={mode === "furigana"}
 aria-label="Gunakan Mode Furigana Ruby"
 onClick={() => {
 setMode("furigana");
 if (inputText.trim()) {
 handleConvert(inputText, "furigana");
 }
 }}
 className={`px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-wider rounded-[4px] border transition-all duration-300 ${
 mode === "furigana"
 ? "bg-primary/10 border-primary text-primary"
 : "border-border/80 text-muted-foreground hover:border-border/80"
 }`}
 >
 Furigana (Ruby)
 </button>
 <button
 type="button"
 aria-pressed={mode === "normal"}
 aria-label="Gunakan Mode Hiragana Kana"
 onClick={() => {
 setMode("normal");
 if (inputText.trim()) {
 handleConvert(inputText, "normal");
 }
 }}
 className={`px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-wider rounded-[4px] border transition-all duration-300 ${
 mode === "normal"
 ? "bg-primary/10 border-primary text-primary"
 : "border-border/80 text-muted-foreground hover:border-border/80"
 }`}
 >
 Hiragana (Kana)
 </button>
 </div>
 </div>

 <div className="space-y-4">
 {/* Presets */}
 <div className="flex flex-col gap-2">
 <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Contoh Kalimat:</span>
 <div className="flex flex-col gap-1.5">
 {PRESETS.map((preset) => (
 <button
 key={preset.text}
 type="button"
 aria-label={`Gunakan contoh kalimat: ${preset.text}`}
 onClick={() => handlePresetClick(preset.text)}
 className="w-full text-left px-3 py-2 bg-background/30 hover:bg-background/80 border border-border/80 rounded-lg transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] flex items-center justify-between text-xs text-foreground font-semibold group"
 >
 <span>{preset.text}</span>
 <CornerDownLeft size={12} className="text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:translate-x-0 -translate-x-1 transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]" />
 </button>
 ))}
 </div>
 </div>

 {/* Asymmetric Calligraphic Cut for CTA Button */}
 <Button
 onClick={() => handleConvert()}
 disabled={isLoading || !inputText.trim()}
 className="w-full bg-primary text-primary-foreground hover:bg-primary/92 h-11 text-xs rounded-lg rounded-br-none flex items-center justify-center gap-2 transition-all duration-300 active:scale-[0.98]"
 >
 {isLoading ? (
 <Loader2 size={16} className="animate-spin" />
 ) : (
 <Sparkles size={14} />
 )}
 <span>Proses Sekarang</span>
 </Button>
 </div>
 </Card>
 </div>

 {/* OUTPUT PANEL - KOLOM KANAN */}
 <div className="lg:col-span-6 relative group h-[450px]">
 {/* Tombou Register Mark */}
 <div className="absolute -top-[6px] -right-[6px] w-[14px] h-[14px] pointer-events-none z-20">
 <div className="absolute top-0 right-0 w-[14px] h-[1px] bg-primary/20 group-hover:bg-primary transition-colors duration-500" />
 <div className="absolute top-0 right-0 w-[1px] h-[14px] bg-primary/20 group-hover:bg-primary transition-colors duration-500" />
 </div>

 <Card className="p-6 sm:p-8 bg-card border border-border/50 dark:border-white/10 rounded-2xl flex flex-col justify-between h-full relative overflow-hidden group shadow-[0_4px_25px_rgba(0,0,0,0.015)] group-hover:border-primary/45 transition-colors duration-500">
 <div className="flex items-center justify-between relative z-10">
 <span className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
 <span className="size-2 rounded-full bg-success animate-pulse" /> Hasil Konversi
 </span>
 {outputHtml && (
 <Badge className="bg-success/10 text-success border-success/20 font-bold uppercase tracking-widest text-[8px] shadow-none rounded-[4px]">
 Berhasil
 </Badge>
 )}
 </div>

 <div className="flex-1 my-6 p-6 bg-background/50 border border-border/80 rounded-lg flex items-center justify-center relative z-10 min-h-48 overflow-y-auto">
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
 <span className="text-xs text-muted-foreground font-bold uppercase tracking-wider animate-pulse">Sedang diproses...</span>
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
 transition={{ type: "spring", stiffness: 120, damping: 20 }}
 className="w-full text-center"
 >
 {/* Render parsed HTML containing ruby tags */}
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
 Ketik kalimat Jepang di kolom kiri, atau pilih contoh kalimat yang sudah disiapkan.
 </m.div>
 )}
 </AnimatePresence>
 </div>

 <div className="pt-4 border-t border-border/60 flex items-center justify-between text-[9px] font-bold text-muted-foreground uppercase tracking-widest relative z-10">
 <span>Ditenagai Kuroshiro Parser</span>
 <span className="flex items-center gap-1.5">
 <Check size={10} className="text-success" /> Siap Mode Offline
 </span>
 </div>
 </Card>
 </div>
 </div>
 </section>
 );
}