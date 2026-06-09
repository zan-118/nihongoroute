/**
 * @file app/(main)/tools/weak-points/page.tsx
 * @description Entry route for targeted weak-point flashcard training.
 */

import type { Metadata } from "next";
import WeakPointTrainerClient from "@/components/features/tools/weak-points/WeakPointTrainerClient";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = {
  ...createPageMetadata({
    title: "Weak Point Trainer | NihongoRoute",
    description: "Latihan terarah untuk memperkuat kartu SRS yang paling rentan.",
    path: "/tools/weak-points",
    noIndex: true,
  }),
};

export default function WeakPointTrainerPage() {
  return <WeakPointTrainerClient />;
}
