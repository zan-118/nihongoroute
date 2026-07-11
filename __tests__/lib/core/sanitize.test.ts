import { describe, it, expect } from 'vitest';
import { sanitizeHtml } from '@/lib/core/sanitize';

describe('Sanitize HTML', () => {
  it('harus menghapus tag script', () => {
    const dirty = '<script>alert(1)</script><p>Halo</p>';
    expect(sanitizeHtml(dirty)).toBe('<p>Halo</p>');
  });

  it('harus menghapus event handler seperti onclick', () => {
    const dirty = '<button onclick="alert(1)">Klik</button>';
    // Button dihapus beserta kontennya karena masuk dalam regex hapus berbahaya
    expect(sanitizeHtml(dirty)).toBe('');
    
    // Tag yang ada di whitelist tapi bawa event
    const dirty2 = '<a href="#" onmouseover="alert(1)">Link</a>';
    expect(sanitizeHtml(dirty2)).toBe('<a href="#">Link</a>');
  });

  it('harus mempertahankan tag styling editorial (b, i, em, span, ruby)', () => {
    const dirty = '<ruby>漢字<rt>かんじ</rt></ruby> <span class="text-red-500">merah</span>';
    const clean = sanitizeHtml(dirty);
    expect(clean).toContain('<ruby>漢字<rt>かんじ</rt></ruby>');
    expect(clean).toContain('<span class="text-red-500">merah</span>');
  });

  it('harus menghapus atribut jahat javascript:', () => {
    const dirty = '<a href="javascript:alert(1)">Hacked</a>';
    expect(sanitizeHtml(dirty)).toBe('<a href="">Hacked</a>');
  });

  it('harus menutup self closing tag dengan benar', () => {
    const dirty = '<img src="a.jpg" onerror="alert(1)" />';
    expect(sanitizeHtml(dirty)).toBe('<img src="a.jpg" />');
  });
});
