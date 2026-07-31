/**
 * @file index.ts
 * @description Modul terpadu komponen & hook media audio (Media Feature Seam).
 */

export { OfflineAudio } from "./OfflineAudio";
export type { OfflineAudioProps } from "./OfflineAudio";

export { TTSReader } from "./TTSReader";
export type { TTSReaderProps } from "./TTSReader";

export { useTTSReader } from "./useTTSReader";
export { useLineTTS } from "./hooks/useLineTTS";
export type { TTSRate, TTSLineItem } from "./hooks/useLineTTS";
