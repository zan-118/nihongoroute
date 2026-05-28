import type { Metadata } from "next";
import ShareClient from "./ShareClient";

export const metadata: Metadata = {
  title: "Berbagi Progres | NihongoRoute",
  description: "Lihat dan bagikan pencapaian serta progres belajar bahasa Jepang Anda di NihongoRoute.",
};

export default function SharePage() {
  return <ShareClient />;
}
