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
 * Hook kustom untuk membacakan teks bahasa Jepang (TTS) menggunakan strategi Hybrid & Caching.
 * Mengutamakan Edge TTS API dan mendeteksi suara pria/wanita otomatis berdasarkan nama pembicara,
 * fallback ke Web Speech API jika Edge TTS tidak tersedia.
 * 
 * @param {string} text - Teks bahasa Jepang yang akan dibacakan.
 * @param {string} [speaker] - Nama pembicara untuk penentuan gender suara dinamis.
 * @returns {{ isPlaying: boolean; hasJapanese: boolean; speak: () => Promise<void> }} Status pemutaran, keberadaan karakter Jepang, dan fungsi pemicu speak.
 * @effects Memutar audio di browser, memprefetch data ke CacheStorage, memanipulasi window.speechSynthesis.
 */
export function useTTSReader(text: string, speaker?: string) {
  // ==========================================
  // STATUS & STATE & REFS
  // ==========================================
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

    // Pemicu pause audio lain di halaman
    isSelfPlayingRef.current = true;
    window.dispatchEvent(new CustomEvent("nihongoroute_pause_line_tts"));
    window.dispatchEvent(new CustomEvent("nihongoroute_pause_native_audio"));

    // Tentukan suara: jika ada speaker gunakan speaker, 
    // jika tidak (seperti pada contoh kalimat), gunakan suara secara acak-deterministik berdasarkan hash teks
    let voice: TtsVoice = TTS_VOICES.INDAH;
    if (speaker) {
      voice = detectVoice(speaker);
    } else {
      // Pool 19 voices — HARUS identik dengan VOICES_ROTATION di generate_example_sentences.js
      // agar hash deterministik menghasilkan voice yang sama (cache hit)
      const voices = [
        // Wanita
        TTS_VOICES.LARA,
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
        TTS_VOICES.NAMONASHI,
      ];
      let hash = 0;
      for (let i = 0; i < text.length; i++) {
        hash = text.charCodeAt(i) + ((hash << 5) - hash);
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
        text,
        voice,
        1,
        () => setIsPlaying(false),
        () => setIsPlaying(false)
      );
      stopNativeRef.current = cancel;
    };

    try {
      const audioUrl = await fetchTTSAudio(text, voice);
      if (!audioUrl) {
        playFallback();
        return;
      }

      if (!audioRef.current) {
        audioRef.current = new Audio();
      }

      const audio = audioRef.current;

      cleanupObjectUrl();
      if (audioUrl.startsWith("blob:")) {
        objectUrlRef.current = audioUrl;
      }

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

