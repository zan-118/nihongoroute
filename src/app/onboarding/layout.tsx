import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Selamat Datang | NihongoRoute",
  description: "Panduan awal untuk memulai perjalanan belajar bahasa Jepang di NihongoRoute.",
};

export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  return children;
}
