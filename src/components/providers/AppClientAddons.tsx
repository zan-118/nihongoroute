"use client";

import dynamic from "next/dynamic";

const FeedbackWidget = dynamic(
  () => import("@/components/features/feedback/FeedbackWidget"),
  { ssr: false }
);

const DictionaryPopup = dynamic(
  () => import("@/components/features/tools/dictionary/DictionaryPopup"),
  { ssr: false }
);

export default function AppClientAddons() {
  return (
    <>
      <FeedbackWidget />
      <DictionaryPopup />
    </>
  );
}

