"use client";
import { useRouter } from "next/navigation";

export default function SupportPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#1f242d] text-[#c4cfde] selection:bg-[#0ef]/30 flex flex-col">
      {/* Top Nav Khusus Support */}
      <nav className="p-4 md:p-6 sticky top-0 bg-[#1f242d]/80 backdrop-blur-xl z-50 flex justify-between items-center border-b border-white/5">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-[10px] md:text-xs font-black uppercase tracking-widest text-[#c4cfde]/60 hover:text-[#0ef] active:scale-90 transition-all bg-white/5 px-4 py-2 rounded-lg border border-white/10"
        >
          <span>←</span> Kembali
        </button>
        <div className="font-black italic text-xl md:text-2xl tracking-tighter text-white">
          N<span className="text-[#0ef]">P</span>.
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-4 md:px-6 py-12 md:py-16 w-full flex-1 flex flex-col">
        {/* Heart Icon */}
        <div className="relative w-20 h-20 md:w-24 md:h-24 mx-auto mb-10 md:mb-16 group">
          <div className="absolute inset-0 bg-[#0ef] blur-[40px] opacity-20 animate-pulse"></div>
          <div className="relative bg-gradient-to-br from-[#1e2024] to-[#23272b] shadow-2xl border border-white/10 w-full h-full rounded-[2rem] flex items-center justify-center text-3xl md:text-4xl rotate-6 group-hover:rotate-0 transition-all duration-500 group-hover:shadow-[0_0_30px_#0ef]/20">
            💙
          </div>
        </div>

        <div className="text-center mb-12 md:mb-20">
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-black italic tracking-tighter text-white leading-[0.9] mb-6 md:mb-8 text-balance">
            KEEP IT <br />
            <span className="text-[#0ef] drop-shadow-[0_0_15px_rgba(0,255,239,0.3)]">
              FREE FOR ALL.
            </span>
          </h1>
          <p className="text-[#c4cfde]/70 text-sm md:text-base font-medium max-w-lg mx-auto leading-relaxed text-balance">
            Donasi kamu adalah energi utama agar{" "}
            <span className="text-white font-bold">NihongoPath</span> tetap
            hidup, gratis, dan tanpa iklan bagi pejuang JLPT di seluruh dunia.
          </p>
        </div>

        {/* Donation Buttons - Thumb-friendly di HP */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-8 mb-16 md:mb-20">
          <a
            href="https://trakteer.id/Zan118/tip"
            target="_blank"
            className="p-8 md:p-10 rounded-[2rem] bg-gradient-to-br from-[#1e2024] to-[#1a1c20] border-2 border-white/5 hover:border-red-500/50 active:scale-[0.98] transition-all group overflow-hidden relative shadow-lg"
          >
            <div className="absolute top-0 right-0 p-4 opacity-5 text-6xl font-black italic group-hover:text-red-500 transition-colors">
              TIP
            </div>
            <div className="text-4xl mb-4 group-hover:scale-110 group-hover:rotate-12 transition-transform duration-300">
              ☕
            </div>
            <h3 className="text-white font-black text-2xl md:text-3xl mb-1 uppercase italic">
              Trakteer
            </h3>
            <p className="text-[10px] font-bold text-[#c4cfde]/50 uppercase tracking-widest leading-loose">
              Support via E-Wallet
            </p>
          </a>

          <a
            href="https://saweria.co/Zan118"
            target="_blank"
            className="p-8 md:p-10 rounded-[2rem] bg-gradient-to-br from-[#1e2024] to-[#1a1c20] border-2 border-white/5 hover:border-yellow-500/50 active:scale-[0.98] transition-all group overflow-hidden relative shadow-lg"
          >
            <div className="absolute top-0 right-0 p-4 opacity-5 text-6xl font-black italic group-hover:text-yellow-500 transition-colors">
              QRIS
            </div>
            <div className="text-4xl mb-4 group-hover:scale-110 group-hover:-rotate-12 transition-transform duration-300">
              💸
            </div>
            <h3 className="text-white font-black text-2xl md:text-3xl mb-1 uppercase italic">
              Saweria
            </h3>
            <p className="text-[10px] font-bold text-[#c4cfde]/50 uppercase tracking-widest leading-loose">
              Support via QRIS / Gopay
            </p>
          </a>
        </div>

        {/* Transparency Section */}
        <div className="bg-[#1e2024] p-8 md:p-12 rounded-[2.5rem] md:rounded-[3.5rem] border border-white/5 shadow-xl relative overflow-hidden">
          <h4 className="text-[#0ef] text-[10px] md:text-xs font-black uppercase tracking-[0.3em] md:tracking-[0.5em] mb-8 md:mb-12 flex items-center gap-4">
            <span className="h-[2px] w-6 md:w-8 bg-[#0ef]"></span>
            Allocation of Funds
          </h4>

          <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 gap-8 relative z-10">
            {[
              {
                title: "Infrastructure",
                desc: "Domain & Server maintenance",
                icon: "⚡",
              },
              {
                title: "New Content",
                desc: "N5 - N1 Curriculum expansion",
                icon: "📚",
              },
              {
                title: "Platform Features",
                desc: "Interactive Listening & Gamification",
                icon: "🎮",
              },
            ].map((item, i) => (
              <li
                key={i}
                className="flex gap-4 md:gap-6 items-center group/item"
              >
                <span className="text-[#0ef] font-black italic text-xl md:text-2xl group-hover:scale-125 transition-transform duration-300">
                  0{i + 1}
                </span>
                <div className="h-10 w-[2px] bg-white/10 group-hover:bg-[#0ef]/50 transition-colors"></div>
                <div>
                  <h5 className="text-white font-black text-sm md:text-base uppercase tracking-widest">
                    {item.title}
                  </h5>
                  <p className="text-[10px] md:text-xs text-[#c4cfde]/50 font-bold uppercase tracking-widest mt-1">
                    {item.desc}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </main>
    </div>
  );
}
