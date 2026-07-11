import { describe, it, expect } from 'vitest';
import { buildSrsUpdates, buildLessonUpdates, getSrsStatus } from '@/lib/core/cloud-sync-payload';
import type { SRSState } from '@/lib/srs';

describe('Cloud Sync Payload Utils', () => {
  describe('getSrsStatus', () => {
    it('harus membedakan status srs', () => {
      expect(getSrsStatus({ interval: 1 } as SRSState)).toBe('learning');
      expect(getSrsStatus({ interval: 10 } as SRSState)).toBe('reviewing');
      expect(getSrsStatus({ interval: 22 } as SRSState)).toBe('graduated');
    });
  });

  describe('buildSrsUpdates', () => {
    it('harus menghasilkan baris yang diubah', () => {
      const srsLocal = {
        'w1': {
          wordId: 'w1', repetition: 2, interval: 3, easeFactor: 2.5, 
          nextReview: 1000, updatedAt: 1000, customMnemonic: 'test'
        }
      } as Record<string, SRSState>;

      const dirty = new Set(['w1']);
      const updates = buildSrsUpdates(srsLocal, dirty);
      
      expect(updates.length).toBe(1);
      expect(updates[0].word_id).toBe('w1');
      expect(updates[0].status).toBe('reviewing');
      expect(updates[0].custom_mnemonic).toBe('test');
    });

    it('harus menangani data tidak valid / null', () => {
      const dirty = new Set(['w2']);
      const updates = buildSrsUpdates({}, dirty); // w2 ga ada
      
      expect(updates[0].word_id).toBe('w2');
      expect(updates[0].is_deleted).toBe(true);
    });
  });

  describe('buildLessonUpdates', () => {
    it('harus menghasilkan list sinkronisasi lesson', () => {
      const local = {
        'l1': { completedAt: 1000, updatedAt: 1000, isDeleted: false }
      };
      
      const updates = buildLessonUpdates(local, new Set(['l1']));
      expect(updates[0].lesson_id).toBe('l1');
      expect(updates[0].is_completed).toBe(true);
    });
  });
});
