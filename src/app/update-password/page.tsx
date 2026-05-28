import type { Metadata } from "next";
import UpdatePasswordClient from "./UpdatePasswordClient";

export const metadata: Metadata = {
  title: "Perbarui Kata Sandi | NihongoRoute",
  description: "Perbarui kata sandi akun NihongoRoute Anda untuk menjaga keamanan akun belajar bahasa Jepang Anda.",
};

export default function UpdatePasswordPage() {
  return <UpdatePasswordClient />;
}
