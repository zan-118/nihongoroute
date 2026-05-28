import type { Metadata } from "next";
import OnboardingClient from "./OnboardingClient";

export const metadata: Metadata = {
  title: "Selamat Datang | NihongoRoute",
  description: "Selamat datang di NihongoRoute! Tentukan jalur belajar dan target JLPT Anda agar kami dapat merekomendasikan kurikulum terbaik.",
};

export default function OnboardingPage() {
  return <OnboardingClient />;
}
