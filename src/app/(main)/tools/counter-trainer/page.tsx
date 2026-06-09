import type { Metadata } from "next";
import CounterTrainerClient from "@/components/features/tools/counter-trainer/CounterTrainerClient";

export const metadata: Metadata = {
  title: "Counter Trainer | NihongoRoute",
  description: "Latihan memilih counter bahasa Jepang untuk orang, benda, umur, lantai, dan kategori umum lainnya.",
};

export default function CounterTrainerPage() {
  return <CounterTrainerClient />;
}
