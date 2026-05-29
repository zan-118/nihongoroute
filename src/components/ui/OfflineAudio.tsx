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
interface OfflineAudioProps extends React.AudioHTMLAttributes<HTMLAudioElement> {
  src: string;
}

// ======================
// EKSEKUSI UTAMA
// ======================
export function OfflineAudio({ src, className, ...props }: OfflineAudioProps) {
  const cachedUrl = useCachedAudio(src);

  return (
    <audio
      src={cachedUrl}
      className={className}
      {...props}
    />
  );
}
