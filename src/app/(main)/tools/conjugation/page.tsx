import type { Metadata } from "next";
import ConjugationTrainerWrapper from "@/features/tools/conjugation-trainer/ConjugationTrainerWrapper";
import { createPageMetadata } from "@/lib/seo";
import { Suspense } from "react";
import { ROUTES } from "@/lib/core/routes";
import { Loader } from "@/components/ui/icons";

/** Page metadata. Define SEO tags for conjugation trainer. */
export const metadata: Metadata = {
 ...createPageMetadata({
 title: "Verb Conjugation Trainer Jepang | NihongoRoute",
 description: "Latihan konjugasi verba Jepang untuk bentuk masu, te, nai, ta, potensial, pasif, kausatif, dan lainnya.",
 path:ROUTES.TOOLS.CONJUGATION,
 keywords: ["konjugasi verba Jepang", "verb conjugation Japanese", "latihan te form", "masu form"],
 }),
};

/** Page component for Japanese verb conjugation trainer. */
export default function ConjugationTrainerPage() {
 return (
 <div className="min-h-screen bg-background/95">
 <Suspense fallback={
 <div className="flex h-full min-h-[50vh] items-center justify-center">
 <Loader className="animate-spin text-muted-foreground" size={32} />
 </div>
 }>
 <ConjugationTrainerWrapper />
 </Suspense>
 </div>
 );
}