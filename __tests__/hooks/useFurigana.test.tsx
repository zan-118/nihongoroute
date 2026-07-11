import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useFurigana } from '@/hooks/useFurigana';

describe('useFurigana', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({ hiragana: 'ねこ' })
    }));
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('harus memanggil api jika tidak ada di cache', async () => {
    const { result } = renderHook(() => useFurigana());
    
    let furigana;
    await waitFor(async () => {
      furigana = await result.current.getFurigana('猫');
    });

    expect(furigana).toBe('ねこ');
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it('harus menggunakan cache untuk teks yang sama', async () => {
    const { result } = renderHook(() => useFurigana());
    
    await waitFor(async () => {
      await result.current.getFurigana('犬');
    });
    
    // Panggilan kedua
    await waitFor(async () => {
      await result.current.getFurigana('犬');
    });

    // Fetch hanya dipanggil 1 kali karena caching ref
    expect(fetch).toHaveBeenCalledTimes(1);
  });
});
