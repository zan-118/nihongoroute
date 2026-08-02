"use client";

import dynamic from "next/dynamic";

/**
 * Dynamic import of OnboardingTour component.
 * Disable SSR. Tour needs browser DOM.
 */
const OnboardingTour = dynamic(
 () => import("@/features/auth/onboarding/OnboardingTour"),
 // Disable SSR. Tour library requires window/document access.
 { ssr: false }
);

/**
 * Wrapper component.
 * Defers onboarding tour load to client side.
 * Prevents hydration mismatch.
 * 
 * @returns React element rendering client-side tour.
 */
export default function DeferredOnboardingTour() {
 return <OnboardingTour />;
}