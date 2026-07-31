import { describe, it, expect, vi, beforeEach } from 'vitest';
import { searchToolDictionaryAction } from '@/actions/dictionary.actions';
import { getLibraryGrammarDetail } from '@/actions/grammar.actions';

const mockOrQueries: Record<string, string> = {};

vi.mock('@/lib/supabase/server', () => {
  return {
    createStaticClient: vi.fn().mockImplementation(() => ({
      from: vi.fn().mockImplementation((table: string) => {
        return {
          select: function () {
            return this;
          },
          or: function (orStr: string) {
            mockOrQueries[table] = orStr;
            return this;
          },
          eq: function () {
            return this;
          },
          maybeSingle: function () {
            return Promise.resolve({
              data: {
                id: '12345678-1234-1234-1234-123456789012',
                title: 'Test Grammar',
                slug: 'test-grammar',
                meaning: 'Grammar Meaning',
                examples: '[]',
              },
              error: null,
            });
          },
          limit: function () {
            return Promise.resolve({ data: [], error: null });
          },
        };
      }),
    })),
  };
});

describe('Dictionary & Grammar Server Actions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Object.keys(mockOrQueries).forEach((key) => delete mockOrQueries[key]);
  });

  it('searchToolDictionaryAction harus menggunakan meaning_id.ilike untuk kueri vocab', async () => {
    await searchToolDictionaryAction('taberu');
    expect(mockOrQueries['vocab']).toContain('meaning_id.ilike');
    expect(mockOrQueries['vocab']).not.toContain('meaning.ilike');
  });

  it('getLibraryGrammarDetail harus memvalidasi format UUID 5 kelompok karakter', async () => {
    const validUuid = '12345678-1234-1234-1234-123456789012';
    const result = await getLibraryGrammarDetail(validUuid);
    expect(result).not.toBeNull();
    expect(result?._id).toBe(validUuid);
  });
});
