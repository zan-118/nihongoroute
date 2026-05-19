import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Masuk | NihongoRoute",
  description: "Masuk ke akun NihongoRoute untuk melanjutkan perjalanan belajar bahasa Jepang.",
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children;
}
