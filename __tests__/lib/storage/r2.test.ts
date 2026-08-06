import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { getR2PublicUrl } from "@/lib/storage/r2";

describe("getR2PublicUrl", () => {
  const originalR2Url = process.env.NEXT_PUBLIC_R2_PUBLIC_URL;
  const originalSupabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

  beforeEach(() => {
    process.env.NEXT_PUBLIC_R2_PUBLIC_URL = "https://assets.nihongoroute.com";
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://hubqetausiziocdlbdmd.supabase.co";
  });

  afterEach(() => {
    process.env.NEXT_PUBLIC_R2_PUBLIC_URL = originalR2Url;
    process.env.NEXT_PUBLIC_SUPABASE_URL = originalSupabaseUrl;
  });

  it("should construct direct CDN URL using Cloudflare Custom Domain when NEXT_PUBLIC_R2_PUBLIC_URL is set", () => {
    const url = getR2PublicUrl("tts-cache", "test-hash.mp3");
    expect(url).toBe("https://assets.nihongoroute.com/tts-cache/test-hash.mp3");
  });

  it("should handle leading slashes in objectPath gracefully", () => {
    const url = getR2PublicUrl("exam-assets", "/n5/audio/q1.mp3");
    expect(url).toBe("https://assets.nihongoroute.com/exam-assets/n5/audio/q1.mp3");
  });

  it("should avoid repeating bucket name if objectPath already starts with bucket name", () => {
    const url = getR2PublicUrl("tts-cache", "tts-cache/sample.mp3");
    expect(url).toBe("https://assets.nihongoroute.com/tts-cache/sample.mp3");
  });

  it("should fallback gracefully to Supabase Storage URL if NEXT_PUBLIC_R2_PUBLIC_URL is empty", () => {
    delete process.env.NEXT_PUBLIC_R2_PUBLIC_URL;
    const url = getR2PublicUrl("asset", "vocab/123.mp3");
    expect(url).toBe("https://hubqetausiziocdlbdmd.supabase.co/storage/v1/object/public/asset/vocab/123.mp3");
  });
});
