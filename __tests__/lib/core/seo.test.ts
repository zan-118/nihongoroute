import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { getSiteUrl, absoluteUrl, DEFAULT_SITE_URL } from "@/lib/core/seo";

describe("SEO Helper (getSiteUrl & absoluteUrl)", () => {
  const originalEnv = process.env.NEXT_PUBLIC_SITE_URL;

  afterEach(() => {
    process.env.NEXT_PUBLIC_SITE_URL = originalEnv;
  });

  it("should return DEFAULT_SITE_URL when NEXT_PUBLIC_SITE_URL is not set", () => {
    delete process.env.NEXT_PUBLIC_SITE_URL;
    expect(getSiteUrl()).toBe(DEFAULT_SITE_URL);
  });

  it("should fallback to DEFAULT_SITE_URL when NEXT_PUBLIC_SITE_URL is an invalid or relative URL like '/'", () => {
    process.env.NEXT_PUBLIC_SITE_URL = "/";
    expect(getSiteUrl()).toBe(DEFAULT_SITE_URL);
  });

  it("should return parsed origin when NEXT_PUBLIC_SITE_URL is a valid absolute URL", () => {
    process.env.NEXT_PUBLIC_SITE_URL = "https://www.nihongoroute.my.id/";
    expect(getSiteUrl()).toBe("https://www.nihongoroute.my.id");
  });

  it("should convert relative path to absolute URL", () => {
    process.env.NEXT_PUBLIC_SITE_URL = "https://www.nihongoroute.my.id";
    expect(absoluteUrl("/about")).toBe("https://www.nihongoroute.my.id/about");
  });
});
