import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dukungan & Donasi | NihongoRoute",
  description: "Dukung pengembangan NihongoRoute agar tetap gratis dan tanpa iklan untuk semua pejuang bahasa Jepang.",
};

export default function SupportLayout({ children }: { children: React.ReactNode }) {
  return children;
}
