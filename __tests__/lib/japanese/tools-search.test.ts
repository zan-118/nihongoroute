import { describe, it, expect } from 'vitest';
import { getJapaneseTextStats } from '@/lib/tools/tools-search';

describe('tools-search', () => {
  describe('getJapaneseTextStats', () => {
    it('harus menghitung statistik dasar karakter dengan benar', () => {
      const stats = getJapaneseTextStats('日本語の本');
      expect(stats.charCount).toBe(5);
      expect(stats.japaneseCharCount).toBe(5);
      expect(stats.kanjiCount).toBe(4); // 日, 本, 語, 本
      expect(stats.kanaCount).toBe(1); // の
    });

    it('harus mengekstrak token kanji tunggal tetapi mengabaikan partikel hiragana tunggal', () => {
      const stats = getJapaneseTextStats('本を読む。');
      // Token yang diharapkan: "本" (kanji tunggal), "読む" (kanji+kana 2+ karakter)
      // Partikel "を" (hiragana tunggal) dan tanda baca "。" harus diabaikan dari tokens.
      expect(stats.tokens).toContain('本');
      expect(stats.tokens).toContain('読む');
      expect(stats.tokens).not.toContain('を');
      expect(stats.tokens).not.toContain('。');
    });

    it('harus mengekstrak kata katakana atau hiragana multi-karakter', () => {
      const stats = getJapaneseTextStats('テレビを見る。');
      expect(stats.tokens).toContain('テレビ');
      expect(stats.tokens).toContain('見る');
      expect(stats.tokens).not.toContain('を');
    });
  });
});
