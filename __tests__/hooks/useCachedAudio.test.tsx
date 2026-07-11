import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useCachedAudio } from '@/hooks/useCachedAudio';

describe('useCachedAudio', () => {
  beforeEach(() => {
    vi.stubGlobal('caches', {
      open: vi.fn().mockResolvedValue({
        match: vi.fn().mockResolvedValue(undefined), // Tidak ada di cache
        put: vi.fn().mockResolvedValue(undefined),
        keys: vi.fn().mockResolvedValue([]),
      })
    });

    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      clone: vi.fn().mockReturnThis(),
      blob: vi.fn().mockResolvedValue(new Blob(['audio content'], { type: 'audio/mpeg' }))
    }));

    vi.stubGlobal('URL', {
      createObjectURL: vi.fn().mockReturnValue('blob:http://localhost/mock-url'),
      revokeObjectURL: vi.fn()
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('harus mengembalikan url langsung sebagai fallback sebelum cache selesai', () => {
    const { result } = renderHook(() => useCachedAudio('https://example.com/audio.mp3'));
    
    // Default kembalian pertama kali (sinkron)
    expect(result.current).toBe('https://example.com/audio.mp3');
  });

  it('harus mengubah URL menjadi blob: setelah di-fetch dan cache sukses', async () => {
    const { result } = renderHook(() => useCachedAudio('https://example.com/audio.mp3'));
    
    await waitFor(() => {
      expect(result.current).toBe('blob:http://localhost/mock-url');
    });
  });

  it('harus memanggil URL.revokeObjectURL saat unmount', async () => {
    const { unmount } = renderHook(() => useCachedAudio('https://example.com/audio.mp3'));
    
    await waitFor(() => {}); // Biarkan efek berjalan
    unmount();
    
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:http://localhost/mock-url');
  });
});
