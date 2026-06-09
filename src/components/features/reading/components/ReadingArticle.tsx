/**
 * @file ReadingArticle.tsx
 * @description Guided reading article with furigana, translations, scroll progress, paragraph TTS, and completion action.
 */

import { AnimatePresence, m, useScroll, useSpring } from "framer-motion";
import { memo, useCallback, useEffect, useRef, useState } from "react";
import FuriganaDisplay from "@/components/ui/FuriganaDisplay";
import { Loader2, Sparkles, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { fetchTTSAudio, TTS_VOICES } from "@/lib/tts";

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

const FONT_SIZE_CLASSES = {
  standard: "text-xl md:text-2xl",
  large: "text-2xl md:text-4xl",
  extra: "text-4xl md:text-5xl",
} as const;

function useParagraphTTS() {
  const [speakingIdx, setSpeakingIdx] = useState(-1);
  const [loadingIdx, setLoadingIdx] = useState(-1);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const isSelfPlayingRef = useRef(false);
  const speakingIdxRef = useRef(-1);
  const loadingIdxRef = useRef(-1);
  const requestIdRef = useRef(0);

  const updateSpeakingIdx = useCallback((idx: number) => {
    speakingIdxRef.current = idx;
    setSpeakingIdx(idx);
  }, []);

  const updateLoadingIdx = useCallback((idx: number) => {
    loadingIdxRef.current = idx;
    setLoadingIdx(idx);
  }, []);

  const stop = useCallback(() => {
    requestIdRef.current += 1;

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
    }

    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }

    updateSpeakingIdx(-1);
    updateLoadingIdx(-1);
  }, [updateLoadingIdx, updateSpeakingIdx]);

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

  useEffect(() => {
    return () => {
      requestIdRef.current += 1;
      audioRef.current?.pause();
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, [stop]);

  const speak = useCallback(
    async (text: string, idx: number) => {
      if (speakingIdxRef.current === idx || loadingIdxRef.current === idx) {
        stop();
        return;
      }

      window.dispatchEvent(new CustomEvent("nihongoroute_pause_native_audio"));
      isSelfPlayingRef.current = true;
      window.dispatchEvent(new CustomEvent("nihongoroute_pause_line_tts"));

      stop();
      const requestId = requestIdRef.current + 1;
      requestIdRef.current = requestId;
      updateLoadingIdx(idx);

      const url = await fetchTTSAudio(text, TTS_VOICES.ZUNDAMON, "medium");
      if (requestId !== requestIdRef.current) return;

      if (url) {
        if (!audioRef.current) audioRef.current = new Audio();
        const audio = audioRef.current;
        audio.src = url;

        audio.oncanplay = () => {
          if (requestId !== requestIdRef.current) return;
          updateLoadingIdx(-1);
          updateSpeakingIdx(idx);
        };
        audio.onended = () => updateSpeakingIdx(-1);
        audio.onerror = () => {
          updateLoadingIdx(-1);
          updateSpeakingIdx(-1);
        };

        audio.play().catch(() => updateLoadingIdx(-1));
        return;
      }

      updateLoadingIdx(-1);
      updateSpeakingIdx(idx);
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = "ja-JP";
        utterance.onend = () => updateSpeakingIdx(-1);
        utterance.onerror = () => updateSpeakingIdx(-1);
        window.speechSynthesis.speak(utterance);
      }
    },
    [stop, updateLoadingIdx, updateSpeakingIdx],
  );

  return { loadingIdx, speak, speakingIdx };
}

interface ReadingParagraphProps {
  idx: number;
  para: string;
  hiragana: string;
  romaji?: string;
  translation?: string;
  mode: ReadingArticleProps["mode"];
  fontSize: ReadingArticleProps["fontSize"];
  showTranslation: boolean;
  isSpeaking: boolean;
  isLoading: boolean;
  onSpeak: (text: string, idx: number) => void;
}

const ReadingParagraph = memo(function ReadingParagraph({
  idx,
  para,
  hiragana,
  romaji,
  translation,
  mode,
  fontSize,
  showTranslation,
  isSpeaking,
  isLoading,
  onSpeak,
}: ReadingParagraphProps) {
  return (
    <div className="group/para relative">
      <button
        type="button"
        onClick={() => onSpeak(para, idx)}
        aria-label={isSpeaking ? "Hentikan bacaan" : "Dengarkan paragraf ini"}
        title={isSpeaking ? "Hentikan" : "Dengarkan dengan AI Voice"}
        className={cn(
          "absolute -left-6 sm:-left-8 md:-left-10 top-1 p-1.5 rounded-xl transition-all duration-200",
          "opacity-0 group-hover/para:opacity-100 focus:opacity-100",
          isSpeaking
            ? "opacity-100 text-success bg-success/10 border border-success/30"
            : isLoading
              ? "opacity-100 text-muted-foreground cursor-wait"
              : "text-muted-foreground/40 hover:text-primary hover:bg-primary/10",
        )}
      >
        {isLoading ? (
          <Loader2 size={14} className="animate-spin" />
        ) : (
          <Volume2 size={14} className={cn(isSpeaking && "animate-pulse")} />
        )}
      </button>

      <FuriganaDisplay
        text={para}
        furigana={hiragana}
        romaji={romaji}
        mode={mode}
        size="medium"
        interactive={true}
        className={cn("transition-all duration-300", FONT_SIZE_CLASSES[fontSize])}
      />

      <AnimatePresence>
        {showTranslation && (
          <m.p
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
            className="mt-6 text-base md:text-lg text-muted-foreground italic font-medium leading-relaxed border-l-2 border-primary/30 pl-6"
          >
            {translation}
          </m.p>
        )}
      </AnimatePresence>
    </div>
  );
});

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
  const articleRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: articleRef,
    offset: ["start start", "end end"],
  });
  const scaleX = useSpring(scrollYProgress, { damping: 30, stiffness: 200 });
  const { speakingIdx, loadingIdx, speak } = useParagraphTTS();

  return (
    <m.article
      ref={articleRef}
      className={cn(
        "p-4 sm:p-8 md:p-16 lg:p-24 rounded-2xl sm:rounded-[2.5rem] md:rounded-[3rem] transition-all duration-300 relative",
        isZenMode
          ? "bg-transparent shadow-none border-none"
          : "bg-card/75 backdrop-blur-md border border-border/60 shadow-[0_24px_70px_-30px_rgb(var(--background-rgb)/0.25)]",
      )}
    >
      {!isZenMode && (
        <m.div
          style={{ scaleX, transformOrigin: "left" }}
          className="absolute top-0 left-0 right-0 h-[2px] bg-primary rounded-t-2xl sm:rounded-t-[2.5rem] md:rounded-t-[3rem]"
        />
      )}
      <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-transparent via-primary/20 to-transparent opacity-50" />

      <div className="space-y-16 relative z-10">
        {paragraphs.map((para, idx) => (
          <ReadingParagraph
            key={`para-${idx}-${para.slice(0, 16)}`}
            idx={idx}
            para={para}
            hiragana={hiraganaParagraphs[idx] || ""}
            romaji={romajiParagraphs[idx]}
            translation={translationParagraphs[idx]}
            mode={mode}
            fontSize={fontSize}
            showTranslation={showTranslation}
            isSpeaking={speakingIdx === idx}
            isLoading={loadingIdx === idx}
            onSpeak={speak}
          />
        ))}
      </div>

      {!isZenMode && (
        <div className="mt-24 pt-12 border-t border-border/40 flex flex-col items-center gap-8">
          <div className="flex items-center gap-4 w-full max-w-xs">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground/30 shrink-0">
              終わり
            </span>
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
                : "bg-primary text-primary-foreground shadow-[0_20px_50px_-10px_rgb(var(--primary-rgb)/0.4)] hover:shadow-[0_20px_70px_-10px_rgb(var(--primary-rgb)/0.6)] hover:scale-105 active:scale-95",
            )}
          >
            {isCompleted ? "Sudah Selesai ✓" : "Tandai Selesai"}
          </Button>
        </div>
      )}
    </m.article>
  );
}
