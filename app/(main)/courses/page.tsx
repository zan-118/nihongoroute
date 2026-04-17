import Link from "next/link";
import { client } from "@/sanity/lib/client";

export const revalidate = 3600;

interface CategoryData {
  _id: string;
  title: string;
  slug: { current: string };
  description?: string;
}

interface SanityResponse {
  jlpt: CategoryData[];
  general: CategoryData[];
}

export default async function CoursesLandingPage() {
  const { jlpt, general }: SanityResponse = await client.fetch(`{
    "jlpt": *[_type == "course_category" && type == "jlpt"] | order(title desc),
    "general": *[_type == "course_category" && type == "general"] | order(title asc)
  }`);

  return (
    <main className="min-h-screen px-4 md:px-8 pt-24 pb-32 bg-cyber-bg relative overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

      <div className="max-w-6xl mx-auto relative z-10">
        <PageHeader
          title="Pilih Jalur"
          highlight="Belajarmu"
          subtitle="Pusat Kurikulum"
        />

        {/* Fase 0: Dasar */}
        <section className="mb-16">
          <BasicsCard />
        </section>

        {/* Kurikulum Utama */}
        <SectionTitle
          title="Kurikulum Utama:"
          highlight="JLPT"
          accentColor="border-cyan-400"
        />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 mb-24">
          {jlpt.map((cat) => (
            <JlptCard key={cat._id} category={cat} />
          ))}
        </div>

        {/* Materi Tambahan */}
        {general.length > 0 && (
          <>
            <SectionTitle
              title="Materi Tambahan:"
              highlight="Eksplorasi"
              accentColor="border-amber-500"
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 mb-24">
              {general.map((cat) => (
                <GeneralCard key={cat._id} category={cat} />
              ))}
            </div>
          </>
        )}

        {/* Pintasan Koleksi */}
        <LibrarySection />
      </div>
    </main>
  );
}

// --- Sub-Components ---
function PageHeader({
  title,
  highlight,
  subtitle,
}: {
  title: string;
  highlight: string;
  subtitle: string;
}) {
  return (
    <header className="mb-16 text-center md:text-left border-b border-white/5 pb-10">
      <p className="text-cyan-400 text-[10px] font-black uppercase tracking-[0.5em] mb-3 drop-shadow-[0_0_5px_rgba(34,211,238,0.5)]">
        {subtitle}
      </p>
      <h1 className="text-5xl md:text-7xl font-black text-white uppercase italic tracking-tighter leading-none">
        {title} <span className="text-cyan-400">{highlight}</span>
      </h1>
    </header>
  );
}

function SectionTitle({
  title,
  highlight,
  accentColor,
}: {
  title: string;
  highlight: string;
  accentColor: string;
}) {
  return (
    <div className="mb-8 flex items-center gap-4">
      <h3
        className={`text-2xl font-black text-white uppercase tracking-widest italic border-l-4 ${accentColor} pl-4`}
      >
        {title}{" "}
        <span className={accentColor.replace("border-", "text-")}>
          {highlight}
        </span>
      </h3>
      <div className="h-[1px] flex-1 bg-white/5" />
    </div>
  );
}

function BasicsCard() {
  return (
    <Link
      href="/courses/basics"
      className="group block relative overflow-hidden bg-gradient-to-br from-blue-600/10 to-cyber-surface border border-blue-500/20 p-8 md:p-10 rounded-[3rem] hover:border-blue-400/50 transition-all shadow-[0_10px_30px_rgba(0,0,0,0.5)] active:scale-[0.98]"
    >
      <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-6">
        <div className="w-16 h-16 md:w-20 md:h-20 bg-cyber-bg rounded-2xl flex items-center justify-center border border-white/5 shadow-inner group-hover:border-blue-500/50 transition-colors shrink-0">
          <span className="text-4xl md:text-5xl group-hover:scale-110 transition-transform">
            🖋️
          </span>
        </div>
        <div>
          <p className="text-blue-400 text-[9px] md:text-[10px] font-black uppercase tracking-[0.3em] mb-2 bg-blue-500/10 px-3 py-1 rounded-md border border-blue-500/20 w-max">
            Fase 0 / Mulai Di Sini
          </p>
          <h2 className="text-3xl md:text-4xl font-black text-white uppercase italic tracking-tighter">
            Dasar Huruf Kana
          </h2>
          <p className="text-[#c4cfde]/60 text-xs md:text-sm mt-2 max-w-md leading-relaxed">
            Pelajari cara membaca dan menulis Hiragana & Katakana sebelum
            memulai perjalanan belajar tata bahasamu.
          </p>
        </div>
      </div>
    </Link>
  );
}

function JlptCard({ category }: { category: CategoryData }) {
  return (
    <Link
      href={`/courses/${category.slug.current}`}
      className="group relative h-[300px] block"
    >
      <div className="absolute inset-0 bg-cyan-400 blur-[50px] opacity-0 group-hover:opacity-20 transition-opacity duration-500" />
      <div className="relative bg-cyber-surface p-8 md:p-10 rounded-[2.5rem] md:rounded-[3rem] border border-white/5 group-hover:border-cyan-400/50 transition-all flex flex-col items-center text-center h-full shadow-[15px_15px_40px_rgba(0,0,0,0.6)] overflow-hidden">
        <span className="text-[10px] font-black text-white/30 group-hover:text-cyan-400 uppercase tracking-[0.4em] mb-auto">
          Jalur Sertifikasi
        </span>
        <h2 className="text-5xl font-black text-white italic group-hover:scale-110 transition-transform uppercase leading-tight">
          {category.title}
        </h2>
        <div className="h-1 w-12 bg-white/10 rounded-full my-6 group-hover:bg-cyan-400/50 transition-colors" />
        <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] mt-auto flex items-center gap-2 group-hover:text-cyan-400 transition-colors">
          Lihat Silabus{" "}
          <span className="text-lg leading-none group-hover:translate-x-1 transition-transform">
            →
          </span>
        </p>
      </div>
    </Link>
  );
}

function GeneralCard({ category }: { category: CategoryData }) {
  return (
    <Link
      href={`/courses/${category.slug.current}`}
      className="group relative overflow-hidden bg-gradient-to-br from-amber-600/10 to-cyber-surface border border-amber-500/20 p-8 rounded-[2.5rem] hover:border-amber-400/50 transition-all shadow-[0_10px_30px_rgba(0,0,0,0.4)] active:scale-[0.98] block"
    >
      <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="flex-1">
          <h4 className="text-2xl md:text-3xl font-black text-white uppercase italic tracking-tighter group-hover:text-amber-400 transition-colors">
            {category.title}
          </h4>
          {category.description && (
            <p className="text-[#c4cfde]/60 text-xs md:text-sm mt-2 line-clamp-2 leading-relaxed">
              {category.description}
            </p>
          )}
        </div>
        <div className="w-14 h-14 md:w-16 md:h-16 shrink-0 bg-cyber-bg rounded-2xl flex items-center justify-center border border-white/5 group-hover:border-amber-500/50 transition-colors">
          <span className="text-2xl md:text-3xl group-hover:scale-110 transition-transform">
            🎒
          </span>
        </div>
      </div>
    </Link>
  );
}

function LibrarySection() {
  return (
    <section className="pt-16 border-t border-white/5">
      <header className="flex flex-col md:flex-row justify-between items-end mb-12 gap-4">
        <div>
          <h2 className="text-4xl font-black text-white uppercase italic tracking-tighter">
            Koleksi <span className="text-cyan-400">Pintar</span>
          </h2>
          <p className="text-[#c4cfde]/50 mt-2 text-sm max-w-md">
            Pusat referensi cepat untuk tata bahasa, konjugasi kata kerja, dan
            kamus.
          </p>
        </div>
      </header>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        <LibraryCard
          href="/library/verbs"
          icon="🔍"
          title="Kamus Kata Kerja"
          color="blue"
        />
        <LibraryCard
          href="/library/grammar"
          icon="📖"
          title="Panduan Tata Bahasa"
          color="green"
        />
        <LibraryCard
          href="/library/cheatsheet"
          icon="📋"
          title="Catatan Ringkas"
          color="pink"
        />
      </div>
    </section>
  );
}

function LibraryCard({
  href,
  icon,
  title,
  color,
}: {
  href: string;
  icon: string;
  title: string;
  color: string;
}) {
  const themes: Record<string, string> = {
    blue: "hover:border-blue-500/50 group-hover:text-blue-400 group-hover:shadow-[0_0_20px_rgba(59,130,246,0.1)]",
    green:
      "hover:border-green-500/50 group-hover:text-green-400 group-hover:shadow-[0_0_20px_rgba(34,197,94,0.1)]",
    pink: "hover:border-pink-500/50 group-hover:text-pink-400 group-hover:shadow-[0_0_20px_rgba(236,72,153,0.1)]",
  };

  return (
    <Link
      href={href}
      className={`bg-cyber-surface p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] border border-white/5 transition-all duration-300 text-center group ${themes[color]}`}
    >
      <div className="w-16 h-16 md:w-20 md:h-20 mx-auto bg-cyber-bg rounded-2xl flex items-center justify-center border border-white/5 mb-6 group-hover:scale-110 transition-transform">
        <span className="text-3xl md:text-4xl">{icon}</span>
      </div>
      <h3 className="text-white font-black uppercase italic tracking-[0.1em] md:tracking-[0.2em] text-[10px] md:text-xs">
        {title}
      </h3>
    </Link>
  );
}
