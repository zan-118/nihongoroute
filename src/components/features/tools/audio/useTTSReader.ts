"use client";

/**
 * @file useTTSReader.ts
 * @description Hook kustom untuk membacakan teks bahasa Jepang menggunakan strategi Hybrid & Caching. Mengutamakan High-Quality Online Voices, kemudian fallback ke Google Translate TTS API dengan Cache Storage lokal untuk luring penuh.
 */

// ==========================================
// IMPORT & DEPENDENSI
// ==========================================
import { useState, useEffect, useRef } from "react";
import { fetchTTSAudio, speakWithWebSpeech, TTS_VOICES } from "@/lib/tts";

// ==========================================
// HOOK UTAMA
// ==========================================
/**
 * Hook khusus pembaca teks Jepang (TTS).
 * 
 * @param text Teks bahasa Jepang yang akan dibacakan.
 * @returns Status pemutaran, keberadaan karakter Jepang, dan fungsi speak.
 */
export function useTTSReader(text: string) {
  // ==========================================
  // STATUS & STATE & REFS
  // ==========================================
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasJapanese, setHasJapanese] = useState(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const stopNativeRef = useRef<(() => void) | null>(null);
  const objectUrlRef = useRef<string | null>(null);

  const cleanupObjectUrl = () => {
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
  };

  // ==========================================
  // EFEK SAMPING (EFFECTS)
  // ==========================================
  useEffect(() => {
    const jpRegex = /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/;
    const frame = requestAnimationFrame(() => {
      setHasJapanese(jpRegex.test(text));
    });
    return () => cancelAnimationFrame(frame);
  }, [text]);

  useEffect(() => {
    return () => {
      if (stopNativeRef.current) {
        stopNativeRef.current();
      }
      cleanupObjectUrl();
    };
  }, []);

  // ==========================================
  // LOGIKA PENGENDALI & PEMUTARAN AUDIO
  // ==========================================
  /**
   * Menjalankan pemutaran suara.
   * Strategi:
   * 1. Hentikan pemutaran jika sedang berjalan.
   * 2. Ambil audio berkualitas tinggi dari API Route /api/tts menggunakan fetchTTSAudio.
   * 3. Jika gagal atau luring total tanpa cache, gunakan Web Speech API (speakWithWebSpeech).
   */
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

    const playFallback = () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      setIsPlaying(true);
      const cancel = speakWithWebSpeech(
        text,
        TTS_VOICES.NANAMI,
        1,
        () => setIsPlaying(false),
        () => setIsPlaying(false)
      );
      stopNativeRef.current = cancel;
    };

    try {
      const audioUrl = await fetchTTSAudio(text, TTS_VOICES.NANAMI);
      if (!audioUrl) {
        playFallback();
        return;
      }

      if (!audioRef.current) {
        audioRef.current = new Audio();
      }

      const audio = audioRef.current;
      audio.src = audioUrl;

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

  // ==========================================
  // HASIL HOOK (RETURN VALUE)
  // ==========================================
  return { isPlaying, hasJapanese, speak };
}

