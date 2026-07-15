import { describe, it, expect } from 'vitest';
import { tokenizeSentence } from '@/lib/tools/sentence-builder';

describe('Sentence Builder Tokenizer', () => {
  it('harus memecah kalimat sederhana dengan partikel', () => {
    const tokens = tokenizeSentence('図書館で日本語を勉強します。');
    expect(tokens).toEqual(['図書館', 'で', '日本語', 'を', '勉強し', 'ます', '。']);
  });

  it('tidak boleh memecah kata utuh yang memiliki huruf partikel di dalamnya', () => {
    const tokens = tokenizeSentence('ごはんを食べます。');
    expect(tokens).toEqual(['ごはん', 'を', '食べ', 'ます', '。']);
  });

  it('harus menangani kata kana/kanji dengan benar', () => {
    const tokens = tokenizeSentence('友達と映画を見ました。');
    expect(tokens).toEqual(['友達', 'と', '映画', 'を', '見', 'ました', '。']);
  });
});
