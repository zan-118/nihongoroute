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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[#1e2024] p-8 rounded-[2.5rem] border border-white/5 shadow-xl"
    >
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-[#0ef] font-black uppercase tracking-widest text-sm italic">
          Memory Distribution
        </h3>
        <span className="text-[10px] text-white/40 font-bold uppercase">
          {srsEntries.length} Words Known
        </span>
      </div>

      <div className="space-y-6 mb-8">
        <StatBar
          label="Ahli (Master)"
          count={stats.master}
          total={total}
          color="bg-green-400"
          icon="🏆"
        />
        <StatBar
          label="Menengah"
          count={stats.intermediate}
          total={total}
          color="bg-blue-400"
          icon="📈"
        />
        <StatBar
          label="Belajar"
          count={stats.learning}
          total={total}
          color="bg-yellow-400"
          icon="🌱"
        />
        <StatBar
          label="Baru"
          count={stats.new}
          total={total}
          color="bg-white/20"
          icon="🆕"
        />
      </div>

      {/* QUICK DRILL ACTIONS */}
      <div className="pt-6 border-t border-white/5 grid grid-cols-2 gap-3">
        <Link
          href="/jlpt/n5/flashcards"
          className="py-4 px-4 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/5 text-[9px] font-black text-center uppercase tracking-[0.2em] text-[#c4cfde] transition-all active:scale-95"
        >
          Quick Vocab
        </Link>
        <Link
          href="/jlpt/n5/kanji"
          className="py-4 px-4 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/5 text-[9px] font-black text-center uppercase tracking-[0.2em] text-[#c4cfde] transition-all active:scale-95"
        >
          Quick Kanji
        </Link>
      </div>
    </motion.div>
  );
}

function StatBar({ label, count, total, color, icon }: any) {
  const percent = (count / total) * 100;
  return (
    <div>
      <div className="flex justify-between text-[10px] font-black uppercase tracking-wider mb-2">
        <span className="text-white/60 flex items-center gap-2">
          <span>{icon}</span> {label}
        </span>
        <span className="text-white">{count}</span>
      </div>
      <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percent}%` }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className={`${color} h-full shadow-[0_0_10px_rgba(255,255,255,0.1)]`}
        />
      </div>
    </div>
  );
}
