/**
 * @file AudioPlaybackEngine.ts
 * @description Modul pemutaran audio terpadu (Audio Playback Engine).
 * Menyembunyikan kompleksitas pembentukan audio element, pembersihan memory blob URL,
 * pengambilan TTS dari cache/sintesis EdgeTTS, dan fallback otomatis ke Web Speech API.
 */

import { fetchTTSAudio, speakWithWebSpeech, TTS_VOICES, type TtsVoice } from "@/lib/tts";

export interface PlaybackOptions {
  voice?: TtsVoice | string;
  rate?: number;
  id?: string | number;
}

export interface AudioPlaybackState {
  playingId: string | number | null;
  isPlaying: boolean;
  error: string | null;
}

type StateListener = (state: AudioPlaybackState) => void;

export class AudioPlaybackEngine {
  private static instance: AudioPlaybackEngine | null = null;

  private state: AudioPlaybackState = {
    playingId: null,
    isPlaying: false,
    error: null,
  };

  private listeners: Set<StateListener> = new Set();
  private audioRef: HTMLAudioElement | null = null;
  private objectUrlRef: string | null = null;
  private cancelSpeechRef: (() => void) | null = null;

  public static getInstance(): AudioPlaybackEngine {
    if (!AudioPlaybackEngine.instance) {
      AudioPlaybackEngine.instance = new AudioPlaybackEngine();
    }
    return AudioPlaybackEngine.instance;
  }

  public getState(): AudioPlaybackState {
    return this.state;
  }

  public subscribe(listener: StateListener): () => void {
    this.listeners.add(listener);
    listener(this.state);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    for (const listener of this.listeners) {
      listener(this.state);
    }
  }

  public stop(): void {
    if (this.audioRef) {
      this.audioRef.pause();
      this.audioRef.onended = null;
      this.audioRef.onerror = null;
      this.audioRef = null;
    }
    if (this.objectUrlRef) {
      URL.revokeObjectURL(this.objectUrlRef);
      this.objectUrlRef = null;
    }
    if (this.cancelSpeechRef) {
      this.cancelSpeechRef();
      this.cancelSpeechRef = null;
    }

    this.state = {
      playingId: null,
      isPlaying: false,
      error: null,
    };
    this.notify();
  }

  public async play(text: string, options: PlaybackOptions = {}): Promise<void> {
    const cleanText = text.replace(/\[.*?\]|\(.*?\)/g, "").trim();
    if (!cleanText) return;

    const id = options.id ?? cleanText;

    // Toggle off if same item is currently playing
    if (this.state.playingId === id && this.state.isPlaying) {
      this.stop();
      return;
    }

    this.stop();

    const voice = (options.voice || TTS_VOICES.INDAH) as TtsVoice;
    const rate = options.rate || 1;
    const rateStr = rate === 1 ? "medium" : rate > 1 ? `+${Math.round((rate - 1) * 100)}%` : `${Math.round((rate - 1) * 100)}%`;

    this.state = {
      playingId: id,
      isPlaying: true,
      error: null,
    };
    this.notify();

    try {
      const audioUrl = await fetchTTSAudio(cleanText, voice, rateStr);
      if (audioUrl) {
        this.objectUrlRef = audioUrl;
        const audio = new Audio(audioUrl);
        this.audioRef = audio;
        audio.playbackRate = rate;

        audio.onended = () => {
          this.stop();
        };

        audio.onerror = () => {
          this.fallbackWebSpeech(cleanText, voice, rate);
        };

        await audio.play();
        return;
      }

      this.fallbackWebSpeech(cleanText, voice, rate);
    } catch {
      this.fallbackWebSpeech(cleanText, voice, rate);
    }
  }

  private fallbackWebSpeech(text: string, voice: TtsVoice, rate: number): void {
    if (this.objectUrlRef) {
      URL.revokeObjectURL(this.objectUrlRef);
      this.objectUrlRef = null;
    }
    this.audioRef = null;

    this.cancelSpeechRef = speakWithWebSpeech(
      text,
      voice,
      rate,
      () => this.stop(),
      () => {
        this.state = {
          playingId: null,
          isPlaying: false,
          error: "Gagal memutar audio TTS",
        };
        this.notify();
      }
    );
  }
}

export const audioPlaybackEngine = AudioPlaybackEngine.getInstance();
