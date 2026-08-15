/**
 * @file indexnow.ts
 * @description Service engine for IndexNow real-time URL submission to Microsoft Bing and participating search engines.
 * @module IndexNowService
 */

import { getSiteUrl } from "@/lib/core/seo";

export const INDEXNOW_KEY = "c7b94918e9074092b77a76058e594d21";
export const INDEXNOW_ENDPOINT = "https://api.indexnow.org/indexnow";
const MAX_URLS_PER_BATCH = 10_000;

export interface IndexNowPayload {
  host: string;
  key: string;
  keyLocation: string;
  urlList: string[];
}

export interface IndexNowResult {
  success: boolean;
  submittedCount: number;
  statusCode?: number;
  message?: string;
  error?: string;
}

/**
 * Extract hostname from base URL (strip protocol and port).
 */
export function getHostFromUrl(url: string): string {
  try {
    const parsed = new URL(url);
    return parsed.hostname;
  } catch {
    return "nihongoroute.my.id";
  }
}

/**
 * Submit list of changed or new URLs to IndexNow endpoint.
 * Automatically splits large URL lists into compliant batches (up to 10,000 URLs).
 *
 * @param rawUrls - Array of absolute or relative URLs to submit.
 * @returns Result object containing success status and submitted count.
 */
export async function submitIndexNow(rawUrls: string[]): Promise<IndexNowResult> {
  const baseUrl = getSiteUrl();
  const host = getHostFromUrl(baseUrl);
  const keyLocation = `${baseUrl}/${INDEXNOW_KEY}.txt`;

  // Normalize URLs to full absolute URLs
  const uniqueUrls = Array.from(
    new Set(
      rawUrls
        .map((u) => u.trim())
        .filter((u) => Boolean(u))
        .map((u) => (u.startsWith("http://") || u.startsWith("https://") ? u : `${baseUrl}${u.startsWith("/") ? u : `/${u}`}`))
    )
  );

  if (uniqueUrls.length === 0) {
    return {
      success: true,
      submittedCount: 0,
      message: "No URLs provided for submission",
    };
  }

  let totalSubmitted = 0;

  // Process in batches of MAX_URLS_PER_BATCH
  for (let i = 0; i < uniqueUrls.length; i += MAX_URLS_PER_BATCH) {
    const batch = uniqueUrls.slice(i, i + MAX_URLS_PER_BATCH);
    const payload: IndexNowPayload = {
      host,
      key: INDEXNOW_KEY,
      keyLocation,
      urlList: batch,
    };

    try {
      const response = await fetch(INDEXNOW_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json; charset=utf-8",
        },
        body: JSON.stringify(payload),
      });

      // IndexNow returns 200 (OK) or 202 (Accepted) on success
      if (!response.ok && response.status !== 202) {
        const errorText = await response.text().catch(() => "Unknown error");
        return {
          success: false,
          submittedCount: totalSubmitted,
          statusCode: response.status,
          error: `IndexNow API returned status ${response.status}: ${errorText}`,
        };
      }

      totalSubmitted += batch.length;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Network error";
      return {
        success: false,
        submittedCount: totalSubmitted,
        error: `Failed to submit URLs to IndexNow: ${errorMessage}`,
      };
    }
  }

  return {
    success: true,
    submittedCount: totalSubmitted,
    message: `Successfully submitted ${totalSubmitted} URL(s) to IndexNow`,
  };
}
