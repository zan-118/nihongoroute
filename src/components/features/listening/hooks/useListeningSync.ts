import { useState, useCallback, useMemo } from "react";
import { TranscriptLine } from "../types";

export function useListeningSync(transcript: TranscriptLine[]) {
  const [currentTime, setCurrentTime] = useState(0);
  const [externalSeek, setExternalSeek] = useState<number | undefined>(undefined);

  const activeIndex = useMemo(() => {
    // Mencari baris yang sedang aktif berdasarkan currentTime
    return transcript.findIndex(
      (line) => currentTime >= line.startTime && currentTime <= line.endTime
    );
  }, [currentTime, transcript]);

  const handleTimeUpdate = useCallback((time: number) => {
    setCurrentTime(time);
    // Reset externalSeek setelah dipicu agar tidak loop
    setExternalSeek(undefined);
  }, []);

  const seekToLine = useCallback((startTime: number) => {
    setExternalSeek(startTime);
    setCurrentTime(startTime);
  }, []);

  return {
    currentTime,
    activeIndex,
    externalSeek,
    handleTimeUpdate,
    seekToLine,
  };
}
