"use client";

import dynamic from "next/dynamic";

const OnboardingTour = dynamic(
  () => import("@/components/features/onboarding/OnboardingTour"),
  { ssr: false }
);

export default function DeferredOnboardingTour() {
  return <OnboardingTour />;
}
