/**
 * @file page.tsx
 * @description Halaman utama Pustaka (Library Hub) NihongoRoute.
 * Menyediakan navigasi ke semua kategori konten: Kosakata, Kanji, Tata Bahasa, Membaca, Menyimak, dan Ujian.
 */

// ======================
// IMPOR
// ======================
import type { Metadata } from "next";
import { JsonLd } from "@/components/seo/JsonLd";
import { BookOpen, BarChart2, Library, Database, Activity, Award, Headphones, Type } from "lucide-react";
import { Card } from "@/components/ui/card";

// Komponen Pendukung
import { LibraryCategoryCard } from "@/components/features/library/LibraryCategoryCard";
import { LibraryServerStatus } from "@/components/features/library/LibraryServerStatus";
import { getLibraryCounts } from "@/actions/library.counts.actions";
import {
  breadcrumbJsonLd,
  createPageMetadata,
  learningResourceJsonLd,
  webPageJsonLd,
} from "@/lib/seo";

// ======================
// METADATA SEO
// ======================
export const metadata: Metadata = {
  ...createPageMetadata({
    title: "Pustaka Belajar | NihongoRoute",
    description:
      "Cari semua materi belajar bahasa Jepang: kosakata, tata bahasa, kanji, graded reading, listening lab, cheatsheet, dan simulasi ujian JLPT.",
    path: "/library",
    keywords: [
      "pustaka bahasa Jepang",
      "kamus kosakata Jepang",
      "kanji JLPT",
      "grammar bahasa Jepang",
      "graded reading Jepang",
    ],
  }),
};

// ======================
// EKSEKUSI UTAMA
// ======================

/**
 * Halaman utama Pustaka (RSC).
 * Mengambil data statistik agregat jumlah kosakata, kanji, pola kalimat, dll., lalu menyajikan grid navigasi kategori.
 * 
 * @returns {JSX.Element} Halaman direktori pustaka materi belajar.
 */
export default async function LibraryPage() {
  const counts = await getLibraryCounts();

  const totalMateri = counts.vocab + counts.kanji + counts.grammar + counts.reading + counts.listening + counts.exams;

  const categories = [
    {
      href: "/library/vocab",
      title: "Daftar Kosakata",
      desc: "Ribuan kosakata, kata kerja, dan kata sifat N5-N1 lengkap dengan audio dan fitur SRS.",
      icon: <Database size={24} />,
      label: "Perbendaharaan Kata",
      count: counts.vocab,
      accentRgb: "59 130 246",
    },
    {
      href: "/library/kanji",
      title: "Pustaka Kanji",
      desc: "Dalami struktur ribuan kanji melalui visualisasi urutan goresan (stroke order) yang interaktif.",
      icon: <Type size={24} />,
      label: "Koleksi Kanji",
      count: counts.kanji,
      accentRgb: "239 68 68",
    },
    {
      href: "/library/grammar",
      title: "Panduan Tata Bahasa",
      desc: "Bahas pola kalimat jadi lebih mudah dengan contoh audio dan penjelasan yang simpel.",
      icon: <BookOpen size={24} />,
      label: "Pola Kalimat",
      count: counts.grammar,
      accentRgb: "34 197 94",
    },
    {
      href: "/library/reading",
      title: "Graded Reading",
      desc: "Asah kemahiran membaca melalui teks interaktif yang dikategorikan sesuai standar level JLPT.",
      icon: <BookOpen size={24} />,
      label: "Bacaan Berjenjang",
      count: counts.reading,
      isSanity: true,
      accentRgb: "168 85 247",
    },
    {
      href: "/library/listening",
      title: "Latihan Menyimak",
      desc: "Tingkatkan kepekaan pendengaran melalui modul audio interaktif dan dukungan transkrip.",
      icon: <Headphones size={24} />,
      label: "Listening Lab",
      count: counts.listening,
      isSanity: true,
      accentRgb: "6 182 212",
    },
    {
      href: "/exams",
      title: "Ujian & Sertifikasi",
      desc: "Uji kesiapan Anda menghadapi ujian JLPT sesungguhnya dengan simulasi skor yang akurat.",
      icon: <Award size={24} />,
      label: "Latihan Ujian",
      count: counts.exams,
      isSanity: true,
      accentRgb: "249 115 22",
    },
    {
      href: "/library/cheatsheet",
      title: "Catatan Cepat",
      desc: "Referensi cepat untuk angka, partikel, dan materi dasar lainnya sebagai penunjang belajar harian.",
      icon: <BarChart2 size={24} />,
      label: "Panduan Cepat",
      accentRgb: "245 158 11",
    }
  ];

  const stats = [
    { label: "Total Kosakata", value: counts.vocab, accentRgb: "59 130 246" },
    { label: "Total Kanji", value: counts.kanji, accentRgb: "239 68 68" },
    { label: "Total Tata Bahasa", value: counts.grammar, accentRgb: "34 197 94" },
  ];

  return (
    <div className="w-full px-4 md:px-8 lg:px-12 relative overflow-hidden pb-24 bg-transparent text-foreground transition-colors duration-300 min-h-screen pt-8 md:pt-12">
      <JsonLd
        data={[
          breadcrumbJsonLd([
            { name: "Beranda", path: "/" },
            { name: "Pustaka", path: "/library" },
          ]),
          webPageJsonLd({
            name: "Pustaka Belajar NihongoRoute",
            description: metadata.description as string,
            path: "/library",
          }),
          learningResourceJsonLd({
            name: "Pustaka Belajar NihongoRoute",
            description: metadata.description as string,
            path: "/library",
            educationalLevel: "JLPT N5-N1",
            teaches: categories.map((category) => category.title),
          }),
        ]}
      />
      {/* Background Neural Overlays */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgb(var(--primary-rgb)/0.05)_0%,transparent_50%)] pointer-events-none z-0" />
      <div className="neural-grid" />

      <div className="max-w-7xl mx-auto relative z-10">

        {/* ── HEADER ── */}
        <header className="mb-10 md:mb-16">
          <div className="flex items-center gap-4 md:gap-6 mb-8 md:mb-10">
            <Card className="w-14 h-14 md:w-16 md:h-16 shrink-0 rounded-2xl bg-[rgb(var(--primary-rgb)/0.1)] border-[rgb(var(--primary-rgb)/0.2)] flex items-center justify-center neo-inset shadow-none">
              <Library size={28} className="text-primary md:w-8 md:h-8" />
            </Card>
            <div className="flex flex-col">
              <span className="text-xs font-bold uppercase tracking-widest text-[rgb(var(--primary-rgb)/0.5)]">
                Pusat Sumber Belajar
              </span>
              <div className="flex items-center gap-2 mt-1">
                <Activity size={12} className="text-primary animate-pulse" />
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest leading-none">
                  Status: Siap Belajar
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-10 lg:gap-12 mb-10 md:mb-14">
            <div className="flex-1">
              <h1 className="text-3xl sm:text-4xl md:text-7xl lg:text-7xl font-black uppercase tracking-tight text-foreground mb-4 md:mb-6 drop-shadow-lg leading-none md:leading-[0.85]">
                Pustaka<br />
                <span className="text-primary">Materi</span>
              </h1>
              <p className="text-muted-foreground text-xs md:text-base lg:text-xl max-w-2xl leading-relaxed font-medium">
                Cari semua materi belajar kamu di sini. Mulai dari kata kerja sampai pola kalimat buat persiapan JLPT, semuanya lengkap.
              </p>
            </div>
            <div className="shrink-0 hidden xl:block w-full lg:w-auto mt-8 lg:mt-0">
              <LibraryServerStatus />
            </div>
          </div>

          {/* ── BANNER STATISTIK ── */}
          <div className="rounded-[1.75rem] border border-border bg-card/40 backdrop-blur-sm overflow-hidden">
            <div className="grid grid-cols-3 divide-x divide-border">
              {stats.map((stat) => (
                <div key={stat.label} className="px-5 py-5 md:px-8 md:py-6 flex flex-col items-center text-center gap-1 group">
                  <span
                    className="text-2xl sm:text-3xl md:text-4xl font-black tabular-nums tracking-tight leading-none"
                    style={{ color: `rgb(${stat.accentRgb})` }}
                  >
                    {stat.value.toLocaleString("id-ID")}
                  </span>
                  <span className="text-[9px] sm:text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">
                    {stat.label}
                  </span>
                </div>
              ))}
            </div>
            {/* Total strip */}
            <div
              className="px-6 py-2.5 border-t border-border flex items-center justify-center gap-2"
              style={{ background: "rgb(var(--primary-rgb)/0.03)" }}
            >
              <Activity size={10} className="text-primary animate-pulse" />
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.25em]">
                {totalMateri.toLocaleString("id-ID")} total materi tersedia
              </span>
            </div>
          </div>
        </header>

        {/* ── NAVIGATION GRID ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5 items-stretch">
          {categories.map((cat, idx) => (
            <div
              key={cat.href}
              className={
                idx === categories.length - 1 && categories.length % 2 !== 0
                  ? "md:col-span-2"
                  : ""
              }
            >
              <LibraryCategoryCard
                {...cat}
                index={idx}
              />
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
