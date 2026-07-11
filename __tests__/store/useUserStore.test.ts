import { describe, it, expect, beforeEach } from 'vitest';
import { useUserStore, STREAK_FREEZE_COST } from '@/store/useUserStore';

describe('useUserStore', () => {
  beforeEach(() => {
    useUserStore.getState().resetUser();
  });

  it('harus menambah XP dan naik level jika XP mencukupi', () => {
    const store = useUserStore.getState();
    store.addXP(200);

    const state = useUserStore.getState();
    expect(state.xp).toBe(200);
    expect(state.level).toBeGreaterThan(1);
  });

  it('harus bisa membeli streak freeze jika XP cukup', () => {
    const store = useUserStore.getState();
    store.addXP(1000); // Cukup untuk beli

    const success = useUserStore.getState().buyStreakFreeze();
    
    const state = useUserStore.getState();
    expect(success).toBe(true);
    expect(state.inventory.streakFreeze).toBe(1);
    expect(state.xp).toBe(1000 - STREAK_FREEZE_COST);
  });

  it('harus gagal membeli streak freeze jika XP kurang', () => {
    const store = useUserStore.getState();
    store.addXP(100); // Kurang dari harga

    const success = useUserStore.getState().buyStreakFreeze();
    
    const state = useUserStore.getState();
    expect(success).toBe(false);
    expect(state.inventory.streakFreeze).toBe(0);
    expect(state.xp).toBe(100); // XP tidak berkurang
  });

  it('harus mencatat pelajaran selesai dan menambahkannya ke dirtyLessons', () => {
    const store = useUserStore.getState();
    store.completeLesson('lesson-1');

    const state = useUserStore.getState();
    expect(state.completedLessons['lesson-1']).toBeDefined();
    expect(state.completedLessons['lesson-1'].isDeleted).toBe(false);
    expect(state.dirtyLessons.has('lesson-1')).toBe(true);
  });
});
