/**
 * @file page.tsx
 * @description Halaman utama Pustaka (Library Hub) NihongoRoute.
 * Menyediakan navigasi ke semua kategori konten secara interaktif dan sangat lapang di desktop.
 */

// ======================
// IMPOR
// ======================
import type { Metadata } from "next";
import { JsonLd } from "@/components/seo/JsonLd";
import { BookOpen, BarChart2, Library, Database, Activity, Award, Headphones, Type, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";

// Komponen Pendukung
import { LibraryCategoryCard } from "@/components/features/library/LibraryCategoryCard";
import { LibraryServerStatus } from "@/components/features/library/LibraryServerStatus";
import { getLibraryCounts } from "@/actions/library-counts.actions";
import {
  breadcrumbJsonLd,
  createPageMetadata,
  learningResourceJsonLd,
  webPageJsonLd,
} from "@/lib/seo";

/**
 * Metadata SEO untuk halaman Pustaka Belajar.
 */
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
 * Mengambil data statistik agregat jumlah kosakata, kanji, pola kalimat, dll., lalu menyajikan bento grid navigasi kategori.
 * 
 * @returns {Promise<JSX.Element>} Halaman direktori pustaka materi belajar Jepang yang super lega.
 */
export default async function LibraryPage() {
  // Ambil data jumlah materi dari database/API
  const counts = await getLibraryCounts();

  // Hitung total akumulasi seluruh materi belajar
  const totalMateri = counts.vocab + counts.kanji + counts.grammar + counts.reading + counts.listening + counts.exams;

  // Konfigurasi data untuk setiap kategori kartu navigasi
  const categories = [
    {
      href: "/library/vocab",
      title: "Daftar Kosakata",
      desc: "Ribuan kosakata, kata kerja, dan kata sifat N5-N1 lengkap dengan audio dan fitur SRS luring.",
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
      desc: "Bahas pola kalimat jadi lebih mudah dengan contoh audio dan penjelasan praktis.",
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
      desc: "Uji kesiapanmu menghadapi ujian JLPT sesungguhnya dengan simulasi skor yang akurat.",
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

  // Konfigurasi data statistik utama untuk banner atas
  const stats = [
    { label: "Total Kosakata", value: counts.vocab, accentRgb: "59 130 246" },
    { label: "Total Kanji", value: counts.kanji, accentRgb: "239 68 68" },
    { label: "Total Tata Bahasa", value: counts.grammar, accentRgb: "34 197 94" },
  ];

  return (
    <div className="w-full px-4 md:px-8 lg:px-12 relative overflow-hidden pb-32 bg-transparent text-foreground transition-colors duration-300 min-h-screen pt-8 md:pt-16">
      {/* Injeksi JSON-LD untuk optimasi SEO mesin pencari */}
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
      {/* Background Neural Overlays & Glowing Ambient Accents */}
      <div className="absolute top-[5%] -left-[10%] size-[50%] bg-primary/5 blur-[150px] rounded-full pointer-events-none z-0" />
      <div className="absolute bottom-[10%] -right-[10%] size-[40%] bg-secondary/5 blur-[150px] rounded-full pointer-events-none z-0" />
      <div className="neural-grid" />

      <div className="max-w-7xl mx-auto relative z-10">

        {/* ── HEADER ── */}
        <header className="mb-14 md:mb-20">
          <div className="flex items-center gap-4 md:gap-6 mb-8 md:mb-12">
            <Card className="w-14 h-14 md:w-16 md:h-16 shrink-0 rounded-2.5xl bg-[rgb(var(--primary-rgb)/0.08)] border-border/80 flex items-center justify-center shadow-[0_0_30px_rgba(var(--primary-rgb),0.02)] glass">
              <Library size={28} className="text-primary md:w-8 md:h-8" />
            </Card>
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-black uppercase tracking-[0.25em] text-primary/70">
                Pusat Sumber Belajar
              </span>
              <div className="flex items-center gap-2.5">
                <div className="size-2 rounded-full bg-success animate-pulse" />
                <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest leading-none">
                  Koneksi Luring: Aktif
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-12 mb-14 md:mb-20">
            <div className="flex-1">
              <h1 className="text-4xl sm:text-5xl md:text-8xl uppercase tracking-tight text-foreground mb-6 drop-shadow-sm leading-none">
                Pustaka<br />
                <span className="text-primary">Materi</span>
              </h1>
              <p className="text-muted-foreground text-sm md:text-lg lg:text-xl max-w-3xl leading-relaxed font-medium">
                Cari semua materi belajar kamu di sini. Mulai dari kata kerja sampai pola kalimat buat persiapan JLPT, semuanya lengkap.
              </p>
            </div>
            <div className="shrink-0 hidden xl:block w-full lg:w-auto mt-8 lg:mt-0">
              <LibraryServerStatus />
            </div>
          </div>

          {/* ── BANNER STATISTIK (Bento Grid Style) ── */}
          <div className="flex flex-col gap-6 w-full">
            <div className="flex flex-col sm:flex-row flex-wrap gap-6 md:gap-8">
              {stats.map((stat) => (
                <Card 
                  key={stat.label} 
                  className="p-6 md:p-8 rounded-[2rem] border border-border/80 bg-[rgb(var(--card-rgb)/0.3)]  flex flex-col justify-center items-center text-center gap-2 group transition-all duration-300 hover:shadow-[0_0_30px_rgba(var(--primary-rgb),0.03)] hover:border-primary/20 glass"
                >
                  <span
                    className="text-3xl md:text-5xl font-black tabular-nums tracking-tighter leading-none transition-transform duration-300 group-hover:scale-105"
                    style={{ color: `rgb(${stat.accentRgb})` }}
                  >
                    {stat.value.toLocaleString("id-ID")}
                  </span>
                  <span className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.25em]">
                    {stat.label}
                  </span>
                </Card>
              ))}
            </div>

            {/* Total strip status */}
            <div
              className="px-8 py-4 rounded-lg border border-border/60  flex items-center justify-center gap-3 glass"
              style={{ background: "rgb(var(--primary-rgb)/0.02)" }}
            >
              <Sparkles size={14} className="text-primary animate-pulse" />
              <span className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.3em] text-center">
                {totalMateri.toLocaleString("id-ID")} total materi siap diakses secara luring
              </span>
            </div>
          </div>
        </header>

        {/* ── NAVIGATION GRID ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 items-stretch mt-12">
          {categories.map((cat, idx) => (
            <div
              key={cat.href}
              className={
                // Jika item terakhir ganjil, buat melebar penuh pada layar medium ke atas
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