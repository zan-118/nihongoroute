import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

export function QuestCompleted() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex-1 flex flex-col items-center justify-center text-center p-8 relative"
    >
      <div className="absolute inset-0 bg-emerald-500/5 blur-3xl rounded-full animate-bloom pointer-events-none" />
      <div className="w-24 h-24 bg-emerald-500/10 rounded-[2rem] flex items-center justify-center mb-6 neo-inset border-emerald-500/20 relative z-10">
        <Sparkles size={48} className="text-emerald-400 drop-shadow-[0_0_15px_rgba(52,211,153,0.5)]" />
      </div>
      <h4 className="text-xl font-black text-white uppercase italic tracking-tighter mb-2 relative z-10">
        Target Tercapai!
      </h4>
      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest max-w-[200px] leading-relaxed relative z-10">
        Kamu luar biasa! Semua misi hari ini sudah beres. Istirahat yang cukup ya, esok misi baru menanti.
      </p>
    </motion.div>
  );
}
