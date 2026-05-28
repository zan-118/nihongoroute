"use client";

import { useState, useEffect } from "react";

/**
 * Hook untuk mengecek apakah komponen sudah terpasang (mounted) di client.
 * Digunakan untuk mencegah Hydration Mismatch pada komponen yang bergantung pada client-only data (localStorage, window, dll).
 * 
 * @returns {boolean} True jika komponen sudah mounted di client.
 */
export function useHasMounted() {
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setHasMounted(true);
  }, []);

  return hasMounted;
}
