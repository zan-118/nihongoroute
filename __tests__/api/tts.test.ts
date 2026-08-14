import { beforeEach, describe, expect, it, vi } from "vitest";

const processTtsPipeline = vi.fn();

vi.mock("@/lib/audio/tts-pipeline", () => ({
  MAX_TTS_TEXT_LENGTH: 500,
  processTtsPipeline,
}));

describe("TTS API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    processTtsPipeline.mockResolvedValue({
      audioBuffer: new Uint8Array([1, 2, 3]),
      contentType: "audio/mpeg",
      cacheControl: "no-store",
      isCacheHit: false,
    });
  });

  it("rate-limits burst requests per IP", async () => {
    const { GET } = await import("@/app/api/tts/route");
    const url = "https://example.test/api/tts?text=konnichiwa";
    const headers = { "x-forwarded-for": "203.0.113.77" };

    for (let i = 0; i < 30; i += 1) {
      const response = await GET(new Request(url, { headers }));
      expect(response.status).toBe(200);
    }

    const blocked = await GET(new Request(url, { headers }));

    expect(blocked.status).toBe(429);
    expect(processTtsPipeline).toHaveBeenCalledTimes(30);
  });
});
