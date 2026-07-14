/**
 * @file sanitize.ts
 * @description Modul utilitas sanitasi HTML luring-ready untuk melindungi aplikasi dari kerentanan Cross-Site Scripting (XSS). Membatasi tag HTML dan atribut yang diizinkan untuk keperluan rendering teks deskriptif atau aksen furigana.
 */

// ==========================================
// KONFIGURASI DAFTAR PUTIH (WHITELIST)
// ==========================================
/** Set of allowed HTML tags. Safe for rendering. */
const ALLOWED_TAGS = new Set([
  'b', 'i', 'em', 'strong', 'u', 's', 'br', 'p', 'span',
  'ruby', 'rt', 'rp', 'sub', 'sup',
  'ul', 'ol', 'li',
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'div', 'blockquote', 'pre', 'code',
  'table', 'thead', 'tbody', 'tr', 'th', 'td',
  'img', 'a',
]);

/** Allowed attributes per HTML tag. Key '*' applies to all tags. */
const ALLOWED_ATTRS: Record<string, Set<string>> = {
  '*': new Set(['class', 'id', 'lang', 'dir', 'style']),
  'a': new Set(['href', 'target', 'rel', 'title']),
  'img': new Set(['src', 'alt', 'width', 'height', 'loading']),
  'td': new Set(['colspan', 'rowspan']),
  'th': new Set(['colspan', 'rowspan', 'scope']),
};

// ==========================================
// FUNGSI UTAMA SANITASI
// ==========================================

/**
 * Sanitize HTML string. Remove unsafe tags and attributes. Prevent XSS.
 *
 * @param dirty - Raw HTML string.
 * @returns Clean HTML string.
 */
export function sanitizeHtml(dirty: string): string {
  // Return empty if input null or empty.
  if (!dirty) return '';

  // Strip dangerous tags and inner content.
  let clean = dirty
    // Hapus tag berbahaya beserta kontennya
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
    .replace(/<iframe\b[^>]*>[\s\S]*?<\/iframe>/gi, '')
    .replace(/<object\b[^>]*>[\s\S]*?<\/object>/gi, '')
    .replace(/<embed\b[^>]*\/?>/gi, '')
    .replace(/<form\b[^>]*>[\s\S]*?<\/form>/gi, '')
    .replace(/<input\b[^>]*\/?>/gi, '')
    .replace(/<textarea\b[^>]*>[\s\S]*?<\/textarea>/gi, '')
    .replace(/<select\b[^>]*>[\s\S]*?<\/select>/gi, '')
    .replace(/<button\b[^>]*>[\s\S]*?<\/button>/gi, '');

  // Strip inline event handlers.
  clean = clean.replace(/\s+on\w+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]*)/gi, '');

  // Strip javascript and data URIs.
  clean = clean.replace(/(href|src)\s*=\s*(?:"javascript:[^"]*"|'javascript:[^']*')/gi, '$1=""');
  clean = clean.replace(/(href|src)\s*=\s*(?:"data:[^"]*"|'data:[^']*')/gi, '$1=""');

  // Filter tags against whitelist. Keep content of disallowed tags.
  clean = clean.replace(/<\/?([a-zA-Z][a-zA-Z0-9]*)\b[^>]*>/g, (match, tag: string) => {
    const tagLower = tag.toLowerCase();
    if (ALLOWED_TAGS.has(tagLower)) {
      // Tag diizinkan — sanitasi atributnya
      return sanitizeTagAttributes(match, tagLower);
    }
    // Tag tidak diizinkan — hapus tag tapi pertahankan konten
    return '';
  });

  return clean;
}

/**
 * Filter attributes on allowed tag. Keep whitelisted attributes only.
 * 
 * @param tagHtml - Full tag string.
 * @param tagName - Name of tag.
 * @returns Cleaned tag string.
 */
function sanitizeTagAttributes(tagHtml: string, tagName: string): string {
  // Closing tag has no attributes. Return early.
  if (tagHtml.startsWith('</')) return tagHtml;

  // Merge global and tag-specific allowed attributes.
  const globalAllowed = ALLOWED_ATTRS['*'] ?? new Set<string>();
  const tagAllowed = ALLOWED_ATTRS[tagName] ?? new Set<string>();
  const combined = new Set([...globalAllowed, ...tagAllowed]);

  // Check if tag self-closes.
  const selfClosing = tagHtml.endsWith('/>');
  const attrRegex = /\s+([a-zA-Z][a-zA-Z0-9-]*)\s*(?:=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]*)))?/g;

  const attrs: string[] = [];
  let attrMatch: RegExpExecArray | null;

  // Parse attributes using regex loop.
  while ((attrMatch = attrRegex.exec(tagHtml)) !== null) {
    const attrName = attrMatch[1].toLowerCase();
    const attrValue = attrMatch[2] ?? attrMatch[3] ?? attrMatch[4] ?? '';

    if (combined.has(attrName)) {
      // Block javascript/data URIs hidden by whitespace.
      if (attrName === 'href' || attrName === 'src') {
        const cleanVal = attrValue.replace(/[\r\n\t\u0000-\u001F]/g, '').trim().toLowerCase();
        if (cleanVal.startsWith('javascript:') || cleanVal.startsWith('data:')) {
          continue;
        }
      }
      attrs.push(`${attrName}="${escapeAttrValue(attrValue)}"`);
    }
  }

  const attrStr = attrs.length > 0 ? ' ' + attrs.join(' ') : '';
  return `<${tagName}${attrStr}${selfClosing ? ' /' : ''}>`;
}

/**
 * Escape special characters in attribute values. Prevent HTML injection.
 * 
 * @param value - Raw attribute value.
 * @returns Escaped value.
 */
function escapeAttrValue(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}