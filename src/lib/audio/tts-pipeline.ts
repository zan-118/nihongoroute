import crypto from "crypto";
// @ts-ignore
import { MsEdgeTTS } from "msedge-tts";
import { TTS_VOICES, SPEAKER_MAP, type TtsVoice } from "@/lib/constants/tts";
import { MALE_VOICES } from "@/lib/audio/tts";
import { createAdminClient } from "@/lib/supabase/admin";

import { getR2PublicUrl } from "@/lib/storage/r2";

export const MAX_TTS_TEXT_LENGTH = 500;
const ALLOWED_VOICES = new Set(Object.values(TTS_VOICES));

export interface TTSRequestParams {
 text: string;
 voice?: string;
 rate?: string;
}

export interface TTSPipelineResult {
 audioBuffer?: Uint8Array;
 contentType?: string;
 cacheControl?: string;
 redirectUrl?: string;
 isCacheHit: boolean;
}

/**
 * Resolves raw input voice string to valid TtsVoice enum value using canonical speaker map.
 */
export function resolveTtsVoice(rawVoice?: string): TtsVoice {
 const normalized = (rawVoice || "zundamon").trim().toLowerCase();
 return (
 SPEAKER_MAP[normalized] ||
 (ALLOWED_VOICES.has(normalized as TtsVoice)
 ? (normalized as TtsVoice)
 : TTS_VOICES.ZUNDAMON)
 );
}

/**
 * Generates deterministic MD5 hash key for text + voice + rate combination.
 */
export function generateTtsCacheKey(text: string, voice: TtsVoice, rate: string = "medium"): string {
 return crypto
 .createHash("md5")
 .update(`${text}_${voice}_${rate}`)
 .digest("hex");
}

/**
 * Synthesizes speech dynamically using MsEdgeTTS neural voices.
 */
export async function synthesizeEdgeTTS(text: string, edgeVoice: string): Promise<Buffer> {
 const tts = new MsEdgeTTS();
 await tts.setMetadata(
 edgeVoice,
 "audio-24khz-96kbitrate-mono-mp3" as unknown as Parameters<typeof tts.setMetadata>[1]
 );

 return new Promise<Buffer>((resolve, reject) => {
 const chunks: Buffer[] = [];
 const { audioStream } = tts.toStream(text);

 const timer = setTimeout(() => {
 if (audioStream && typeof audioStream.destroy === "function") {
 audioStream.destroy();
 }
 reject(new Error("Timeout koneksi Edge TTS (10 detik)."));
 }, 10000);

 audioStream.on("data", (data: Buffer) => chunks.push(data));
 audioStream.on("end", () => {
 clearTimeout(timer);
 resolve(Buffer.concat(chunks));
 });
 audioStream.on("error", (err: Error) => {
 clearTimeout(timer);
 reject(err);
 });
 });
}

/**
 * Executes the complete TTS pipeline:
 * 1. Checks Supabase tts_cache DB & Storage bucket.
 * 2. On cache hit, returns stored audio with immutable cache header.
 * 3. On cache miss, performs dynamic MsEdgeTTS synthesis with ephemeral no-store header.
 */
export async function processTtsPipeline(params: TTSRequestParams): Promise<TTSPipelineResult> {
 const text = params.text.trim();
 const voice = resolveTtsVoice(params.voice);
 const rate = params.rate || "medium";

 const hash = generateTtsCacheKey(text, voice, rate);
 const supabase = createAdminClient();

 // 1. Cek Cache Supabase Database & Storage
 try {
 const { data: cached } = await supabase
 .from("tts_cache")
 .select("audio_url")
 .eq("id", hash)
 .maybeSingle();

 if (cached?.audio_url) {
 let storagePath = `${hash}.mp3`;
 const match = cached.audio_url.match(/\/tts-cache\/(.+)$/);
 if (match) {
 storagePath = decodeURIComponent(match[1]);
 }

 const publicUrl = getR2PublicUrl("tts-cache", storagePath);

 return {
 redirectUrl: publicUrl,
 isCacheHit: true,
 };
 }
 } catch (err) {
 console.warn("[TTSPipeline] Gagal membaca cache Supabase:", err);
 }

 // 2. Cache Miss: Sintesis dinamis via MsEdgeTTS
 const isMale = MALE_VOICES.includes(voice);
 const edgeVoice = isMale ? "ja-JP-KeitaNeural" : "ja-JP-NanamiNeural";
 const dynamicBuffer = await synthesizeEdgeTTS(text, edgeVoice);

 return {
 audioBuffer: new Uint8Array(dynamicBuffer),
 contentType: "audio/mpeg",
 cacheControl: "no-store",
 isCacheHit: false,
 };
}
