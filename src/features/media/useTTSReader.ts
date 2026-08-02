"use client";

/**
 * @file useTTSReader.ts
 * @description Custom hook for reading Japanese text aloud using Text-to-Speech (TTS) hybrid fallback strategies.
 */

// ==========================================
// Import & Dependencies
// ==========================================
import { useState, useEffect, useRef } from "react";
import { fetchTTSAudio, speakWithWebSpeech, detectVoice, TTS_VOICES, type TtsVoice } from "@/lib/tts";

// ==========================================
// Main Custom Hook
// ==========================================
/**
 * Hook for Japanese text-.
 * Uses hybrid strategy with caching.
 * Falls back to Web Speech API.
 */
export function useTTSReader(text: string, speaker?: string, audioUrl?: string | null) {
 const [isPlaying, setIsPlaying] = useState(false);
 const [hasJapanese, setHasJapanese] = useState(true);
 const audioRef = useRef<HTMLAudioElement | null>(null);
 const stopNativeRef = useRef<(() => void) | null>(null);
 const objectUrlRef = useRef<string | null>(null);
 const isSelfPlayingRef = useRef(false);

 const cleanupObjectUrl = () => {
 if (objectUrlRef.current) {
 URL.revokeObjectURL(objectUrlRef.current);
 objectUrlRef.current = null;
 }
 };

 useEffect(() => {
 const jpRegex = /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/;
 const frame = requestAnimationFrame(() => {
 setHasJapanese(jpRegex.test(text));
 });
 return () => cancelAnimationFrame(frame);
 }, [text]);

 useEffect(() => {
 const handlePause = () => {
 if (isSelfPlayingRef.current) {
 isSelfPlayingRef.current = false;
 return;
 }
 if (audioRef.current) {
 audioRef.current.pause();
 audioRef.current.currentTime = 0;
 }
 if (stopNativeRef.current) {
 stopNativeRef.current();
 stopNativeRef.current = null;
 }
 if (typeof window !== "undefined" && window.speechSynthesis) {
 window.speechSynthesis.cancel();
 }
 setIsPlaying(false);
 };
 window.addEventListener("nihongoroute_pause_line_tts", handlePause);

 return () => {
 window.removeEventListener("nihongoroute_pause_line_tts", handlePause);
 if (stopNativeRef.current) {
 stopNativeRef.current();
 }
 cleanupObjectUrl();
 };
 }, []);

 const speak = async () => {
 if (typeof window === "undefined") return;

 if (isPlaying) {
 if (audioRef.current) {
 audioRef.current.pause();
 audioRef.current.currentTime = 0;
 }
 if (stopNativeRef.current) {
 stopNativeRef.current();
 stopNativeRef.current = null;
 }
 window.speechSynthesis.cancel();
 cleanupObjectUrl();
 setIsPlaying(false);
 return;
 }

 isSelfPlayingRef.current = true;
 window.dispatchEvent(new CustomEvent("nihongoroute_pause_line_tts"));
 window.dispatchEvent(new CustomEvent("nihongoroute_pause_native_audio"));

 const cleanText = text.trim();
 if (!cleanText) return;

 let voice: TtsVoice = TTS_VOICES.INDAH;
 if (speaker) {
 voice = detectVoice(speaker);
 } else {
 const voices = [
 TTS_VOICES.LALA,
 TTS_VOICES.INDAH,
 TTS_VOICES.SITI,
 TTS_VOICES.DEWI,
 TTS_VOICES.HAYASHI,
 TTS_VOICES.SATO,
 TTS_VOICES.AYU,
 TTS_VOICES.ZUNDAMON,
 TTS_VOICES.RITSU,
 TTS_VOICES.DITO,
 TTS_VOICES.BUDI,
 TTS_VOICES.SUZUKI,
 TTS_VOICES.TANAKA,
 TTS_VOICES.KIMURA,
 TTS_VOICES.ANDI,
 TTS_VOICES.FAISAL,
 TTS_VOICES.TAKAHASHI,
 TTS_VOICES.KOBAYASHI,
 ];
 let hash = 0;
 for (let i = 0; i < cleanText.length; i++) {
 hash = cleanText.charCodeAt(i) + ((hash << 5) - hash);
 }
 const voiceIndex = Math.abs(hash) % voices.length;
 voice = voices[voiceIndex];
 }

 const playFallback = () => {
 if (audioRef.current) {
 audioRef.current.pause();
 }
 setIsPlaying(true);
 const cancel = speakWithWebSpeech(
 cleanText,
 voice,
 1,
 () => setIsPlaying(false),
 () => setIsPlaying(false)
 );
 stopNativeRef.current = cancel;
 };

 try {
 const finalAudioUrl = audioUrl || await fetchTTSAudio(cleanText, voice);
 if (!finalAudioUrl) {
 playFallback();
 return;
 }

 if (!audioRef.current) {
 audioRef.current = new Audio();
 }

 const audio = audioRef.current;
 cleanupObjectUrl();

 if (finalAudioUrl.startsWith("blob:")) {
 objectUrlRef.current = finalAudioUrl;
 }

 audio.src = finalAudioUrl;
 audio.onplay = () => setIsPlaying(true);
 audio.onended = () => {
 setIsPlaying(false);
 cleanupObjectUrl();
 };
 audio.onerror = (e) => {
 console.warn("API TTS Error, falling back to Web Speech:", e);
 setIsPlaying(false);
 cleanupObjectUrl();
 playFallback();
 };

 const playPromise = audio.play();
 if (playPromise !== undefined) {
 playPromise.catch(error => {
 console.warn("Audio playback blocked, falling back to Web Speech:", error);
 playFallback();
 });
 }
 } catch (err) {
 console.warn("Failed to play TTS from API, falling back:", err);
 playFallback();
 }
 };

 return { isPlaying, hasJapanese, speak };
}
