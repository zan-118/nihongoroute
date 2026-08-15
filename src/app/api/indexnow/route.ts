/**
 * @file route.ts
 * @description Admin API endpoint for triggering IndexNow URL submissions to Bing & participating search engines.
 * @module IndexNowApiRoute
 */

import { NextResponse } from "next/server";
import { validateAdminApiRequest } from "@/lib/core/admin-api-auth";
import { submitIndexNow } from "@/lib/services/indexnow";
import { securityLogger } from "@/lib/core/logger";
import { z } from "zod";

const indexNowRequestSchema = z.object({
  urls: z.array(z.string().trim().min(1)).max(10_000).optional(),
});

/**
 * Top canonical public paths for baseline submission.
 */
const CANONICAL_PUBLIC_PATHS = [
  "/",
  "/courses",
  "/courses/n5",
  "/courses/n4",
  "/courses/n3",
  "/courses/n2",
  "/courses/n1",
  "/courses/articles",
  "/library",
  "/library/vocab",
  "/library/kanji",
  "/library/grammar",
  "/library/reading",
  "/library/listening",
  "/library/cheatsheet",
  "/tools",
  "/tools/kana",
  "/tools/writing",
  "/tools/conjugation",
  "/tools/particles",
  "/tools/kanji-similarity",
  "/tools/text-analyzer",
  "/tools/dictionary",
  "/tools/counter-trainer",
  "/tools/sentence-builder",
  "/tools/shadowing",
  "/tools/dictation",
  "/tools/flashcards",
  "/tools/survival",
  "/tools/weak-points",
  "/exams",
  "/about",
  "/contact",
  "/support",
  "/privacy",
  "/terms",
];

/**
 * POST /api/indexnow
 * Protected by admin API secret key.
 */
export async function POST(request: Request) {
  // 1. Authenticate admin request
  const auth = validateAdminApiRequest(request);
  if (!auth.ok) {
    securityLogger.warn({
      event: "indexnow_admin_unauthorized",
      source: "api_indexnow",
    });
    return NextResponse.json({ error: auth.error ?? "Unauthorized" }, { status: auth.status });
  }

  // 2. Parse payload if present
  let targetUrls: string[] = CANONICAL_PUBLIC_PATHS;

  try {
    const rawJson = await request.json().catch(() => ({}));
    const parsed = indexNowRequestSchema.safeParse(rawJson);
    if (parsed.success && parsed.data.urls && parsed.data.urls.length > 0) {
      targetUrls = parsed.data.urls;
    }
  } catch {
    // Default to canonical paths on empty/non-JSON body
  }

  // 3. Submit to IndexNow
  const result = await submitIndexNow(targetUrls);

  if (!result.success) {
    securityLogger.error({
      event: "indexnow_submission_failed",
      source: "api_indexnow",
      metadata: { error: result.error ?? null, count: targetUrls.length },
    });
    return NextResponse.json(result, { status: 502 });
  }

  securityLogger.info({
    event: "indexnow_submission_success",
    source: "api_indexnow",
    metadata: { count: result.submittedCount },
  });

  return NextResponse.json(result, { status: 200 });
}
