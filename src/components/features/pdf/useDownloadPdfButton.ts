import { useState, useEffect } from "react";

export function useDownloadPdfButton() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setIsMounted(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  return { isMounted };
}
