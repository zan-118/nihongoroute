import { useState, useEffect } from "react";
import { sounds } from "@/lib/audio";

export function useLevelUpOverlay(level: number) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (level <= 1) return;

    // Check if we've already shown this level
    const lastSeenLevel = localStorage.getItem("nihongoroute_last_seen_level");
    
    if (!lastSeenLevel || parseInt(lastSeenLevel) < level) {
      setShow(true);
      sounds?.playSuccess();
      
      // Mark this level as seen
      localStorage.setItem("nihongoroute_last_seen_level", level.toString());

      const timer = setTimeout(() => setShow(false), 8000);
      return () => clearTimeout(timer);
    }
  }, [level]);

  return { show, setShow };
}
