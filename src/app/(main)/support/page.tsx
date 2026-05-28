import type { Metadata } from "next";
import SupportClient from "./SupportClient";

export const metadata: Metadata = {
  title: "Dukung Kami | NihongoRoute",
  description: "Dukungan Anda sangat berarti agar NihongoRoute tetap berjalan, gratis, terus berkembang, dan tanpa iklan yang mengganggu bagi para pejuang bahasa Jepang.",
};

export default function SupportPage() {
  return <SupportClient />;
}
