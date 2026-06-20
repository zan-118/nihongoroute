import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";

// Load environment variables from .env.local
const envPath = path.resolve(process.cwd(), ".env.local");
const envContent = fs.readFileSync(envPath, "utf8");
envContent.split(/\r?\n/).forEach((line) => {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("#")) return;
  const eqIdx = trimmed.indexOf("=");
  if (eqIdx === -1) return;
  const key = trimmed.slice(0, eqIdx).trim();
  const val = trimmed.slice(eqIdx + 1).trim().replace(/^['"]|['"]$/g, "");
  process.env[key] = val;
});

import sitemap from "@/app/sitemap";

describe("Sitemap Performance and Size Test", () => {
  it("should generate sitemap and measure time", async () => {
    console.log("Measuring sitemap generation...");
    const start = Date.now();
    const urls = await sitemap();
    const duration = Date.now() - start;
    console.log(`Sitemap generated in ${duration}ms with ${urls.length} URLs`);
    
    expect(urls.length).toBeGreaterThan(0);
    // Vercel serverless function has a timeout of 10-15s (Hobby tier) or 60s (Pro).
    // A good sitemap should ideally load in under 5 seconds.
    expect(duration).toBeLessThan(10000); 
  }, 30000); // 30s timeout
});
