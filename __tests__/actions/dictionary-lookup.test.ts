import { describe, it, expect, vi, beforeEach } from 'vitest';
import { lookupDictionaryWordAction } from '@/actions/dictionary.actions';

/** Data yang akan dikembalikan oleh maybeSingle / limit pada query berikutnya. */
let nextSingleData: Record<string, unknown> | null = null;
let nextListData: Record<string, unknown>[] = [];
let nextError: { message: string } | null = null;
const capturedQueries: string[] = [];

vi.mock('@/lib/supabase/server', () => {
  return {
    createStaticClient: vi.fn().mockImplementation(() => ({
      from: vi.fn().mockImplementation((table: string) => {
        capturedQueries.push(table);
        return {
          select: function () {
            return this;
          },
          or: function (orStr: string) {
            capturedQueries.push(orStr);
            return this;
          },
          eq: function () {
            return this;
          },
          limit: function () {
            return this;
          },
          maybeSingle: function () {
            return Promise.resolve({
              data: nextSingleData,
              error: nextError,
            });
          },
          then: function (resolve: (value: unknown) => void) {
            // allow `await supabase.from(...).select(...).or(...).limit(...)`
            resolve({ data: nextListData, error: nextError });
          },
        };
      }),
    })),
  };
});

const VOCAB_ROW = {
  id: '11111111-1111-1111-1111-111111111111',
  slug: 'taberu',
  word: '食べる',
  furigana: null,
  romaji: 'taberu',
  meaning_id: 'to eat',
  jlpt_level: 'N5',
  hinshi: ['Ichidan verb', 'Transitive verb'],
};

describe('lookupDictionaryWordAction', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    nextSingleData = null;
    nextListData = [];
    nextError = null;
    capturedQueries.length = 0;
  });

  it('mengembalikan null untuk input kosong atau hanya spasi', async () => {
    expect(await lookupDictionaryWordAction('')).toBeNull();
    expect(await lookupDictionaryWordAction('   ')).toBeNull();
    // Tidak boleh memanggil DB.
    expect(capturedQueries).toHaveLength(0);
  });

  it('mengembalikan null untuk input lebih dari 30 karakter', async () => {
    const longText = 'あ'.repeat(31);
    expect(await lookupDictionaryWordAction(longText)).toBeNull();
    expect(capturedQueries).toHaveLength(0);
  });

  it('menormalisasi hasil exact match (furigana null tetap null, hinshi array)', async () => {
    nextSingleData = VOCAB_ROW;

    const result = await lookupDictionaryWordAction('食べる');

    expect(result).not.toBeNull();
    expect(result?.word).toBe('食べる');
    expect(result?.slug).toBe('taberu');
    expect(result?.furigana).toBeNull();
    expect(result?.romaji).toBe('taberu');
    expect(result?.jlpt).toBe('N5');
    expect(result?.hinshi).toEqual(['Ichidan verb', 'Transitive verb']);
    // Pastikan query pertama pakai exact match.
    expect(capturedQueries.join(' ')).toContain('word.eq.食べる');
  });

  it('mencoba substring (ilike) saat exact match tidak ditemukan', async () => {
    nextSingleData = null;
    nextListData = [VOCAB_ROW];

    const result = await lookupDictionaryWordAction('食べ');

    expect(result).not.toBeNull();
    expect(result?.word).toBe('食べる');
    // Query kedua harus mengandung ilike dengan wildcard.
    const joined = capturedQueries.join(' ');
    expect(joined).toContain('ilike');
    expect(joined).toContain('%食べ%');
  });

  it('mengembalikan null saat kedua query gagal', async () => {
    nextSingleData = null;
    nextListData = [];

    expect(await lookupDictionaryWordAction('tidak-ada')).toBeNull();
  });

  it('mengembalikan null saat DB mengembalikan error', async () => {
    nextError = { message: 'Database query failed' };

    expect(await lookupDictionaryWordAction('食べる')).toBeNull();
  });

  it('fallback slug ke word/id ketika slug tidak tersedia', async () => {
    const { slug: _slug, ...noSlug } = VOCAB_ROW;
    nextSingleData = noSlug;

    const result = await lookupDictionaryWordAction('食べる');

    expect(result?.slug).toBe('食べる');
  });
});
