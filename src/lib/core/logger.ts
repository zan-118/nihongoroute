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

/**
 * Context passthrough untuk logger umum.
 * Nilai kompleks (objek/array) otomatis di-redact agar payload tetap kecil dan aman.
 */
type LogContext = Record<string, string | number | boolean | null | undefined>;

interface LoggerOptions {
 source?: string;
 userId?: string;
}

/**
 * Serialisasi error ke bentuk aman tanpa stack yang berlebihan di metadata.
 */
function toErrorMeta(error: unknown): Record<string, string | number | boolean | null> {
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
    };
  }
  if (typeof error === "string") {
    return { message: error };
  }
  if (typeof error === "object" && error !== null) {
    const errObj = error as Record<string, unknown>;
    return {
      name: String(errObj.name || errObj.code || "PostgrestError"),
      message: String(errObj.message || errObj.details || JSON.stringify(error)),
    };
  }
  return { message: "Unknown error" };
}

/**
 * Logger umum untuk seluruh aplikasi (server-side & client-side).
 * Menyediakan API sederhana `logger.error(message, error?, context?)`
 * dengan timestamp terstruktur, sanitasi metadata, dan redaction otomatis.
 *
 * @example
 * logger.error("Gagal mengambil data", error, { table: "vocab", source: "server action" });
 */
export const logger = {
 info: (message: string, context?: LogContext, options?: LoggerOptions) =>
  emitLog("info", { event: message, source: options?.source, userId: options?.userId, metadata: context ? cleanContext(context) : undefined }),
 warn: (message: string, context?: LogContext, options?: LoggerOptions) =>
  emitLog("warn", { event: message, source: options?.source, userId: options?.userId, metadata: context ? cleanContext(context) : undefined }),
 error: (message: string, error?: unknown, context?: LogContext, options?: LoggerOptions) =>
  emitLog("error", {
   event: message,
   source: options?.source,
   userId: options?.userId,
   metadata: cleanContext({ ...(context || {}), ...(error !== undefined ? toErrorMeta(error) : {}) }),
  }),
};

/**
 * Hapus nilai undefined dari context agar cocok dengan tipe metadata logger.
 */
function cleanContext(context: LogContext): Record<string, string | number | boolean | null> {
 const clean: Record<string, string | number | boolean | null> = {};
 for (const [key, value] of Object.entries(context)) {
  if (value !== undefined) clean[key] = value;
 }
 return clean;
}
