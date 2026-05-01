import { useState, useEffect } from "react";

export function useTTSReader(text: string) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasJapanese, setHasJapanese] = useState(true);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);

  useEffect(() => {
    const jpRegex = /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/;
    setHasJapanese(jpRegex.test(text));
  }, [text]);

  useEffect(() => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;

    const loadVoices = () => {
      setVoices(window.speechSynthesis.getVoices());
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;

    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, []);

  const speak = () => {
    if (typeof window === "undefined" || !window.speechSynthesis) {
      return alert("Maaf, browser kamu tidak mendukung fitur audio.");
    }

    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "ja-JP";
    utterance.rate = 0.85;

    const currentVoices =
      voices.length > 0 ? voices : window.speechSynthesis.getVoices();

    const jpVoice = currentVoices.find(
      (voice) =>
        voice.lang === "ja-JP" ||
        voice.lang.includes("ja") ||
        voice.name.includes("Japanese")
    );

    if (jpVoice) {
      utterance.voice = jpVoice;
    }

    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = () => setIsPlaying(false);

    setIsPlaying(true);
    window.speechSynthesis.speak(utterance);
  };

  return { isPlaying, hasJapanese, speak };
}
