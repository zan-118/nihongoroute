/**
 * @file useLineTTS.ts
 * @description Hook untuk memutar TTS per baris transkrip menggunakan Edge TTS
 * dengan deteksi suara pria/wanita otomatis berdasarkan nama pembicara.
 * Mendukung pemutaran berurutan (playlist) untuk seluruh percakapan.
 * Fallback ke Web Speech API jika Edge TTS gagal.
 */

"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { fetchTTSAudio, speakWithWebSpeech, detectVoice, TtsVoice } from "@/lib/tts";

// ── Tipe ─────────────────────────────────────────────────────
export type TTSRate = "slow" | "medium" | "fast";

interface UseLineTTSOptions {
  rate?: TTSRate;
}

interface UseLineTTSReturn {
  speakingIndex: number;
  loadingIndex: number;
  speakLine: (line: any, index: number) => Promise<void>;
  stopLineTTS: () => void;
  lineTTSEnabled: boolean;
  toggleLineTTS: () => void;
  rate: TTSRate;
  setRate: (r: TTSRate) => void;
  
  // Fitur playlist sequential
  isPlayingPlaylist: boolean;
  playlistIndex: number;
  playPlaylist: (lines: any[], startIndex?: number) => void;
  pausePlaylist: () => void;
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

  // State & Ref untuk Playlist
  const [playlistIndex, setPlaylistIndex] = useState<number>(-1);
  const [isPlayingPlaylist, setIsPlayingPlaylist] = useState<boolean>(false);
  const playlistLinesRef = useRef<any[]>([]);
  const isPlayingPlaylistRef = useRef<boolean>(false);

  const audioRef         = useRef<HTMLAudioElement | null>(null);
  const stopWebSpeechRef = useRef<(() => void) | null>(null);
  const isSelfPlayingRef = useRef<boolean>(false);
  const objectUrlRef     = useRef<string | null>(null);

  const cleanupObjectUrl = useCallback(() => {
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
  }, []);

  const stopLineTTS = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
    }
    cleanupObjectUrl();
    stopWebSpeechRef.current?.();
    stopWebSpeechRef.current = null;
    setSpeakingIndex(-1);
    setLoadingIndex(-1);

    if (isPlayingPlaylistRef.current) {
      isPlayingPlaylistRef.current = false;
      setIsPlayingPlaylist(false);
      setPlaylistIndex(-1);
    }
  }, []);

  // Event listener untuk mematikan TTS jika audio lain mulai diputar
  useEffect(() => {
    const handlePause = () => {
      if (isSelfPlayingRef.current) {
        isSelfPlayingRef.current = false;
        return;
      }
      stopLineTTS();
    };
    window.addEventListener("nihongoroute_pause_line_tts", handlePause);
    return () => {
      window.removeEventListener("nihongoroute_pause_line_tts", handlePause);
    };
  }, [stopLineTTS]);

  // Cleanup saat unmount
  useEffect(() => {
    const audio = audioRef.current;
    return () => {
      if (audio) audio.pause();
      cleanupObjectUrl();
      stopWebSpeechRef.current?.();
    };
  }, [cleanupObjectUrl]);

  const speakLineRaw = useCallback(async (line: any, index: number, forcePlay = false) => {
    if (!lineTTSEnabled && !forcePlay) return;

    // Matikan audio utama & TTS lain terlebih dahulu
    window.dispatchEvent(new CustomEvent("nihongoroute_pause_native_audio"));
    isSelfPlayingRef.current = true;
    window.dispatchEvent(new CustomEvent("nihongoroute_pause_line_tts"));

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
    }
    stopWebSpeechRef.current?.();
    stopWebSpeechRef.current = null;
    setSpeakingIndex(-1);
    setLoadingIndex(-1);

    // Ekstrak teks (dukung field .text dan .jp)
    const rawText = line.jp || line.text || "";
    const text = typeof rawText === "string"
      ? rawText
      : Array.isArray(rawText)
        ? (rawText as { text?: string; children?: { text?: string }[] }[])
            .map(b => b?.children?.map(c => c?.text || "").join("") || b?.text || "")
            .join("")
        : String(rawText || "");

    if (!text.trim()) return;

    const speakerName = line.speaker || line.speakerName || "";
    const voice: TtsVoice = detectVoice(speakerName, index);
    const playbackRate = rateToNumber(rate);

    setLoadingIndex(index);

    const onAudioEnded = () => {
      setSpeakingIndex(-1);
      cleanupObjectUrl();
      if (isPlayingPlaylistRef.current) {
        setPlaylistIndex(prev => {
          const next = prev + 1;
          if (next < playlistLinesRef.current.length) {
            return next;
          } else {
            setIsPlayingPlaylist(false);
            isPlayingPlaylistRef.current = false;
            return -1;
          }
        });
      }
    };

    try {
      const ttsUrl = await fetchTTSAudio(text, voice, rate);

      if (ttsUrl) {
        if (!audioRef.current) audioRef.current = new Audio();

        const audio = audioRef.current;
        cleanupObjectUrl();
        if (ttsUrl.startsWith("blob:")) {
          objectUrlRef.current = ttsUrl;
        }
        audio.src = ttsUrl;
        audio.playbackRate = playbackRate;

        audio.oncanplay = () => { setLoadingIndex(-1); setSpeakingIndex(index); };
        audio.onended   = onAudioEnded;
        audio.onerror   = () => {
          setLoadingIndex(-1);
          setSpeakingIndex(index);
          stopWebSpeechRef.current = speakWithWebSpeech(
            text, voice, playbackRate,
            onAudioEnded,
            onAudioEnded
          );
        };

        await audio.play();
      } else {
        // Edge TTS tidak tersedia — fallback Web Speech
        setLoadingIndex(-1);
        setSpeakingIndex(index);
        stopWebSpeechRef.current = speakWithWebSpeech(
          text, voice, playbackRate,
          onAudioEnded,
          onAudioEnded
        );
      }
    } catch {
      setLoadingIndex(-1);
      setSpeakingIndex(-1);
    }
  }, [lineTTSEnabled, rate]);

  const speakLine = useCallback(async (line: any, index: number) => {
    await speakLineRaw(line, index, false);
  }, [speakLineRaw]);

  const toggleLineTTS = useCallback(() => {
    setLineTTSEnabled(prev => {
      if (prev) stopLineTTS();
      return !prev;
    });
  }, [stopLineTTS]);

  // Playlist handlers
  const playPlaylist = useCallback((lines: any[], startIndex = 0) => {
    playlistLinesRef.current = lines;
    isPlayingPlaylistRef.current = true;
    setIsPlayingPlaylist(true);
    setPlaylistIndex(startIndex);
  }, []);

  const pausePlaylist = useCallback(() => {
    isPlayingPlaylistRef.current = false;
    setIsPlayingPlaylist(false);
    stopLineTTS();
  }, [stopLineTTS]);

  // Efek pemicu putar baris berikutnya dalam playlist
  useEffect(() => {
    if (isPlayingPlaylist && playlistIndex >= 0 && playlistIndex < playlistLinesRef.current.length) {
      const line = playlistLinesRef.current[playlistIndex];
      speakLineRaw(line, playlistIndex, true);
    }
  }, [playlistIndex, isPlayingPlaylist, speakLineRaw]);

  return {
    speakingIndex,
    loadingIndex,
    speakLine,
    stopLineTTS,
    lineTTSEnabled,
    toggleLineTTS,
    rate,
    setRate,
    isPlayingPlaylist,
    playlistIndex,
    playPlaylist,
    pausePlaylist
  };
}
