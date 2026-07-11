import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useSyncProgress } from '@/hooks/useSyncProgress';

// Mock dependensi eksternal hook yang sangat kompleks
vi.mock('@tanstack/react-query', () => ({
  useQuery: () => ({ data: { user: { id: 'user-1' } }, isFetching: false }),
  useQueryClient: () => ({ setQueryData: vi.fn(), invalidateQueries: vi.fn() })
}));

vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    auth: {
      getSession: vi.fn().mockResolvedValue({ data: { session: null } }),
      onAuthStateChange: vi.fn().mockReturnValue({ data: { subscription: { unsubscribe: vi.fn() } } })
    }
  })
}));

vi.mock('@/hooks/useCloudData', () => ({
  useCloudData: () => ({ cloudData: null, isFetching: false })
}));

vi.mock('@/hooks/useCloudMutation', () => ({
  useCloudMutation: () => ({
    mutate: vi.fn(),
    isPending: false
  })
}));

vi.mock('@/hooks/useStoreHydration', () => ({
  useStoreHydration: () => true
}));

// Karena komponen hooks cukup kompleks dan punya timer (debounce 2 detik),
// kita memverifikasi bahwa sinkronisasi manual bisa dipanggil langsung tanpa error.
describe('useSyncProgress', () => {
  it('harus mengembalikan isLoading dan fungsi syncNow', () => {
    const { result } = renderHook(() => useSyncProgress());
    
    expect(result.current.isLoading).toBe(false);
    expect(typeof result.current.syncNow).toBe('function');
  });

  it('fungsi syncNow bisa dipanggil secara aman tanpa error', () => {
    const { result } = renderHook(() => useSyncProgress());
    
    expect(() => {
      result.current.syncNow();
    }).not.toThrow();
  });
});
