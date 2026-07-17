import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getLibraryLessonDetail } from '@/actions/lessons.actions';

let mockLessonDbData: Record<string, unknown> | null = null;
let mockListeningData: Record<string, unknown>[] = [];
let mockReadingData: Record<string, unknown>[] = [];

vi.mock('@/lib/supabase/server', () => {
  return {
    createStaticClient: vi.fn().mockImplementation(() => ({
      from: vi.fn().mockImplementation((table: string) => {
        const builder = {
          select: function() { return this; },
          eq: function() { return this; },
          in: function() { return this; },
          maybeSingle: function() {
            return Promise.resolve({ data: mockLessonDbData, error: null });
          },
          then: function(onfulfilled?: (value: { data: Record<string, unknown>[]; error: null }) => unknown) {
            let data: Record<string, unknown>[] = [];
            if (table === 'listening') data = mockListeningData;
            if (table === 'reading') data = mockReadingData;
            const res = Promise.resolve({ data, error: null });
            return onfulfilled ? res.then(onfulfilled) : res;
          }
        };
        return builder;
      })
    }))
  };
});

describe('Listening and Reading Actions from Supabase', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('harus mengambil data latihan listening dan reading dari Supabase', async () => {
    mockLessonDbData = {
      id: 'lesson-supabase-lr',
      title: 'Bab 5: Latihan Listening & Reading',
      slug: 'n5-bab-5-lr',
      summary: 'Materi tes LR Supabase',
      order_number: 5,
      content: null,
      dialogue: null,
      vocab_list: [],
      kanji_list: [],
      grammar_list: [],
      listening_list: ['listening-slug-1'],
      reading_list: ['reading-slug-1'],
      quizzes: [],
      category: { title: 'N5', type: 'jlpt' }
    };

    mockListeningData = [
      {
        id: 'list-1',
        title: 'Percakapan di Toko',
        slug: 'listening-slug-1',
        body: '店員：いらっしゃいませ。\n客：これをお願いします。',
        translation: 'Pelayan: Selamat datang.\nPelanggan: Tolong yang ini.',
        audio_url: 'https://example.com/audio.mp3'
      }
    ];

    mockReadingData = [
      {
        id: 'read-1',
        title: 'Membaca Surat',
        slug: 'reading-slug-1',
        body: '手紙を読みました。とても嬉しいです。',
        translation: 'Saya membaca surat. Sangat senang.'
      }
    ];

    const result = await getLibraryLessonDetail('n5-bab-5-lr');
    expect(result).not.toBeNull();
    
    // Verifikasi Listening
    expect(result?.listeningList).toHaveLength(1);
    expect(result?.listeningList?.[0]?.transcript).toHaveLength(2);
    expect(result?.listeningList?.[0]?.transcript?.[0]?.speaker).toBe('店員');
    expect(result?.listeningList?.[0]?.transcript?.[0]?.text).toBe('いらっしゃいませ。');

    // Verifikasi Reading
    expect(result?.readingList).toHaveLength(1);
    expect(result?.readingList?.[0]?.title).toBe('Membaca Surat');
  });
});
