import { useState, useEffect } from "react";
import { sounds } from "@/lib/audio";

export function useLevelUpOverlay(level: number) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (level > 1) {
      setShow(true);
      sounds?.playSuccess();

      const timer = setTimeout(() => setShow(false), 6000);
      return () => clearTimeout(timer);
    }
  }, [level]);

  return { show, setShow };
}
