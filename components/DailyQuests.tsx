"use client";
import { useProgress } from "@/context/UserProgressContext";
import { motion } from "framer-motion";

export default function DailyQuests() {
  const { progress } = useProgress();

  // Contoh logika misi:
  const quests = [
    {
      id: 1,
      title: "Hafalan Pagi",
      target: 10,
      current: Object.keys(progress.srs).length % 10, // Simulasi
      xp: 50,
    },
    {
      id: 2,
      title: "Leveling Up",
      target: 500,
      current: progress.xp % 500,
      xp: 100,
    },
  ];

  return (
    <div className="bg-[#1e2024] p-8 rounded-[2.5rem] border border-white/5 h-full">
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-[#0ef] font-black uppercase tracking-widest text-sm italic">
          Daily Quests
        </h3>
        <span className="bg-[#0ef]/10 text-[#0ef] px-3 py-1 rounded-full text-[8px] font-black tracking-widest uppercase">
          Bonus XP
        </span>
      </div>

      <div className="space-y-6">
        {quests.map((quest) => {
          const progressPercent = Math.min(
            (quest.current / quest.target) * 100,
            100,
          );
          return (
            <div key={quest.id} className="group">
              <div className="flex justify-between items-end mb-3">
                <div>
                  <p className="text-white text-xs font-black uppercase tracking-tight group-hover:text-[#0ef] transition-colors">
                    {quest.title}
                  </p>
                  <p className="text-[9px] text-white/30 font-bold uppercase mt-0.5">
                    Reward: +{quest.xp} XP
                  </p>
                </div>
                <span className="text-[10px] font-black text-white/60">
                  {quest.current}/{quest.target}
                </span>
              </div>
              <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercent}%` }}
                  className="h-full bg-gradient-to-r from-[#0ef] to-blue-500"
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
