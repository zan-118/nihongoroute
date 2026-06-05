/**
 * @file ReadingArticle.tsx
 * @description Komponen untuk menampilkan isi artikel bacaan terpandu dengan dukungan furigana,
 * terjemahan paragraf, progress scroll indicator, TTS per-paragraf, dan tombol penyelesaian.
 */

import { m, AnimatePresence, useScroll, useSpring } from "framer-motion";
import { useRef, useState, useCallback, useEffect } from "react";
import FuriganaDisplay from "@/components/ui/FuriganaDisplay";
import { Sparkles, Volume2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { fetchTTSAudio, TTS_VOICES } from "@/lib/tts";

// ── Tipe ─────────────────────────────────────────────────────
interface ReadingArticleProps {
  paragraphs: string[];
  hiraganaParagraphs: string[];
  romajiParagraphs: string[];
  translationParagraphs: string[];
  mode: "kanji" | "furigana" | "romaji" | "hiragana";
  fontSize: "standard" | "large" | "extra";
  showTranslation: boolean;
  isZenMode: boolean;
  onComplete?: () => void;
  isCompleted?: boolean;
}

/**
 * Hook internal untuk mengelola TTS (Text to Speech) per paragraf.
 * Mengkoordinasikan pemutaran agar tidak terjadi collision (pemutaran ganda)
 * dengan pemutar audio utama atau pemutar TTS lainnya di aplikasi.
 */
function useParagraphTTS() {
  const [speakingIdx, setSpeakingIdx] = useState(-1);
  const [loadingIdx,  setLoadingIdx]  = useState(-1);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const isSelfPlayingRef = useRef(false);

  const stop = useCallback(() => {
    if (audioRef.current) { 
      audioRef.current.pause(); 
      audioRef.current.src = ""; 
    }
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setSpeakingIdx(-1);
    setLoadingIdx(-1);
  }, []);

  // Sinkronisasi event-driven: matikan audio jika pemutar audio lain aktif
  useEffect(() => {
    const handlePause = () => {
      if (isSelfPlayingRef.current) {
        isSelfPlayingRef.current = false;
        return;
      }
      stop();
    };
    window.addEventListener("nihongoroute_pause_line_tts", handlePause);
    return () => {
      window.removeEventListener("nihongoroute_pause_line_tts", handlePause);
    };
  }, [stop]);

  // Efek pembersihan saat komponen unmount
  useEffect(() => {
    const audio = audioRef.current;
    return () => {
      audio?.pause();
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const speak = useCallback(async (text: string, idx: number) => {
    // Toggle stop jika baris/paragraf yang sama diklik ulang
    if (speakingIdx === idx || loadingIdx === idx) { stop(); return; }

    // Hentikan pemutar audio utama (native) & infokan pemutar lain
    window.dispatchEvent(new CustomEvent("nihongoroute_pause_native_audio"));
    isSelfPlayingRef.current = true;
    window.dispatchEvent(new CustomEvent("nihongoroute_pause_line_tts"));

    stop();
    setLoadingIdx(idx);

    const url = await fetchTTSAudio(text, TTS_VOICES.ZUNDAMON, "medium");

    if (url) {
      if (!audioRef.current) audioRef.current = new Audio();
      const audio = audioRef.current;
      audio.src   = url;

      audio.oncanplay = () => { setLoadingIdx(-1); setSpeakingIdx(idx); };
      audio.onended   = () => { setSpeakingIdx(-1); };
      audio.onerror   = () => { setLoadingIdx(-1); setSpeakingIdx(-1); };

      audio.play().catch(() => { setLoadingIdx(-1); });
    } else {
      // Fallback Web Speech API
      setLoadingIdx(-1);
      setSpeakingIdx(idx);
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
        const utt = new SpeechSynthesisUtterance(text);
        utt.lang = "ja-JP";
        utt.onend   = () => setSpeakingIdx(-1);
        utt.onerror = () => setSpeakingIdx(-1);
        window.speechSynthesis.speak(utt);
      }
    }
  }, [speakingIdx, loadingIdx, stop]);

  return { speakingIdx, loadingIdx, speak, stop };
}

// ── Komponen utama ────────────────────────────────────────────
export function ReadingArticle({
  paragraphs,
  hiraganaParagraphs,
  romajiParagraphs,
  translationParagraphs,
  mode,
  fontSize,
  showTranslation,
  isZenMode,
  onComplete,
  isCompleted = false,
}: ReadingArticleProps) {

  const fontSizeClasses = {
    standard: "text-xl md:text-2xl",
    large:    "text-2xl md:text-4xl",
    extra:    "text-4xl md:text-5xl",
  };

  // Scroll progress indicator
  const articleRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: articleRef,
    offset: ["start start", "end end"],
  });
  const scaleX = useSpring(scrollYProgress, { stiffness: 200, damping: 30 });

  // TTS per-paragraf
  const { speakingIdx, loadingIdx, speak } = useParagraphTTS();

  return (
    <m.article
      ref={articleRef}
      layout
      className={cn(
        "p-4 sm:p-8 md:p-16 lg:p-24 rounded-2xl sm:rounded-[2.5rem] md:rounded-[3rem] transition-all duration-700 relative",
        isZenMode
          ? "bg-transparent shadow-none border-none"
          : "bg-card/60 backdrop-blur-3xl border border-border/60 shadow-[0_40px_100px_-20px_rgba(var(--background-rgb),0.2)]"
      )}
    >
      {/* Scroll progress bar */}
      {!isZenMode && (
        <m.div
          style={{ scaleX, transformOrigin: "left" }}
          className="absolute top-0 left-0 right-0 h-[2px] bg-primary rounded-t-2xl sm:rounded-t-[2.5rem] md:rounded-t-[3rem]"
        />
      )}
      <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-transparent via-primary/20 to-transparent opacity-50" />

      {/* Paragraf */}
      <div className="space-y-16 relative z-10">
        {paragraphs.map((para, idx) => {
          const isSpeaking = speakingIdx === idx;
          const isLoading  = loadingIdx  === idx;

          return (
            <div key={`para-${idx}`} className="group/para relative">
              {/* Tombol TTS per paragraf — muncul saat hover */}
              <button
                type="button"
                onClick={() => speak(para, idx)}
                aria-label={isSpeaking ? "Hentikan bacaan" : "Dengarkan paragraf ini"}
                title={isSpeaking ? "Hentikan" : "Dengarkan dengan AI Voice"}
                className={cn(
                  "absolute -left-6 sm:-left-8 md:-left-10 top-1 p-1.5 rounded-xl transition-all duration-200",
                  "opacity-0 group-hover/para:opacity-100 focus:opacity-100",
                  isSpeaking
                    ? "opacity-100 text-success bg-success/10 border border-success/30"
                    : isLoading
                      ? "opacity-100 text-muted-foreground cursor-wait"
                      : "text-muted-foreground/40 hover:text-primary hover:bg-primary/10"
                )}
              >
                {isLoading
                  ? <Loader2 size={14} className="animate-spin" />
                  : <Volume2 size={14} className={cn(isSpeaking && "animate-pulse")} />
                }
              </button>

              <FuriganaDisplay
                text={para}
                furigana={hiraganaParagraphs[idx] || ""}
                romaji={romajiParagraphs[idx]}
                mode={mode}
                size="medium"
                interactive={true}
                className={cn(
                  "transition-all duration-500",
                  fontSizeClasses[fontSize]
                )}
              />

              <AnimatePresence>
                {showTranslation && (
                  <m.p
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 5 }}
                    className="mt-6 text-base md:text-lg text-muted-foreground italic font-medium leading-relaxed border-l-2 border-primary/30 pl-6"
                  >
                    {translationParagraphs[idx]}
                  </m.p>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      {/* Footer artikel */}
      {!isZenMode && (
        <div className="mt-24 pt-12 border-t border-border/40 flex flex-col items-center gap-8">
          <div className="flex items-center gap-4 w-full max-w-xs">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground/30 shrink-0">終わり</span>
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
          </div>
          <div className="flex items-center gap-4">
            <Sparkles size={20} className="text-warning animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">
              Selesaikan Bacaan Untuk XP
            </span>
          </div>
          <Button
            onClick={onComplete}
            disabled={isCompleted}
            className={cn(
              "px-16 py-8 h-auto rounded-2xl text-xs font-black uppercase tracking-[0.3em] transition-all duration-300",
              isCompleted
                ? "bg-success/10 border border-success/30 text-success cursor-default"
                : "bg-primary text-primary-foreground shadow-[0_20px_50px_-10px_rgba(var(--primary-rgb),0.4)] hover:shadow-[0_20px_70px_-10px_rgba(var(--primary-rgb),0.6)] hover:scale-105 active:scale-95"
            )}
          >
            {isCompleted ? "Sudah Selesai ✓" : "Tandai Selesai"}
          </Button>
        </div>
      )}
    </m.article>
  );
}
