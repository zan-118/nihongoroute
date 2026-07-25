import { describe, it, expect } from 'vitest';
import { 
  buildEcosystemRecommendations, 
  buildWeakPointInsights, 
  buildDailyRoute,
} from '@/lib/learning/learning-ecosystem';
import type { LearningEvent } from '@/lib/learning-events';

const MOCK_EVENTS: LearningEvent[] = [
  {
    id: 'e1',
    type: 'reading_completed',
    source: { type: 'reading', id: 'r1', title: 'Reading 1' },
    createdAt: Date.now() - 1000,
  },
  {
    id: 'e2',
    type: 'jlpt_drill_answered',
    source: { type: 'grammar', id: 'g1', title: 'Grammar N5' },
    details: { isCorrect: false, kind: 'grammar', prompt: 'te-form' },
    createdAt: Date.now(),
  }
];

const MOCK_METADATA = [
  {
    id: 'n5',
    slug: 'n5',
    title: 'JLPT N5: Tingkat Dasar',
    lessons: [
      { id: 'l1', _id: 'l1', title: 'Bab 1: Perkenalan Diri', slug: 'n5-bab-1-perkenalan-diri' }
    ]
  }
];

describe('Learning Ecosystem', () => {
  describe('buildEcosystemRecommendations', () => {
    it('menghasilkan rekomendasi pelajaran aktif berdasarkan metadata', () => {
      const recs = buildEcosystemRecommendations({ 
        events: [],
        courseMetadata: MOCK_METADATA,
        completedLessons: {}
      });
      
      expect(recs.some(r => r.id.includes('active-lesson-l1'))).toBe(true);
    });
  });

  describe('buildWeakPointInsights', () => {
    it('mengelompokkan kelemahan berdasarkan jumlah kesalahan', () => {
      const insights = buildWeakPointInsights({ events: MOCK_EVENTS });
      
      expect(insights.length).toBe(1); // Hanya 1 kesalahan di event
      expect(insights[0].category).toBe('grammar');
      expect(insights[0].mistakes).toBe(1);
      expect(insights[0].label).toBe('Grammar');
    });
  });

  describe('buildDailyRoute', () => {
    it('membangun urutan rutinitas dengan prioritas rasional', () => {
      const routes = buildDailyRoute({ 
        events: [],
        courseMetadata: MOCK_METADATA,
        completedLessons: {}
      });
      
      expect(routes.length).toBeGreaterThan(0);
      expect(routes[0].order).toBe(1);
      expect(routes[0].id).toContain('active-lesson');
    });
    
    it('membuat prioritas membaca jika ada progres terputus', () => {
      const routes = buildDailyRoute({
        events: [],
        readingProgressMap: {
          'r2': {
            sourceId: 'r2',
            lastParagraphIndex: 2,
            totalParagraphs: 5,
            elapsedSeconds: 30,
            updatedAt: Date.now(),
          }
        }
      });
      
      expect(routes[0].category).toBe('continue');
      expect(routes[0].href).toContain('/library/reading/r2');
    });
  });
});
