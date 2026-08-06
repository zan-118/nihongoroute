/**
 * @file page.tsx
 * @description Halaman detail kosakata (Vocab Detail).
 * Menampilkan informasi mendalam tentang kata, termasuk contoh, mnemonic, dan konjugasi.
 * @module VocabDetailPage
 */

// ======================
// IMPOR
// ======================
import { Metadata } from "next";
import { getLibraryItemBySlug } from "@/actions/library.actions";
import { getVocabStaticSlugs } from "@/actions/vocab.actions";
import { notFound } from "next/navigation";
import Link from "next/link";
import { JsonLd } from "@/components/seo/JsonLd";
import { fullyDecode } from "@/lib/utils";
import { 
 ChevronLeft, 
 GraduationCap,
 Hash,
 Layers,
 ListChecks
} from "@/components/ui/icons";
import { Button } from "@/components/ui/button";

// Komponen Pendukung
import { VocabHero } from "@/features/library/components/vocab/detail/VocabHero";
import { VocabDetails } from "@/features/library/components/vocab/detail/VocabDetails";
import { VocabNotes } from "@/features/library/components/vocab/detail/VocabNotes";
import { VocabConjugation } from "@/features/library/components/vocab/detail/VocabConjugation";
import { VocabExamples } from "@/features/library/components/vocab/detail/VocabExamples";
import { VocabRelated } from "@/features/library/components/vocab/detail/VocabRelated";
import {
 breadcrumbJsonLd,
 createPageMetadata,
 definedTermJsonLd,
 encodeRouteSegment,
} from "@/lib/seo";

// ======================
// ANTARMUKA
// ======================

/**
 * Structure for vocabulary example sentences.
 */
interface VocabExampleItem {
 jp?: string;
 japanese?: string;
 id?: string;
 indonesian?: string;
 furigana?: string;
 romaji?: string;
 meaning?: string;
}

/**
 * Structure for related Kanji references.
 */
interface VocabKanjiRef {
 id?: string;
 _id?: string;
 character: string;
 meaning: string;
 onyomi: string;
 kunyomi: string;
 slug: string;
}

/**
 * Structure for related vocabulary references.
 */
interface VocabRef {
 id?: string;
 _id?: string;
 word: string;
 meaning: string;
 romaji?: string;
 slug?: string;
}




// ======================
// METADATA SEO
// ======================

/**
 * Generates dynamic SEO metadata for the vocabulary detail page.
 * @param props - Component properties.
 * @param props.params - Route parameters containing the vocabulary slug.
 * @returns Promise resolving to page metadata.
 */
export async function generateMetadata({
 params,
}: {
 params: Promise<{ slug: string }>;
}): Promise<Metadata> {
 // Decode slug to handle Japanese characters in URL
 const { slug } = await params;
 const decodedSlug = fullyDecode(slug);

 // Fetch vocabulary item from database
 const vocab = await getLibraryItemBySlug("vocab", decodedSlug);

 if (!vocab) {
 return {
 title: "Kosakata Tidak Ditemukan | NihongoRoute",
 };
 }

 const romajiStr = typeof vocab.romaji === "string" ? vocab.romaji : "";
 const vocabSlug = String(vocab.slug || decodedSlug);
 return createPageMetadata({
 title: vocab.seo?.title ?? `${vocab.word || ""} (${vocab.meaning || ""}) | Kosakata Jepang`,
 description: vocab.seo?.description ?? `Pelajari arti, cara baca, romaji, contoh kalimat, dan penggunaan kata ${vocab.word || ""}${romajiStr ? ` (${romajiStr})` : ""} dalam bahasa Jepang.`,
 path: `/library/vocab/${encodeRouteSegment(vocabSlug)}`,
 keywords: vocab.seo?.keywords
 ? vocab.seo.keywords.split(",").map((k: string) => k.trim())
 : [
 String(vocab.word || ""),
 String(vocab.furigana || ""),
 String(vocab.romaji || ""),
 String(vocab.meaning || ""),
 "kosakata bahasa Jepang",
 ].filter(Boolean),
 });
}

export const dynamicParams = true;
export const revalidate = 604800;

/**
 * Generate static params for vocabulary detail pages (ISR).
 */
export async function generateStaticParams() {
 return await getVocabStaticSlugs();
}

// ======================
// EKSEKUSI UTAMA
// ======================

/**
 * Vocabulary detail page component (React Server Component).
 * Fetches vocabulary data and renders details, conjugations, examples, and related items.
 * @param props - Component properties.
 * @param props.params - Route parameters containing the vocabulary slug.
 */
export default async function VocabDetailPage({
 params,
}: {
 params: Promise<{ slug: string }>;
}) {
 // Decode slug to handle Japanese characters in URL
 const { slug } = await params;
 const decodedSlug = fullyDecode(slug);

 // Fetch vocabulary item from database
 const vocab = await getLibraryItemBySlug("vocab", decodedSlug);

 if (!vocab) return notFound();

 // Normalize part of speech (hinshi) list to lowercase
 const hinshiList = Array.isArray(vocab.hinshi)
 ? vocab.hinshi.map((h: string) => h.toLowerCase())
 : (typeof vocab.hinshi === "string" ? [vocab.hinshi.toLowerCase()] : []);

 // Determine word type flags for conditional rendering
 const isAdjective = hinshiList.some((h: string) => h.includes("adjective"));
 const isVerb = hinshiList.some((h: string) => h.includes("verb"));
 const vocabSlug = String(vocab.slug || vocab.id || decodedSlug);
 const vocabPath = `/library/vocab/${encodeRouteSegment(vocabSlug)}`;
 const vocabLevel = String(vocab.jlptLevel || vocab.jlpt_level || "").toUpperCase();
 const vocabWord = String(vocab.word || "");
 
 // Determine verb group for conjugation tool link
 const verbGroup = hinshiList.some((h: string) => h.includes("ichidan"))
 ? "ichidan"
 : hinshiList.some((h: string) => h.includes("irregular") || h.includes("suru") || h.includes("kuru"))
 ? "irregular"
 : "godan";

 return (
 <main className="w-full bg-transparent px-4 md:px-8 lg:px-12 relative overflow-hidden flex flex-col justify-start min-h-screen pb-32 transition-colors duration-300">
 {/* Structured data for SEO */}
 <JsonLd
 data={[
 breadcrumbJsonLd([
 { name: "Beranda", path: "/" },
 { name: "Pustaka", path: "/library" },
 { name: "Kosakata", path: "/library/vocab" },
 { name: vocabWord, path: vocabPath },
 ]),
 definedTermJsonLd({
 name: vocabWord,
 description: `Kosakata bahasa Jepang ${vocabWord} berarti ${String(vocab.meaning || vocab.meaning_id || "")}.`,
 path: vocabPath,
 termCode: vocabLevel || null,
 termSetName: "Kamus Kosakata Bahasa Jepang NihongoRoute",
 termSetPath: "/library/vocab",
 }),
 ]}
 />
 {/* Ambient Background Glows */}
 <div className="absolute top-[10%] left-[-10%] size-[40%] bg-primary/10 blur-[65px] rounded-full pointer-events-none z-0 animate-pulse ambient-glow will-change-transform" />
 <div className="absolute bottom-[10%] right-[-10%] size-[30%] bg-secondary/5 blur-[65px] rounded-full pointer-events-none z-0 ambient-glow will-change-transform" />
 
 {/* Background Grid Overlay */}
 <div className="absolute inset-0 bg-[linear-gradient(hsl(var(--foreground)/0.01)_1px,transparent_1px),linear-gradient(90deg,hsl(var(--foreground)/0.01)_1px,transparent_1px)] bg-size-[60px_60px] pointer-events-none z-0" />

 <div className="max-w-4xl mx-auto w-full relative z-10 pt-8 md:pt-16">
 <div className="flex flex-col gap-12 md:gap-16">
 
 {/* 1. Hero Bento (Fokus Utama) */}
 <VocabHero 
 word={vocab.word || ""} 
 furigana={typeof vocab.furigana === "string" ? vocab.furigana : undefined} 
 romaji={typeof vocab.romaji === "string" ? vocab.romaji : undefined} 
 meaning={vocab.meaning || ""} 
 audioUrl={(vocab.audioUrl as string) || (vocab.audio_url as string) || undefined}
 />

 {/* 2. Meta Data Bento (Atribut Kata) */}
 <VocabDetails 
 hinshi={typeof vocab.hinshi === "string" ? vocab.hinshi : undefined} 
 jlptLevel={vocab.jlptLevel || undefined} 
 pitchAccent={vocab.pitchAccent || undefined} 
 />

 {/* 3. Mnemonic & Notes Bento */}
 <VocabNotes 
 wordId={vocab.word || ""}
 mnemonic={typeof vocab.mnemonic === "string" ? vocab.mnemonic : undefined} 
 usageNotes={vocab.usageNotes || undefined} 
 />

 {/* 4. Conjugation Bento (Jika Kata Sifat atau Kata Kerja) */}
 <VocabConjugation 
 isAdjective={isAdjective}
 isVerb={isVerb}
 conjugations={vocab.conjugations as Record<string, string> | null | undefined}
 />

 {/* 5. Examples Bento */}
 <VocabExamples examples={vocab.examples as VocabExampleItem[] | undefined} />

 {/* 6. Related Context Bento */}
 <VocabRelated 
 relatedKanji={vocab.relatedKanji as VocabKanjiRef[] | undefined} 
 synonyms={vocab.synonyms as VocabRef[] | undefined} 
 antonyms={vocab.antonyms as VocabRef[] | undefined} 
 />
 </div>

 {/* Action Footer */}
 <footer className="mt-20 pt-16 border-t border-border flex flex-col gap-8">
 <div className="flex flex-col gap-3">
 <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
 Latihan Terkait
 </p>
 <div className="flex flex-wrap gap-2">
 <Button asChild variant="outline" className="rounded-lg gap-2">
 <Link href={`/tools/jlpt-drill?level=${encodeURIComponent(vocabLevel)}&kind=vocab&source=vocab&slug=${encodeURIComponent(vocabSlug)}`}>
 <ListChecks size={16} aria-hidden="true" />
 JLPT Drill
 </Link>
 </Button>
 <Button asChild variant="outline" className="rounded-lg gap-2">
 <Link href={`/tools/counter-trainer?level=${encodeURIComponent(vocabLevel)}&source=vocab&slug=${encodeURIComponent(vocabSlug)}`}>
 <Hash size={16} aria-hidden="true" />
 Counter
 </Link>
 </Button>
 <Button asChild variant="outline" className="rounded-lg gap-2">
 <Link href={`/tools/flashcards?category=${encodeURIComponent(vocabLevel.toLowerCase())}&mode=vocab&amount=10`}>
 <Layers size={16} aria-hidden="true" />
 Flashcard
 </Link>
 </Button>
 {isVerb ? (
 <Button asChild variant="outline" className="rounded-lg gap-2">
 <Link href={`/tools/conjugation?verb=${encodeURIComponent(vocabWord)}&group=${verbGroup}&sourceTitle=${encodeURIComponent(vocabWord)}&sourceHref=${encodeURIComponent(`/library/vocab/${vocabSlug}`)}`}>
 <GraduationCap size={16} aria-hidden="true" />
 Konjugasi
 </Link>
 </Button>
 ) : null}
 </div>
 </div>
 <div className="flex flex-col md:flex-row items-center justify-between gap-8">
 <Link href="/library/vocab" className="w-full md:w-auto">
 <Button variant="ghost" className="w-full px-10 py-8 h-auto text-[11px] md:text-xs font-black uppercase tracking-[0.2em] rounded-lg bg-[hsl(var(--muted)/0.3)] border border-border hover:bg-[hsl(var(--muted)/0.5)] hover:border-primary/30 transition-all gap-4 group">
 <ChevronLeft size={20} aria-hidden="true" className="group-hover:-translate-x-2 transition-transform" /> Kembali ke Daftar Kosakata
 </Button>
 </Link>
 </div>
 </footer>
 </div>
 </main>
 );
}