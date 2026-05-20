import { useState, useEffect, useRef } from "react";

/**
 * @file useTTSReader.ts
 * @description Hook untuk membacakan teks Jepang. 
 * Menggunakan strategi Hybrid & Caching: Mengutamakan High-Quality Online Browser Voices, 
 * lalu fallback ke Google Translate TTS API dengan penyimpanan CacheStorage lokal untuk luring penuh.
 */

export function useTTSReader(text: string) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasJapanese, setHasJapanese] = useState(true);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const objectUrlRef = useRef<string | null>(null);

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
    if (typeof window === "undefined" || !window.speechSynthesis) return;

    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      requestAnimationFrame(() => {
        setVoices(availableVoices);
      });
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;

    return () => {
      window.speechSynthesis.onvoiceschanged = null;
      cleanupObjectUrl();
    };
  }, []);

  /**
   * Menjalankan pemutaran suara.
   * Strategi:
   * 1. Cek apakah ada suara "Google 日本語" atau "Microsoft Nanami" (Online & High Quality).
   * 2. Jika tidak ada, gunakan Fallback URL (Google Translate TTS) via HTMLAudioElement dengan Cache Storage.
   * 3. Jika gagal/offline tanpa cache, gunakan suara OS standar.
   */
  const speak = (forceProxy = false) => {
    if (typeof window === "undefined") return;

    if (isPlaying) {
      window.speechSynthesis.cancel();
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      cleanupObjectUrl();
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
      const GOOGLE_TTS_URL = "https://translate.google.com/translate_tts?ie=UTF-8&tl=ja&client=tw-ob&q=";
      const proxyUrl = `${GOOGLE_TTS_URL}${encodeURIComponent(text)}`;
      
      if (!audioRef.current) {
        audioRef.current = new Audio();
      }
      
      const audio = audioRef.current;
      audio.onplay = () => setIsPlaying(true);
      audio.onended = () => {
        setIsPlaying(false);
        cleanupObjectUrl();
      };
      audio.onerror = (e) => {
        console.error("Proxy TTS Error:", e);
        setIsPlaying(false);
        cleanupObjectUrl();
        playNativeTTS(text, null); 
      };

      const cacheName = "nihongoroute_tts_cache";

      const playFromBlob = (blob: Blob) => {
        cleanupObjectUrl();
        const objUrl = URL.createObjectURL(blob);
        objectUrlRef.current = objUrl;
        audio.src = objUrl;
        
        const playPromise = audio.play();
        if (playPromise !== undefined) {
          playPromise.catch(error => {
            console.warn("Cached audio playback blocked:", error);
            playNativeTTS(text, null);
          });
        }
      };

      const fetchAndCache = async () => {
        try {
          const response = await fetch(proxyUrl);
          if (!response.ok) throw new Error("Gagal mengambil audio");
          
          const clonedResponse = response.clone();
          const blob = await response.blob();
          
          if ("caches" in window) {
            caches.open(cacheName).then((cache) => {
              cache.put(proxyUrl, clonedResponse).catch(err => {
                console.warn("Gagal menyimpan ke cache:", err);
              });
            });
          }
          
          playFromBlob(blob);
        } catch (err) {
          console.warn("Fetch online failed, trying native TTS fallback:", err);
          playNativeTTS(text, null);
        }
      };

      // Cek apakah data audio sudah tersimpan di Cache Storage
      if ("caches" in window) {
        caches.open(cacheName).then((cache) => {
          cache.match(proxyUrl).then((cachedResponse) => {
            if (cachedResponse) {
              cachedResponse.blob().then((blob) => {
                playFromBlob(blob);
              }).catch(() => {
                fetchAndCache();
              });
            } else {
              fetchAndCache();
            }
          }).catch(() => {
            fetchAndCache();
          });
        }).catch(() => {
          fetchAndCache();
        });
      } else {
        fetchAndCache();
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

