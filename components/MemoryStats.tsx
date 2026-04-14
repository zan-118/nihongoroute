"use client";
import { useProgress } from "@/context/UserProgressContext";
import { motion } from "framer-motion";
import Link from "next/link";

export default function MemoryStats() {
  const { progress } = useProgress();
  const srsEntries = Object.values(progress.srs);

  const stats = {
    master: srsEntries.filter((s: any) => s.interval >= 30).length,
    intermediate: srsEntries.filter(
      (s: any) => s.repetition > 1 && s.interval >= 7 && s.interval < 30,
    ).length,
    learning: srsEntries.filter((s: any) => s.repetition > 1 && s.interval < 7)
      .length,
    new: srsEntries.filter((s: any) => s.repetition <= 1).length,
  };

  const total = srsEntries.length || 1;

  const statConfig = [
    {
      label: "Sangat Mahir",
      count: stats.master,
      color: "bg-green-400",
      glow: "shadow-[0_0_12px_rgba(34,197,94,0.8)]",
      icon: "🏆",
      delay: 0.1,
    },
    {
      label: "Cukup Ingat",
      count: stats.intermediate,
      color: "bg-blue-400",
      glow: "shadow-[0_0_12px_rgba(59,130,246,0.8)]",
      icon: "📈",
      delay: 0.2,
    },
    {
      label: "Sedang Belajar",
      count: stats.learning,
      color: "bg-yellow-400",
      glow: "shadow-[0_0_12px_rgba(250,204,21,0.8)]",
      icon: "🔥",
      delay: 0.3,
    },
    {
      label: "Kata Baru",
      count: stats.new,
      color: "bg-white/50",
      glow: "shadow-[0_0_12px_rgba(255,255,255,0.3)]",
      icon: "🌱",
      delay: 0.4,
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[#1e2024] p-6 md:p-8 rounded-[2.5rem] border border-white/5 shadow-[15px_15px_40px_rgba(0,0,0,0.6),-10px_-10px_30px_rgba(255,255,255,0.02)] relative overflow-hidden h-full flex flex-col"
    >
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:15px_15px] opacity-30 pointer-events-none" />

      <div className="flex items-center justify-between mb-8 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center shadow-[0_0_10px_rgba(59,130,246,0.2)]">
            <span className="text-blue-400 text-sm">🧠</span>
          </div>
          <h3 className="text-white font-black uppercase tracking-widest text-sm md:text-base drop-shadow-md">
            Status Ingatan
          </h3>
        </div>
        <div className="flex flex-col items-end">
          <span className="bg-[#15171a] border border-white/10 text-cyan-400 px-3 py-1.5 rounded-full text-[9px] font-black tracking-[0.2em] uppercase shadow-inner">
            {srsEntries.length} Dikuasai
          </span>
        </div>
      </div>

      <div className="space-y-6 mb-8 relative z-10 flex-1">
        {statConfig.map((stat, i) => (
          <StatBar
            key={i}
            label={stat.label}
            count={stat.count}
            total={total}
            color={stat.color}
            glow={stat.glow}
            icon={stat.icon}
            delay={stat.delay}
          />
        ))}
      </div>

      <div className="pt-6 border-t border-white/5 grid grid-cols-2 gap-4 relative z-10 mt-auto">
        <Link
          href="/jlpt/n5/flashcards"
          className="group relative p-4 bg-[#1e2024] rounded-2xl border border-white/5 text-[9px] md:text-[10px] font-black text-center uppercase tracking-[0.2em] text-[#c4cfde] transition-all shadow-[6px_6px_15px_rgba(0,0,0,0.5),-4px_-4px_10px_rgba(255,255,255,0.03)] active:shadow-[inset_4px_4px_10px_rgba(0,0,0,0.5),inset_-2px_-2px_5px_rgba(255,255,255,0.02)] active:translate-y-1 hover:text-cyan-400 hover:border-cyan-400/30"
        >
          <div className="absolute inset-0 rounded-2xl bg-cyan-400/5 opacity-0 group-hover:opacity-100 transition-opacity" />
          📚 Pemanasan Kosakata
        </Link>
        <Link
          href="/courses/jlpt-n5/kanji"
          className="group relative p-4 bg-[#1e2024] rounded-2xl border border-white/5 text-[9px] md:text-[10px] font-black text-center uppercase tracking-[0.2em] text-[#c4cfde] transition-all shadow-[6px_6px_15px_rgba(0,0,0,0.5),-4px_-4px_10px_rgba(255,255,255,0.03)] active:shadow-[inset_4px_4px_10px_rgba(0,0,0,0.5),inset_-2px_-2px_5px_rgba(255,255,255,0.02)] active:translate-y-1 hover:text-purple-400 hover:border-purple-500/30"
        >
          <div className="absolute inset-0 rounded-2xl bg-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
          🖋️ Pemanasan Kanji
        </Link>
      </div>
    </motion.div>
  );
}

function StatBar({ label, count, total, color, glow, icon, delay }: any) {
  const percent = total > 1 || count > 0 ? (count / total) * 100 : 0;

  return (
    <div className="group cursor-default">
      <div className="flex justify-between text-[10px] font-black uppercase tracking-wider mb-2">
        <span className="text-white/60 flex items-center gap-2 transition-colors group-hover:text-white">
          <span className="text-sm opacity-80">{icon}</span> {label}
        </span>
        <div className="flex items-center gap-2">
          <span className="text-white/40 font-mono">{percent.toFixed(0)}%</span>
          <span className="text-white bg-white/10 px-2 py-0.5 rounded shadow-inner font-mono">
            {String(count).padStart(3, "0")}
          </span>
        </div>
      </div>

      <div className="w-full bg-[#15171a] h-2.5 rounded-full overflow-hidden shadow-[inset_0_1px_3px_rgba(0,0,0,0.8)] relative">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percent}%` }}
          transition={{ duration: 1.5, delay, ease: "circOut" }}
          className={`${color} ${glow} h-full relative`}
        >
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-white/40 rounded-t-full opacity-50" />
        </motion.div>
      </div>
    </div>
  );
}
