import { useCallback } from "react";
import { useAudioPlayback } from "@/features/media/useAudioPlayback";
import type { TtsVoice } from "@/lib/tts";

interface UseAudioPlayerOptions {
 voice?: TtsVoice;
 rate?: number;
}

/**
 * Custom hook wrapper untuk menyentralisasi alur pemutaran Audio TTS
 * memanfaatkan AudioPlaybackEngine terpadu.
 */
export function useAudioPlayer(defaultOptions: UseAudioPlayerOptions = {}) {
 const { playingId, play, stop } = useAudioPlayback(defaultOptions);

 const playAudio = useCallback(
 async (text: string, index: number | string, options: UseAudioPlayerOptions = {}) => {
 play(text, { ...options, id: index });
 },
 [play]
 );

 return {
 playingIndex: playingId,
 playAudio,
 stopAudio: stop,
 };
}
