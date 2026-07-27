/**
 * @file logger.ts
 * @description Modul untuk pencatatan log keamanan dan peringatan (alerts) 
 * tanpa membocorkan rahasia atau payload sensitif.
 */

type LogLevel = "info" | "warn" | "error" | "alert";

interface LogPayload {
  event: string;
  userId?: string;
  source?: string;
  metadata?: Record<string, string | number | boolean | null>;
}

function sanitizeMetadata(metadata?: Record<string, unknown>): Record<string, unknown> {
  if (!metadata) return {};
  const clean: Record<string, unknown> = {};
  
  const sensitiveKeys = ['secret', 'token', 'password', 'key', 'signature', 'auth'];

  for (const [key, value] of Object.entries(metadata)) {
    const lowerKey = key.toLowerCase();
    const isSensitive = sensitiveKeys.some(s => lowerKey.includes(s));
    
    if (isSensitive) {
      clean[key] = "[REDACTED]";
    } else if (typeof value === 'object' && value !== null) {
      clean[key] = "[COMPLEX_OBJECT_REDACTED]";
    } else {
      clean[key] = value;
    }
  }
  return clean;
}

function emitLog(level: LogLevel, payload: LogPayload) {
  const safePayload = {
    timestamp: new Date().toISOString(),
    level,
    event: payload.event,
    userId: payload.userId,
    source: payload.source,
    metadata: sanitizeMetadata(payload.metadata),
  };

  const message = JSON.stringify(safePayload);

  switch (level) {
    case "info":
      console.log(message);
      break;
    case "warn":
      console.warn(message);
      break;
    case "error":
      console.error(message);
      break;
    case "alert":
      // Alerts typically get picked up by log monitors or forwarded to alerting services
      console.error(`[SECURITY_ALERT] ${message}`);
      break;
  }
}

export const securityLogger = {
  info: (payload: LogPayload) => emitLog("info", payload),
  warn: (payload: LogPayload) => emitLog("warn", payload),
  error: (payload: LogPayload) => emitLog("error", payload),
  alert: (payload: LogPayload) => emitLog("alert", payload),
};
