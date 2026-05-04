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
    
    // Cari suara Jepang yang berkualitas tinggi
    const premiumJPVoice = currentVoices.find(
      (v) => (v.lang === "ja-JP" || v.lang.includes("ja")) && 
             (v.name.includes("Google") || v.name.includes("Natural") || v.name.includes("Online"))
    );

    // RESET: Pastikan tidak ada antrian suara yang macet
    window.speechSynthesis.cancel();

    // JIKA: Dipaksa menggunakan proxy atau tidak ada suara premium di browser
    if (forceProxy || !premiumJPVoice) {
      const proxyUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(text)}&tl=ja&client=tw-ob`;
      
      if (!audioRef.current) {
        audioRef.current = new Audio();
      }
      
      audioRef.current.src = proxyUrl;
      audioRef.current.onplay = () => setIsPlaying(true);
      audioRef.current.onended = () => setIsPlaying(false);
      audioRef.current.onerror = (e) => {
        console.error("Proxy TTS Error:", e);
        setIsPlaying(false);
        playNativeTTS(text, null); 
      };
      
      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          console.warn("Autoplay/Proxy blocked:", error);
          playNativeTTS(text, null);
        });
      }
      return;
    }

    playNativeTTS(text, premiumJPVoice);
  };

  const playNativeTTS = (txt: string, voice: SpeechSynthesisVoice | null) => {
    window.speechSynthesis.cancel(); // Bersihkan antrian lagi
    const utterance = new SpeechSynthesisUtterance(txt);
    utterance.lang = "ja-JP";
    utterance.rate = 0.9;

    if (voice) {
      utterance.voice = voice;
    } else {
      const anyJPVoice = voices.find(v => v.lang === "ja-JP" || v.lang.includes("ja"));
      if (anyJPVoice) utterance.voice = anyJPVoice;
    }

    utterance.onstart = () => setIsPlaying(true);
    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = (e) => {
      console.error("Native TTS Error:", e);
      setIsPlaying(false);
    };

    window.speechSynthesis.speak(utterance);
  };

  return { isPlaying, hasJapanese, speak };
}

