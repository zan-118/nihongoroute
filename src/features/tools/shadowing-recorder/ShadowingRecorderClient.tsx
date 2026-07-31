"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  AudioLines,
  Mic,
  Play,
  RotateCcw,
  Square,
  Volume2,
  Waves,
} from "@/components/ui/icons";
import {
  formatShadowingDuration,
  getShadowingPaceLabel,
  SHADOWING_PRESETS,
  type ShadowingPreset,
} from "@/lib/shadowing-recorder";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import NextActionPanel from "@/features/ecosystem/NextActionPanel";
import { useUIStore } from "@/store/useUIStore";
import { cn } from "@/lib/utils";

import { ROUTES } from "@/lib/core/routes";
/** Playback speed options for target speech. */
const PLAYBACK_RATES = [
  { label: "Lambat", value: 0.78 },
  { label: "Normal", value: 0.95 },
  { label: "Cepat", value: 1.12 },
] as const;

/** Props for ShadowingRecorderClient component. */
interface ShadowingRecorderClientProps {
  /** Initial presets to display. */
  initialPresets?: ShadowingPreset[];
  /** Total presets available in library. */
  libraryPresetCount?: number;
  /** Optional label for context. */
  contextLabel?: string;
}

/**
 * Shadowing recorder client component.
 * Allows users to listen to Japanese text, record their own voice, and compare durations.
 */
export default function ShadowingRecorderClient({
  initialPresets = [],
  libraryPresetCount = 0,
  contextLabel,
}: ShadowingRecorderClientProps) {
  // State hooks for UI and audio status
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [playbackRate, setPlaybackRate] = useState<(typeof PLAYBACK_RATES)[number]["value"]>(0.95);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [speechSupported, setSpeechSupported] = useState(false);
  const [recordingSupported, setRecordingSupported] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);

  // Refs for media recording and timers
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startedAtRef = useRef<number | null>(null);
  const finalElapsedRef = useRef(0);
  const audioUrlRef = useRef<string | null>(null);
  const recordLearningEvent = useUIStore((state) => state.recordLearningEvent);

  // Resolve presets and current selection
  const presets = initialPresets.length > 0 ? initialPresets : SHADOWING_PRESETS;
  const preset = presets[selectedIndex] ?? presets[0];
  const paceLabel = getShadowingPaceLabel(elapsedSeconds, preset.targetSeconds);
  const pacePercent = Math.min(100, Math.round((elapsedSeconds / Math.max(preset.targetSeconds, 1)) * 100));

  /** Stop active timer. */
  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  /** Stop microphone stream tracks. */
  const stopStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  }, []);

  /** Free memory from old audio URL. */
  const revokeRecordingUrl = useCallback(() => {
    if (audioUrlRef.current) {
      URL.revokeObjectURL(audioUrlRef.current);
      audioUrlRef.current = null;
    }
  }, []);

  /** Reset recording state. */
  const clearRecording = useCallback(() => {
    revokeRecordingUrl();
    setAudioUrl(null);
    setElapsedSeconds(0);
  }, [revokeRecordingUrl]);

  /** Cancel active speech synthesis. */
  const stopSpeaking = useCallback(() => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
  }, []);

  // Check browser API support, load voices, and handle cleanup
  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      const supported = typeof window !== "undefined" && "speechSynthesis" in window && "SpeechSynthesisUtterance" in window;
      setSpeechSupported(supported);
      setRecordingSupported(
        typeof navigator !== "undefined" &&
          !!navigator.mediaDevices?.getUserMedia &&
          typeof MediaRecorder !== "undefined"
      );

      if (supported && typeof window !== "undefined" && window.speechSynthesis) {
        const updateVoices = () => {
          setVoices(window.speechSynthesis.getVoices());
        };
        updateVoices();
        window.speechSynthesis.onvoiceschanged = updateVoices;
      }
    });

    return () => {
      cancelAnimationFrame(frame);
      stopSpeaking();
      stopTimer();
      stopStream();
      revokeRecordingUrl();
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.onvoiceschanged = null;
      }
    };
  }, [revokeRecordingUrl, stopSpeaking, stopStream, stopTimer]);

  /** Switch preset and reset state. */
  const handlePresetChange = (nextIndex: number) => {
    if (isRecording) return;
    stopSpeaking();
    clearRecording();
    setSelectedIndex(nextIndex);
    setError("");
  };

  /** Play target text using Web Speech API. */
  const speakTarget = () => {
    if (!speechSupported) {
      setError("Browser ini belum mendukung Web Speech API.");
      return;
    }
    if (typeof window === "undefined") return;

    if (isSpeaking) {
      stopSpeaking();
      return;
    }

    setError("");
    // Pause other audio players
    window.dispatchEvent(new CustomEvent("nihongoroute_pause_line_tts"));
    window.dispatchEvent(new CustomEvent("nihongoroute_pause_native_audio"));
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(preset.text);
    utterance.lang = "ja-JP";
    utterance.rate = playbackRate;
    utterance.pitch = 1;
    
    // Find Japanese voice
    const currentVoices = voices.length > 0 ? voices : window.speechSynthesis.getVoices();
    const japaneseVoice = currentVoices.find((voice) => voice.lang.toLowerCase().startsWith("ja"));
    if (japaneseVoice) utterance.voice = japaneseVoice;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => {
      setIsSpeaking(false);
      setError("Pemutaran suara target gagal dijalankan.");
    };

    window.speechSynthesis.speak(utterance);
  };

  /** Request microphone access and start recording. */
  const startRecording = async () => {
    if (!recordingSupported) {
      setError("Browser ini belum mendukung perekaman mikrofon.");
      return;
    }

    try {
      setError("");
      stopSpeaking();
      clearRecording();
      chunksRef.current = [];

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const options = MediaRecorder.isTypeSupported("audio/webm")
        ? { mimeType: "audio/webm" }
        : undefined;
      const recorder = new MediaRecorder(stream, options);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunksRef.current.push(event.data);
      };

      recorder.onstop = () => {
        stopTimer();
        stopStream();
        setIsRecording(false);

        const blob = new Blob(chunksRef.current, {
          type: recorder.mimeType || "audio/webm",
        });
        if (blob.size > 0) {
          const url = URL.createObjectURL(blob);
          audioUrlRef.current = url;
          setAudioUrl(url);
          
          // Log learning event to store
          recordLearningEvent({
            type: "shadowing_recorded",
            source: {
              type: preset.sourceType === "static" ? "tool" : preset.sourceType || "tool",
              id: preset.id,
              slug: preset.sourceHref?.split("/").pop(),
              title: preset.sourceTitle || preset.title,
              href: preset.sourceHref,
              level: preset.level,
            },
            metrics: {
              elapsedSeconds: finalElapsedRef.current || elapsedSeconds,
              targetSeconds: preset.targetSeconds,
            },
            details: {
              kind: "shadowing",
              focus: preset.focus,
              text: preset.text,
            },
          });
        }
      };

      startedAtRef.current = Date.now();
      setElapsedSeconds(0);
      timerRef.current = setInterval(() => {
        if (!startedAtRef.current) return;
        setElapsedSeconds(Math.floor((Date.now() - startedAtRef.current) / 1000));
      }, 250);

      recorder.start();
      setIsRecording(true);
    } catch {
      stopTimer();
      stopStream();
      setIsRecording(false);
      setError("Izin mikrofon ditolak atau perangkat audio tidak tersedia.");
    }
  };

  /** Stop recording and calculate final duration. */
  const stopRecording = () => {
    const recorder = mediaRecorderRef.current;
    if (recorder && recorder.state !== "inactive") {
      recorder.stop();
    }
    if (startedAtRef.current) {
      const finalElapsed = Math.floor((Date.now() - startedAtRef.current) / 1000);
      finalElapsedRef.current = finalElapsed;
      setElapsedSeconds(finalElapsed);
    }
    startedAtRef.current = null;
  };

  return (
    <div className="min-h-screen bg-background/95 px-4 py-12 md:px-8">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
        <header className="flex flex-col gap-5">
          <Button variant="outline" asChild className="w-fit rounded-xl">
            <Link href={ROUTES.TOOLS.ROOT}>Kembali ke Peralatan</Link>
          </Button>
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <div className="flex size-12 items-center justify-center rounded-lg border border-success/20 bg-success/10 text-success">
                <Mic size={24} aria-hidden="true" />
              </div>
              <Badge className="w-fit rounded-xl px-3 py-1">Perekam Shadowing</Badge>
            </div>
            <h1 className="max-w-3xl text-4xl uppercase tracking-tight text-foreground md:text-6xl">
              Shadowing Studio
            </h1>
            <p className="max-w-2xl text-sm font-medium leading-relaxed text-muted-foreground">
              Putar kalimat target, rekam suara sendiri, lalu bandingkan tempo dan artikulasi dari hasil playback.
            </p>
            <p className="text-xs font-bold text-muted-foreground">
              {libraryPresetCount > 0
                ? `${libraryPresetCount} preset aktif dari reading/listening library.`
                : "Memakai preset lokal karena materi library belum tersedia."}
            </p>
            {contextLabel ? (
              <Badge variant="outline" className="w-fit rounded-xl px-3 py-1 text-[10px]">
                {contextLabel}
              </Badge>
            ) : null}
          </div>
        </header>

        <div className="grid gap-6 lg:grid-cols-[340px_1fr]">
          <Card className="rounded-2xl md:rounded-3xl border border-border bg-card/45 p-5 shadow-xl">
            <div className="mb-5 flex items-center gap-2">
              <AudioLines size={16} className="text-primary" aria-hidden="true" />
              <h2 className="text-xs uppercase tracking-[0.2em] text-foreground">
                Baris Preset
              </h2>
            </div>
            <div className="flex flex-col gap-2">
              {presets.map((item, index) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handlePresetChange(index)}
                  disabled={isRecording}
                  className={cn(
                    "rounded-lg border p-4 text-left transition-all",
                    preset.id === item.id
                      ? "border-success/40 bg-success/10 text-success"
                      : "border-border bg-background/35 text-muted-foreground hover:text-foreground"
                  )}
                >
                  <span className="block text-xs font-black uppercase tracking-widest">
                    {item.level} · {item.focus}
                  </span>
                  <span className="mt-1 block text-sm font-black text-foreground">
                    {item.title}
                  </span>
                  <span className="mt-2 block font-japanese text-sm font-bold leading-relaxed">
                    {item.text}
                  </span>
                  {item.sourceTitle ? (
                    <span className="mt-2 block text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                      {item.sourceType}: {item.sourceTitle}
                    </span>
                  ) : null}
                </button>
              ))}
            </div>
          </Card>

          <div className="flex flex-col gap-6">
            <Card className="rounded-2xl md:rounded-3xl border border-border bg-card/45 p-5 shadow-2xl md:p-8">
              <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <Badge variant="outline" className="mb-3 rounded-xl">
                    {preset.level} · Target {formatShadowingDuration(preset.targetSeconds)}
                  </Badge>
                  <p className="font-japanese text-3xl font-black leading-relaxed text-foreground md:text-5xl">
                    {preset.text}
                  </p>
                  <p className="mt-3 text-sm font-medium leading-relaxed text-muted-foreground">
                    {preset.translation}
                  </p>
                  {preset.sourceHref ? (
                    <Button asChild variant="outline" size="sm" className="mt-4 rounded-xl">
                      <Link href={preset.sourceHref}>Buka Pustaka</Link>
                    </Button>
                  ) : null}
                </div>
                <div className="w-full rounded-lg border border-border bg-muted/15 p-4 sm:w-44">
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                    Rekaman
                  </p>
                  <p className="font-mono text-3xl font-black text-foreground">
                    {formatShadowingDuration(elapsedSeconds)}
                  </p>
                  <Progress value={pacePercent} className="mt-3 h-2" />
                </div>
              </div>

              <div className="mb-6 flex flex-wrap gap-2">
                {preset.chunks.map((chunk) => (
                  <span
                    key={chunk}
                    className="rounded-xl border border-primary/20 bg-primary/10 px-3 py-2 font-japanese text-sm font-black text-primary"
                  >
                    {chunk}
                  </span>
                ))}
              </div>

              <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
                <div className="flex flex-wrap items-center justify-center gap-3">
                  {PLAYBACK_RATES.map((item) => (
                    <button
                      key={item.label}
                      type="button"
                      onClick={() => setPlaybackRate(item.value)}
                      aria-pressed={playbackRate === item.value}
                      className={cn(
                        "min-h-11 rounded-xl border px-2 text-xs font-black uppercase tracking-widest transition-all",
                        playbackRate === item.value
                          ? "border-primary/40 bg-primary/10 text-primary"
                          : "border-border bg-background/35 text-muted-foreground hover:text-foreground"
                      )}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
                <Button type="button" onClick={speakTarget} className="rounded-xl">
                  {isSpeaking ? <Square data-icon="inline-start" /> : <Volume2 data-icon="inline-start" />}
                  {isSpeaking ? "Hentikan Target" : "Putar Target"}
                </Button>
              </div>

              <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-wrap gap-2">
                  {!isRecording ? (
                    <Button type="button" onClick={startRecording} className="rounded-xl">
                      <Mic data-icon="inline-start" />
                      Rekam
                    </Button>
                  ) : (
                    <Button type="button" variant="destructive" onClick={stopRecording} className="rounded-xl">
                      <Square data-icon="inline-start" />
                      Hentikan
                    </Button>
                  )}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={clearRecording}
                    disabled={isRecording || !audioUrl}
                    className="rounded-xl"
                  >
                    <RotateCcw data-icon="inline-start" />
                    Ulang Rekaman
                  </Button>
                </div>
                <div className="rounded-xl border border-border bg-muted/15 px-4 py-3">
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                    Tempo
                  </p>
                  <p className="text-sm font-black text-foreground">{paceLabel}</p>
                </div>
              </div>
            </Card>

            <Card className="rounded-2xl md:rounded-3xl border border-border bg-card/45 p-5 shadow-xl">
              <div className="mb-4 flex items-center gap-2">
                <Waves size={16} className="text-success" aria-hidden="true" />
                <h2 className="text-xs uppercase tracking-[0.2em] text-foreground">
                  Playback Kamu
                </h2>
              </div>

              {audioUrl ? (
                <div className="rounded-lg border border-success/20 bg-success/10 p-4">
                  <audio controls src={audioUrl} className="w-full">
                    <track kind="captions" />
                  </audio>
                  <div className="mt-4 flex flex-col sm:flex-row gap-4">
                    <div className="rounded-xl border border-border bg-background/35 p-3">
                      <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                        Target
                      </p>
                      <p className="font-mono text-lg font-black text-foreground">
                        {formatShadowingDuration(preset.targetSeconds)}
                      </p>
                    </div>
                    <div className="rounded-xl border border-border bg-background/35 p-3">
                      <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                        Kamu
                      </p>
                      <p className="font-mono text-lg font-black text-foreground">
                        {formatShadowingDuration(elapsedSeconds)}
                      </p>
                    </div>
                    <div className="rounded-xl border border-border bg-background/35 p-3">
                      <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                        Fokus
                      </p>
                      <p className="text-sm font-black text-foreground">{preset.focus}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="rounded-lg border border-dashed border-border bg-muted/15 p-5">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Play size={16} aria-hidden="true" />
                    <p className="text-sm font-medium">
                      Rekaman akan muncul di sini setelah kamu menekan Stop.
                    </p>
                  </div>
                </div>
              )}

              {error ? (
                <p className="mt-4 rounded-lg border border-destructive/25 bg-destructive/10 p-4 text-sm font-bold text-destructive">
                  {error}
                </p>
              ) : null}

              {!speechSupported || !recordingSupported ? (
                <p className="mt-4 rounded-lg border border-warning/25 bg-warning/10 p-4 text-sm font-bold text-warning">
                  Beberapa fitur audio bergantung pada izin browser dan dukungan Web Speech atau MediaRecorder.
                </p>
              ) : null}
            </Card>

            <NextActionPanel compact />
          </div>
        </div>
      </div>
    </div>
  );
}