import { NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import crypto from "crypto";

export const dynamic = "force-dynamic";

const MAX_TEXT_LENGTH = 500;

const ALLOWED_VOICES = new Set([
  // Wanita
  "lara",
  "indah",
  "siti",
  "dewi",
  "hayashi",
  "sato",
  "ayu",
  "zundamon",
  
  // Pria
  "dito",
  "budi",
  "suzuki",
  "tanaka",
  "yamada",
  "kimura",
  "andi",
  "faisal",
  "takahashi",
  "kobayashi",
  "namonashi",
  "ritsu",
  "ooba",
]);

const CANONICAL_TO_JAPANESE: Record<string, string> = {
  suzuki: "鈴木",
  tanaka: "田中",
  sato: "佐藤",
  yamada: "山田",
  kimura: "木村",
  kobayashi: "小林",
  takahashi: "高橋",
  hayashi: "林",
  budi: "ブディ",
  ayu: "アユ",
  indah: "インダ",
  lara: "ララ",
  siti: "シティ",
  dewi: "デウィ",
  dito: "ディト",
  andi: "アンディ",
  faisal: "ファイサル",
  ritsu: "リツ",
};

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const text  = (searchParams.get("text") || "").trim();
  const voice = searchParams.get("voice") || "zundamon";
  const rate  = searchParams.get("rate")  || "medium";

  console.log(`\n--- [TTS API REQUEST] ---`);
  console.log(`Text:  "${text}"`);
  console.log(`Voice: "${voice}"`);
  console.log(`Rate:  "${rate}"`);

  if (!text) {
    console.log(`[TTS API] Gagal: parameter teks kosong.`);
    return new Response("Missing text parameter", { status: 400 });
  }
  if (text.length > MAX_TEXT_LENGTH) {
    console.log(`[TTS API] Gagal: teks terlalu panjang (${text.length} chars).`);
    return new Response("Text too long (max 500 chars)", { status: 400 });
  }
  if (!ALLOWED_VOICES.has(voice)) {
    console.log(`[TTS API] Gagal: pengisi suara "${voice}" tidak terdaftar.`);
    return new Response("Invalid voice", { status: 400 });
  }

  // 1. Hitung hash MD5 unik untuk kombinasi text + voice + rate
  let hash = crypto
    .createHash("md5")
    .update(`${text}_${voice}_${rate}`)
    .digest("hex");

  console.log(`Calculated Hash: "${hash}"`);

  const supabase = createAdminClient();

  try {
    // 2. Cek apakah metadata cache ada di Database
    let { data: cached } = await supabase
      .from("tts_cache")
      .select("audio_url")
      .eq("id", hash)
      .maybeSingle();

    // Fallback pencarian dengan nama bahasa Jepang jika tidak ditemukan
    if (!cached?.audio_url && CANONICAL_TO_JAPANESE[voice]) {
      const jpVoice = CANONICAL_TO_JAPANESE[voice];
      const fallbackHash = crypto
        .createHash("md5")
        .update(`${text}_${jpVoice}_${rate}`)
        .digest("hex");

      console.log(`Cache miss untuk "${voice}". Mencoba fallback Jepang "${jpVoice}" dengan hash: "${fallbackHash}"`);

      const { data: fallbackCached } = await supabase
        .from("tts_cache")
        .select("audio_url")
        .eq("id", fallbackHash)
        .maybeSingle();

      if (fallbackCached?.audio_url) {
        console.log(`Fallback Jepang HIT!`);
        cached = fallbackCached;
        hash = fallbackHash;
      }
    }

    if (cached?.audio_url) {
      console.log(`CACHE HIT di Database! Audio URL: ${cached.audio_url}`);
      console.log(`Mencoba download "${hash}.mp3" dari Storage tts-cache...`);

      // Coba download file audio dari Storage
      const { data: fileData, error: downloadError } = await supabase
        .storage
        .from("tts-cache")
        .download(`${hash}.mp3`);

      if (!downloadError && fileData && fileData.size > 0) {
        console.log(`SUKSES download file dari Storage! Ukuran: ${fileData.size} bytes. Memulangkan berkas biner.`);
        const audioBuffer = await fileData.arrayBuffer();
        return new Response(new Uint8Array(audioBuffer), {
          headers: {
            "Content-Type": "audio/mpeg",
            "Content-Length": fileData.size.toString(),
            "Cache-Control": "public, max-age=604800, immutable",
          },
        });
      } else {
        // DB record ada tapi file di Storage hilang/rusak — hapus record DB agar hash bisa di-generate ulang
        console.warn(`GAGAL download file dari Storage atau file kosong. Error:`, downloadError?.message);
        console.warn(`Menghapus record DB "${hash}" yang menunjuk ke file Storage yang tidak valid...`);
        try {
          await supabase.from("tts_cache").delete().eq("id", hash);
          console.log(`Record DB "${hash}" berhasil dihapus. Generate ulang audio via script VoiceVox.`);
        } catch (cleanupErr) {
          console.error(`Gagal hapus record DB "${hash}":`, cleanupErr);
        }
      }
    } else {
      console.log(`CACHE MISS di Database (Tidak ada data untuk hash "${hash}").`);
    }
  } catch (err) {
    console.error("[TTS API] Gagal membaca cache dari database/storage:", err);
  }

  // 3. Cache miss — tidak ada synthesis real-time dari API route.
  // Semua audio harus di-generate terlebih dahulu via script generate_voicevox.js / generate_example_sentences.js
  // menggunakan VOICEVOX lokal, kemudian disimpan ke Supabase Storage & DB.
  // Kembalikan 404 agar client fallback ke Web Speech API (browser).
  console.log(`Cache miss untuk hash "${hash}". Mengembalikan 404 — audio harus di-generate offline via VoiceVox.`);
  return new Response("Audio not found in cache", { status: 404 });
}
