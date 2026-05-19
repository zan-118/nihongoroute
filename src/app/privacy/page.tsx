import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Shield, Lock, FileText, Mail } from "lucide-react";

export const metadata = {
  title: "Kebijakan Privasi | NihongoRoute",
  description: "Kebijakan Privasi pengguna platform NihongoRoute.",
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-background text-foreground py-24 px-4 sm:px-6 md:px-12 relative overflow-hidden flex flex-col items-center justify-start transition-colors duration-300">
      {/* Background Neural Overlays */}
      <div className="neural-grid" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(var(--primary-rgb),0.07)_0%,transparent_70%)] pointer-events-none z-0" />
      <div className="absolute top-1/4 right-0 w-[300px] h-[300px] bg-[rgba(var(--primary-rgb),0.03)] rounded-full blur-[100px] pointer-events-none z-0" />
      <div className="absolute bottom-1/4 left-0 w-[250px] h-[250px] bg-[rgba(var(--destructive-rgb),0.02)] rounded-full blur-[80px] pointer-events-none z-0" />

      <div className="max-w-4xl w-full relative z-10 flex flex-col">
        {/* Breadcrumb / Top Navigation */}
        <div className="mb-8 flex items-center justify-start animate-fade-in">
          <Link href="/dashboard">
            <Button variant="ghost" className="rounded-2xl px-4 py-2 hover:bg-muted text-xs font-bold tracking-wider uppercase flex items-center gap-2 border border-border/40 hover:border-primary/20 transition-all duration-300">
              <ArrowLeft size={14} className="text-primary" />
              <span>Dashboard</span>
            </Button>
          </Link>
        </div>

        {/* Outer Premium Cyber-glass Card */}
        <div className="glass border border-border/60 rounded-3xl p-6 sm:p-10 md:p-14 shadow-[0_0_50px_rgba(var(--primary-rgb),0.05)] relative overflow-hidden backdrop-blur-xl">
          {/* Subtle Corner Accents */}
          <div className="absolute top-0 left-0 w-8 h-[2px] bg-gradient-to-r from-primary to-transparent" />
          <div className="absolute top-0 left-0 w-[2px] h-8 bg-gradient-to-b from-primary to-transparent" />
          <div className="absolute bottom-0 right-0 w-8 h-[2px] bg-gradient-to-l from-primary to-transparent" />
          <div className="absolute bottom-0 right-0 w-[2px] h-8 bg-gradient-to-t from-primary to-transparent" />

          {/* Header Jepang */}
          <header className="mb-12 border-b border-border/60 pb-8 relative">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-[0_0_15px_rgba(var(--primary-rgb),0.2)]">
                <Shield size={20} />
              </div>
              <span className="text-xs font-black tracking-widest text-primary uppercase bg-primary/5 border border-primary/10 px-3 py-1 rounded-full">
                Guaranteed Privacy
              </span>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-black text-foreground font-japanese tracking-tight mb-3 select-none">
              プライバシーポリシー
            </h1>
            <p className="text-sm md:text-base font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
              Privacy Policy <span className="text-primary/60">•</span> Kebijakan Privasi
            </p>
          </header>

          {/* Konten Tipografi Minimalis & Modern */}
          <article className="prose prose-slate dark:prose-invert max-w-none text-muted-foreground space-y-8">
            <div className="flex items-center gap-2 text-xs font-semibold text-primary/80 bg-primary/5 border border-primary/10 w-fit px-4 py-2 rounded-xl">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span>Terakhir diperbarui: {new Date().toLocaleDateString("id-ID", { month: "long", year: "numeric" })}</span>
            </div>

            <p className="lead text-base md:text-lg text-foreground/80 leading-relaxed font-medium border-l-2 border-primary/30 pl-4">
              Selamat datang di <strong className="text-foreground font-semibold">NihongoRoute</strong>. Kami menghargai privasi Anda dan berkomitmen penuh untuk melindungi informasi pribadi Anda. Dokumen ini menjelaskan bagaimana kami mengumpulkan, menggunakan, dan menjaga data Anda saat menggunakan platform edukasi non-komersial kami.
            </p>

            {/* Section 1 */}
            <div className="space-y-4 pt-4 border-t border-border/20">
              <h2 className="text-xl md:text-2xl font-black text-foreground tracking-tight flex items-center gap-3">
                <span className="text-sm font-bold bg-primary/10 text-primary border border-primary/20 w-8 h-8 rounded-lg flex items-center justify-center shadow-[0_0_10px_rgba(var(--primary-rgb),0.1)]">1</span>
                Pendahuluan
              </h2>
              <p className="leading-relaxed">
                NihongoRoute didesain sebagai platform pembelajaran interaktif yang aman dan transparan. Akses pembelajaran Anda dijamin bebas dari pelacakan invasif demi menjaga ketenangan dan fokus penuh dalam mempelajari bahasa Jepang.
              </p>
            </div>

            {/* Section 2 */}
            <div className="space-y-4 pt-4 border-t border-border/20">
              <h2 className="text-xl md:text-2xl font-black text-foreground tracking-tight flex items-center gap-3">
                <span className="text-sm font-bold bg-primary/10 text-primary border border-primary/20 w-8 h-8 rounded-lg flex items-center justify-center shadow-[0_0_10px_rgba(var(--primary-rgb),0.1)]">2</span>
                Data yang Kami Kumpulkan
              </h2>
              <p className="leading-relaxed">
                Karena NihongoRoute beroperasi dengan prinsip <strong className="text-foreground font-semibold">&quot;Offline-First&quot;</strong> dan menjunjung tinggi privasi, kami mengumpulkan data yang sangat minimal, yaitu:
              </p>
              
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 !list-none !pl-0">
                <li className="glass border border-border/60 hover:border-primary/30 rounded-2xl p-5 transition-all duration-300 group flex items-start gap-4 shadow-sm hover:shadow-[0_0_20px_rgba(var(--primary-rgb),0.02)]">
                  <div className="w-8 h-8 rounded-lg bg-primary/5 border border-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform duration-300">
                    <Lock size={16} />
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground mb-1 text-sm">Data Profil (Opsional)</h3>
                    <p className="text-xs leading-relaxed text-muted-foreground">Nama dan alamat surel apabila Anda memilih masuk log untuk menyinkronkan progres lintas perangkat.</p>
                  </div>
                </li>
                <li className="glass border border-border/60 hover:border-primary/30 rounded-2xl p-5 transition-all duration-300 group flex items-start gap-4 shadow-sm hover:shadow-[0_0_20px_rgba(var(--primary-rgb),0.02)]">
                  <div className="w-8 h-8 rounded-lg bg-primary/5 border border-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform duration-300">
                    <FileText size={16} />
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground mb-1 text-sm">Data Progres Belajar</h3>
                    <p className="text-xs leading-relaxed text-muted-foreground">Riwayat penyelesaian materi, perolehan XP (Experience Points), dan riwayat ulasan Spaced Repetition System (SRS).</p>
                  </div>
                </li>
              </ul>
            </div>

            {/* Section 3 */}
            <div className="space-y-4 pt-4 border-t border-border/20">
              <h2 className="text-xl md:text-2xl font-black text-foreground tracking-tight flex items-center gap-3">
                <span className="text-sm font-bold bg-primary/10 text-primary border border-primary/20 w-8 h-8 rounded-lg flex items-center justify-center shadow-[0_0_10px_rgba(var(--primary-rgb),0.1)]">3</span>
                Penggunaan Data
              </h2>
              <p className="leading-relaxed">
                Data yang kami kumpulkan murni digunakan untuk meningkatkan pengalaman belajar Anda, dengan rincian:
              </p>
              <ul className="space-y-3 !list-none !pl-0">
                {[
                  "Menyimpan dan mengembalikan progres belajar lintas perangkat secara mulus.",
                  "Menghitung algoritma pengulangan materi (SRS) secara akurat dan terpersonalisasi agar Anda bisa menguasai kosakata lebih efisien.",
                  "Mengidentifikasi area untuk meningkatkan kualitas konten NihongoRoute di masa depan."
                ].map((text, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-sm leading-relaxed">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                    <span>{text}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Section 4 */}
            <div className="space-y-4 pt-4 border-t border-border/20">
              <h2 className="text-xl md:text-2xl font-black text-foreground tracking-tight flex items-center gap-3">
                <span className="text-sm font-bold bg-primary/10 text-primary border border-primary/20 w-8 h-8 rounded-lg flex items-center justify-center shadow-[0_0_10px_rgba(var(--primary-rgb),0.1)]">4</span>
                Berbagi Data dengan Pihak Ketiga
              </h2>
              <p className="leading-relaxed">
                NihongoRoute adalah <strong className="text-foreground font-semibold">platform edukasi non-komersial</strong>. Kami <strong className="text-foreground font-semibold text-destructive">tidak pernah menjual, menyewakan, atau memperdagangkan</strong> data pribadi Anda kepada pihak ketiga mana pun untuk tujuan periklanan, pemasaran, atau komersial.
              </p>
            </div>

            {/* Section 5 */}
            <div className="space-y-4 pt-4 border-t border-border/20">
              <h2 className="text-xl md:text-2xl font-black text-foreground tracking-tight flex items-center gap-3">
                <span className="text-sm font-bold bg-primary/10 text-primary border border-primary/20 w-8 h-8 rounded-lg flex items-center justify-center shadow-[0_0_10px_rgba(var(--primary-rgb),0.1)]">5</span>
                Keamanan Data Anda
              </h2>
              <p className="leading-relaxed">
                Kami menerapkan berbagai standar keamanan modern untuk melindungi informasi Anda. Operasi sinkronisasi data ke basis data (Supabase) kami dilakukan menggunakan enkripsi standar industri serta kontrol akses baris (Row Level Security). Namun, karena tidak ada transmisi data di internet yang 100% kebal, kami mendesain aplikasi ini untuk menyimpan data sensitif secara lokal terlebih dahulu demi keamanan optimal.
              </p>
            </div>

            {/* Section 6 */}
            <div className="space-y-4 pt-4 border-t border-border/20">
              <h2 className="text-xl md:text-2xl font-black text-foreground tracking-tight flex items-center gap-3">
                <span className="text-sm font-bold bg-primary/10 text-primary border border-primary/20 w-8 h-8 rounded-lg flex items-center justify-center shadow-[0_0_10px_rgba(var(--primary-rgb),0.1)]">6</span>
                Hubungi Kami
              </h2>
              <p className="leading-relaxed">
                Jika Anda memiliki pertanyaan terkait Kebijakan Privasi ini atau ingin mengajukan permohonan penghapusan data profil secara penuh dari sistem awan kami, silakan hubungi kami melalui surel atau repositori resmi kami.
              </p>

              <div className="glass border border-border/50 rounded-2xl p-4 w-full sm:w-fit flex items-center gap-3 hover:border-primary/30 transition-all duration-300">
                <div className="w-8 h-8 rounded-lg bg-primary/5 flex items-center justify-center text-primary">
                  <Mail size={16} />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-muted-foreground font-medium">Email Dukungan</span>
                  <a href="mailto:nihongoroute@gmail.com" className="text-sm text-primary font-bold hover:underline transition-all">
                    nihongoroute@gmail.com
                  </a>
                </div>
              </div>
            </div>
          </article>

          {/* Footer Back Button */}
          <div className="pt-10 mt-14 border-t border-border/60 flex justify-start">
            <Link href="/dashboard">
              <Button variant="outline" className="rounded-2xl px-6 h-12 shadow-sm font-bold tracking-widest uppercase text-xs flex items-center gap-2 hover:bg-muted border border-border hover:border-primary/30 transition-all duration-300">
                <ArrowLeft size={16} />
                <span>Kembali ke Dashboard</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
