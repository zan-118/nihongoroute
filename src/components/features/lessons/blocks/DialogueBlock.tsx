import React from "react";
import { ContentBlock } from "@/types/database";
import { SmartJapanese } from "@/components/ui/japanese";
import { TTSReader, OfflineAudio } from "@/components/features/media";
import { detectVoice, fetchTTSAudio, speakWithWebSpeech } from "@/lib/tts";
import { parseInlineStyles } from "@/lib/utils/markdown-parser";
import { Card } from "@/components/ui/card";

interface DialogueBlockProps {
  block: ContentBlock;
}

export function DialogueBlock({ block }: DialogueBlockProps) {
  // Parse dialogue lines and speakers from raw content and furigana strings
  const lines = React.useMemo(() => {
    return block.content
      ? block.content.split("\n").filter(Boolean).map((line: string, i: number) => {
          const parts = line.split(/[：:]/);
          const furiLine = block.furigana?.split("\n")[i] || "";
          const furiParts = furiLine.split(/[：:]/);
          
          const rawSpeaker = parts.length > 1 ? parts[0].trim() : undefined;
          
          return {
            speaker: rawSpeaker,
            text: parts.length > 1 ? parts.slice(1).join("：").trim() : line.trim(),
            furigana: furiParts.length > 1 ? furiParts.slice(1).join("：").trim() : furiLine.trim(),
          };
        })
      : [];
  }, [block.content, block.furigana]);

  const [isPlaying, setIsPlaying] = React.useState(false);
  const [playingIndex, setPlayingIndex] = React.useState<number | null>(null);
  const currentAudioRef = React.useRef<HTMLAudioElement | null>(null);
  const playTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const stopPlayback = React.useCallback(() => {
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current = null;
    }
    window.speechSynthesis.cancel();
    setIsPlaying(false);
    setPlayingIndex(null);
    if (playTimeoutRef.current) {
      clearTimeout(playTimeoutRef.current);
      playTimeoutRef.current = null;
    }
  }, []);

  const linesRef = React.useRef(lines);
  React.useEffect(() => {
    linesRef.current = lines;
  }, [lines]);

  const playLineRef = React.useRef<(index: number) => Promise<void>>(() => Promise.resolve());

  React.useEffect(() => {
    playLineRef.current = async (index: number) => {
      const currentLines = linesRef.current;
      if (index >= currentLines.length) {
        stopPlayback();
        return;
      }

      setPlayingIndex(index);
      const line = currentLines[index];
      const text = line.text;
      const speaker = line.speaker;
      const voice = detectVoice(speaker || "");

      const playFallback = () => {
        speakWithWebSpeech(text, voice, 1, () => {
          playTimeoutRef.current = setTimeout(() => {
            playLineRef.current(index + 1);
          }, 800);
        });
      };

      try {
        const audioUrl = await fetchTTSAudio(text, voice);
        
        if (audioUrl) {
          const audio = new Audio(audioUrl);
          currentAudioRef.current = audio;
          audio.play();

          audio.onended = () => {
            // Delay 800ms before playing next line.
            playTimeoutRef.current = setTimeout(() => {
              playLineRef.current(index + 1);
            }, 800);
          };

          audio.onerror = () => {
            playFallback();
          };
        } else {
          playFallback();
        }
      } catch (err) {
        console.warn("TTS fetch failed, falling back to Web Speech:", err);
        playFallback();
      }
    };
  }, [stopPlayback]);

  const playLine = React.useCallback((index: number) => {
    return playLineRef.current(index);
  }, []);

  const togglePlayAll = React.useCallback(() => {
    if (isPlaying) {
      stopPlayback();
    } else {
      setIsPlaying(true);
      playLineRef.current(0);
    }
  }, [isPlaying, stopPlayback]);

  React.useEffect(() => {
    return () => {
      if (playTimeoutRef.current) clearTimeout(playTimeoutRef.current);
      window.speechSynthesis.cancel();
    };
  }, []);

  const audioSrc = (block.audio_url || block.audioUrl) as string | undefined;

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        {block.title ? (
          <h3 className="text-xs text-muted-foreground uppercase tracking-widest">
            {block.title}
          </h3>
        ) : (
          <div />
        )}
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto justify-end">
          {audioSrc && (
            <OfflineAudio 
              src={audioSrc}
              controls
              className="w-full sm:w-64 h-10 filter brightness-90 contrast-125 shrink-0"
            />
          )}
          {lines.length > 0 && (
            <button
              onClick={togglePlayAll}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border text-[10px] font-black uppercase tracking-widest transition-all duration-300 shadow-sm shrink-0 ${
                isPlaying
                  ? "bg-success/15 border-success/30 text-success"
                  : "bg-muted/50 border-border text-muted-foreground hover:text-success hover:bg-success/5 hover:border-success/20"
              }`}
              aria-label={isPlaying ? "Jeda Dialog AI" : "Putar Semua Dialog AI"}
            >
              {isPlaying ? (
                <>
                  <span className="size-2 bg-success rounded-full animate-ping" />
                  <span>Jeda AI</span>
                </>
              ) : (
                <>
                  <svg className="size-3 fill-current" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                  <span>Putar Dialog (AI)</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>

      <div className="relative group/dialogue w-full">
        {/* Tombou Register Mark */}
        <div className="absolute -top-[6px] -right-[6px] w-[14px] h-[14px] pointer-events-none z-20">
          <div className="absolute top-0 right-0 w-[14px] h-[1px] bg-primary/20 group-hover/dialogue:bg-primary transition-colors duration-500" />
          <div className="absolute top-0 right-0 w-[1px] h-[14px] bg-primary/20 group-hover/dialogue:bg-primary transition-colors duration-500" />
        </div>

        <Card className="space-y-4 rounded-2xl p-6 shadow-[0_4px_25px_rgba(0,0,0,0.015)] bg-card border border-border/50 dark:border-white/10">
          {lines.map((line: { speaker: string | undefined; text: string; furigana?: string }, pos: number) => {
            const isLinePlaying = playingIndex === pos;
            return (
              <div 
                key={`dialogue-${pos}`} 
                className={`flex gap-4 items-start group p-2.5 rounded-lg transition-all duration-300 ${
                  isLinePlaying 
                    ? "bg-secondary/10 border-l-4 border-l-secondary pl-3.5 shadow-[0_0_15px_rgb(var(--secondary-rgb)/0.05)]" 
                    : "hover:bg-muted/10"
                }`}
              >
                <span 
                  className="text-[10px] font-black text-secondary uppercase tracking-widest px-2.5 py-1 rounded-[4px] h-fit flex-shrink-0 mt-1 border border-secondary/20 animate-none"
                  style={{ backgroundColor: "rgb(var(--secondary-rgb)/0.1)" }}
                >
                  {line.speaker}
                </span>
                <div className="flex-1 min-w-0 flex items-center justify-between gap-4">
                  <div 
                    className="text-xl font-japanese font-medium text-foreground leading-relaxed cursor-pointer flex-1"
                    onClick={async () => {
                      if (isPlaying) {
                        stopPlayback();
                        playLine(pos);
                      } else {
                        const voice = detectVoice(line.speaker || "", pos);
                        try {
                          const audioUrl = await fetchTTSAudio(line.text, voice);
                          if (audioUrl) {
                            if (currentAudioRef.current) {
                              currentAudioRef.current.pause();
                            }
                            const audio = new Audio(audioUrl);
                            currentAudioRef.current = audio;
                            audio.play();
                          } else {
                            speakWithWebSpeech(line.text, voice, 1);
                          }
                        } catch {
                          speakWithWebSpeech(line.text, voice, 1);
                        }
                      }
                    }}
                  >
                    <SmartJapanese word={line.text} furigana={line.furigana} />
                  </div>
                  <div className="opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300 shrink-0 self-center">
                    <TTSReader text={line.text} speaker={line.speaker} minimal />
                  </div>
                </div>
              </div>
            );
          })}
        </Card>
      </div>
      {block.translation && (
        <p className="text-sm text-muted-foreground italic px-4 border-l-2 border-border/70 whitespace-pre-wrap">{parseInlineStyles(block.translation)}</p>
      )}
    </div>
  );
}
