/** Node.js runtime configuration. */
export const runtime = "nodejs";

/** Force dynamic rendering to prevent caching health checks. */
export const dynamic = "force-dynamic";

/** Critical environment variables needed for app startup. */
const REQUIRED_ENV = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "NEXT_PUBLIC_SANITY_PROJECT_ID",
  "NEXT_PUBLIC_SANITY_DATASET",
  "NEXT_PUBLIC_SITE_URL",
];

/** Optional environment variables for specific features. */
const FEATURE_ENV = [
  "ADMIN_API_SECRET",
  "SUPABASE_SERVICE_ROLE_KEY",
  "GEMINI_API_KEY",
  "SANITY_API_READ_TOKEN",
];

/**
 * Check environment variables and build health status payload.
 * @returns Health status object.
 */
function getHealthPayload() {
  const missingRequired = REQUIRED_ENV.filter((key) => !process.env[key]);
  const missingFeature = FEATURE_ENV.filter((key) => !process.env[key]);
  const healthy = missingRequired.length === 0;
  const envCheck = {
    ok: healthy,
    missingRequired,
    missingFeature,
  };

  return {
    status: healthy ? "ok" : "degraded",
    time: new Date().toISOString(),
    uptimeSeconds: Math.round(process.uptime()),
    checks: {
      // Hide exact missing keys in production to prevent info leaks.
      env: process.env.NODE_ENV === "production"
        ? {
            ok: healthy,
            missingRequiredCount: missingRequired.length,
            missingFeatureCount: missingFeature.length,
          }
        : envCheck,
    },
  };
}

/**
 * Handle GET request. Return health status JSON.
 * @returns Response with health payload.
 */
export function GET() {
  const payload = getHealthPayload();
  const envOk = payload.status === "ok";

  return Response.json(payload, {
    status: envOk ? 200 : 503,
    headers: {
      "Cache-Control": "no-store",
    },
  });
}

/**
 * Handle HEAD request. Return health status code without body.
 * @returns Response with status code only.
 */
export function HEAD() {
  const payload = getHealthPayload();
  const envOk = payload.status === "ok";

  return new Response(null, {
    status: envOk ? 200 : 503,
    headers: {
      "Cache-Control": "no-store",
    },
  });
}