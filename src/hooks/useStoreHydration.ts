import { useState, useEffect } from "react";

/**
 * Custom hook to monitor the asynchronous IndexedDB hydration of a Zustand persist store.
 * Prevents race conditions by ensuring local state is fully loaded before cloud sync begins.
 */
export function useStoreHydration(store: any) {
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    if (!store?.persist) {
      setHydrated(true);
      return;
    }

    // If store already hydrated, set true immediately
    if (store.persist.hasHydrated()) {
      setHydrated(true);
      return;
    }

    // Otherwise, subscribe to the finish hydration event
    const unsub = store.persist.onFinishHydration(() => {
      setHydrated(true);
    });

    return unsub;
  }, [store]);

  return hydrated;
}
