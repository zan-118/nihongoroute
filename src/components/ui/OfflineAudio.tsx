"use client";

import React from "react";
import { useCachedAudio } from "@/hooks/useCachedAudio";

interface OfflineAudioProps extends React.AudioHTMLAttributes<HTMLAudioElement> {
  src: string;
}

/**
 * @file OfflineAudio.tsx
 * @description Komponen pemutar audio HTML5 yang secara otomatis memanfaatkan useCachedAudio
 * untuk caching luring penuh.
 */
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
