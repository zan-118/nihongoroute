/**
 * @file useListeningSync.ts
 * @description Hook kustom untuk menyinkronkan waktu pemutaran audio dengan baris transkrip aktif.
 * Mengelola pembaruan waktu audio (currentTime) dan navigasi linear (seekToLine).
 */

// IMPOR UTAMA

import { useState, useCallback, useRef } from "react";
import { TranscriptLine } from "../types";

// HOOK UTAMA: useListeningSync

/**
 * Syncs audio playback time with active transcript lines.
 * 
 * @param transcript Array of transcript lines with start and end times.
 * @returns Sync state and control functions.
 */
export function useListeningSync(transcript: TranscriptLine[]) {
 /** Track current time without triggering re-renders. */
 const currentTimeRef = useRef(0);
 /** Track active index to prevent redundant state updates. */
 const activeIndexRef = useRef(-1);
 
 const [currentTime, setCurrentTime] = useState(0);
 const [activeIndex, setActiveIndex] = useState(-1);
 const [externalSeek, setExternalSeek] = useState<number | undefined>(undefined);

 /**
 * Finds and sets active transcript index based on current time.
 * 
 * @param time Current audio time in seconds.
 * @param forceTimeUpdate Force state update even if index did not change.
 */
 const syncActiveIndex = useCallback((time: number, forceTimeUpdate = false) => {
 // Find line matching current playback time.
 const nextIndex = transcript.findIndex(
 (line) => time >= line.startTime && time <= line.endTime
 );

 if (forceTimeUpdate) {
 setCurrentTime(time);
 }

 // Only update state if active line index changed.
 if (nextIndex !== activeIndexRef.current) {
 activeIndexRef.current = nextIndex;
 if (!forceTimeUpdate) {
 setCurrentTime(time);
 }
 setActiveIndex(nextIndex);
 }
 }, [transcript]);

 /**
 * Updates playback time and syncs active index.
 * 
 * @param time Current audio time in seconds.
 */
 const handleTimeUpdate = useCallback((time: number) => {
 currentTimeRef.current = time;
 syncActiveIndex(time);
 // Reset external seek target once audio catches up.
 setExternalSeek((current) => current === undefined ? current : undefined);
 }, [syncActiveIndex]);

 /**
 * Jumps audio playback to specific transcript line start time.
 * 
 * @param startTime Start time of target transcript line.
 */
 const seekToLine = useCallback((startTime: number) => {
 setExternalSeek(startTime);
 currentTimeRef.current = startTime;
 syncActiveIndex(startTime, true);
 }, [syncActiveIndex]);

 return {
 currentTime,
 activeIndex,
 externalSeek,
 handleTimeUpdate,
 seekToLine,
 };
}