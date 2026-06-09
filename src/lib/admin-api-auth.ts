import crypto from "crypto";

interface AdminAuthResult {
  ok: boolean;
  status: number;
  error?: string;
}

function safeEqual(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);

  return (
    leftBuffer.length === rightBuffer.length &&
    crypto.timingSafeEqual(leftBuffer, rightBuffer)
  );
}

function readBearerToken(req: Request) {
  const header = req.headers.get("authorization")?.trim();
  if (!header) return null;

  if (header.toLowerCase().startsWith("bearer ")) {
    return header.slice(7).trim();
  }

  return header;
}

export function validateAdminApiRequest(req: Request): AdminAuthResult {
  const configuredSecret = process.env.ADMIN_API_SECRET?.trim();

  if (!configuredSecret) {
    return {
      ok: false,
      status: 503,
      error: "Admin API secret is not configured",
    };
  }

  const candidates = [
    readBearerToken(req),
    req.headers.get("x-admin-api-secret")?.trim(),
  ].filter((candidate): candidate is string => Boolean(candidate));

  const isAuthorized = candidates.some((candidate) =>
    safeEqual(candidate, configuredSecret)
  );

  if (!isAuthorized) {
    return {
      ok: false,
      status: 401,
      error: "Unauthorized",
    };
  }

  return { ok: true, status: 200 };
}
