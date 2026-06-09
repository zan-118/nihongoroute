/**
 * @file app/(main)/tools/weak-points/page.tsx
 * @description Entry route for targeted weak-point flashcard training.
 */

import type { Metadata } from "next";
import WeakPointTrainerClient from "@/components/features/tools/weak-points/WeakPointTrainerClient";

export const metadata: Metadata = {
  title: "Weak Point Trainer | NihongoRoute",
  description: "Latihan terarah untuk memperkuat kartu SRS yang paling rentan.",
};

export default function WeakPointTrainerPage() {
  return <WeakPointTrainerClient />;
}
