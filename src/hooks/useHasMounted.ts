"use client";

/**
 * @file useHasMounted.ts
 * @description Utility custom hook verifying whether a React component has fully mounted on the client side (browser).
 * Prevents Next.js Server-Side Rendering (SSR) hydration mismatches.
 */

// Import & Dependencies

import { useState, useEffect } from "react";

// Main Custom Hook

/**
 * Track component client-side mount status.
 * Prevents hydration mismatch in SSR.
 * 
 * @returns {boolean} True if component is fully mounted on client side.
 */
export function useHasMounted() {
 // State tracks mount status. Initial false for SSR.
 const [hasMounted, setHasMounted] = useState(false);

 useEffect(() => {
 // Trigger state update after mount.
 // eslint-disable-next-line react-hooks/set-state-in-effect
 setHasMounted(true);
 }, []);

 return hasMounted;
}