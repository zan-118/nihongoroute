import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { submitIndexNow, getHostFromUrl, INDEXNOW_KEY, INDEXNOW_ENDPOINT } from "@/lib/services/indexnow";

describe("IndexNow Service", () => {
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://nihongoroute.my.id");
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
    vi.clearAllMocks();
    vi.unstubAllEnvs();
  });

  it("extracts hostname accurately", () => {
    expect(getHostFromUrl("https://nihongoroute.my.id/subpath")).toBe("nihongoroute.my.id");
    expect(getHostFromUrl("http://localhost:3000")).toBe("localhost");
  });

  it("handles empty URL list gracefully", async () => {
    const result = await submitIndexNow([]);
    expect(result.success).toBe(true);
    expect(result.submittedCount).toBe(0);
  });

  it("submits batch of URLs successfully with correct payload", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
    });
    globalThis.fetch = fetchMock;

    const urls = ["/courses", "/library/vocab", "https://nihongoroute.my.id/about"];
    const result = await submitIndexNow(urls);

    expect(result.success).toBe(true);
    expect(result.submittedCount).toBe(3);
    expect(fetchMock).toHaveBeenCalledTimes(1);

    const [url, options] = fetchMock.mock.calls[0];
    expect(url).toBe(INDEXNOW_ENDPOINT);
    expect(options.method).toBe("POST");

    const payload = JSON.parse(options.body);
    expect(payload.host).toBe("nihongoroute.my.id");
    expect(payload.key).toBe(INDEXNOW_KEY);
    expect(payload.keyLocation).toBe(`https://nihongoroute.my.id/${INDEXNOW_KEY}.txt`);
    expect(payload.urlList).toEqual([
      "https://nihongoroute.my.id/courses",
      "https://nihongoroute.my.id/library/vocab",
      "https://nihongoroute.my.id/about",
    ]);
  });

  it("handles API error status codes", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 422,
      text: vi.fn().mockResolvedValue("Unprocessable Entity"),
    });
    globalThis.fetch = fetchMock;

    const result = await submitIndexNow(["/courses"]);
    expect(result.success).toBe(false);
    expect(result.statusCode).toBe(422);
    expect(result.error).toContain("422");
  });

  it("handles network failures gracefully", async () => {
    const fetchMock = vi.fn().mockRejectedValue(new Error("Connection timeout"));
    globalThis.fetch = fetchMock;

    const result = await submitIndexNow(["/courses"]);
    expect(result.success).toBe(false);
    expect(result.error).toContain("Connection timeout");
  });
});
