import type { Metadata } from "next";
import LoginClient from "./LoginClient";

export const metadata: Metadata = {
  title: "Masuk & Daftar | NihongoRoute",
  description: "Masuk ke akun NihongoRoute Anda untuk melanjutkan petualangan belajar bahasa Jepang.",
};

export default function LoginPage() {
  return <LoginClient />;
}
