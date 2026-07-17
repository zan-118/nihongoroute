/**
 * @file app/(main)/library/cheatsheet/[id]/page.tsx
 * @description Halaman detail referensi cheatsheet interaktif NihongoRoute yang dapat diekspor ke PDF secara dinamis.
 */

// ======================
// IMPOR
// ======================
import { notFound } from "next/navigation";
import Link from "next/link";
import { JsonLd } from "@/components/seo/JsonLd";
import { 
  ChevronLeft, 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheatsheetTable } from "./CheatsheetTable";
import { getCheatsheetByIdOrSlug, getCheatsheets, getCheatsheetStaticParams } from "@/actions/library.actions";
import CheatsheetPdfButton from "./CheatsheetPdfButton";
import type { Metadata } from "next";
import {
  breadcrumbJsonLd,
  createPageMetadata,
  encodeRouteSegment,
  learningResourceJsonLd,
} from "@/lib/seo";

// ======================
// KONFIGURASI STATIC GENERATION (ISR/SSG)
// ======================

export const dynamicParams = true;
export const revalidate = 3600;

/**
 * Generate static params.
 * Return active cheatsheet slugs and IDs for ISR.
 */
export async function generateStaticParams() {
  return await getCheatsheetStaticParams();
}

// ======================
// METADATA SEO
// ======================

/**
 * Generate page metadata.
 * Fetch cheatsheet details for SEO.
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  // Decode URL parameter.
  const decodedId = decodeURIComponent(id);
  // Fetch cheatsheet data.
  const sheet = await getCheatsheetByIdOrSlug(decodedId);
  return createPageMetadata({
    title: sheet ? `${sheet.title} | Cheatsheet NihongoRoute` : "Cheatsheet Referensi Cepat | NihongoRoute",
    description: sheet
      ? `Pelajari cheatsheet tabel referensi cepat untuk ${sheet.title}, lengkap dengan versi PDF untuk belajar offline.`
      : "Kumpulan tabel cheatsheet referensi cepat untuk materi tata bahasa, angka, partikel, dan kosakata Jepang.",
    path: `/library/cheatsheet/${encodeRouteSegment(sheet?.slug || decodedId)}`,
    keywords: [
      String(sheet?.title || ""),
      String(sheet?.category || ""),
      "cheatsheet bahasa Jepang",
      "referensi cepat Jepang",
    ].filter(Boolean),
  });
}

// ======================
// EKSEKUSI UTAMA
// ======================

/**
 * Cheatsheet detail page component.
 * Render interactive table and PDF export option.
 */
export default async function CheatsheetDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  // Decode URL parameter.
  const decodedId = decodeURIComponent(id);
  
  // Fetch cheatsheet data.
  const sheet = await getCheatsheetByIdOrSlug(decodedId);

  // Redirect to 404 if not found.
  if (!sheet) notFound();
  // Build canonical path.
  const sheetPath = `/library/cheatsheet/${encodeRouteSegment(String(sheet.slug || decodedId))}`;

  // Merge vocabulary and items.
  const allItems = [
    ...(sheet.linkedVocab || []),
    ...(sheet.items || [])
  ].filter(Boolean);

  return (
    <main className="w-full bg-transparent min-h-screen pb-24 relative overflow-hidden">
      <JsonLd
        data={[
          breadcrumbJsonLd([
            { name: "Beranda", path: "/" },
            { name: "Pustaka", path: "/library" },
            { name: "Cheatsheet", path: "/library/cheatsheet" },
            { name: sheet.title, path: sheetPath },
          ]),
          learningResourceJsonLd({
            name: sheet.title,
            description: `Cheatsheet referensi cepat bahasa Jepang untuk ${sheet.title}.`,
            path: sheetPath,
            teaches: sheet.category || sheet.title,
          }),
        ]}
      />
      {/* Dekorasi Latar Belakang */}
      <div className="neural-grid" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgb(var(--destructive-rgb)/0.03)_0%,transparent_70%)] pointer-events-none" />

      <div className="max-w-[1400px] mx-auto px-6 md:px-12 relative z-10 pt-10">
        {/* Bagian Tajuk Halaman (Header) */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-12 mb-16">
          <div className="flex flex-col gap-6 max-w-3xl">
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.2em]">
                {sheet.category}
              </Badge>
              <div className="size-1 rounded-full bg-border" />
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">
                {allItems.length} Materi Terdaftar
              </span>
            </div>
            <h1 className="text-5xl md:text-7xl text-foreground tracking-tighter leading-[0.85]">
              {sheet.title}
            </h1>
            <p className="text-lg text-muted-foreground font-medium leading-relaxed">
              Panduan referensi lengkap untuk memahami <span className="text-primary">{sheet.title}</span> dengan tabel komparasi yang sistematis.
            </p>
          </div>

          <div className="flex items-center gap-3 no-print">
            <CheatsheetPdfButton 
              data={allItems} 
              title={sheet.title} 
              category={sheet.category} 
            />
          </div>
        </div>

        {/* Tabel Konten Utama (Komponen Klien) */}
        <CheatsheetTable items={allItems} />

        {/* Aksi Kaki Halaman */}
        <div className="mt-16 flex flex-col items-center gap-8 text-center pb-20">
          <div className="w-16 h-1 bg-border rounded-full" />
          <div className="flex flex-col gap-3">
            <h3 className="text-2xl tracking-tight">Butuh Versi Cetak?</h3>
            <p className="text-muted-foreground text-sm font-medium">Unduh PDF cheatsheet ini untuk dipelajari secara offline di mana saja.</p>
          </div>
          <Link href="/library/cheatsheet">
            <Button variant="ghost" className="gap-2 font-bold text-muted-foreground hover:text-primary">
              <ChevronLeft size={16} /> Kembali ke Daftar
            </Button>
          </Link>
        </div>
      </div>
    </main>
  );
}