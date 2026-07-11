import { describe, it, expect, beforeEach } from 'vitest';
import { useUIStore } from '@/store/useUIStore';

describe('useUIStore', () => {
  beforeEach(() => {
    useUIStore.getState().resetUI();
  });

  it('harus menambahkan dan menandai notifikasi terbaca', () => {
    const store = useUIStore.getState();
    store.addNotification({ title: 'Test', message: 'Test Notif', type: 'info' });

    let state = useUIStore.getState();
    expect(state.notifications.length).toBe(1);
    expect(state.notifications[0].read).toBe(false);

    const notifId = state.notifications[0].id;
    useUIStore.getState().markNotificationAsRead(notifId);

    state = useUIStore.getState();
    expect(state.notifications[0].read).toBe(true);
  });

  it('harus mengubah pengaturan dengan benar', () => {
    const store = useUIStore.getState();
    store.updateSettings({ dailyLessonGoal: 20 });

    const state = useUIStore.getState();
    expect(state.settings.dailyLessonGoal).toBe(20);
  });

  it('harus menambah dan menghitung vocab ke dalam reading bank', () => {
    const store = useUIStore.getState();
    const id = store.addReadingVocabulary({
      word: '猫',
      reading: 'ねこ',
      meaning: 'Kucing',
      sourceId: 'article-1'
    });

    let state = useUIStore.getState();
    expect(state.readingVocabularyBank[id].hitCount).toBe(1);

    // Tambah lagi dengan atribut sama
    store.addReadingVocabulary({
      word: '猫',
      reading: 'ねこ',
      meaning: 'Kucing',
      sourceId: 'article-1'
    });

    state = useUIStore.getState();
    expect(state.readingVocabularyBank[id].hitCount).toBe(2);
  });

  it('harus merekam aktivitas belajar (Learning Event)', () => {
    const store = useUIStore.getState();
    store.recordLearningEvent({
      type: 'reading_completed',
      source: { type: 'reading', id: 'article-1', title: 'Test Article' }
    });

    const state = useUIStore.getState();
    expect(state.learningEvents.length).toBe(1);
    expect(state.learningEvents[0].type).toBe('reading_completed');
  });
});
