"use client";

/**
 * @file DictationClient.tsx
 * @description Komponen interaktif utama untuk alat Latihan Dikte (Dictation).
 */

// ==========================================
// IMPORT UTAMA
// ==========================================
import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { m, AnimatePresence } from "framer-motion";
import {
  Volume2,
  VolumeX,
  ChevronLeft,
  ChevronRight,
  Play,
  RotateCw,
  Award,
  CheckCircle,
  XCircle,
  HelpCircle,
  BookOpen
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { getRandomSentencesForDrill, type SentenceDrillItem } from "@/actions/sentences.actions";
import { fetchTTSAudio, speakWithWebSpeech, TTS_VOICES, type TtsVoice } from "@/lib/tts";
import { toHiragana } from "wanakana";

// ==========================================
// KONSTANTA & KONFIGURASI
// ==========================================

/**
 * JLPT difficulty levels for selection.
 */
const JLPT_LEVELS = [
  { id: "all", label: "Campur (Semua)", color: "bg-muted text-muted-foreground border-border" },
  { id: "N5", label: "N5", color: "bg-primary/10 text-primary border-primary/20" },
  { id: "N4", label: "N4", color: "bg-success/10 text-success border-success/20" },
  { id: "N3", label: "N3", color: "bg-warning/10 text-warning border-warning/20" },
  { id: "N2", label: "N2", color: "bg-secondary/10 text-secondary border-secondary/20" },
  { id: "N1", label: "N1", color: "bg-destructive/10 text-destructive border-destructive/20" }
];

/**
 * Sentence count options.
 */
const AMOUNTS = [5, 10, 15, 20];

// ==========================================
// KOMPONEN UTAMA
// ==========================================

/**
 * Dictation practice client component.
 * Handles audio playback, user input validation, and score tracking.
 */
export default function DictationClient() {
  // Setup State
  const [level, setLevel] = useState<string>("all");
  const [amount, setAmount] = useState<number>(10);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  
  // Game/Session State
  const [sentences, setSentences] = useState<SentenceDrillItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [userInput, setUserInput] = useState<string>("");
  const [isChecked, setIsChecked] = useState<boolean>(false);
  const [isRevealed, setIsRevealed] = useState<boolean>(false);
  const [score, setScore] = useState<{ correct: number; total: number }>({ correct: 0, total: 0 });
  const [correctList, setCorrectList] = useState<boolean[]>([]); // track which ones were correct
  
  // Audio State
  const [audioPlaying, setAudioPlaying] = useState<boolean>(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const objectUrlRef = useRef<string | null>(null);

  /**
   * Revoke active blob URL to prevent memory leaks.
   */
  const cleanupObjectUrl = useCallback(() => {
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
  }, []);

  /**
   * List of TTS voices for rotation.
   */
  const VOICES_ROTATION: TtsVoice[] = [
    TTS_VOICES.LALA, TTS_VOICES.INDAH, TTS_VOICES.SITI, TTS_VOICES.DEWI,
    TTS_VOICES.HAYASHI, TTS_VOICES.SATO, TTS_VOICES.AYU, TTS_VOICES.ZUNDAMON,
    TTS_VOICES.RITSU, TTS_VOICES.DITO, TTS_VOICES.BUDI, TTS_VOICES.SUZUKI,
    TTS_VOICES.TANAKA, TTS_VOICES.KIMURA, TTS_VOICES.ANDI, TTS_VOICES.FAISAL,
    TTS_VOICES.TAKAHASHI, TTS_VOICES.KOBAYASHI,
  ];

  /**
   * Get voice based on text hash. Ensures same text uses same voice.
   * @param text Input text to hash.
   */
  const getDeterministicVoice = (text: string): TtsVoice => {
    let hash = 0;
    for (let i = 0; i < text.length; i++) hash = text.charCodeAt(i) + ((hash << 5) - hash);
    return VOICES_ROTATION[Math.abs(hash) % VOICES_ROTATION.length];
  };

  /**
   * Play TTS audio for given text. Fallback to Web Speech API if fetch fails.
   * @param text Japanese text to speak.
   */
  const speakSentence = async (text: string) => {
    if (audioPlaying) {
      // Stop current audio if playing
      audioRef.current?.pause();
      cleanupObjectUrl();
      if (typeof window !== "undefined") window.speechSynthesis.cancel();
      setAudioPlaying(false);
      return;
    }

    const cleanText = text.trim();
    if (!cleanText) return;

    setAudioPlaying(true);
    const voice = getDeterministicVoice(cleanText);

    try {
      const audioUrl = await fetchTTSAudio(cleanText, voice);
      if (audioUrl) {
        if (!audioRef.current) audioRef.current = new Audio();
        const audio = audioRef.current;
        cleanupObjectUrl();
        if (audioUrl.startsWith("blob:")) objectUrlRef.current = audioUrl;
        audio.src = audioUrl;
        audio.onended = () => { setAudioPlaying(false); cleanupObjectUrl(); };
        audio.onerror = () => {
          cleanupObjectUrl();
          speakWithWebSpeech(cleanText, voice, 1, () => setAudioPlaying(false), () => setAudioPlaying(false));
        };
        audio.play().catch(() => {
          speakWithWebSpeech(cleanText, voice, 1, () => setAudioPlaying(false), () => setAudioPlaying(false));
        });
      } else {
        speakWithWebSpeech(cleanText, voice, 1, () => setAudioPlaying(false), () => setAudioPlaying(false));
      }
    } catch {
      speakWithWebSpeech(cleanText, voice, 1, () => setAudioPlaying(false), () => setAudioPlaying(false));
    }
  };

  // Cleanup audio resources on unmount
  useEffect(() => {
    return () => {
      audioRef.current?.pause();
      cleanupObjectUrl();
      if (typeof window !== "undefined") window.speechSynthesis.cancel();
    };
  }, [cleanupObjectUrl]);

  /**
   * Fetch sentences and start dictation session.
   */
  const handleStart = async () => {
    setLoading(true);
    try {
      const data = await getRandomSentencesForDrill(level === "all" ? "" : level, amount);
      if (data.length === 0) {
        toast.error("Maaf ya, kalimat untuk level ini belum ketemu.");
        return;
      }
      setSentences(data);
      setCurrentIndex(0);
      setUserInput("");
      setIsChecked(false);
      setIsRevealed(false);
      setScore({ correct: 0, total: data.length });
      setCorrectList(new Array(data.length).fill(false));
      setIsPlaying(true);
      
      // Auto play first audio
      setTimeout(() => {
        speakSentence(data[0].japanese);
      }, 500);
    } catch (e) {
      console.error(e);
      toast.error("Waduh, gagal memuat kalimat dikte.");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Convert text to hiragana and strip punctuation for comparison.
   * @param text Japanese text to normalize.
   */
  const normalizeJapanese = (text: string) => {
    return toHiragana(
      text.normalize("NFKC").toLowerCase()
    ).replace(
      /[\s。、，,.．・!！?？:：;；'"“”‘’`´「」『』（）()\[\]【】<>〈〉《》…ー~-]/g,
      ""
    );
  };

  /**
   * Validate user input against target sentence. Update score.
   */
  const handleCheck = () => {
    if (!userInput.trim()) {
      toast.warning("Ketik dulu apa yang kamu dengar ya.");
      return;
    }

    setIsChecked(true);
    const target = sentences[currentIndex].japanese;
    const normUser = normalizeJapanese(userInput);
    const normTarget = normalizeJapanese(target);

    const isMatch = normUser === normTarget;
    if (isMatch) {
      setScore((prev) => ({ ...prev, correct: prev.correct + 1 }));
      setCorrectList((prev) => {
        const next = [...prev];
        next[currentIndex] = true;
        return next;
      });
      toast.success("Benar!");
    } else {
      toast.error("Belum tepat.");
    }
  };

  /**
   * Advance to next sentence or finish session.
   */
  const handleNext = () => {
    if (currentIndex < sentences.length - 1) {
      const nextIdx = currentIndex + 1;
      setCurrentIndex(nextIdx);
      setUserInput("");
      setIsChecked(false);
      setIsRevealed(false);
      setTimeout(() => {
        speakSentence(sentences[nextIdx].japanese);
      }, 300);
    } else {
      // Selesai
      setIsChecked(true);
      setIsRevealed(true);
    }
  };

  /**
   * Reset session state to setup screen.
   */
  const handleRestart = () => {
    setIsPlaying(false);
    setSentences([]);
  };

  /**
   * Update user input state.
   * @param e Input change event.
   */
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserInput(e.target.value);
  };

  // Cek apakah input mengandung perbedaan kanji tapi bacaan sama
  const targetText = sentences[currentIndex]?.japanese || "";
  const isPerfectMatch = userInput.trim() === targetText.trim();
  const isPhoneticMatch = normalizeJapanese(userInput) === normalizeJapanese(targetText);

  return (
    <div className="w-full flex-1 relative overflow-hidden flex flex-col bg-transparent transition-colors duration-300 pt-12 pb-24 px-4 md:px-8">
      {/* Glow effect */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-success/5 via-transparent to-transparent pointer-events-none" />

      <div className="max-w-3xl mx-auto w-full relative z-10 flex flex-col h-full">
        {/* Header */}
        <header className="mb-10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/tools">
              <Button variant="ghost" size="icon" className="rounded-xl border border-border bg-card/20 hover:bg-card/40">
                <ChevronLeft size={20} />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl md:text-3xl text-foreground uppercase tracking-tight italic">
                Latihan <span className="text-success">Dictation</span>
              </h1>
              <p className="text-muted-foreground text-[8px] md:text-[10px] font-bold uppercase tracking-[0.2em] mt-0.5">
                Dengar & Tulis Kalimat Jepang
              </p>
            </div>
          </div>
        </header>

        <AnimatePresence mode="wait">
          {!isPlaying ? (
            /* SETUP CARD */
            <m.div
              key="setup"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="w-full"
            >
              <Card className="p-6 md:p-8 bg-card/30  border-border rounded-2xl md:rounded-3xl hover:border-success/40 transition-all flex flex-col gap-8 shadow-lg">
                <div>
                  <h2 className="text-lg md:text-xl uppercase tracking-wider text-foreground mb-2">
                    Konfigurasi Sesi Dikte
                  </h2>
                  <p className="text-xs md:text-sm text-muted-foreground">
                    Pilih tingkat kesulitan JLPT dan jumlah kalimat contoh yang ingin Anda tebak bacaannya.
                  </p>
                </div>

                {/* Level Selection */}
                <div className="space-y-3">
                  <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground block">JLPT Level</span>
                  <div className="flex flex-wrap items-center justify-center gap-3">
                    {JLPT_LEVELS.map((lvl) => (
                      <button
                        type="button"
                        key={lvl.id}
                        onClick={() => setLevel(lvl.id)}
                        className={`flex flex-col items-center justify-center p-3.5 rounded-lg border transition-all duration-200 ${
                          level === lvl.id
                            ? `shadow-md ${lvl.color.replace("text-", "bg-").replace("/10", "/20")} border-success`
                            : "bg-background/50 border-border hover:bg-muted"
                        }`}
                      >
                        <span className={`font-black text-sm md:text-base ${level === lvl.id ? "text-success" : ""}`}>
                          {lvl.label}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Amount Selection */}
                <div className="space-y-3">
                  <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground block">Jumlah Kalimat</span>
                  <div className="flex gap-3">
                    {AMOUNTS.map((amt) => (
                      <button
                        type="button"
                        key={amt}
                        onClick={() => setAmount(amt)}
                        className={`flex-1 py-3 px-4 rounded-lg border font-bold text-xs md:text-sm transition-all duration-200 ${
                          amount === amt
                            ? "bg-success text-success-foreground border-success shadow-md"
                            : "bg-background/50 text-muted-foreground border-border hover:bg-muted"
                        }`}
                      >
                        {amt} Kalimat
                      </button>
                    ))}
                  </div>
                </div>

                <Button
                  onClick={handleStart}
                  disabled={loading}
                  className="w-full py-6 rounded-lg text-sm md:text-base font-black uppercase tracking-widest bg-success hover:bg-success/90 text-success-foreground shadow-md transition-all flex items-center justify-center gap-2 group"
                >
                  {loading ? (
                    <>
                      <RotateCw className="animate-spin size-4" /> Memuat Kalimat...
                    </>
                  ) : (
                    <>
                      Mulai Latihan <Play size={16} className="group-hover:translate-x-0.5 transition-transform" />
                    </>
                  )}
                </Button>
              </Card>
            </m.div>
          ) : (
            /* GAMEPLAY CARD */
            <m.div
              key="gameplay"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="w-full space-y-6"
            >
              {/* Progress and Score Bar */}
              <div className="flex justify-between items-center px-2">
                <span className="text-xs font-bold font-mono text-muted-foreground">
                  KALIMAT {currentIndex + 1} DARI {sentences.length}
                </span>
                <span className="text-xs font-black uppercase tracking-widest text-success">
                  Skor: {score.correct} / {currentIndex + (isChecked ? 1 : 0)}
                </span>
              </div>

              {/* Progress Dots */}
              <div className="flex gap-1.5 w-full px-1">
                {sentences.map((_, idx) => (
                  <div
                    key={idx}
                    className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                      idx === currentIndex
                        ? "bg-success shadow-[0_0_10px_rgb(var(--success-rgb)/0.5)] scale-y-110"
                        : idx < currentIndex
                        ? correctList[idx]
                          ? "bg-success"
                          : "bg-destructive"
                        : "bg-muted"
                    }`}
                  />
                ))}
              </div>

              {/* Dictation Box */}
              <Card className="p-6 md:p-10 bg-card/30  border-border rounded-2xl md:rounded-3xl flex flex-col items-center gap-8 shadow-lg relative overflow-hidden">
                {/* Decorative voice-wave animation when audio playing */}
                <div
                  className={`absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-success/0 via-success to-success/0 transition-opacity duration-300 ${
                    audioPlaying ? "opacity-100 animate-pulse" : "opacity-0"
                  }`}
                />

                {/* Audio Button */}
                <button
                  type="button"
                  onClick={() => speakSentence(sentences[currentIndex].japanese)}
                  className={`size-24 rounded-full border flex flex-col items-center justify-center transition-all duration-300 gap-2 ${
                    audioPlaying
                      ? "border-success bg-success/10 text-success shadow-[0_0_30px_rgb(var(--success-rgb)/0.3)] animate-pulse"
                      : "border-border bg-card/40 text-muted-foreground hover:border-success/40 hover:text-success hover:bg-success/5"
                  }`}
                >
                  {audioPlaying ? (
                    <>
                      <VolumeX size={32} />
                      <span className="text-[8px] font-black uppercase tracking-widest">Hentikan</span>
                    </>
                  ) : (
                    <>
                      <Volume2 size={32} />
                      <span className="text-[8px] font-black uppercase tracking-widest">Putar Suara</span>
                    </>
                  )}
                </button>

                <div className="w-full text-center space-y-2">
                  <p className="text-xs text-muted-foreground">
                    Dengarkan audio, lalu ketik kalimatnya di bawah dalam huruf Jepang (Hiragana/Katakana/Kanji).
                  </p>
                </div>

                {/* Text Input */}
                <div className="w-full max-w-lg space-y-4">
                  <Input
                    value={userInput}
                    onChange={handleInputChange}
                    disabled={isChecked}
                    placeholder="Ketik apa yang kamu dengar..."
                    className={`h-14 bg-muted/50 border-2 text-center text-lg font-japanese font-bold rounded-lg transition-all ${
                      isChecked
                        ? isPerfectMatch
                          ? "border-success bg-success/5 text-success"
                          : isPhoneticMatch
                          ? "border-warning bg-warning/5 text-warning"
                          : "border-destructive bg-destructive/5 text-destructive"
                        : "border-border focus:border-success focus:ring-success/20"
                    }`}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !isChecked) {
                        handleCheck();
                      }
                    }}
                    autoFocus
                  />

                  {/* Feedback Status */}
                  <AnimatePresence>
                    {isChecked && (
                      <m.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-5 rounded-lg border flex flex-col gap-4 bg-card/40  animate-in fade-in duration-300"
                      >
                        <div className="flex items-center gap-3">
                          {isPerfectMatch ? (
                            <>
                              <CheckCircle className="text-success shrink-0" size={24} />
                              <span className="text-sm font-bold text-success">Sempurna! 100% Cocok</span>
                            </>
                          ) : isPhoneticMatch ? (
                            <>
                              <CheckCircle className="text-warning shrink-0" size={24} />
                              <span className="text-sm font-bold text-warning">Benar! (Beda Kanji/Penulisan saja)</span>
                            </>
                          ) : (
                            <>
                              <XCircle className="text-destructive shrink-0" size={24} />
                              <span className="text-sm font-bold text-destructive">Belum Tepat</span>
                            </>
                          )}
                        </div>

                        {/* Answers block */}
                        <div className="space-y-3 pt-3 border-t border-border/50 text-left">
                          <div>
                            <span className="text-[8px] font-black uppercase tracking-widest text-muted-foreground block">Jawaban Benar</span>
                            <p className="text-lg font-japanese font-bold text-foreground leading-relaxed">
                              {sentences[currentIndex].japanese}
                            </p>
                          </div>
                          {sentences[currentIndex].translation && (
                            <div>
                              <span className="text-[8px] font-black uppercase tracking-widest text-muted-foreground block">Arti Kalimat</span>
                              <p className="text-sm text-muted-foreground leading-relaxed font-semibold">
                                {sentences[currentIndex].translation}
                              </p>
                            </div>
                          )}
                        </div>
                      </m.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Action Controls */}
                <div className="flex gap-3 w-full max-w-lg mt-4">
                  {!isChecked ? (
                    <>
                      <Button
                        variant="outline"
                        onClick={() => setIsRevealed(true)}
                        className="flex-1 py-6 rounded-xl text-xs font-bold uppercase tracking-widest border-border bg-card/20 hover:bg-card/40 gap-2"
                      >
                        <HelpCircle size={16} /> Buka Jawaban
                      </Button>
                      <Button
                        onClick={handleCheck}
                        disabled={!userInput.trim()}
                        className="flex-1 py-6 rounded-xl text-xs font-bold uppercase tracking-widest bg-success hover:bg-success/95 text-success-foreground gap-2"
                      >
                        <CheckCircle size={16} /> Periksa
                      </Button>
                    </>
                  ) : (
                    <Button
                      onClick={handleNext}
                      className="w-full py-6 rounded-xl text-xs font-bold uppercase tracking-widest bg-primary hover:bg-primary/95 text-primary-foreground gap-2"
                    >
                      Kalimat Berikutnya <ChevronRight size={16} />
                    </Button>
                  )}
                </div>
              </Card>

              {/* Reveal answer overlay modal (if they just want to read the answer directly) */}
              <AnimatePresence>
                {isRevealed && !isChecked && (
                  <div className="fixed inset-0 bg-background/80  z-50 flex items-center justify-center p-4">
                    <Card className="w-full max-w-md p-6 bg-card border-border rounded-xl flex flex-col gap-6 shadow-2xl animate-in fade-in zoom-in duration-200">
                      <div>
                        <h3 className="text-sm uppercase tracking-widest text-muted-foreground mb-3 flex items-center gap-2">
                          <BookOpen size={16} className="text-success" /> Jawaban & Arti Kalimat
                        </h3>
                        <p className="text-xl font-japanese font-black text-foreground mb-2 leading-relaxed">
                          {sentences[currentIndex].japanese}
                        </p>
                        {sentences[currentIndex].translation && (
                          <p className="text-sm text-muted-foreground leading-relaxed font-semibold italic">
                            &quot;{sentences[currentIndex].translation}&quot;
                          </p>
                        )}
                      </div>
                      <div className="flex gap-3">
                        <Button
                          variant="ghost"
                          onClick={() => setIsRevealed(false)}
                          className="flex-1 py-5 rounded-xl text-xs font-bold uppercase tracking-widest border border-border"
                        >
                          Tutup
                        </Button>
                        <Button
                          onClick={() => {
                            setIsRevealed(false);
                            setIsChecked(true);
                          }}
                          className="flex-1 py-5 rounded-xl text-xs font-bold uppercase tracking-widest bg-success hover:bg-success/90"
                        >
                          Tandai Selesai
                        </Button>
                      </div>
                    </Card>
                  </div>
                )}
              </AnimatePresence>

              {/* Back out button */}
              <div className="flex justify-center pt-4">
                <Button
                  variant="ghost"
                  onClick={handleRestart}
                  className="text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground h-auto px-4 py-2 bg-muted/20 hover:bg-muted/40 rounded-xl"
                >
                  Keluar dari Latihan
                </Button>
              </div>
            </m.div>
          )}
        </AnimatePresence>

        {/* Results summary modal when all done */}
        <AnimatePresence>
          {isPlaying && isChecked && currentIndex === sentences.length - 1 && (
            <div className="fixed inset-0 bg-background/80  z-50 flex items-center justify-center p-4">
              <Card className="w-full max-w-md p-8 bg-card border-border rounded-2xl md:rounded-3xl flex flex-col items-center text-center gap-6 shadow-2xl animate-in fade-in zoom-in-95 duration-300">
                <div className="w-16 h-16 rounded-full bg-success/10 border border-success/20 flex items-center justify-center shadow-lg text-success animate-bounce">
                  <Award size={32} />
                </div>
                
                <div>
                  <h2 className="text-2xl uppercase tracking-tight text-foreground">
                    Latihan Selesai!
                  </h2>
                  <p className="text-muted-foreground text-xs uppercase tracking-widest font-bold mt-1">
                    Hasil Pencapaian Diktemu
                  </p>
                </div>

                <div className="w-full bg-muted/30 p-5 rounded-lg border border-border flex flex-col items-center">
                  <span className="text-4xl font-black text-success font-mono">
                    {score.correct} / {sentences.length}
                  </span>
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">
                    Kalimat yang Dijawab Benar
                  </span>
                  <span className="text-xs text-success font-bold mt-2">
                    Akurasi: {Math.round((score.correct / sentences.length) * 100)}%
                  </span>
                </div>

                <div className="flex gap-3 w-full">
                  <Button
                    variant="outline"
                    onClick={handleRestart}
                    className="flex-1 py-6 rounded-xl text-xs font-bold uppercase tracking-widest border border-border"
                  >
                    Menu Utama
                  </Button>
                  <Button
                    onClick={handleStart}
                    className="flex-1 py-6 rounded-xl text-xs font-bold uppercase tracking-widest bg-success hover:bg-success/90"
                  >
                    Main Lagi
                  </Button>
                </div>
              </Card>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}