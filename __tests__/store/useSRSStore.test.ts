import { describe, it, expect, beforeEach } from 'vitest';
import { useSRSStore } from '@/store/useSRSStore';
import { useUserStore } from '@/store/useUserStore';

describe('useSRSStore', () => {
  beforeEach(() => {
    useSRSStore.getState().resetSRS();
    useUserStore.getState().resetUser();
  });

  it('harus menambahkan kartu baru ke srs dan menandai dirty', () => {
    const store = useSRSStore.getState();
    store.addToSRS('word-1');

    const state = useSRSStore.getState();
    expect(state.srs['word-1']).toBeDefined();
    expect(state.srs['word-1'].interval).toBe(1);
    expect(state.dirtySrs.has('word-1')).toBe(true);
  });

  it('harus menghapus kartu dari srs (soft delete) dan menandai dirty', () => {
    const store = useSRSStore.getState();
    store.addToSRS('word-2');
    store.removeFromSRS('word-2');

    const state = useSRSStore.getState();
    expect(state.srs['word-2'].isDeleted).toBe(true);
    expect(state.dirtySrs.has('word-2')).toBe(true);
  });

  it('harus mengosongkan dirtySrs setelah clear', () => {
    const store = useSRSStore.getState();
    store.addToSRS('word-3');
    
    expect(useSRSStore.getState().dirtySrs.has('word-3')).toBe(true);
    
    useSRSStore.getState().clearDirtySrs(['word-3']);
    expect(useSRSStore.getState().dirtySrs.has('word-3')).toBe(false);
  });
});
