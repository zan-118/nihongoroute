"use client";

/**
 * @file ListeningWorkspace.tsx
 * @description Komponen Workspace terintegrasi untuk Graded Listening (Choukai).
 * Orkestrator yang menggabungkan tab selector, panel belajar/dikte/kuis, dan
 * sticky bottom media control bar. Logika per-panel dipecah ke folder workspace/.
 * Catatan: semua panel tetap ter-mount (disembunyikan via CSS) agar state
 * per-panel (progres dikte, jawaban kuis) bertahan saat pengguna pindah tab.
 */

import { useState, useMemo } from "react";
import { useLineTTS } from "@/features/media";
import { extractDictationText } from "@/lib/learning/dictation";
import { cn } from "@/lib/utils";
import { TranscriptLine, QuizItem } from "../types";
import { WorkspaceTabs, WorkspaceTab } from "./workspace/WorkspaceTabs";
import { StudyPanel } from "./workspace/StudyPanel";
import { DictationPanel, DictationLine } from "./workspace/DictationPanel";
import { QuizPanel } from "./workspace/QuizPanel";
import { MediaControlBar } from "./workspace/MediaControlBar";

/**
 * Props for ListeningWorkspace component.
 */
interface ListeningWorkspaceProps {
  /** Array of transcript lines containing text, translation, and timing data */
  transcript: TranscriptLine[];
  /** Index of the currently active transcript line */
  activeIndex: number;
  /** Callback to seek audio playback to a specific timestamp */
  seekToLine: (startTime: number) => void;
  /** Optional URL of the audio file */
  audioUrl?: string;
  /** Optional callback triggered on audio playback time updates */
  onTimeUpdate?: (time: number) => void;
  /** Optional external seek timestamp to trigger audio updates */
  externalSeek?: number;
  /** Optional list of quiz questions related to the audio */
  quiz?: QuizItem[];
  /** Optional background image URL for the visualizer scene */
  imageUrl?: string;
  /** Optional list of illustrations to display when no speaker is present */
  illustrations?: { title?: string; content: string }[];
  /** Callback triggered when the quiz is completed, returning the final score */
  onQuizComplete: (score: number) => void;
  /** Query parameters or identifiers for tools */
  toolParams: string;
  /** Title of the listening exercise */
  title: string;
}

/**
 * ListeningWorkspace component.
 * Provides interactive transcript, dictation practice, and quiz modes for Japanese listening practice.
 */
export default function ListeningWorkspace({
  transcript,
  activeIndex,
  seekToLine,
  audioUrl,
  onTimeUpdate,
  externalSeek,
  quiz = [],
  imageUrl,
  illustrations = [],
  onQuizComplete,
  toolParams,
  title,
}: ListeningWorkspaceProps) {
  // Active workspace tab state
  const [activeTab, setActiveTab] = useState<WorkspaceTab>("study");
  // Toggle translation visibility state
  const [showTranslation, setShowTranslation] = useState(false);
  // Toggle transcript text visibility state
  const [isTranscriptHidden, setIsTranscriptHidden] = useState(false);

  // Filter and clean transcript lines suitable for dictation practice
  const dictationLines = useMemo<DictationLine[]>(
    () =>
      transcript
        .map((line, index) => ({
          ...line,
          index,
          cleanText: extractDictationText(line.text).trim(),
        }))
        .filter((line) => line.cleanText.length > 0),
    [transcript]
  );

  // TTS Line Hook for fallback audio playback
  const {
    speakingIndex,
    loadingIndex,
    speakLine,
    stopLineTTS,
    rate,
    setRate,
    isPlayingPlaylist,
    playlistIndex,
    playPlaylist,
    pausePlaylist,
  } = useLineTTS({ rate: "medium", lines: transcript });

  // Determine active line index based on playlist or manual audio sync
  const currentActiveIndex = isPlayingPlaylist ? playlistIndex : activeIndex;

  return (
    <div className="w-full flex flex-col pb-40 md:pb-28">
      {/* Tab Selector Workspace */}
      <WorkspaceTabs
        activeTab={activeTab}
        onTabChange={setActiveTab}
        hasDictation={dictationLines.length > 0}
        hasQuiz={quiz.length > 0}
      />

      {/* Workspace Panels — selalu ter-mount agar state per-panel bertahan antar tab */}
      <div className={cn("w-full", activeTab === "study" ? "block" : "hidden")}>
        <StudyPanel
          transcript={transcript}
          currentActiveIndex={currentActiveIndex}
          seekToLine={seekToLine}
          speakingIndex={speakingIndex}
          loadingIndex={loadingIndex}
          speakLine={speakLine}
          stopLineTTS={stopLineTTS}
          isTranscriptHidden={isTranscriptHidden}
          showTranslation={showTranslation}
          imageUrl={imageUrl}
          illustrations={illustrations}
          title={title}
        />
      </div>

      <div className={cn("w-full", activeTab === "dictation" ? "block" : "hidden")}>
        <DictationPanel
          dictationLines={dictationLines}
          audioUrl={audioUrl}
          seekToLine={seekToLine}
          speakLine={speakLine}
        />
      </div>

      <div className={cn("w-full", activeTab === "quiz" ? "block" : "hidden")}>
        <QuizPanel quiz={quiz} onQuizComplete={onQuizComplete} />
      </div>

      {/* Floating Sticky Bottom Media Control Bar (Unified) */}
      <MediaControlBar
        audioUrl={audioUrl}
        onTimeUpdate={onTimeUpdate}
        externalSeek={externalSeek}
        isPlayingPlaylist={isPlayingPlaylist}
        playPlaylist={playPlaylist}
        pausePlaylist={pausePlaylist}
        transcript={transcript}
        currentActiveIndex={currentActiveIndex}
        rate={rate}
        onRateChange={setRate}
        showTranslation={showTranslation}
        onToggleTranslation={() => setShowTranslation(!showTranslation)}
        isTranscriptHidden={isTranscriptHidden}
        onToggleTranscriptHidden={() => setIsTranscriptHidden(!isTranscriptHidden)}
      />
    </div>
  );
}
