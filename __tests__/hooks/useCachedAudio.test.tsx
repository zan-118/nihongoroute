import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useCachedAudio } from "@/hooks/useCachedAudio";

// Mock API browser yang tidak tersedia di jsdom
if (typeof window !== "undefined") {
  global.caches = {
    open: vi.fn().mockResolvedValue({
      match: vi.fn().mockResolvedValue(null),
      put: vi.fn().mockResolvedValue(undefined),
    }),
  } as unknown as CacheStorage;
}

describe("useCachedAudio Hook", () => {
  beforeEach(() => {
    // Mock global fetch
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      clone: vi.fn().mockImplementation(function (this: Response) {
        return this;
      }),
      blob: vi.fn().mockResolvedValue(new Blob(["mock-audio-data"], { type: "audio/mpeg" })),
    } as unknown as Response);

    // Mock URL.createObjectURL dan URL.revokeObjectURL
    global.URL.createObjectURL = vi.fn().mockReturnValue("blob:mock-audio-url");
    global.URL.revokeObjectURL = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("kembali dengan undefined jika src kosong", () => {
    const { result } = renderHook(() => useCachedAudio(undefined));
    expect(result.current).toBeUndefined();
  });

  it("melakukan fetch dan caching jika berkas tidak ditemukan di cache", async () => {
    const { result } = renderHook(() => useCachedAudio("https://example.com/audio.mp3"));

    await waitFor(() => {
      expect(result.current).toBe("blob:mock-audio-url");
    });

    expect(global.fetch).toHaveBeenCalledWith("https://example.com/audio.mp3");
    expect(global.URL.createObjectURL).toHaveBeenCalled();
  });

  it("langsung menggunakan berkas dari cache jika tersedia", async () => {
    // Mock cache hit
    const mockBlob = new Blob(["cached-audio-data"], { type: "audio/mpeg" });
    const mockCachedResponse = {
      blob: vi.fn().mockResolvedValue(mockBlob),
    };

    global.caches.open = vi.fn().mockResolvedValue({
      match: vi.fn().mockResolvedValue(mockCachedResponse),
      put: vi.fn(),
    });

    const { result } = renderHook(() => useCachedAudio("https://example.com/cached-audio.mp3"));

    await waitFor(() => {
      expect(result.current).toBe("blob:mock-audio-url");
    });

    expect(global.fetch).not.toHaveBeenCalled();
    expect(global.URL.createObjectURL).toHaveBeenCalled();
  });
});
