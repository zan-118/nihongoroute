/**
 * @file page.tsx
 * @description New user onboarding page route for NihongoRoute. Entry point for OnboardingView.
 */

import type { Metadata } from "next";
import OnboardingView from "@/features/auth/OnboardingView";
import { createPageMetadata } from "@/lib/seo";

/**
 * Page metadata. Disable search engine indexing for onboarding.
 */
export const metadata: Metadata = {
 ...createPageMetadata({
 title: "Selamat Datang | NihongoRoute",
 description: "Tentukan jalur belajar dan target JLPT Anda di NihongoRoute.",
 path: "/onboarding",
 noIndex: true,
 }),
};

/**
 * Onboarding page entry point. Renders client onboarding flow.
 */
export default function OnboardingPage() {
 // Render client component wrapper
 return <OnboardingView />;
}