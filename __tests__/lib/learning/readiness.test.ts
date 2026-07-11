import { describe, it, expect, vi, beforeEach } from 'vitest';
import { calculateJlptReadiness, detectJlptLevel, type ReadinessCourseCategory } from '@/lib/learning/readiness';
import type { SRSState } from '@/lib/learning/srs';
import type { LessonProgress } from '@/store/types';

describe('Readiness & JLPT Detection', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-07-12T00:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('detectJlptLevel', () => {
    it('harus mendeteksi N5 dari string', () => {
      expect(detectJlptLevel('Course N5 Pemula')).toBe('n5');
      expect(detectJlptLevel('n5')).toBe('n5');
    });

    it('harus mengembalikan null jika format tidak cocok', () => {
      expect(detectJlptLevel('Course N6')).toBeNull();
      expect(detectJlptLevel('Belajar Bahasa Jepang')).toBeNull();
    });
  });

  describe('calculateJlptReadiness', () => {
    it('harus menghitung skor kesiapan secara proporsional dan tidak lebih dari 100', () => {
      // Setup data palsu yang memenuhi target N5 sempurna (N5: 150 cards, 7 activeDays, 7 streak)
      const courseMetadata: ReadinessCourseCategory[] = [{
        id: 'c1',
        title: 'N5 Course',
        slug: 'n5',
        lessonCount: 10,
        lessons: Array.from({length: 10}).map((_, i) => ({ id: `l${i}`, title: `Lesson ${i}`, slug: `l${i}` }))
      }];
      
      const completedLessons: Record<string, LessonProgress> = {};
      for(let i=0; i<10; i++) {
        completedLessons[`l${i}`] = { completedAt: Date.now(), isDeleted: false, mastery: 1, attempts: 1 };
      }

      const srs: Record<string, SRSState> = {};
      for(let i=0; i<150; i++) {
        srs[`card${i}`] = {
          interval: 5,
          repetition: 2,
          easeFactor: 2.5,
          nextReview: Date.now() + 86400000,
          updatedAt: Date.now()
        };
      }

      const studyDays: Record<string, number> = {};
      for(let i=0; i<7; i++) {
        const d = new Date(Date.now() - i * 86400000);
        studyDays[d.toISOString().split('T')[0]] = 10;
      }

      const result = calculateJlptReadiness({
        courseMetadata,
        completedLessons,
        srs,
        streak: 7,
        todayReviewCount: 20,
        studyDays,
        now: new Date()
      });

      // curriculumScore = 100
      // memoryVolumeScore = 100
      // stabilityScore = ~100
      // routineScore = ~100
      expect(result.score).toBeGreaterThanOrEqual(95);
      expect(result.score).toBeLessThanOrEqual(100);
      expect(result.targetLevel).toBe('n5');
      expect(result.statusLabel).toBe('Siap Simulasi'); // >= 85
      expect(result.metrics.length).toBe(4);
    });

    it('menghitung penalti untuk kartu yang rentan/fragile', () => {
       const courseMetadata: ReadinessCourseCategory[] = [{
        id: 'c1',
        title: 'N5 Course',
        slug: 'n5',
        lessonCount: 1,
        lessons: [{ id: 'l1', title: 'L1', slug: 'l1' }]
      }];
      
      const completedLessons: Record<string, LessonProgress> = {
        'l1': { completedAt: Date.now(), isDeleted: false, mastery: 1, attempts: 1 }
      };

      const srs: Record<string, SRSState> = {};
      // 100 kartu rentan (EF < 2)
      for(let i=0; i<100; i++) {
        srs[`card${i}`] = {
          interval: 1,
          repetition: 0,
          easeFactor: 1.5,
          nextReview: Date.now() - 86400000, // Due
          updatedAt: Date.now()
        };
      }

      const result = calculateJlptReadiness({
        courseMetadata,
        completedLessons,
        srs,
        streak: 1,
        todayReviewCount: 0,
        studyDays: {},
        now: new Date()
      });

      const stabilityMetric = result.metrics.find(m => m.id === 'stability');
      // Karena semua kartu fragile dan due, penaltinya maksimal
      expect(stabilityMetric?.score).toBe(0);
      expect(result.actions.some(a => a.id === 'review')).toBeTruthy();
    });
  });
});
