import { describe, it, expect, afterEach } from "vitest";
import {
  getSiteUrl,
  absoluteUrl,
  DEFAULT_SITE_URL,
  organizationJsonLd,
  websiteJsonLd,
  webApplicationJsonLd,
  faqPageJsonLd,
} from "@/lib/core/seo";

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

describe("JSON-LD Schema Generators", () => {
  it("should generate rich Organization schema with knowsAbout topics", () => {
    const org = organizationJsonLd();
    expect(org["@type"]).toBe("Organization");
    expect(org.name).toBe("NihongoRoute");
    expect(Array.isArray(org.knowsAbout)).toBe(true);
    expect(org.knowsAbout).toContain("JLPT N5");
  });

  it("should generate WebSite schema with SearchAction for sitelinks", () => {
    const site = websiteJsonLd();
    expect(site["@type"]).toBe("WebSite");
    expect(site.potentialAction).toBeDefined();
    const action = site.potentialAction as Record<string, unknown>;
    expect(action["@type"]).toBe("SearchAction");
  });

  it("should generate WebApplication schema with free offer", () => {
    const app = webApplicationJsonLd({
      name: "Kana Master",
      description: "Latihan Hiragana & Katakana",
      path: "/tools/kana",
    });
    expect(app["@type"]).toBe("WebApplication");
    expect(app.applicationCategory).toBe("EducationalApplication");
    expect(app.isAccessibleForFree).toBe(true);
    const offer = app.offers as Record<string, unknown>;
    expect(offer.price).toBe("0");
  });

  it("should generate FAQPage schema correctly", () => {
    const faq = faqPageJsonLd([
      { question: "Apakah gratis?", answer: "Ya, 100% gratis." },
    ]);
    expect(faq["@type"]).toBe("FAQPage");
    expect(Array.isArray(faq.mainEntity)).toBe(true);
    const entities = faq.mainEntity as Record<string, unknown>[];
    expect(entities[0].name).toBe("Apakah gratis?");
  });
});
