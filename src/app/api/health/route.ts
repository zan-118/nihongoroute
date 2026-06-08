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

  return {
    status: healthy ? "ok" : "degraded",
    time: new Date().toISOString(),
    uptimeSeconds: Math.round(process.uptime()),
    checks: {
      env: {
        ok: healthy,
        missingRequired,
        missingFeature,
      },
    },
  };
}

export function GET() {
  const payload = getHealthPayload();

  return Response.json(payload, {
    status: payload.checks.env.ok ? 200 : 503,
    headers: {
      "Cache-Control": "no-store",
    },
  });
}

export function HEAD() {
  const payload = getHealthPayload();

  return new Response(null, {
    status: payload.checks.env.ok ? 200 : 503,
    headers: {
      "Cache-Control": "no-store",
    },
  });
}

