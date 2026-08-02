"use client";

/**
 * @file PronunciationPanel.tsx
 * @description Oral pronunciation evaluation panel component for practicing Japanese speech using Web Speech API, featuring real-time audio waveform visualizers and Levenshtein Distance phonetic similarity scoring.
 */

// ==========================================
// Import & Dependencies
// ==========================================
import React, { useState, useEffect, useRef, useCallback } from "react";
import { Mic, MicOff, RefreshCw, ChevronRight, Zap, CheckCircle2, AlertCircle } from "@/components/ui/icons";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useUserStore } from "@/store/useUserStore";
import { sounds } from "@/lib/audio";

// ==========================================
// Component Props Interface
// ==========================================
/**
 * Props for PronunciationPanel component.
 */
interface PronunciationPanelProps {
 /** Target card data containing word, furigana, and meaning. */
 card: {
 word: string;
 furigana?: string | null;
 meaning: string;
 };
 /** Callback triggered when moving to next card. */
 onNext: () => void;
 /** Current card index in stack. */
 currentIndex: number;
 /** Total number of cards in stack. */
 totalCards: number;
}

// ==========================================
// Helper Functions
// ==========================================
/**
 * Convert Katakana characters to Hiragana.
 * @param str Input string containing Katakana.
 * @returns Converted Hiragana string.
 */
function toHiragana(str: string): string {
 return str.replace(/[\u30a1-\u30f6]/g, (match) =>
 String.fromCharCode(match.charCodeAt(0) - 0x60)
 );
}

/**
 * Calculate Levenshtein Distance edit distance between two strings.
 * @param a First string.
 * @param b Second string.
 * @returns Minimum edit steps distance.
 */
function getLevenshteinDistance(a: string, b: string): number {
 if (a.length === 0) return b.length;
 if (b.length === 0) return a.length;

 const matrix: number[][] = [];

 for (let i = 0; i <= b.length; i++) {
 matrix[i] = [i];
 }

 for (let j = 0; j <= a.length; j++) {
 matrix[0][j] = j;
 }

 for (let i = 1; i <= b.length; i++) {
 for (let j = 1; j <= a.length; j++) {
 if (b.charAt(i - 1) === a.charAt(j - 1)) {
 matrix[i][j] = matrix[i - 1][j - 1];
 } else {
 matrix[i][j] = Math.min(
 matrix[i - 1][j - 1] + 1,
 matrix[i][j - 1] + 1,
 matrix[i - 1][j] + 1
 );
 }
 }
 }

 return matrix[b.length][a.length];
}

/**
 * Calculate pronunciation accuracy score percentage (0-100%).
 * @param target Target pronunciation text.
 * @param input Recognized speech input text.
 * @returns Accuracy score percentage.
 */
function getSimilarityScore(target: string, input: string): number {
 const distance = getLevenshteinDistance(target, input);
 const maxLength = Math.max(target.length, input.length);
 if (maxLength === 0) return 100;
 return Math.round((1 - distance / maxLength) * 100);
}

// ==========================================
// Main Component
// ==========================================
/**
 * Interactive speech pronunciation evaluation panel utilizing Web Speech API.
 * Captures microphone audio, normalizes Hiragana/Katakana text, and computes similarity scores using Levenshtein Distance.
 * 
 * @param {PronunciationPanelProps} props Component properties.
 * @returns {React.ReactElement} Pronunciation evaluation panel interface.
 * @storeAccess Accesses `useUserStore` for XP reward dispatch.
 */
export default function PronunciationPanel({
 card,
 onNext,
 currentIndex,
 totalCards,
}: PronunciationPanelProps) {
 const [isRecording, setIsRecording] = useState(false);
 const [transcript, setTranscript] = useState("");
 const [score, setScore] = useState<number | null>(null);
 const [inputResult, setInputResult] = useState<"correct" | "wrong" | null>(null);
 const [combo, setCombo] = useState(0);

 // Custom interface to avoid 'any' type warnings
 /** Speech recognition result event structure. */
 interface SpeechRecognitionEvent {
 results: { [index: number]: { [index: number]: { transcript: string } } };
 }

 /** Speech recognition error event structure. */
 interface SpeechRecognitionErrorEvent {
 error: string;
 }

 /** Speech recognition instance interface. */
 interface SpeechRecognitionInstance {
 continuous: boolean;
 interimResults: boolean;
 lang: string;
 start: () => void;
 stop: () => void;
 onresult: ((event: SpeechRecognitionEvent) => void) | null;
 onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
 onend: (() => void) | null;
 }

 const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);

 // Visualizer Refs
 const canvasRef = useRef<HTMLCanvasElement | null>(null);
 const animationRef = useRef<number | null>(null);
 const mediaStreamRef = useRef<MediaStream | null>(null);
 const audioContextRef = useRef<AudioContext | null>(null);
 const [audioAnalyser, setAudioAnalyser] = useState<AnalyserNode | null>(null);

 // Initialize SpeechRecognition on mount
 useEffect(() => {
 if (typeof window !== "undefined") {
 const win = window as unknown as { SpeechRecognition?: new () => SpeechRecognitionInstance; webkitSpeechRecognition?: new () => SpeechRecognitionInstance };
 const SpeechRecognition = win.SpeechRecognition || win.webkitSpeechRecognition;
 if (SpeechRecognition) {
 const rec = new SpeechRecognition();
 rec.continuous = false;
 rec.interimResults = false;
 rec.lang = "ja-JP";
 recognitionRef.current = rec;
 }
 }
 }, []);

 /**
 * Stop recording, release audio stream, and close audio context.
 */
 const stopRecording = useCallback(() => {
 setIsRecording(false);

 // Stop recognition
 try {
 recognitionRef.current?.stop();
 } catch {}

 // Stop streams & visualizer
 if (animationRef.current) {
 cancelAnimationFrame(animationRef.current);
 }
 if (mediaStreamRef.current) {
 mediaStreamRef.current.getTracks().forEach((track) => track.stop());
 mediaStreamRef.current = null;
 }
 if (audioContextRef.current) {
 try {
 audioContextRef.current.close();
 } catch {}
 audioContextRef.current = null;
 }
 setAudioAnalyser(null);
 }, []);

 /**
 * Request microphone access, initialize audio analyzer, and start speech recognition.
 */
 const startRecording = async () => {
 if (!recognitionRef.current) {
 toast.error("Speech Recognition tidak didukung di browsermu. Gunakan Google Chrome/Safari ya!");
 return;
 }

 try {
 setIsRecording(true);
 setInputResult(null);
 setTranscript("");
 setScore(null);

 // Access Audio for Canvas wave
 const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
 mediaStreamRef.current = stream;

 const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
 const audioCtx = new AudioContextClass();
 audioContextRef.current = audioCtx;

 const source = audioCtx.createMediaStreamSource(stream);
 const analyser = audioCtx.createAnalyser();
 analyser.fftSize = 256;
 source.connect(analyser);
 setAudioAnalyser(analyser);

 recognitionRef.current.start();
 } catch (err) {
 console.error(err);
 setIsRecording(false);
 toast.error("Gagal mengakses mikrofonmu. Pastikan izin akses mikrofon diberikan ya!");
 }
 };

 // Wire recognition callbacks
 useEffect(() => {
 const rec = recognitionRef.current;
 if (!rec) return;

 rec.onresult = (event: SpeechRecognitionEvent) => {
 const resultText = event.results[0][0].transcript;
 setTranscript(resultText);

 // Similarity Evaluation
 const targetWord = card.word;
 const targetFuri = card.furigana || targetWord;

 const cleanTargetFuri = toHiragana(targetFuri.trim());
 const cleanInput = toHiragana(resultText.trim());

 const scoreFuri = getSimilarityScore(cleanTargetFuri, cleanInput);
 const scoreWord = getSimilarityScore(targetWord.trim().toLowerCase(), resultText.trim().toLowerCase());
 const finalScore = Math.max(scoreFuri, scoreWord);

 setScore(finalScore);

 const isSuccess = finalScore >= 80;
 if (isSuccess) {
 sounds?.playSuccess();
 setInputResult("correct");

 const newCombo = combo + 1;
 setCombo(newCombo);

 // Zustand Reward XP (+3 XP)
 useUserStore.getState().addXP(3);

 if (newCombo === 10) {
 useUserStore.getState().addXP(15);
 toast.success("Rantai Sempurna! Bonus +15 XP diperoleh!");
 }
 } else {
 sounds?.playError();
 setInputResult("wrong");
 setCombo(0);
 }

 stopRecording();
 };

 rec.onerror = (event: SpeechRecognitionErrorEvent) => {
 console.error("Speech recognition error", event);
 if (event.error !== "no-speech") {
 toast.error("Gagal mendeteksi ucapanmu. Coba lagi ya!");
 }
 stopRecording();
 };

 rec.onend = () => {
 setIsRecording(false);
 };
 }, [card, combo, stopRecording]);

 // Audio wave rendering loop
 useEffect(() => {
 if (!audioAnalyser || !canvasRef.current) return;
 const canvas = canvasRef.current;
 const ctx = canvas.getContext("2d");
 if (!ctx) return;

 const bufferLength = audioAnalyser.frequencyBinCount;
 const dataArray = new Uint8Array(bufferLength);

 const draw = () => {
 animationRef.current = requestAnimationFrame(draw);
 audioAnalyser.getByteTimeDomainData(dataArray);

 ctx.clearRect(0, 0, canvas.width, canvas.height);
 ctx.lineWidth = 3;
 ctx.strokeStyle = "hsl(var(--primary)/0.85)";
 ctx.shadowBlur = 4;
 ctx.shadowColor = "hsl(var(--primary)/0.35)";
 ctx.beginPath();

 const sliceWidth = canvas.width / bufferLength;
 let x = 0;

 for (let i = 0; i < bufferLength; i++) {
 const v = dataArray[i] / 128.0;
 const y = (v * canvas.height) / 2;

 if (i === 0) {
 ctx.moveTo(x, y);
 } else {
 ctx.lineTo(x, y);
 }

 x += sliceWidth;
 }

 ctx.lineTo(canvas.width, canvas.height / 2);
 ctx.stroke();
 };

 draw();

 return () => {
 if (animationRef.current) cancelAnimationFrame(animationRef.current);
 };
 }, [audioAnalyser]);

 // Cleanup on unmount
 useEffect(() => {
 return () => {
 if (animationRef.current) cancelAnimationFrame(animationRef.current);
 if (mediaStreamRef.current) {
 mediaStreamRef.current.getTracks().forEach((track) => track.stop());
 }
 if (audioContextRef.current) {
 try {
 audioContextRef.current.close();
 } catch {}
 }
 };
 }, []);

 // Determine neon glow colors based on evaluation result
 let borderGlow = "border-border/50 shadow-sm";
 if (inputResult === "correct") {
 borderGlow = "border-success/60 bg-success/5 shadow-md";
 } else if (inputResult === "wrong") {
 borderGlow = "border-destructive/60 bg-destructive/5 shadow-md";
 }

 return (
 <div className={`w-full glass rounded-xl p-6 border transition-all duration-200 flex flex-col gap-6 ${borderGlow}`}>
 <div className="flex justify-between items-center">
 <div className="flex items-center gap-2">
 <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
 Latihan Lisan
 </span>
 <span className="text-[10px] font-mono text-muted-foreground/60">
 ({currentIndex + 1} / {totalCards})
 </span>
 </div>

 {combo > 0 && (
 <div className="flex items-center gap-1 bg-warning/15 border border-warning/30 text-warning px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider">
 <Zap size={10} className="fill-current" />
 <span>Combo: {combo}x</span>
 </div>
 )}
 </div>

 {/* Target Word & Guided Furigana */}
 <div className="text-center py-4 flex flex-col items-center justify-center gap-1">
 {card.furigana && (
 <span className="text-sm font-bold text-muted-foreground/60 tracking-wider">
 {card.furigana}
 </span>
 )}
 <h2 className="text-4xl text-foreground tracking-tight select-all">
 {card.word}
 </h2>
 <span className="text-xs text-muted-foreground italic mt-1 uppercase tracking-widest font-semibold">
 {card.meaning}
 </span>
 </div>

 {/* Canvas Visualizer when recording */}
 <div className="relative w-full h-16 bg-muted/20 border border-border/30 rounded-lg overflow-hidden flex items-center justify-center">
 {isRecording ? (
 <canvas ref={canvasRef} className="w-full h-full" width={400} height={64} />
 ) : (
 <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground/50">
 Tekan mikrofon untuk melatih pelafalan
 </span>
 )}
 </div>

 {/* Evaluation Results Card */}
 {inputResult !== null && (
 <div className="flex flex-col gap-2 p-4 bg-muted/30 border border-border/40 rounded-lg animate-in fade-in duration-300">
 <div className="flex items-center justify-between">
 <div className="flex items-center gap-2">
 {inputResult === "correct" ? (
 <CheckCircle2 size={16} className="text-success" />
 ) : (
 <AlertCircle size={16} className="text-destructive" />
 )}
 <span className={`text-[10px] font-black uppercase tracking-widest ${inputResult === "correct" ? 'text-success' : 'text-destructive'}`}>
 {inputResult === "correct" ? "Pelafalan Bagus!" : "Coba Ucapkan Lagi"}
 </span>
 </div>
 {score !== null && (
 <span className="text-[10px] font-mono font-bold bg-card border border-border px-2.5 py-0.5 rounded-full text-foreground">
 Akurasi: {score}%
 </span>
 )}
 </div>
 <div className="text-xs font-semibold text-muted-foreground leading-relaxed mt-1 flex flex-wrap gap-1 items-center">
 <span>Terdeteksi:</span>
 <span className={`font-mono text-sm px-2 py-0.5 rounded-lg border font-bold ${inputResult === "correct" ? 'bg-success/10 border-success/30 text-success' : 'bg-destructive/10 border-destructive/30 text-destructive'}`}>
 {transcript || "(tidak terdengar)"}
 </span>
 </div>
 </div>
 )}

 {/* Action Controls */}
 <div className="flex gap-3 pt-2">
 <Button
 onClick={isRecording ? stopRecording : startRecording}
 variant="outline"
 className={`flex-1 py-6 rounded-lg text-xs font-black uppercase tracking-widest group relative overflow-hidden transition-all duration-200 ${
 isRecording
 ? "bg-destructive text-destructive-foreground hover:bg-destructive/95 border-none shadow-md"
 : "bg-primary text-primary-foreground hover:bg-primary/95 border-none shadow-md"
 }`}
 >
 {isRecording ? (
 <>
 <MicOff size={14} className="mr-2" /> Hentikan & Selesai
 </>
 ) : (
 <>
 <Mic size={14} className="mr-2 group-hover:scale-110 transition-transform" /> Mulai Bicara
 </>
 )}
 </Button>

 {inputResult !== null && (
 <Button
 onClick={onNext}
 variant="outline"
 className="w-14 py-6 rounded-lg border-border bg-card/80 hover:bg-muted text-foreground flex items-center justify-center shrink-0"
 aria-label="Kata Selanjutnya"
 >
 <ChevronRight size={18} />
 </Button>
 )}
 </div>
 </div>
 );
}