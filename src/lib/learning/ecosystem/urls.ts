/**
 * @file urls.ts
 * @description Helper URL untuk rekomendasi ekosistem belajar (query params, slug, level, drill href).
 */

/**
 * URL encode string safely.
 */
export function safeQuery(value: string | undefined) {
 return encodeURIComponent(value || "");
}

/**
 * Normalize JLPT level string.
 */
export function normalizedLevel(level: string | undefined) {
 const upper = String(level || "").toUpperCase();
 return ["N5", "N4", "N3", "N2", "N1"].includes(upper) ? upper : "";
}

/**
 * Get slug or ID from source.
 */
export function sourceSlug(source: { slug?: string; id?: string }) {
 return source.slug || source.id || "";
}

/**
 * Build URL query parameters from source.
 */
export function sourceParams(source: { type?: string; slug?: string; id?: string; level?: string }) {
 const params = new URLSearchParams();
 if (source.type) params.set("source", source.type);
 if (sourceSlug(source)) params.set("slug", sourceSlug(source));
 if (normalizedLevel(source.level)) params.set("level", normalizedLevel(source.level));
 return params.toString();
}

/**
 * Generate drill tool URL.
 */
export function drillHref(source: { type?: string; slug?: string; id?: string; level?: string }, kind?: string) {
 const params = new URLSearchParams(sourceParams(source));
 if (kind) params.set("kind", kind);
 return `/tools/jlpt-drill?${params.toString()}`;
}
