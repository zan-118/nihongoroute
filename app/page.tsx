import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#1f242d] text-[#c4cfde] overflow-hidden selection:bg-[#0ef] selection:text-[#1f242d]">
      {/* HERO */}
      <section className="relative pt-8 pb-8 lg:pt-8 lg:pb-8 flex items-center min-h-[90vh]">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-[0%] right-[-5%] w-[600px] h-[600px] bg-[#0ef]/10 rounded-full blur-[120px]" />
          <div className="absolute bottom-[20%] left-[-5%] w-[400px] h-[400px] bg-blue-500/5 rounded-full blur-[100px]" />
        </div>

        <div className="max-w-7xl mx-auto px-8 relative z-10 w-full">
          <h1 className="text-5xl md:text-7xl lg:text-[110px] font-black italic tracking-tight text-white leading-[0.9] mb-10">
            JAPANESE <br />
            <span className="text-[#0ef]">MADE SIMPLE.</span>
          </h1>

          <Link
            href="/jlpt/"
            className="px-10 py-5 bg-[#0ef] text-[#1f242d] font-black rounded-2xl hover:scale-105 transition-all text-xs uppercase tracking-[0.2em]"
          >
            Start Learning Free
          </Link>
        </div>
      </section>

      {/* FEATURES */}
      <section className="py-24 border-y border-white/5">
        <div className="max-w-7xl mx-auto px-8 grid grid-cols-1 md:grid-cols-3 gap-10">
          {[
            {
              title: "Structured",
              desc: "Materi N5 hingga N1 yang tersusun logis dan progresif.",
              icon: "📚",
            },
            {
              title: "Gamified",
              desc: "XP, level, streak, dan achievement system.",
              icon: "🎮",
            },
            {
              title: "Free Forever",
              desc: "Tanpa paywall. Donasi-based platform.",
              icon: "🔓",
            },
          ].map((feature, i) => (
            <div
              key={i}
              className="p-8 rounded-3xl bg-[#1e2024] border border-white/5"
            >
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-bold text-white mb-3 uppercase">
                {feature.title}
              </h3>
              <p className="text-sm text-[#c4cfde]/60">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
