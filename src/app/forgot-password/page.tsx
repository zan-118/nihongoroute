import type { Metadata } from "next";
import ForgotPasswordClient from "./ForgotPasswordClient";

export const metadata: Metadata = {
  title: "Lupa Kata Sandi | NihongoRoute",
  description: "Lupa kata sandi Anda? Kirim tautan pemulihan kata sandi ke email terdaftar Anda untuk membuat kata sandi baru.",
};

export default function ForgotPasswordPage() {
  return <ForgotPasswordClient />;
}
