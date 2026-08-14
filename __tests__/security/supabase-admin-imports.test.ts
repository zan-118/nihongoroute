import { describe, expect, it } from "vitest";
import { readdirSync, readFileSync, statSync } from "fs";
import { join } from "path";

function listSourceFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((entry) => {
    const path = join(dir, entry);
    const stat = statSync(path);
    if (stat.isDirectory()) return listSourceFiles(path);
    return /\.(ts|tsx)$/.test(entry) ? [path] : [];
  });
}

describe("Supabase admin client imports", () => {
  it("stays out of Client Components", () => {
    const offenders = listSourceFiles(join(process.cwd(), "src")).filter((file) => {
      const source = readFileSync(file, "utf8");
      return source.includes("\"use client\"") && source.includes("@/lib/supabase/admin");
    });

    expect(offenders).toEqual([]);
  });
});
