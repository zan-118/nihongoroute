import { describe, it, expect } from 'vitest';
import { getSimilarKanjiPair, SIMILAR_KANJI_PAIRS } from '@/lib/japanese/kanji-similarity';

describe('Kanji Similarity Data', () => {
  describe('getSimilarKanjiPair', () => {
    it('harus mengembalikan pasangan kanji berdasarkan id', () => {
      const pair = getSimilarKanjiPair('day-eye');
      expect(pair.title).toBe('日 vs 目');
    });

    it('harus mengembalikan item default (index 0) jika id tidak ditemukan', () => {
      const pair = getSimilarKanjiPair('not-exist-id');
      expect(pair.id).toBe(SIMILAR_KANJI_PAIRS[0].id);
    });
  });
});
