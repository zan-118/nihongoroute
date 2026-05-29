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
interface AnimatedCounterProps {
  value: number;
  className?: string;
  duration?: number;
}

// ======================
// EKSEKUSI UTAMA
// ======================
export default function AnimatedCounter({ value, className, duration = 1.5 }: AnimatedCounterProps) {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => Math.round(latest));

  useEffect(() => {
    const controls = animate(count, value, {
      duration: duration,
      ease: "easeOut",
    });

    return controls.stop;
  }, [value, count, duration]);

  return (
    <m.span className={className}>
      {rounded}
    </m.span>
  );
}
