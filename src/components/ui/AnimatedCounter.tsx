/**
 * @file AnimatedCounter.tsx
 * @description Komponen penghitung teranimasi premium menggunakan Framer Motion.
 */

"use client";

// ======================
// IMPOR
// ======================
import { useEffect } from "react";
import { animate, useMotionValue, useTransform, m } from "framer-motion";

// ======================
// ANTARMUKA / TIPE DATA
// ======================
/**
 * Props for AnimatedCounter component.
 */
interface AnimatedCounterProps {
  /** Target number to animate toward. */
  value: number;
  /** Optional Tailwind or CSS class names. */
  className?: string;
  /** Animation duration in seconds. Default 1.5. */
  duration?: number;
}

// ======================
// EKSEKUSI UTAMA
// ======================
/**
 * Render animated number counter.
 * Animates value from 0 to target.
 */
export default function AnimatedCounter({ value, className, duration = 1.5 }: AnimatedCounterProps) {
  // Motion value tracks raw animation state
  const count = useMotionValue(0);
  
  // Round float to integer for display
  const rounded = useTransform(count, (latest) => Math.round(latest));

  useEffect(() => {
    // Trigger animation when target value or duration changes
    const controls = animate(count, value, {
      duration: duration,
      ease: "easeOut",
    });

    // Cancel animation on component unmount
    return controls.stop;
  }, [value, count, duration]);

  return (
    <m.span className={className}>
      {rounded}
    </m.span>
  );
}