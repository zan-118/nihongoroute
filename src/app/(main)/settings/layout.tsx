import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pengaturan | NihongoRoute",
  description: "Atur profil, tema tampilan, dan preferensi belajar di NihongoRoute.",
};

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
