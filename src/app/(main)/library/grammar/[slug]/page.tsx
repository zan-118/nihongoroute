/**
 * @file page.tsx
 * @description Halaman detail panduan tata bahasa (Grammar Detail). 
 * Menampilkan konten artikel tata bahasa menggunakan Portable Text.
 * @module GrammarDetailPage
 */

// ======================
// IMPOR
// ======================
import { Metadata } from "next";
import { getLibraryItemBySlug } from "@/actions/library.actions";
import { getGrammarStaticSlugs } from "@/actions/grammar.actions";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/seo/JsonLd";
import GrammarDetailClient from "@/features/library/grammar/components/GrammarDetailClient";
import {
 articleJsonLd,
 breadcrumbJsonLd,
 createPageMetadata,
 definedTermJsonLd,
 encodeRouteSegment,
} from "@/lib/seo";

// ======================
// METADATA SEO
// ======================

/**
 * Generate SEO metadata for grammar detail page.
 * @param props Component props.
 * @param props.params Route parameters.
 * @returns Metadata object.
 */
export async function generateMetadata({
 params,
}: {
 params: Promise<{ slug: string }>;
}): Promise<Metadata> {
 // Resolve route params.
 const { slug } = await params;
 // Decode slug for database query.
 const decodedSlug = decodeURIComponent(slug);
 
 // Fetch grammar article from database.
 const article = await getLibraryItemBySlug("grammar", decodedSlug);

 // Return fallback metadata if article not found.
 if (!article) {
 return {
 title: "Grammar Tidak Ditemukan | NihongoRoute",
 description: "Halaman panduan tata bahasa Jepang yang kamu cari nggak tersedia atau udah dipindahkan.",
 };
 }

 // Build metadata with SEO helper.
 return createPageMetadata({
 title: article.seo?.title ?? `Belajar Grammar ${article.title} | NihongoRoute`,
 description: article.seo?.description ?? (article.notes 
 ? `${String(article.notes).slice(0, 150)}...`
 : `Pelajari rumus dan cara penggunaan tata bahasa ${article.title} secara mendalam beserta contoh kalimatnya.`),
 path: `/library/grammar/${encodeRouteSegment(String(article.slug || decodedSlug))}`,
 type: "article",
 keywords: article.seo?.keywords 
 ? article.seo.keywords.split(",").map((k: string) => k.trim())
 : [
 String(article.title || ""),
 String(article.jlptLevel || article.jlpt_level || ""),
 "grammar Jepang",
 "tata bahasa Jepang",
 "bunpou JLPT",
 ].filter(Boolean),
 });
}

export const dynamicParams = true;
export const revalidate = 3600;

/**
 * Generate static params for grammar detail pages (ISR).
 */
export async function generateStaticParams() {
 return await getGrammarStaticSlugs(100);
}

// ======================
// EKSEKUSI UTAMA
// ======================

/**
 * Grammar detail page component.
 * @param props Component props.
 * @param props.params Route parameters.
 * @returns React element.
 */
export default async function GrammarDetailPage({
 params,
}: {
 params: Promise<{ slug: string }>;
}) {
 // Resolve route params.
 const { slug } = await params;
 // Decode slug for database query.
 const decodedSlug = decodeURIComponent(slug);

 // ======================
 // OPERASI DATABASE
 // ======================
 // Fetch grammar article.
 const article = await getLibraryItemBySlug("grammar", decodedSlug);
 // Trigger 404 if article missing.
 if (!article) notFound();

 // ======================
 // RENDER UTAMA
 // ======================
 // Construct canonical URL path.
 const articlePath = `/library/grammar/${encodeRouteSegment(String(article.slug || decodedSlug))}`;
 // Fallback description if notes empty.
 const articleDescription =
 article.notes
 ? `${String(article.notes).slice(0, 150)}...`
 : `Pelajari rumus dan cara penggunaan tata bahasa ${article.title} secara mendalam beserta contoh kalimatnya.`;

 return (
 <main className="w-full bg-transparent px-4 md:px-8 lg:px-12 relative overflow-hidden flex flex-col justify-start min-h-screen pb-32 transition-colors duration-300">
 <JsonLd
 data={[
 breadcrumbJsonLd([
 { name: "Beranda", path: "/" },
 { name: "Pustaka", path: "/library" },
 { name: "Tata Bahasa", path: "/library/grammar" },
 { name: String(article.title || "Grammar"), path: articlePath },
 ]),
 articleJsonLd({
 headline: `Belajar Grammar ${article.title}`,
 description: articleDescription,
 path: articlePath,
 datePublished: typeof article.created_at === "string" ? article.created_at : null,
 educationalLevel: String(article.jlptLevel || article.jlpt_level || ""),
 }),
 definedTermJsonLd({
 name: String(article.title || ""),
 description: `Tata bahasa Jepang ${String(article.title || "")} berarti ${String(article.meaning || "")}.`,
 path: articlePath,
 termCode: String(article.jlptLevel || article.jlpt_level || "") || null,
 termSetName: "Pustaka Tata Bahasa Jepang NihongoRoute",
 termSetPath: "/library/grammar",
 }),
 ]}
 />
 {/* Ambient Background Glows */}
 <div className="absolute top-[10%] -left-[10%] size-[45%] bg-primary/10 blur-[65px] rounded-full pointer-events-none z-0 animate-pulse ambient-glow will-change-transform" />
 <div className="absolute bottom-[10%] -right-[10%] size-[35%] bg-success/5 blur-[65px] rounded-full pointer-events-none z-0 ambient-glow will-change-transform" />
 
 {/* Background Neural Overlays */}
 <div className="absolute inset-0 bg-[linear-gradient(hsl(var(--foreground)/0.01)_1px,transparent_1px),linear-gradient(90deg,hsl(var(--foreground)/0.01)_1px,transparent_1px)] bg-[size:60px_60px] pointer-events-none z-0" />

 <div className="max-w-4xl mx-auto w-full relative z-10 pt-8 md:pt-16">
 {/* Client Side Detail & TTS Interactions */}
 <GrammarDetailClient article={article} />
 </div>
 </main>
 );
}