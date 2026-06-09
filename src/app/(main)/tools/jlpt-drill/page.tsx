import type { Metadata } from "next";
import JlptMiniDrillClient from "@/components/features/tools/jlpt-mini-drill/JlptMiniDrillClient";

export const metadata: Metadata = {
  title: "JLPT Mini Drill | NihongoRoute",
  description: "Generator latihan cepat JLPT untuk vocab, kanji, dan grammar.",
};

export default function JlptMiniDrillPage() {
  return <JlptMiniDrillClient />;
}
