import { describe, it, expect, vi, beforeEach } from 'vitest';
import { calculateNewStreak, mergeStudyDays, mergeGamification, type GamificationData } from '@/lib/gamification/gamification';
import * as utils from '@/lib/utils';
import type { Inventory } from '@/store/types';

describe('Gamification Logic', () => {
  beforeEach(() => {
    // Mock getLocalDateString to return '2026-07-12'
    vi.spyOn(utils, 'getLocalDateString').mockReturnValue('2026-07-12');
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-07-12T12:00:00Z'));
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  describe('calculateNewStreak', () => {
    const mockAddNotification = vi.fn();

    it('harus mempertahankan streak jika belajar di hari yang sama', () => {
      const { streak, streakFreezeUsed } = calculateNewStreak(
        5, '2026-07-12', { streakFreeze: 0, claimedQuests: { date: '', quests: [] }, achievements: [] }, mockAddNotification
      );
      expect(streak).toBe(5);
      expect(streakFreezeUsed).toBe(false);
    });

    it('harus menambah streak jika belajar berturut-turut (kemarin -> hari ini)', () => {
      const { streak, streakFreezeUsed } = calculateNewStreak(
        5, '2026-07-11', { streakFreeze: 0, claimedQuests: { date: '', quests: [] }, achievements: [] }, mockAddNotification
      );
      expect(streak).toBe(6);
      expect(streakFreezeUsed).toBe(false);
    });

    it('harus reset streak jika bolos lebih dari sehari tanpa freeze', () => {
      const { streak, streakFreezeUsed } = calculateNewStreak(
        5, '2026-07-10', { streakFreeze: 0, claimedQuests: { date: '', quests: [] }, achievements: [] }, mockAddNotification
      );
      expect(streak).toBe(1);
      expect(streakFreezeUsed).toBe(false);
    });

    it('harus menggunakan streak freeze dan menambah streak jika bolos tapi punya item', () => {
      const { streak, streakFreezeUsed } = calculateNewStreak(
        5, '2026-07-10', { streakFreeze: 1, claimedQuests: { date: '', quests: [] }, achievements: [] }, mockAddNotification
      );
      expect(streak).toBe(6); // current + 1 because freeze saves it
      expect(streakFreezeUsed).toBe(true);
      expect(mockAddNotification).toHaveBeenCalledWith(expect.objectContaining({
        title: "Streak Freeze Digunakan!"
      }));
    });
  });

  describe('mergeGamification', () => {
    it('harus menggabungkan data XP dan Streak mengambil yang tertinggi', () => {
      const local: GamificationData = {
        xp: 150, streak: 2, studyDays: {}, lastStudyDate: '2026-07-12', todayReviewCount: 10,
        inventory: { streakFreeze: 1, claimedQuests: { date: '2026-07-12', quests: [] }, achievements: [] }
      };
      const cloud: GamificationData = {
        xp: 100, streak: 5, studyDays: {}, lastStudyDate: '2026-07-11', todayReviewCount: 0,
        inventory: { streakFreeze: 0, claimedQuests: { date: '2026-07-11', quests: [] }, achievements: [] }
      };

      const merged = mergeGamification(local, cloud);
      expect(merged.xp).toBe(150); // max
      expect(merged.streak).toBe(5); // max
    });

    it('harus mendeduplikasi achievements dengan unlockedAt paling awal', () => {
      const local: GamificationData = {
        xp: 0, streak: 0, studyDays: {}, lastStudyDate: null, todayReviewCount: 0,
        inventory: { 
          streakFreeze: 0, claimedQuests: { date: '', quests: [] }, 
          achievements: [{ id: 'a1', unlockedAt: 1000 }, { id: 'a2', unlockedAt: 2000 }] 
        }
      };
      const cloud: GamificationData = {
        xp: 0, streak: 0, studyDays: {}, lastStudyDate: null, todayReviewCount: 0,
        inventory: { 
          streakFreeze: 0, claimedQuests: { date: '', quests: [] }, 
          achievements: [{ id: 'a2', unlockedAt: 1500 }, { id: 'a3', unlockedAt: 3000 }] 
        }
      };

      const merged = mergeGamification(local, cloud);
      const a2 = merged.inventory.achievements.find(a => a.id === 'a2');
      expect(merged.inventory.achievements.length).toBe(3);
      // Memilih timestamp yang paling awal untuk a2 -> 1500 dari cloud
      expect(a2?.unlockedAt).toBe(1500);
    });
  });
});
