/**
 * @file useLineTTS.ts
 * @description Hook untuk memutar TTS per baris transkrip menggunakan Edge TTS
 * dengan deteksi suara pria/wanita otomatis berdasarkan nama pembicara.
 * Fallback ke Web Speech API jika Edge TTS gagal.
 */

"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { fetchTTSAudio, speakWithWebSpeech, detectVoice, TtsVoice } from "@/lib/tts";
import { TranscriptLine } from "../types";

// ── Tipe ─────────────────────────────────────────────────────
export type TTSRate = "slow" | "medium" | "fast";

interface UseLineTTSOptions {
  rate?: TTSRate;
}

interface UseLineTTSReturn {
  speakingIndex: number;
  loadingIndex: number;
  speakLine: (line: TranscriptLine, index: number) => Promise<void>;
  stopLineTTS: () => void;
  lineTTSEnabled: boolean;
  toggleLineTTS: () => void;
  rate: TTSRate;
  setRate: (r: TTSRate) => void;
}

// ── Helper: konversi rate string ke playbackRate number ──────
function rateToNumber(rate: TTSRate): number {
  return rate === "slow" ? 0.75 : rate === "fast" ? 1.25 : 1;
}

// ── Hook utama ────────────────────────────────────────────────
export function useLineTTS({ rate: initialRate = "medium" }: UseLineTTSOptions = {}): UseLineTTSReturn {
  const [speakingIndex,   setSpeakingIndex]   = useState(-1);
  const [loadingIndex,    setLoadingIndex]     = useState(-1);
  const [lineTTSEnabled,  setLineTTSEnabled]   = useState(false);
  const [rate,            setRate]             = useState<TTSRate>(initialRate);

  const audioRef         = useRef<HTMLAudioElement | null>(null);
  const stopWebSpeechRef = useRef<(() => void) | null>(null);

  // Cleanup saat unmount
  useEffect(() => {
    const audio = audioRef.current;
    return () => {
      if (audio) audio.pause();
      stopWebSpeechRef.current?.();
    };
  }, []);

  const stopLineTTS = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
    }
    stopWebSpeechRef.current?.();
    stopWebSpeechRef.current = null;
    setSpeakingIndex(-1);
    setLoadingIndex(-1);
  }, []);

  const speakLine = useCallback(async (line: TranscriptLine, index: number) => {
    if (!lineTTSEnabled) return;

    stopLineTTS();

    // Ekstrak teks dari baris
    const text = typeof line.text === "string"
      ? line.text
      : Array.isArray(line.text)
        ? (line.text as { text?: string; children?: { text?: string }[] }[])
            .map(b => b?.children?.map(c => c?.text || "").join("") || b?.text || "")
            .join("")
        : String(line.text || "");

    if (!text.trim()) return;

    const voice: TtsVoice = detectVoice(line.speaker, index);
    const playbackRate = rateToNumber(rate);

    setLoadingIndex(index);

    try {
      const ttsUrl = await fetchTTSAudio(text, voice, rate);

      if (ttsUrl) {
        if (!audioRef.current) audioRef.current = new Audio();

        const audio = audioRef.current;
        audio.src = ttsUrl;
        audio.playbackRate = playbackRate;

        audio.oncanplay = () => { setLoadingIndex(-1); setSpeakingIndex(index); };
        audio.onended   = () => { setSpeakingIndex(-1); };
        audio.onerror   = () => {
          setLoadingIndex(-1);
          setSpeakingIndex(index);
          stopWebSpeechRef.current = speakWithWebSpeech(
            text, voice, playbackRate,
            () => setSpeakingIndex(-1),
            () => setSpeakingIndex(-1)
          );
        };

        await audio.play();
      } else {
        // Edge TTS tidak tersedia — fallback Web Speech
        setLoadingIndex(-1);
        setSpeakingIndex(index);
        stopWebSpeechRef.current = speakWithWebSpeech(
          text, voice, playbackRate,
          () => setSpeakingIndex(-1),
          () => setSpeakingIndex(-1)
        );
      }
    } catch {
      setLoadingIndex(-1);
      setSpeakingIndex(-1);
    }
  }, [lineTTSEnabled, rate, stopLineTTS]);

  const toggleLineTTS = useCallback(() => {
    setLineTTSEnabled(prev => {
      if (prev) stopLineTTS();
      return !prev;
    });
  }, [stopLineTTS]);

  return { speakingIndex, loadingIndex, speakLine, stopLineTTS, lineTTSEnabled, toggleLineTTS, rate, setRate };
}
