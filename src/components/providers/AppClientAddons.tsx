"use client";

import dynamic from "next/dynamic";

/**
 * Feedback widget component.
 * Load dynamically. Disable SSR to prevent hydration mismatch.
 */
const FeedbackWidget = dynamic(
  () => import("@/features/support/feedback/FeedbackWidget"),
  { ssr: false } // Disable SSR. Component need browser APIs.
);

/**
 * Dictionary popup component.
 * Load dynamically. Disable SSR to prevent hydration mismatch.
 */
const DictionaryPopup = dynamic(
  () => import("@/features/tools/dictionary/DictionaryPopup"),
  { ssr: false } // Disable SSR. Component need browser APIs.
);

/**
 * AppClientAddons component.
 * Render global client-only interactive tools.
 * 
 * @returns JSX element containing client addons.
 */
export default function AppClientAddons() {
  return (
    <>
      <FeedbackWidget />
      <DictionaryPopup />
    </>
  );
}