import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";

// Load environment variables from .env.local if exists
const envPath = path.resolve(process.cwd(), ".env.local");
const hasEnv = fs.existsSync(envPath);
if (hasEnv) {
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
}

import { getLibraryItemBySlug } from "@/actions/library.actions";
import { getCheatsheetByIdOrSlug } from "@/actions/cheatsheets.actions";

const isCI = process.env.GITHUB_ACTIONS === "true" || !hasEnv;

describe.skipIf(isCI)("Reading and Cheatsheet Action Tests", () => {
  it("should fetch reading material by slug", async () => {
    const slug = "reading-n5-keluarga-saya--304712";
    const data = await getLibraryItemBySlug("reading", slug);
    console.log("Reading fetch result:", data);
    expect(data).not.toBeNull();
    expect(data?.title).toContain("Keluarga Saya");
  });

  it("should fetch cheatsheet by slug", async () => {
    const slug = "angka-dan-penghitung";
    const data = await getCheatsheetByIdOrSlug(slug);
    console.log("Cheatsheet fetch result:", data);
    expect(data).not.toBeNull();
    expect(data?.slug).toBe(slug);
  });
});
