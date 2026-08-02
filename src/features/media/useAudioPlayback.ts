"use client";

import { useSyncExternalStore, useCallback } from "react";
import { audioPlaybackEngine, type PlaybackOptions } from "./AudioPlaybackEngine";

export function useAudioPlayback(defaultOptions: PlaybackOptions = {}) {
 const state = useSyncExternalStore(
 (callback) => audioPlaybackEngine.subscribe(callback),
 () => audioPlaybackEngine.getState(),
 () => audioPlaybackEngine.getState()
 );

 const play = useCallback(
 (text: string, options: PlaybackOptions = {}) => {
 const mergedOptions = { ...defaultOptions, ...options };
 audioPlaybackEngine.play(text, mergedOptions);
 },
 [defaultOptions]
 );

 const stop = useCallback(() => {
 audioPlaybackEngine.stop();
 }, []);

 return {
 playingId: state.playingId,
 isPlaying: state.isPlaying,
 error: state.error,
 play,
 stop,
 };
}
