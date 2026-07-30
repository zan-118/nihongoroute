/**
 * @file FuriganaDisplay.tsx
 * @description Facade pembungkus untuk memelihara kompatibilitas FuriganaDisplay.
 * Seluruh logika terpusat di `@/components/ui/japanese`.
 */

"use client";

import React from "react";
import { JapaneseText, JapaneseTextProps } from "./JapaneseText";

export interface FuriganaDisplayProps extends JapaneseTextProps {}

/**
 * FuriganaDisplay facade component.
 * Delegasi langsung ke `JapaneseText` terpadu.
 */
function FuriganaDisplay(props: FuriganaDisplayProps) {
  return <JapaneseText {...props} />;
}

export default React.memo(FuriganaDisplay);
