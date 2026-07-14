import crypto from "crypto";

/**
 * Result of admin authentication check.
 */
interface AdminAuthResult {
  ok: boolean;
  status: number;
  error?: string;
}

/**
 * Compare strings in constant time. Prevent timing attacks.
 */
function safeEqual(left: string, right: string) {
  // Convert strings to buffers for crypto comparison
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);

  // Compare length and run timing-safe comparison
  return (
    leftBuffer.length === rightBuffer.length &&
    crypto.timingSafeEqual(leftBuffer, rightBuffer)
  );
}

/**
 * Extract token from Authorization header. Support Bearer prefix.
 */
function readBearerToken(req: Request) {
  const header = req.headers.get("authorization")?.trim();
  if (!header) return null;

  // Strip Bearer prefix if present
  if (header.toLowerCase().startsWith("bearer ")) {
    return header.slice(7).trim();
  }

  return header;
}

/**
 * Validate incoming request admin secret. Check headers.
 */
export function validateAdminApiRequest(req: Request): AdminAuthResult {
  const configuredSecret = process.env.ADMIN_API_SECRET?.trim();

  // Fail if secret not set in environment
  if (!configuredSecret) {
    return {
      ok: false,
      status: 503,
      error: "Admin API secret is not configured",
    };
  }

  // Collect token candidates from Authorization and custom headers
  const candidates = [
    readBearerToken(req),
    req.headers.get("x-admin-api-secret")?.trim(),
  ].filter((candidate): candidate is string => Boolean(candidate));

  // Check if any candidate matches secret securely
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