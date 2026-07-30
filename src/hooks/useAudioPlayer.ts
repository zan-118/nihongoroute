import { useState, useRef, useCallback, useEffect } from "react";
import { fetchTTSAudio, speakWithWebSpeech, TTS_VOICES, type TtsVoice } from "@/lib/tts";

interface UseAudioPlayerOptions {
  voice?: TtsVoice;
  rate?: number;
}

/**
 * Custom hook untuk menyentralisasi alur pemutaran Audio TTS (Cache/API Route)
 * dengan fallback otomatis ke Web Speech API jika terjadi network/cache miss failure.
 */
export function useAudioPlayer(defaultOptions: UseAudioPlayerOptions = {}) {
  const [playingIndex, setPlayingIndex] = useState<number | string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const cancelSpeechRef = useRef<(() => void) | null>(null);
  const objectUrlRef = useRef<string | null>(null);

  const stopAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
    if (cancelSpeechRef.current) {
      cancelSpeechRef.current();
      cancelSpeechRef.current = null;
    }
    setPlayingIndex(null);
  }, []);

  useEffect(() => {
    return () => {
      stopAudio();
    };
  }, [stopAudio]);

  const playAudio = useCallback(
    async (
      text: string,
      index: number | string,
      options: UseAudioPlayerOptions = {}
    ) => {
      const cleanText = text.replace(/\[.*?\]|\(.*?\)/g, "").trim();
      if (!cleanText) return;

      const voice = options.voice || defaultOptions.voice || TTS_VOICES.INDAH;
      const rate = options.rate || defaultOptions.rate || 1;
      const rateStr = rate === 1 ? "medium" : (rate > 1 ? `+${Math.round((rate - 1) * 100)}%` : `${Math.round((rate - 1) * 100)}%`);

      // Jika tombol sama diklik saat sedang me-play, lakukan stop audio (toggle)
      if (playingIndex === index) {
        stopAudio();
        return;
      }

      stopAudio();
      setPlayingIndex(index);

      try {
        const audioUrl = await fetchTTSAudio(cleanText, voice, rateStr);
        if (audioUrl) {
          objectUrlRef.current = audioUrl;
          const audio = new Audio(audioUrl);
          audioRef.current = audio;
          audio.playbackRate = rate;

          audio.onended = () => {
            setPlayingIndex(null);
            audioRef.current = null;
            if (objectUrlRef.current === audioUrl) {
              URL.revokeObjectURL(audioUrl);
              objectUrlRef.current = null;
            }
          };

          audio.onerror = () => {
            if (objectUrlRef.current === audioUrl) {
              URL.revokeObjectURL(audioUrl);
              objectUrlRef.current = null;
            }
            // Audio element error, trigger fallback
            cancelSpeechRef.current = speakWithWebSpeech(
              cleanText,
              voice,
              rate,
              () => setPlayingIndex(null),
              () => setPlayingIndex(null)
            );
          };

          await audio.play();
          return;
        }

        // URL null / fetch miss -> fallback Web Speech
        cancelSpeechRef.current = speakWithWebSpeech(
          cleanText,
          voice,
          rate,
          () => setPlayingIndex(null),
          () => setPlayingIndex(null)
        );
      } catch {
        // Exception during fetch or play -> fallback Web Speech
        cancelSpeechRef.current = speakWithWebSpeech(
          cleanText,
          voice,
          rate,
          () => setPlayingIndex(null),
          () => setPlayingIndex(null)
        );
      }
    },
    [defaultOptions.rate, defaultOptions.voice, playingIndex, stopAudio]
  );

  return {
    playingIndex,
    playAudio,
    stopAudio,
    isPlaying: (index: number | string) => playingIndex === index,
  };
}
