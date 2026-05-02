import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

export function QuestCompleted() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex-1 flex flex-col items-center justify-center text-center p-8 relative"
    >
      <div className="absolute inset-0 bg-emerald-500/5 blur-3xl rounded-full pointer-events-none" />
      <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center mb-6 border border-emerald-500/20 relative z-10">
        <Sparkles size={32} className="text-emerald-400 drop-shadow-[0_0_15px_rgba(52,211,153,0.3)]" />
      </div>
      <h4 className="text-lg md:text-xl font-black text-white uppercase tracking-tight mb-2 relative z-10">
        Target Tercapai!
      </h4>
      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest max-w-[200px] leading-relaxed relative z-10">
        Keren! Semua target hari ini sudah beres. Sampai jumpa besok!
      </p>
    </motion.div>
  );
}
