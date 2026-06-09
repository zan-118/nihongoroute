export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const REQUIRED_ENV = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "NEXT_PUBLIC_SANITY_PROJECT_ID",
  "NEXT_PUBLIC_SANITY_DATASET",
  "NEXT_PUBLIC_SITE_URL",
];

const FEATURE_ENV = [
  "ADMIN_API_SECRET",
  "SUPABASE_SERVICE_ROLE_KEY",
  "GEMINI_API_KEY",
  "SANITY_API_READ_TOKEN",
];

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
