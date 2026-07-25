"use client";

/**
 * @file DialogueSection.tsx
 * @description Komponen seksi dialog/skenario percakapan (DialogueSection) dalam pelajaran. Dilengkapi pembaca dialog per kalimat, audio, dan gambar/video rujukan.
 */

// ======================
// IMPOR
// ======================
import React from "react";
import { MessageSquare, Play, Pause } from "@/components/ui/icons";
import { SmartJapanese } from "@/components/ui/SmartJapanese";
import TTSReader from "@/components/features/tools/tts/TTSReader";
import MediaAsset from "@/components/ui/MediaAsset";
import { OfflineAudio } from "@/components/ui/OfflineAudio";
import { Button } from "@/components/ui/button";
import { useLineTTS } from "@/components/features/listening/hooks/useLineTTS";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";

// ======================
// ANTARMUKA / TIPE DATA
// ======================

/**
 * DialogueSpeakerItem
 * Represents single line in dialogue transcript.
 */
export interface DialogueSpeakerItem {
  /** Speaker identifier code */
  speaker?: string;
  /** Display name of speaker */
  speakerName?: string;
  /** Japanese text content */
  jp?: string;
  /** Alternative Japanese text field */
  text?: string;
  /** Furigana annotations for Japanese text */
  furigana?: string | { text: string; rt?: string }[];
  /** Romaji transcription of the Japanese text */
  romaji?: string;
  /** Indonesian translation text */
  translation?: string;
  /** Alternative translation field or ID */
  id?: string;
}

/**
 * DialogueItem
 * Represents dialogue scenario containing transcript and media.
 */
export interface DialogueItem {
  /** Unique identifier */
  _id?: string;
  /** Alternative unique identifier */
  id?: string;
  /** Title of dialogue scenario */
  title?: string;
  /** URL to audio file */
  audioUrl?: string;
  /** Alternative audio URL field */
  audio_url?: string;
  /** URL to illustration image */
  imageUrl?: string;
  /** URL to reference video */
  videoUrl?: string;
  /** List of dialogue lines */
  transcript?: DialogueSpeakerItem[];
  /** Alternative list of dialogue lines */
  body?: DialogueSpeakerItem[];
}

/**
 * DialogueSectionProps
 * Props for DialogueSection component.
 */
interface DialogueSectionProps {
  /** List of dialogue scenarios to render */
  listeningList: DialogueItem[];
}

// ======================
// EKSEKUSI UTAMA
// ======================

/**
 * Komponen: DialogueSection
 * 
 * Menyajikan antarmuka transkrip percakapan interaktif (skenario percakapan) dalam modul pelajaran.
 * Menampilkan nama pembicara, transkrip bahasa Jepang (yang dirender dengan SmartJapanese furigana),
 * terjemahan bahasa Indonesia, serta menyediakan pemutar audio offline (OfflineAudio)
 * dan pembaca text-to-speech (TTSReader) per kalimat dialog.
 * 
 * @param {Object} props - Properti komponen
 * @param {DialogueItem[]} props.listeningList - Daftar skenario percakapan hasil query database Supabase
 */
export const DialogueSection: React.FC<DialogueSectionProps> = ({ listeningList }) => {
  // Flatten all dialogue lines across scenarios with local index tracking
  const allLines = React.useMemo(() => {
    const lines: (DialogueSpeakerItem & { localIndex: number })[] = [];
    listeningList?.forEach((l) => {
      const dialogueLines = l.transcript || l.body || [];
      dialogueLines.forEach((item, idx) => {
        lines.push({
          ...item,
          localIndex: idx,
        });
      });
    });
    return lines;
  }, [listeningList]);

  // Hook managing TTS playback state and controls
  const {
    speakingIndex,
    loadingIndex,
    isPlayingPlaylist,
    playlistIndex,
    playPlaylist,
    pausePlaylist,
    speakLine,
  } = useLineTTS({ rate: "medium", lines: allLines });

  // Track active dialogue block ID
  const [activeDialogId, setActiveDialogId] = React.useState<string | null>(null);
  // Reference to active dialogue line element for auto-scroll
  const activeLineRef = React.useRef<HTMLDivElement | null>(null);

  // Scroll active line into view during playlist playback
  React.useEffect(() => {
    if (activeLineRef.current && isPlayingPlaylist) {
      activeLineRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [playlistIndex, isPlayingPlaylist]);

  if (!listeningList || listeningList.length === 0) return null;

  return (
    <section id="scenario">
      <div className="flex items-center gap-4 mb-10">
        <h2 className="text-xl uppercase tracking-tight text-foreground flex items-center gap-3">
          <span className="text-2xl not-italic">場面</span> Skenario Percakapan
        </h2>
        <div className="h-[1px] flex-1 bg-border" />
      </div>
      
      <div className="space-y-10">
        {listeningList.map((l: DialogueItem) => {
          const dialogId = l._id || l.id || "";
          const isCurrentPlaying = activeDialogId === dialogId && isPlayingPlaylist;

          return (
            <div key={dialogId} className="relative group/dialog">
              {/* Tombou Register Mark */}
              <div className="absolute -top-[6px] -right-[6px] w-[14px] h-[14px] pointer-events-none z-20">
                <div className="absolute top-0 right-0 w-[14px] h-[1px] bg-secondary/20 group-hover/dialog:bg-secondary transition-colors duration-500" />
                <div className="absolute top-0 right-0 w-[1px] h-[14px] bg-secondary/20 group-hover/dialog:bg-secondary transition-colors duration-500" />
              </div>

              <Card className="p-6 md:p-10 border border-border/50 dark:border-white/10 rounded-2xl bg-card shadow-[0_4px_25px_rgba(0,0,0,0.015)] relative overflow-hidden">
              {/* Header: media + title/audio side-by-side */}
              <div className={`flex flex-col ${(l.imageUrl || l.videoUrl) ? 'md:flex-row' : ''} gap-6 mb-8 border-b border-border/50 pb-8`}>
                {/* MEDIA HERO MENYIMAK — ditaruh di samping, bukan bawah */}
                {(l.imageUrl || l.videoUrl) && (
                  <div className="w-full md:w-48 lg:w-56 shrink-0 rounded-lg overflow-hidden">
                    <MediaAsset 
                      url={l.videoUrl || l.imageUrl || ""} 
                      type={l.videoUrl ? "video" : "image"}
                      className="shadow-lg rounded-lg overflow-hidden w-full h-40 md:h-full object-cover"
                    />
                  </div>
                )}
                <div className="flex-1 flex flex-col justify-between gap-4">
                  <div>
                    <h3 className="text-lg md:text-xl uppercase tracking-tight mb-2">{l.title}</h3>
                    <p className="text-xs text-muted-foreground font-medium flex items-center gap-2">
                       <MessageSquare size={12} className="text-secondary" /> Dengarkan dan pelajari percakapan di bawah ini
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 w-full">
                    {/* Playlist TTS Button */}
                    {(l.transcript || l.body) && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          const lines = l.transcript || l.body || [];
                          if (isCurrentPlaying) {
                            pausePlaylist();
                          } else {
                            setActiveDialogId(dialogId);
                            playPlaylist(lines, 0);
                          }
                        }}
                        title={isCurrentPlaying ? "Jeda Dialog AI" : "Putar Semua Dialog AI"}
                        className={cn(
                          "rounded-full gap-2 transition-all border shrink-0 text-xs font-bold uppercase tracking-widest px-4 py-2 h-10",
                          isCurrentPlaying
                            ? "bg-success/15 border-success/30 text-success"
                            : "bg-muted/50 border-border text-muted-foreground hover:text-success hover:bg-success/5 hover:border-success/20"
                        )}
                      >
                        {isCurrentPlaying ? (
                          <Pause size={13} className="animate-pulse" />
                        ) : (
                          <Play size={13} />
                        )}
                        <span>
                          {isCurrentPlaying ? "Jeda Dialog (AI)" : "Putar Dialog (AI)"}
                        </span>
                      </Button>
                    )}

                    {(l.audioUrl || l.audio_url) && (
                      <OfflineAudio 
                        controls 
                        src={(l.audioUrl || l.audio_url)!} 
                        className="w-full md:w-56 h-10 filter brightness-90 contrast-125" 
                      />
                    )}
                  </div>
                </div>
              </div>
                      {(l.transcript || l.body) && (
              <div className="space-y-8">
                {(l.transcript || l.body)!.map((item: DialogueSpeakerItem, pos: number) => {
                  const isLineActive = activeDialogId === dialogId && isPlayingPlaylist && playlistIndex === pos;
                  const bubbleBg = isLineActive ? "rgb(var(--secondary-rgb)/0.12)" : "rgb(var(--secondary-rgb)/0.05)";
                  const bubbleBorder = isLineActive ? "rgb(var(--secondary-rgb)/0.45)" : "rgb(var(--secondary-rgb)/0.1)";
                  const bubbleShadow = isLineActive ? "0 0 20px rgb(var(--secondary-rgb)/0.15)" : "none";
                  const bubbleScale = isLineActive ? "scale-[1.01]" : "scale-100";

                  return (
                    <div key={`dialogue-${pos}`} className="flex flex-col gap-2 group/dialogue">
                      <div className="flex items-center gap-2">
                        <span 
                          className="text-[10px] font-black text-secondary uppercase tracking-[0.2em] px-2 py-0.5 rounded"
                          style={{ backgroundColor: "rgb(var(--secondary-rgb)/0.1)" }}
                        >
                          {item.speaker || item.speakerName}
                        </span>
                        {isLineActive && (
                          <span className="flex items-center gap-0.5">
                            {[0, 1, 2].map(i => (
                              <span
                                key={i}
                                className="inline-block w-0.5 bg-secondary rounded-full"
                                style={{
                                  height: `${6 + i * 3}px`,
                                  animation: "pulse 1.2s infinite ease-in-out",
                                  animationDelay: `${i * 0.15}s`
                                }}
                              />
                            ))}
                          </span>
                        )}
                      </div>
                      <div 
                        ref={isLineActive ? activeLineRef : null}
                        className={cn(
                          "p-4 md:p-6 rounded-lg border transition-all duration-300 overflow-hidden cursor-pointer flex items-center justify-between gap-4",
                          bubbleScale
                        )}
                        style={{ 
                          backgroundColor: bubbleBg, 
                          borderColor: bubbleBorder,
                          boxShadow: bubbleShadow
                        }}
                        onMouseEnter={(e) => {
                          if (!isLineActive) {
                            e.currentTarget.style.backgroundColor = "rgb(var(--secondary-rgb)/0.1)";
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!isLineActive) {
                            e.currentTarget.style.backgroundColor = "rgb(var(--secondary-rgb)/0.05)";
                          }
                        }}
                        onClick={() => {
                          const lines = l.transcript || l.body || [];
                          const localLine = {
                            ...item,
                            localIndex: pos,
                          };
                          
                          if (isCurrentPlaying) {
                            playPlaylist(lines, pos);
                          } else {
                            setActiveDialogId(dialogId);
                            speakLine(localLine, pos);
                          }
                        }}
                      >
                          <div className="flex-1 min-w-0">
                            <div className="text-lg font-japanese font-bold text-foreground mb-2 leading-relaxed">
                              <SmartJapanese 
                                  word={item.jp || item.text || ""} 
                                  furigana={typeof item.furigana === "string" ? item.furigana : undefined} 
                                />
                            </div>
                            {item.romaji && (
                              <p className="text-xs text-muted-foreground/80 font-mono mb-2">
                                {item.romaji}
                              </p>
                            )}
                            <p 
                              className="text-sm text-muted-foreground font-medium italic border-t pt-3"
                              style={{ borderColor: "rgb(var(--border-rgb)/0.2)" }}
                            >
                              &quot;{item.translation || item.id}&quot;
                            </p>
                          </div>
                         <div className="opacity-100 md:opacity-0 md:group-hover/dialogue:opacity-100 transition-opacity shrink-0 self-center">
                           <TTSReader 
                             text={item.jp || item.text || ""} 
                             minimal={true} 
                             speaker={item.speaker || item.speakerName} 
                           />
                         </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            </Card>
          </div>
        );
      })}
      </div>
    </section>
  );
};