/**
 * @file OfflineAudio.tsx
 * @description Komponen pemutar audio HTML5 luring dalam modul media domain.
 * Menggunakan useCachedAudio untuk pemutaran audio luring penuh.
 */

"use client";

// IMPOR

import React from "react";
import { useCachedAudio } from "@/hooks/useCachedAudio";

// ANTARMUKA / TIPE DATA

export interface OfflineAudioProps extends React.AudioHTMLAttributes<HTMLAudioElement> {
 /** Source URL of the audio file. */
 src: string;
}

// EKSEKUSI UTAMA

/**
 * HTML5 audio player component. Uses cached audio URL for offline playback.
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

export default OfflineAudio;
