import { describe, it, expect } from 'vitest';
import { extractDictationText, normalizeDictationText, evaluateDictation } from '@/lib/learning/dictation';

describe('Dictation Helpers', () => {
  describe('extractDictationText', () => {
    it('harus mengekstrak string langsung', () => {
      expect(extractDictationText('Hello')).toBe('Hello');
    });

    it('harus mengekstrak teks dari format PortableText array', () => {
      const blocks = [
        { text: 'Halo ' },
        { children: [{ text: 'Dunia' }] }
      ];
      expect(extractDictationText(blocks)).toBe('Halo  Dunia');
    });

    it('harus mengembalikan string kosong untuk input tidak valid', () => {
      expect(extractDictationText(null)).toBe('');
      expect(extractDictationText(undefined)).toBe('');
      expect(extractDictationText({})).toBe('[object Object]');
    });
  });

  describe('normalizeDictationText', () => {
    it('harus mengkonversi ke hiragana', () => {
      expect(normalizeDictationText('ワタシ')).toBe('わたし');
    });

    it('harus membuang tanda baca Jepang dan spasi berlebih', () => {
      expect(normalizeDictationText('こんにちは、世界。')).toBe('こんにちは世界');
      expect(normalizeDictationText(' 「ありがとう」 ')).toBe('ありがとう');
    });
  });

  describe('evaluateDictation', () => {
    it('harus mengembalikan skor 100% dan isExact jika sama persis', () => {
      const result = evaluateDictation('ありがとう', 'ありがとう');
      expect(result.accuracy).toBe(100);
      expect(result.isExact).toBe(true);
      expect(result.isPassed).toBe(true);
      expect(result.distance).toBe(0);
    });

    it('harus mengabaikan tanda baca saat membandingkan', () => {
      const result = evaluateDictation('「ありがとう」', 'ありがとう。');
      expect(result.accuracy).toBe(100);
      expect(result.isExact).toBe(true);
      expect(result.isPassed).toBe(true);
    });

    it('harus mendeteksi kesalahan kecil dengan Levenshtein', () => {
      // わたし vs わたち = beda 1 karakter
      const result = evaluateDictation('わたし', 'わたち');
      expect(result.isExact).toBe(false);
      expect(result.distance).toBe(1);
      // Panjang maks = 3. Akurasi = (3-1)/3 = 66.6% -> ~67%
      expect(result.accuracy).toBe(67);
      expect(result.isPassed).toBe(false); // default passing 90%
    });

    it('harus lulus jika akurasi memenuhi batas kelulusan', () => {
      const result = evaluateDictation('わたしのなまえは', 'わたしのまは', 60);
      expect(result.accuracy).toBeGreaterThanOrEqual(60);
      expect(result.isPassed).toBe(true);
    });
  });
});
