/**
 * @file DownloadOfflineButton.tsx
 * @description Tombol interaktif berdesain Cyber-Glass untuk mengunduh seluruh aset pelajaran (audio skenario, audio bacaan, TTS kosakata, dan SVG KanjiVG) ke cache lokal peramban secara offline-first.
 */

"use client";

// ======================
// IMPOR
// ======================
import React, { useState, useEffect, useCallback } from "react";
import { Download, Loader2, CheckCircle2, CloudLightning } from "lucide-react";
import { sounds } from "@/lib/audio";
import { cn } from "@/lib/utils";

// ======================
// ANTARMUKA / TIPE DATA
// ======================
interface LessonAudioItem {
  audioUrl?: string;
  audio_url?: string;
}

interface LessonVocabItem {
  vocab?: string;
  japanese?: string;
  word?: string;
}

interface LessonKanjiItem {
  kanji?: string;
  character?: string;
}

export interface LessonData {
  listeningList?: unknown[];
  listening_list?: unknown[];
  readingList?: unknown[];
  reading_list?: unknown[];
  vocabList?: unknown[];
  vocab_list?: unknown[];
  kanjiList?: unknown[];
  kanji_list?: unknown[];
}

interface DownloadOfflineButtonProps {
  lesson: LessonData;
}

// ======================
// EKSEKUSI UTAMA
// ======================
export default function DownloadOfflineButton({ lesson }: DownloadOfflineButtonProps) {
  const [status, setStatus] = useState<"idle" | "downloading" | "completed" | "error">("idle");
  const [progress, setProgress] = useState(0);

  // Cari aset yang bisa di-cache dalam lesson
  const getAssetUrls = useCallback(() => {
    const audioUrls: string[] = [];
    const ttsWords: string[] = [];
    const kanjiChars: string[] = [];

    // 1. Audio percakapan (listeningList / listening_list)
    const listeningItems = (lesson?.listeningList || lesson?.listening_list || []) as LessonAudioItem[];
    listeningItems.forEach((item: LessonAudioItem) => {
      const url = item?.audioUrl || item?.audio_url;
      if (url && typeof url === "string") audioUrls.push(url);
    });

    // 2. Audio bacaan (readingList / reading_list)
    const readingItems = (lesson?.readingList || lesson?.reading_list || []) as LessonAudioItem[];
    readingItems.forEach((item: LessonAudioItem) => {
      const url = item?.audioUrl || item?.audio_url;
      if (url && typeof url === "string") audioUrls.push(url);
    });

    // 3. Kata kosa kata untuk TTS caching (vocabList / vocab_list)
    const vocabItems = (lesson?.vocabList || lesson?.vocab_list || []) as LessonVocabItem[];
    vocabItems.forEach((item: LessonVocabItem) => {
      const word = item?.vocab || item?.japanese || item?.word;
      if (word && typeof word === "string") {
        ttsWords.push(word);
      }
    });

    // 4. Huruf Kanji untuk latihan menulis canvas (kanjiList / kanji_list)
    const kanjiItems = (lesson?.kanjiList || lesson?.kanji_list || []) as LessonKanjiItem[];
    kanjiItems.forEach((item: LessonKanjiItem) => {
      const char = item?.kanji || item?.character;
      if (char && typeof char === "string") {
        kanjiChars.push(char.charAt(0));
      }
    });

    return { audioUrls, ttsWords, kanjiChars };
  }, [lesson]);

  // Cek pada mount apakah berkas utama sudah ada di cache
  useEffect(() => {
    if (typeof window === "undefined" || !lesson) return;

    const checkCacheStatus = async () => {
      try {
        const { audioUrls, ttsWords, kanjiChars } = getAssetUrls();
        if (audioUrls.length === 0 && ttsWords.length === 0 && kanjiChars.length === 0) {
          return;
        }

        const audioCache = await caches.open("nihongoroute_audio_cache");
        const ttsCache = await caches.open("nihongoroute_tts_cache");
        const kanjiCache = await caches.open("nihongoroute_kanjivg_cache");

        let allCached = true;

        // Cek audio
        for (const url of audioUrls) {
          const match = await audioCache.match(url);
          if (!match) {
            allCached = false;
            break;
          }
        }

        // Cek TTS jika audio masih penuh
        if (allCached) {
          for (const word of ttsWords) {
            const params = new URLSearchParams({ text: word, voice: "indah", rate: "medium" });
            const ttsUrl = `/api/tts?${params.toString()}`;
            const match = await ttsCache.match(ttsUrl);
            if (!match) {
              allCached = false;
              break;
            }
          }
        }

        // Cek KanjiVG SVG
        if (allCached) {
          for (const char of kanjiChars) {
            const code = char.charCodeAt(0).toString(16).padStart(5, "0");
            const kanjivgUrl = `https://raw.githubusercontent.com/KanjiVG/kanjivg/master/kanji/${code}.svg`;
            const match = await kanjiCache.match(kanjivgUrl);
            if (!match) {
              allCached = false;
              break;
            }
          }
        }

        if (allCached) {
          setStatus("completed");
          setProgress(100);
        }
      } catch (err) {
        console.warn("Gagal memeriksa cache luring:", err);
      }
    };

    checkCacheStatus();
  }, [lesson, getAssetUrls]);

  const handleDownload = async () => {
    if (status === "downloading" || status === "completed") return;

    sounds?.playPop();
    setStatus("downloading");
    setProgress(0);

    try {
      const { audioUrls, ttsWords, kanjiChars } = getAssetUrls();
      const totalItems = audioUrls.length + ttsWords.length + kanjiChars.length;

      if (totalItems === 0) {
        setStatus("completed");
        setProgress(100);
        return;
      }

      let completedItems = 0;

      const updateProgress = () => {
        completedItems++;
        setProgress(Math.min(Math.round((completedItems / totalItems) * 100), 100));
      };

      // 1. Buka seluruh cache storage
      const audioCache = await caches.open("nihongoroute_audio_cache");
      const ttsCache = await caches.open("nihongoroute_tts_cache");
      const kanjiCache = await caches.open("nihongoroute_kanjivg_cache");

      // 2. Unduh dan cache audio asli
      const audioPromises = audioUrls.map(async (url) => {
        try {
          const match = await audioCache.match(url);
          if (!match) {
            const res = await fetch(url);
            if (res.ok) await audioCache.put(url, res);
          }
        } catch (e) {
          console.warn("Gagal pre-cache audio:", url, e);
        } finally {
          updateProgress();
        }
      });

      // 3. Unduh dan cache TTS pelafalan
      const ttsPromises = ttsWords.map(async (word) => {
        const params = new URLSearchParams({ text: word, voice: "indah", rate: "medium" });
        const ttsUrl = `/api/tts?${params.toString()}`;
        try {
          const match = await ttsCache.match(ttsUrl);
          if (!match) {
            const res = await fetch(ttsUrl);
            if (res.ok) await ttsCache.put(ttsUrl, res);
          }
        } catch (e) {
          console.warn("Gagal pre-cache TTS:", word, e);
        } finally {
          updateProgress();
        }
      });

      // 4. Unduh dan cache KanjiVG SVG
      const kanjiPromises = kanjiChars.map(async (char) => {
        const code = char.charCodeAt(0).toString(16).padStart(5, "0");
        const kanjivgUrl = `https://raw.githubusercontent.com/KanjiVG/kanjivg/master/kanji/${code}.svg`;
        try {
          const match = await kanjiCache.match(kanjivgUrl);
          if (!match) {
            const res = await fetch(kanjivgUrl);
            if (res.ok) await kanjiCache.put(kanjivgUrl, res);
          }
        } catch (e) {
          console.warn("Gagal pre-cache Kanji SVG:", char, e);
        } finally {
          updateProgress();
        }
      });

      // Jalankan seluruh unduhan secara paralel dengan pembatasan
      await Promise.all([...audioPromises, ...ttsPromises, ...kanjiPromises]);

      // 5. Sukses
      setStatus("completed");
      setProgress(100);
      sounds?.playSuccess();
      if ("vibrate" in navigator) {
        navigator.vibrate([10, 50, 10]);
      }
    } catch (err) {
      console.error("Gagal mengunduh aset luring bab:", err);
      setStatus("error");
      sounds?.playError();
    }
  };

  return (
    <button type="button"
      onClick={handleDownload}
      disabled={status === "downloading"}
      aria-label={
        status === "completed"
          ? "Pelajaran siap diakses luring"
          : status === "downloading"
          ? `Mengunduh aset kelas... ${progress}%`
          : "Unduh materi untuk luring"
      }
      className={cn(
        "relative overflow-hidden flex items-center justify-center gap-3 px-6 py-3 rounded-full text-xs font-black uppercase tracking-widest transition-all duration-500",
        "border  bg-card/40 border-border shadow-[0_0_20px_rgb(var(--primary-rgb)/0.02)] active:scale-95",
        status === "completed" && "bg-[rgb(var(--success-rgb)/0.1)] border-[rgb(var(--success-rgb)/0.3)] text-success shadow-[0_0_25px_rgb(var(--success-rgb)/0.1)] cursor-default active:scale-100",
        status === "downloading" && "border-[rgb(var(--primary-rgb)/0.4)] text-primary cursor-default shadow-[0_0_25px_rgb(var(--primary-rgb)/0.15)]",
        status === "error" && "border-[rgb(var(--destructive-rgb)/0.3)] text-destructive bg-[rgb(var(--destructive-rgb)/0.05)] hover:bg-[rgb(var(--destructive-rgb)/0.1)]"
      )}
    >
      {/* Efek Pendar Latar Belakang Pemuat Visual */}
      {status === "downloading" && (
        <div 
          className="absolute inset-0 transition-all duration-300 self-start h-full" 
          style={{ width: `${progress}%`, backgroundColor: "rgb(var(--primary-rgb)/0.05)" }}
        />
      )}

      {/* Render Ikon & Keterangan teks berdasarkan state */}
      {status === "idle" && (
        <>
          <Download size={14} className="animate-premium-bounce" />
          <span>Simpan Bab Luring</span>
        </>
      )}

      {status === "downloading" && (
        <>
          <Loader2 size={14} className="animate-spin text-primary" />
          <span className="font-mono">{progress}% Mengunduh…</span>
        </>
      )}

      {status === "completed" && (
        <>
          <CheckCircle2 size={14} className="text-success animate-in zoom-in duration-300" />
          <span className="flex items-center gap-1.5">
            Luring Aktif
            <CloudLightning size={12} className="animate-pulse" />
          </span>
        </>
      )}

      {status === "error" && (
        <>
          <Download size={14} />
          <span>Gagal, Coba Lagi</span>
        </>
      )}
    </button>
  );
}
