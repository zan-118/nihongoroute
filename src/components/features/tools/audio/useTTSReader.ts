"use client";

/**
 * @file useTTSReader.ts
 * @description Hook kustom untuk membacakan teks bahasa Jepang menggunakan strategi Hybrid & Caching. Mengutamakan High-Quality Online Voices, kemudian fallback ke Google Translate TTS API dengan Cache Storage lokal untuk luring penuh.
 */

// ==========================================
// IMPORT & DEPENDENSI
// ==========================================
import { useState, useEffect, useRef } from "react";
import { fetchTTSAudio, speakWithWebSpeech, detectVoice, TTS_VOICES, type TtsVoice } from "@/lib/tts";

// ==========================================
// HOOK UTAMA
// ==========================================
/**
 * Hook for Japanese text-to-speech.
 * Uses hybrid strategy with caching.
 * Falls back to Web Speech API.
 * 
 * @param text Japanese text to read.
 * @param speaker Speaker name for voice selection.
 * @param audioUrl Optional pre-fetched audio URL.
 * @returns Playback state, Japanese text check, and speak trigger.
 */
export function useTTSReader(text: string, speaker?: string, audioUrl?: string | null) {
  // ==========================================
  // STATUS & STATE & REFS
  // ==========================================
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasJapanese, setHasJapanese] = useState(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const stopNativeRef = useRef<(() => void) | null>(null);
  const objectUrlRef = useRef<string | null>(null);
  const isSelfPlayingRef = useRef(false);

  /**
   * Release memory of active blob URL.
   */
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
    // Regex matches Hiragana, Katakana, and Kanji.
    const jpRegex = /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/;
    // Run check in animation frame to prevent UI lag.
    const frame = requestAnimationFrame(() => {
      setHasJapanese(jpRegex.test(text));
    });
    return () => cancelAnimationFrame(frame);
  }, [text]);

  useEffect(() => {
    // Handle global pause event to stop audio.
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

  // ==========================================
  // LOGIKA PENGENDALI & PEMUTARAN AUDIO
  // ==========================================
  /**
   * Trigger audio playback.
   * Stop current audio if playing.
   * Fetch from API or use Web Speech API fallback.
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

    // Prevent self-pausing. Stop other active TTS instances.
    isSelfPlayingRef.current = true;
    window.dispatchEvent(new CustomEvent("nihongoroute_pause_line_tts"));
    window.dispatchEvent(new CustomEvent("nihongoroute_pause_native_audio"));

    // Tentukan suara: jika ada speaker gunakan speaker, 
    // jika tidak (seperti pada contoh kalimat), gunakan suara secara acak-deterministik berdasarkan hash teks
    const cleanText = text.trim();
    if (!cleanText) return;

    let voice: TtsVoice = TTS_VOICES.INDAH;
    if (speaker) {
      voice = detectVoice(speaker);
    } else {
      // Pool 19 voices — HARUS identik dengan VOICES_ROTATION di generate_example_sentences.js
      // agar hash deterministik menghasilkan voice yang sama (cache hit)
      const voices = [
        // Wanita
        TTS_VOICES.LALA,
        TTS_VOICES.INDAH,
        TTS_VOICES.SITI,
        TTS_VOICES.DEWI,
        TTS_VOICES.HAYASHI,
        TTS_VOICES.SATO,
        TTS_VOICES.AYU,
        TTS_VOICES.ZUNDAMON,
        TTS_VOICES.RITSU,
        // Pria (yamada & ooba dikeluarkan — kakek tidak cocok untuk contoh kalimat)
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
      // Generate deterministic hash from text to select voice.
      let hash = 0;
      for (let i = 0; i < cleanText.length; i++) {
        hash = cleanText.charCodeAt(i) + ((hash << 5) - hash);
      }
      const voiceIndex = Math.abs(hash) % voices.length;
      voice = voices[voiceIndex];
    }

    /**
     * Fallback to Web Speech API if API fetch fails.
     */
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
      // Track blob URL to release later.
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

      // Handle browser autoplay restrictions.
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