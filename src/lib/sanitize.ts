/**
 * @file sanitize.ts
 * @description Utilitas sanitasi HTML untuk mencegah XSS.
 * Hanya mengizinkan tag dan atribut yang aman untuk konten editorial.
 * @module Sanitize
 */

/** Tag HTML yang diizinkan untuk konten editorial CMS */
const ALLOWED_TAGS = new Set([
  'b', 'i', 'em', 'strong', 'u', 's', 'br', 'p', 'span',
  'ruby', 'rt', 'rp', 'sub', 'sup',
  'ul', 'ol', 'li',
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'div', 'blockquote', 'pre', 'code',
  'table', 'thead', 'tbody', 'tr', 'th', 'td',
  'img', 'a',
]);

/** Atribut yang diizinkan per tag */
const ALLOWED_ATTRS: Record<string, Set<string>> = {
  '*': new Set(['class', 'id', 'lang', 'dir']),
  'a': new Set(['href', 'target', 'rel', 'title']),
  'img': new Set(['src', 'alt', 'width', 'height', 'loading']),
  'td': new Set(['colspan', 'rowspan']),
  'th': new Set(['colspan', 'rowspan', 'scope']),
};

/**
 * Sanitasi string HTML dengan menghapus tag dan atribut berbahaya.
 * Mencegah XSS dari konten CMS/database yang di-render via dangerouslySetInnerHTML.
 *
 * @param dirty - String HTML mentah dari sumber eksternal
 * @returns String HTML yang sudah disanitasi
 */
export function sanitizeHtml(dirty: string): string {
  if (!dirty) return '';

  // 1. Hapus tag <script>, <iframe>, <object>, <embed>, <form>, <input>, dll.
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

  // 2. Hapus event handler (onclick, onerror, onload, dll.)
  clean = clean.replace(/\s+on\w+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]*)/gi, '');

  // 3. Hapus javascript: dan data: URI di atribut href/src
  clean = clean.replace(/(href|src)\s*=\s*(?:"javascript:[^"]*"|'javascript:[^']*')/gi, '$1=""');
  clean = clean.replace(/(href|src)\s*=\s*(?:"data:[^"]*"|'data:[^']*')/gi, '$1=""');

  // 4. Hapus tag yang tidak ada di whitelist (tapi pertahankan kontennya)
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
 * Sanitasi atribut pada tag yang diizinkan.
 * Menghapus atribut yang tidak ada di whitelist.
 */
function sanitizeTagAttributes(tagHtml: string, tagName: string): string {
  // Closing tag — langsung kembalikan
  if (tagHtml.startsWith('</')) return tagHtml;

  const globalAllowed = ALLOWED_ATTRS['*'] ?? new Set<string>();
  const tagAllowed = ALLOWED_ATTRS[tagName] ?? new Set<string>();
  const combined = new Set([...globalAllowed, ...tagAllowed]);

  // Ekstrak tag name dan atribut
  const selfClosing = tagHtml.endsWith('/>');
  const attrRegex = /\s+([a-zA-Z][a-zA-Z0-9-]*)\s*(?:=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]*)))?/g;

  const attrs: string[] = [];
  let attrMatch: RegExpExecArray | null;

  while ((attrMatch = attrRegex.exec(tagHtml)) !== null) {
    const attrName = attrMatch[1].toLowerCase();
    const attrValue = attrMatch[2] ?? attrMatch[3] ?? attrMatch[4] ?? '';

    if (combined.has(attrName)) {
      // Untuk href, pastikan tidak javascript: atau data:
      if (attrName === 'href' || attrName === 'src') {
        const trimmed = attrValue.trim().toLowerCase();
        if (trimmed.startsWith('javascript:') || trimmed.startsWith('data:')) {
          continue;
        }
      }
      attrs.push(`${attrName}="${escapeAttrValue(attrValue)}"`);
    }
  }

  const attrStr = attrs.length > 0 ? ' ' + attrs.join(' ') : '';
  return `<${tagName}${attrStr}${selfClosing ? ' /' : ''}>`;
}

/** Escape karakter khusus dalam nilai atribut HTML */
function escapeAttrValue(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}
