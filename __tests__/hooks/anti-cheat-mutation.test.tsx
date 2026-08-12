import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useUserStore } from '@/store/useUserStore';
import { useSRSStore } from '@/store/useSRSStore';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useCloudMutation } from '@/hooks/useCloudMutation';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Mock Supabase client
const mockRpc = vi.fn();
vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    rpc: mockRpc,
  }),
}));

const queryClient = new QueryClient({
  defaultOptions: {
    mutations: { retry: false },
  },
});

describe('Anti-Cheat Integration (useCloudMutation)', () => {
  beforeEach(() => {
    useUserStore.getState().resetUser();
    mockRpc.mockReset();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );

  it('harus menyesuaikan poin XP lokal dengan accepted_xp dari server (Anti-Cheat)', async () => {
    // Set local XP to 500
    useUserStore.getState().setGamification({ xp: 500 });
    
    // Server rejects 500 and only accepts 100 (e.g. daily limit or cheating detected)
    mockRpc.mockResolvedValue({
      data: { success: true, accepted_xp: 100 },
      error: null,
    });

    const session = { user: { id: 'test-user' } } as unknown as Parameters<typeof useCloudMutation>[0];
    const { result } = renderHook(() => useCloudMutation(session), { wrapper });

    const progressData = {
      name: 'Test',
      xp: 500, // Local cheated XP
      streak: 1,
      todayReviewCount: 0,
      lastStudyDate: null,
      studyDays: {},
      inventory: { streakFreeze: 0 },
      settings: { notificationsEnabled: false },
      srs: {},
      completedLessons: {},
    };

    result.current.mutate({
      progress: progressData,
      dirtySrs: new Set(),
      dirtyLessons: new Set(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    // Validasi bahwa XP diubah secara lokal mengikuti batasan server
    expect(useUserStore.getState().xp).toBe(100);
  });

  it('harus menggagalkan mutasi jika server menolak karena delta negatif (Anti-Cheat)', async () => {
    useUserStore.getState().setGamification({ xp: 500 });
    
    // Mock server returning an error for negative delta XP
    mockRpc.mockResolvedValue({
      data: null,
      error: new Error('Negative XP delta is not allowed. Client out of sync.'),
    });

    const session = { user: { id: 'test-user' } } as unknown as Parameters<typeof useCloudMutation>[0];
    const { result } = renderHook(() => useCloudMutation(session), { wrapper });

    vi.useFakeTimers();
    result.current.mutate({
      progress: {
        name: 'Test',
        xp: 500,
        streak: 1,
        todayReviewCount: 0,
        lastStudyDate: null,
        studyDays: {},
        inventory: { streakFreeze: 0 },
        settings: { notificationsEnabled: false },
        srs: {},
        completedLessons: {},
      },
      dirtySrs: new Set(),
      dirtyLessons: new Set(),
    });

    await vi.runAllTimersAsync();
    vi.useRealTimers();

    expect(result.current.error?.message).toContain('Negative XP delta');
    // XP lokal tetap tidak terpengaruh jika mutasi ditolak total
    expect(useUserStore.getState().xp).toBe(500);
  });

  it('harus menangani race condition saat dipanggil bersamaan (Concurrent RPC)', async () => {
    useUserStore.getState().setGamification({ xp: 100 });
    
    // Simulasi RPC call yang delay dan bersifat idempotent
    // Pemanggilan berulang dengan data yang sama di-handle oleh database, 
    // jadi server tetap mengembalikan accepted_xp = 115 meskipun dipanggil dua kali.
    mockRpc.mockImplementation(async () => {
      return new Promise(resolve => {
        setTimeout(() => {
          resolve({
            data: { success: true, accepted_xp: 115 },
            error: null,
          });
        }, 50);
      });
    });

    const session = { user: { id: 'test-user' } } as unknown as Parameters<typeof useCloudMutation>[0];
    const { result } = renderHook(() => useCloudMutation(session), { wrapper });

    const progressData = {
      name: 'Test',
      xp: 115,
      streak: 1,
      todayReviewCount: 1,
      lastStudyDate: null,
      studyDays: {},
      inventory: { streakFreeze: 0 },
      settings: { notificationsEnabled: false },
      srs: {},
      completedLessons: {},
    };

    useSRSStore.setState({ srs: { word1: { interval: 1, repetition: 0, easeFactor: 2.5, nextReview: Date.now(), updatedAt: Date.now() } } });

    vi.useFakeTimers();

    // Fire two mutations concurrently wrapped in act
    act(() => {
      result.current.mutate({
        progress: progressData,
        dirtySrs: new Set(),
        dirtyLessons: new Set(),
      });

      result.current.mutate({
        progress: progressData,
        dirtySrs: new Set(),
        dirtyLessons: new Set(),
      });
    });

    // Advance time to resolve the promises
    await act(async () => {
      await vi.runAllTimersAsync();
    });

    // Verify that the store successfully took the accepted_xp from the server
    expect(useUserStore.getState().xp).toBe(115);
    
    vi.useRealTimers();
  });
});
