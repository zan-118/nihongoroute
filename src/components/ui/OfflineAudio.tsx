/**
 * @file OfflineAudio.tsx
 * @description Komponen pemutar audio HTML5 yang secara otomatis memanfaatkan useCachedAudio untuk caching luring penuh.
 */

"use client";

// ======================
// IMPOR
// ======================
import React from "react";
import { useCachedAudio } from "@/hooks/useCachedAudio";

// ======================
// ANTARMUKA / TIPE DATA
// ======================
/**
 * Props for OfflineAudio component.
 */
interface OfflineAudioProps extends React.AudioHTMLAttributes<HTMLAudioElement> {
  /** Source URL of the audio file. */
  src: string;
}

// ======================
// EKSEKUSI UTAMA
// ======================
/**
 * HTML5 audio player component. Uses cached audio URL for offline playback.
 *
 * @param props - Component props.
 * @param props.src - Source audio URL.
 * @param props.className - Optional CSS class name.
 */
export function OfflineAudio({ src, className, ...props }: OfflineAudioProps) {
  // Resolve source URL to cached blob URL if available offline.
  const cachedUrl = useCachedAudio(src);

  return (
    <audio
      src={cachedUrl}
      className={className}
      {...props}
    />
  );
}