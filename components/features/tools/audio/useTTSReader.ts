import { useState, useEffect, useRef } from "react";

/**
 * @file useTTSReader.ts
 * @description Hook untuk membacakan teks Jepang. 
 * Menggunakan strategi Hybrid: Mengutamakan High-Quality Online Browser Voices, 
 * lalu fallback ke Google Translate TTS API untuk kualitas tinggi tanpa beban storage/cost.
 */

export function useTTSReader(text: string) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasJapanese, setHasJapanese] = useState(true);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const jpRegex = /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/;
    setHasJapanese(jpRegex.test(text));
  }, [text]);

  useEffect(() => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;

    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      setVoices(availableVoices);
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;

    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, []);

  /**
   * Menjalankan pemutaran suara.
   * Strategi:
   * 1. Cek apakah ada suara "Google 日本語" atau "Microsoft Nanami" (Online & High Quality).
   * 2. Jika tidak ada, gunakan Fallback URL (Google Translate TTS) via HTMLAudioElement.
   * 3. Jika gagal, gunakan suara OS standar.
   */
  const speak = (forceProxy = false) => {
    if (typeof window === "undefined") return;

    if (isPlaying) {
      window.speechSynthesis.cancel();
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      setIsPlaying(false);
      return;
    }

    const currentVoices = voices.length > 0 ? voices : window.speechSynthesis.getVoices();
    
    // Cari suara Jepang yang berkualitas tinggi (biasanya yang bertipe 'online')
    const premiumJPVoice = currentVoices.find(
      (v) => (v.lang === "ja-JP" || v.lang.includes("ja")) && 
             (v.name.includes("Google") || v.name.includes("Natural") || v.name.includes("Online"))
    );

    // JIKA: Dipaksa menggunakan proxy atau tidak ada suara premium di browser
    if (forceProxy || !premiumJPVoice) {
      // Menggunakan Google Translate TTS (Client-side only, 0 storage, 0 cost)
      const proxyUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(text)}&tl=ja&client=tw-ob`;
      
      if (!audioRef.current) {
        audioRef.current = new Audio();
      }
      
      audioRef.current.src = proxyUrl;
      audioRef.current.onplay = () => setIsPlaying(true);
      audioRef.current.onended = () => setIsPlaying(false);
      audioRef.current.onerror = () => {
        console.warn("Proxy TTS gagal, mencoba fallback ke OS voice.");
        playNativeTTS(text, null); // Fallback terakhir ke OS
      };
      
      audioRef.current.play().catch(() => playNativeTTS(text, null));
      return;
    }

    // JIKA: Ada suara premium di browser
    playNativeTTS(text, premiumJPVoice);
  };

  const playNativeTTS = (txt: string, voice: SpeechSynthesisVoice | null) => {
    const utterance = new SpeechSynthesisUtterance(txt);
    utterance.lang = "ja-JP";
    utterance.rate = 0.9; // Sedikit lebih lambat untuk pembelajar

    if (voice) {
      utterance.voice = voice;
    } else {
      // Fallback cari suara Jepang apa saja
      const anyJPVoice = voices.find(v => v.lang === "ja-JP" || v.lang.includes("ja"));
      if (anyJPVoice) utterance.voice = anyJPVoice;
    }

    utterance.onstart = () => setIsPlaying(true);
    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = () => setIsPlaying(false);

    window.speechSynthesis.speak(utterance);
  };

  return { isPlaying, hasJapanese, speak };
}

