import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getLibraryLessonDetail } from '@/actions/lessons.actions';

let mockLessonDbData: Record<string, unknown> | null = null;

vi.mock('@/lib/supabase/server', () => {
  const mockQueryBuilder = {
    select: function() { return this; },
    eq: function() { return this; },
    in: function() { return Promise.resolve({ data: [], error: null }); },
    maybeSingle: function() {
      return Promise.resolve({
        data: mockLessonDbData,
        error: null
      });
    }
  };
  return {
    createStaticClient: vi.fn().mockImplementation(() => ({
      from: vi.fn().mockImplementation(() => mockQueryBuilder)
    }))
  };
});

vi.mock('@/lib/queries', () => ({
  getSanityReadingBySlug: vi.fn().mockResolvedValue(null),
  getSanityListeningBySlug: vi.fn().mockResolvedValue(null)
}));

describe('Lessons Actions - Modular Content and Dialogue Schema', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('harus memparsing kolom modular content (markdown) dan dialogue (jsonb) jika tersedia', async () => {
    mockLessonDbData = {
      id: 'lesson-123',
      title: 'Bab 1: Perkenalan',
      slug: 'n5-bab-1-perkenalan',
      summary: 'Belajar perkenalan diri',
      order_number: 1,
      content: '# Judul Materi\n\nPenjelasan singkat materi modular.',
      dialogue: [
        {
          speaker: 'Lara',
          speakerName: 'Lara',
          jp: 'こんにちは',
          text: 'こんにちは',
          translation: 'Halo',
          romaji: 'Konnichiwa',
          furigana: 'こんにちは'
        }
      ],
      content_blocks: [],
      vocab_list: [],
      kanji_list: [],
      grammar_list: [],
      listening_list: [],
      reading_list: [],
      quizzes: [],
      category: { title: 'N5', type: 'jlpt' }
    };

    const result = await getLibraryLessonDetail('n5-bab-1-perkenalan');
    expect(result).not.toBeNull();
    expect(result?.title).toBe('Bab 1: Perkenalan');
    expect(result?.content).toBe('# Judul Materi\n\nPenjelasan singkat materi modular.');
    expect(result?.content_blocks).toHaveLength(2); // Heading 1 + Text block
    expect(result?.listeningList).toHaveLength(1);
    expect(result?.listeningList?.[0]?.transcript?.[0]?.jp).toBe('こんにちは');
  });

  it('harus fallback ke content_blocks lama jika kolom modular content kosong', async () => {
    mockLessonDbData = {
      id: 'lesson-legacy',
      title: 'Bab 2: Kosakata Lama',
      slug: 'n5-bab-2-legacy',
      summary: 'Belajar dengan JSONB lama',
      order_number: 2,
      content: null,
      dialogue: null,
      content_blocks: [
        { id: 'b1', type: 'text', content: 'Konten JSONB lama', order: 0 }
      ],
      vocab_list: [],
      kanji_list: [],
      grammar_list: [],
      listening_list: [],
      reading_list: [],
      quizzes: [],
      category: { title: 'N5', type: 'jlpt' }
    };

    const result = await getLibraryLessonDetail('n5-bab-2-legacy');
    expect(result).not.toBeNull();
    expect(result?.content).toBeNull();
    expect(result?.content_blocks).toHaveLength(1);
    expect(result?.content_blocks?.[0]?.content).toBe('Konten JSONB lama');
  });
});
