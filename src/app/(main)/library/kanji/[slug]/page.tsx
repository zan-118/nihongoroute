/**
 * @file page.tsx
 * @description Halaman detail Kanji (Kanji Detail).
 * Menampilkan animasi goresan, cara baca, mnemonic, dan kosakata terkait.
 * @module KanjiDetailPage
 */

// ======================
// IMPOR
// ======================
import { Metadata } from "next";
import { getLibraryItemBySlug } from "@/actions/library.actions";
import { getKanjiStaticSlugs } from "@/actions/kanji.actions";
import { notFound } from "next/navigation";
import Link from "next/link";
import { JsonLd } from "@/components/seo/JsonLd";
import { fullyDecode } from "@/lib/utils";
import { 
 ChevronLeft, 
 Stack,
 ListCheck,
 Pencil
} from "@/components/ui/icons";
import { Button } from "@/components/ui/button";

// Komponen Pendukung
import { KanjiStrokeHero } from "@/features/library/kanji/components/detail/KanjiStrokeHero";
import { KanjiReadings } from "@/features/library/kanji/components/detail/KanjiReadings";
import { KanjiRadicals } from "@/features/library/kanji/components/detail/KanjiRadicals";
import { KanjiMnemonic } from "@/features/library/kanji/components/detail/KanjiMnemonic";
import { KanjiRelatedVocab } from "@/features/library/kanji/components/detail/KanjiRelatedVocab";
import { KanjiSentences } from "@/features/library/kanji/components/detail/KanjiSentences";
import {
 breadcrumbJsonLd,
 createPageMetadata,
 definedTermJsonLd,
 encodeRouteSegment,
} from "@/lib/seo";




// ======================
// METADATA SEO
// ======================

/**
 * Generates dynamic SEO metadata for a specific Kanji detail page.
 * 
 * @param props - Component properties.
 * @param props.params - Route parameters containing the Kanji slug.
 * @returns Promise resolving to page metadata.
 */
export async function generateMetadata({
 params,
}: {
 params: Promise<{ slug: string }>;
}): Promise<Metadata> {
 const { slug } = await params;
 // Decode URL-encoded Japanese characters in slug
 const decodedSlug = fullyDecode(slug);
 const kanji = await getLibraryItemBySlug("kanji", decodedSlug);

 if (!kanji) {
 return {
 title: "Kanji Tidak Ditemukan | NihongoRoute",
 };
 }

 const kanjiSlug = String(kanji.slug || decodedSlug);
 return createPageMetadata({
 title: kanji.seo?.title ?? `${kanji.character} (${kanji.meaning}) | Kanji Jepang`,
 description: kanji.seo?.description ?? `Pelajari arti, onyomi, kunyomi, mnemonic, kosakata terkait, dan cara menulis kanji ${kanji.character}.`,
 path: `/library/kanji/${encodeRouteSegment(kanjiSlug)}`,
 keywords: kanji.seo?.keywords
 ? kanji.seo.keywords.split(",").map((k: string) => k.trim())
 : [
 String(kanji.character || ""),
 String(kanji.meaning || ""),
 String(kanji.onyomi || ""),
 String(kanji.kunyomi || ""),
 "kanji Jepang",
 "stroke order kanji",
 ].filter(Boolean),
 });
}

export const dynamicParams = true;
export const revalidate = 604800;

/**
 * Generate static params for Kanji detail pages (ISR).
 */
export async function generateStaticParams() {
 return await getKanjiStaticSlugs();
}

// ======================
// EKSEKUSI UTAMA
// ======================

/**
 * Kanji detail page component.
 * Fetches Kanji data and related sentences, then renders stroke order, readings,
 * radicals, mnemonics, vocabulary, and example sentences.
 * 
 * @param props - Component properties.
 * @param props.params - Route parameters containing the Kanji slug.
 */
export default async function KanjiDetailPage({
 params,
}: {
 params: Promise<{ slug: string }>;
}) {
 const { slug } = await params;
 // Decode URL-encoded Japanese characters in slug
 const decodedSlug = fullyDecode(slug);
 const kanji = await getLibraryItemBySlug("kanji", decodedSlug);

 if (!kanji) notFound();
 const kanjiCharacter = String(kanji.character || "");
 // Map examples from kanji data directly instead of querying public.sentences
 const formattedSentences = ((kanji.examples as import("@/types/database").ExampleSentence[]) || []).map((ex, index) => ({
 id: ex.id || `kanji-ex-${index}`,
 japanese: ex.japanese || ex.jp || "",
 english: ex.english || null,
 indonesia: ex.indonesian || null,
 jlpt_level: String(kanji.jlpt_level || kanji.jlptLevel || "") || null,
 furigana: ex.furigana || null,
 }));
 const kanjiLevel = String(kanji.jlpt_level || kanji.jlptLevel || "").toUpperCase();
 const kanjiSlug = String(kanji.slug || decodedSlug);
 const kanjiPath = `/library/kanji/${encodeRouteSegment(kanjiSlug)}`;

 return (
 <main className="w-full bg-transparent px-4 md:px-8 lg:px-12 relative overflow-hidden flex flex-col justify-start min-h-screen pb-32 transition-colors duration-300">
 {/* Generate JSON-LD structured data for search engines */}
 <JsonLd
 data={[
 breadcrumbJsonLd([
 { name: "Beranda", path: "/" },
 { name: "Pustaka", path: "/library" },
 { name: "Kanji", path: "/library/kanji" },
 { name: kanjiCharacter, path: kanjiPath },
 ]),
 definedTermJsonLd({
 name: kanjiCharacter,
 description: `Kanji ${kanjiCharacter} berarti ${String(kanji.meaning || "")}.`,
 path: kanjiPath,
 termCode: kanjiLevel || null,
 termSetName: "Pustaka Kanji NihongoRoute",
 termSetPath: "/library/kanji",
 }),
 ]}
 />
 {/* Ambient Background Glows */}
 <div className="absolute top-[5%] left-[-10%] size-[45%] bg-secondary/10 blur-[65px] rounded-full pointer-events-none z-0 animate-pulse ambient-glow will-change-transform" />
 <div className="absolute bottom-[20%] right-[-15%] size-[35%] bg-primary/5 blur-[65px] rounded-full pointer-events-none z-0 ambient-glow will-change-transform" />
 
 {/* Background Grid Overlay */}
 <div className="absolute inset-0 bg-[linear-gradient(hsl(var(--foreground)/0.01)_1px,transparent_1px),linear-gradient(90deg,hsl(var(--foreground)/0.01)_1px,transparent_1px)] bg-size-[60px_60px] pointer-events-none z-0" />

 <div className="max-w-4xl mx-auto w-full relative z-10 pt-8 md:pt-16">
 <div className="flex flex-col gap-12 md:gap-16 animate-in fade-in slide-in- duration-1000 ease-out">
 
 {/* 1. Stroke & Visual Bento (Fokus Utama) */}
 <KanjiStrokeHero 
 id={kanji.id || kanji._id || ""}
 character={kanji.character || ""} 
 strokeOrderSvg={kanji.strokeOrderSvg || undefined} 
 meaning={kanji.meaning || ""} 
 jlpt={kanji.jlpt_level || undefined} 
 />

 {/* 2 & 3. Onyomi & Kunyomi */}
 <KanjiReadings 
 onyomi={kanji.onyomi || undefined} 
 kunyomi={kanji.kunyomi || undefined} 
 />

 {/* 4. Radicals Bento (Akar Kata) */}
 <KanjiRadicals radicals={kanji.radicals || undefined} />

 {/* 5. Mnemonic Bento (Jembatan Keledai) */}
 <KanjiMnemonic 
 mnemonics={kanji.mnemonics || undefined} 
 wordId={kanji.character || ""}
 />

 {/* 6. Related Context Bento (Kosakata Terkait) */}
 <KanjiRelatedVocab relatedVocab={kanji.relatedVocab || undefined} />

 {/* 7. Example Sentences Bento (Kalimat Contoh Dinamis) */}
 <KanjiSentences sentences={formattedSentences} character={kanjiCharacter} />
 </div>

 {/* Footer Actions */}
 <footer className="mt-20 pt-16 border-t border-border flex flex-col gap-8">
 <div className="flex flex-col gap-3">
 <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
 Latihan Terkait
 </p>
 <div className="flex flex-wrap gap-2">
 <Button asChild variant="outline" className="rounded-lg gap-2">
 <Link href={`/tools/jlpt-drill?level=${encodeURIComponent(kanjiLevel)}&kind=kanji&source=kanji&slug=${encodeURIComponent(kanjiCharacter)}`}>
 <ListCheck size={16} aria-hidden="true" />
 JLPT Drill
 </Link>
 </Button>
 <Button asChild variant="outline" className="rounded-lg gap-2">
 <Link href={`/tools/writing?char=${encodeURIComponent(kanjiCharacter)}`}>
 <Pencil size={16} aria-hidden="true" />
 Menulis
 </Link>
 </Button>
 <Button asChild variant="outline" className="rounded-lg gap-2">
 <Link href={`/tools/flashcards?category=${encodeURIComponent(kanjiLevel.toLowerCase())}&mode=kanji&amount=10`}>
 <Stack size={16} aria-hidden="true" />
 Flashcard
 </Link>
 </Button>
 </div>
 </div>
 <div className="flex flex-col md:flex-row items-center justify-between gap-8">
 <Link href="/library/kanji" className="w-full md:w-auto">
 <Button variant="ghost" className="w-full px-10 py-8 h-auto text-[11px] md:text-xs font-black uppercase tracking-[0.2em] rounded-lg bg-muted/30 border border-border hover:bg-muted/50 hover:border-primary/30 transition-all gap-4 group shadow-none">
 <ChevronLeft size={20} className="group-hover:-translate-x-2 transition-transform" aria-hidden="true" /> Kembali ke Daftar Kanji
 </Button>
 </Link>
 </div>
 </footer>
 </div>
 </main>
 );
}