import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#1f242d] text-[#c4cfde] flex flex-col">
      {/* HERO SECTION */}
      <section className="relative flex-1 flex flex-col justify-center items-center min-h-[85vh] px-6 md:px-8 text-center overflow-hidden">
        {/* Glow Effects - Disesuaikan agar tidak bikin scroll horizontal di HP */}
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
          <div className="absolute top-[-10%] right-[-10%] w-[300px] md:w-[600px] h-[300px] md:h-[600px] bg-[#0ef]/10 rounded-full blur-[80px] md:blur-[120px]" />
          <div className="absolute bottom-[10%] left-[-10%] w-[200px] md:w-[400px] h-[200px] md:h-[400px] bg-blue-500/5 rounded-full blur-[60px] md:blur-[100px]" />
        </div>

        <div className="relative z-10 w-full max-w-5xl mx-auto flex flex-col items-center">
          <div className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-xs text-[#0ef] font-bold tracking-widest uppercase mb-8 backdrop-blur-sm">
            Platform Belajar Gratis
          </div>

          <h1 className="text-5xl sm:text-6xl md:text-8xl lg:text-[110px] font-black italic tracking-tighter text-white leading-[0.9] md:leading-[0.85] mb-8 text-balance">
            JAPANESE <br />
            <span className="text-[#0ef] drop-shadow-[0_0_15px_rgba(0,255,239,0.2)]">
              MADE SIMPLE.
            </span>
          </h1>

          <p className="text-sm md:text-base text-[#c4cfde]/70 max-w-xl mb-12 text-balance leading-relaxed">
            Kuasai kosakata dan tata bahasa JLPT dari N5 hingga N1 secara
            terstruktur, gratis, dan tanpa perlu login.
          </p>

          <Link
            href="/jlpt/"
            className="px-8 md:px-12 py-5 bg-[#0ef] text-[#1f242d] font-black rounded-2xl hover:bg-[#0ef]/90 hover:scale-105 active:scale-95 transition-all text-sm md:text-xs uppercase tracking-[0.2em] shadow-[0_0_20px_rgba(0,255,239,0.3)]"
          >
            Mulai Belajar Sekarang
          </Link>
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section className="py-20 md:py-32 border-t border-white/5 bg-[#1a1c23]/50">
        <div className="max-w-7xl mx-auto px-6 md:px-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-10">
          {[
            {
              title: "Structured",
              desc: "Materi N5 hingga N1 yang tersusun logis dan progresif untuk pemula.",
              icon: "📚",
            },
            {
              title: "Gamified",
              desc: "Sistem XP, level, dan Spaced Repetition untuk memperkuat ingatanmu.",
              icon: "🎮",
            },
            {
              title: "Free Forever",
              desc: "Tanpa paywall, tanpa login. 100% berjalan aman di browsermu.",
              icon: "🔓",
            },
          ].map((feature, i) => (
            <div
              key={i}
              className="p-8 rounded-[2rem] bg-gradient-to-br from-[#1e2024] to-[#1a1c20] border border-white/5 hover:border-[#0ef]/30 transition-colors group"
            >
              <div className="text-5xl mb-6 group-hover:scale-110 transition-transform origin-left">
                {feature.icon}
              </div>
              <h3 className="text-xl md:text-2xl font-black text-white mb-3 uppercase tracking-tight">
                {feature.title}
              </h3>
              <p className="text-sm text-[#c4cfde]/60 leading-relaxed">
                {feature.desc}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
