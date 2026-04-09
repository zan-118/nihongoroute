"use client";

import { useEffect, useMemo, useState, useRef } from "react";
import { xpForCurrentLevel, xpForNextLevel } from "@/lib/level";
import { ACHIEVEMENTS } from "@/lib/achievement";
import { loadProgress } from "@/lib/progress";
import { loadDailyMission, DailyMission } from "@/lib/daily";
import Heatmap from "@/components/Heatmap";
import { useProgress } from "@/context/UserProgressContext";

interface LocalProgressState {
  streak: number;
  totalReviews: number;
  todayReviewCount: number;
  dailyGoal: number;
  studyDays: Record<string, number>;
}

export default function DashboardPage() {
  const {
    progress: globalProgress,
    loading: globalLoading,
    exportData,
    importData,
  } = useProgress();

  const [localProgress, setLocalProgress] = useState<LocalProgressState | null>(
    null,
  );
  const [unlocked, setUnlocked] = useState<string[]>([]);
  const [mission, setMission] = useState<DailyMission | null>(null);
  const [localLoading, setLocalLoading] = useState<boolean>(true);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const initLocalData = () => {
      const savedUnlocks = localStorage.getItem("nihongo-achievements");
      if (savedUnlocks) {
        try {
          setUnlocked(JSON.parse(savedUnlocks));
        } catch {
          setUnlocked([]);
        }
      }
      setLocalProgress(loadProgress());
      setMission(loadDailyMission());
      setLocalLoading(false);
    };
    initLocalData();
  }, []);

  const progressPercent = useMemo(() => {
    const currentLevelXP = xpForCurrentLevel(globalProgress.level);
    const nextLevelXP = xpForNextLevel(globalProgress.level);
    const range = nextLevelXP - currentLevelXP;
    if (range <= 0) return 0;
    return Math.min(
      Math.max(((globalProgress.xp - currentLevelXP) / range) * 100, 0),
      100,
    );
  }, [globalProgress.xp, globalProgress.level]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const success = importData(content);
      if (success) {
        alert("✅ Progress berhasil dipulihkan!");
        window.location.reload();
      } else {
        alert("❌ File tidak valid atau rusak.");
      }
    };
    reader.readAsText(file);
  };

  if (globalLoading || localLoading || !localProgress || !mission) {
    return (
      <div className="min-h-screen bg-[#1f242d] py-20 px-8 text-white flex justify-center items-center">
        <div className="animate-pulse text-[#0ef] font-mono tracking-widest text-sm">
          MEMUAT DATA...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1f242d] py-20 px-4 md:px-8 text-white">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-black mb-12 text-[#0ef] uppercase tracking-tight">
          Dashboard
        </h1>

        {/* LEVEL CARD */}
        <div className="bg-[#1e2024] p-8 md:p-10 rounded-3xl border border-[#0ef]/20 mb-10 shadow-[0_0_40px_rgba(0,255,239,0.05)] relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-5 text-8xl font-black italic select-none">
            {globalProgress.level}
          </div>
          <h2 className="text-2xl md:text-3xl font-bold mb-6 text-white relative z-10">
            Level {globalProgress.level}
          </h2>

          <div className="w-full bg-white/10 h-4 rounded-full overflow-hidden border border-white/5 relative z-10">
            <div
              className="bg-[#0ef] h-full rounded-full transition-all duration-1000 shadow-[0_0_15px_#0ef]"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <p className="mt-4 text-[#c4cfde] font-mono font-bold tracking-widest text-sm relative z-10">
            TOTAL XP: {globalProgress.xp}
          </p>
        </div>

        {/* DAILY MISSION */}
        <div className="bg-gradient-to-br from-[#1e2024] to-[#23272b] p-8 rounded-[2rem] border border-white/5 mb-10 shadow-lg">
          <h3 className="text-[#0ef] font-black mb-6 uppercase tracking-widest text-sm flex items-center gap-3">
            <span className="text-xl">🎯</span> Daily Mission
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center text-sm font-bold">
              <span>Card Reviews</span>
              <span className="text-[#0ef]">
                {mission.reviewProgress} / {mission.reviewGoal}
              </span>
            </div>
            <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
              <div
                className="bg-green-400 h-full transition-all duration-500"
                style={{
                  width: `${Math.min((mission.reviewProgress / mission.reviewGoal) * 100, 100)}%`,
                }}
              />
            </div>

            <div className="flex justify-between items-center text-sm font-bold mt-6">
              <span>Lessons Completed</span>
              <span className="text-[#0ef]">
                {mission.lessonProgress} / {mission.lessonGoal}
              </span>
            </div>
            <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
              <div
                className="bg-green-400 h-full transition-all duration-500"
                style={{
                  width: `${Math.min((mission.lessonProgress / mission.lessonGoal) * 100, 100)}%`,
                }}
              />
            </div>
          </div>

          {mission.completed && (
            <div className="mt-8 p-4 bg-green-500/10 border border-green-500/30 rounded-xl text-center">
              <p className="text-green-400 font-bold uppercase tracking-widest text-xs">
                ✅ Mission Completed! +{mission.rewardXP} XP
              </p>
            </div>
          )}
        </div>

        {/* STATS GRID */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 mb-12">
          <div className="bg-[#1e2024] p-6 rounded-2xl border border-white/5 flex flex-col justify-center items-center text-center hover:border-[#0ef]/30 transition-colors">
            <h3 className="text-[#c4cfde]/50 font-bold text-xs uppercase tracking-widest">
              Streak
            </h3>
            <p className="text-3xl md:text-4xl mt-3 font-black text-white">
              {localProgress.streak} <span className="text-xl">🔥</span>
            </p>
          </div>
          <div className="bg-[#1e2024] p-6 rounded-2xl border border-white/5 flex flex-col justify-center items-center text-center hover:border-[#0ef]/30 transition-colors">
            <h3 className="text-[#c4cfde]/50 font-bold text-xs uppercase tracking-widest">
              Reviews
            </h3>
            <p className="text-3xl md:text-4xl mt-3 font-black text-white">
              {localProgress.totalReviews} <span className="text-xl">📚</span>
            </p>
          </div>
          <div className="bg-[#1e2024] p-6 rounded-2xl border border-white/5 flex flex-col justify-center items-center text-center hover:border-[#0ef]/30 transition-colors col-span-2 md:col-span-1">
            <h3 className="text-[#c4cfde]/50 font-bold text-xs uppercase tracking-widest">
              Today
            </h3>
            <p className="text-3xl md:text-4xl mt-3 font-black text-[#0ef]">
              {localProgress.todayReviewCount}{" "}
              <span className="text-white/20 text-xl">
                / {localProgress.dailyGoal}
              </span>
            </p>
          </div>
        </div>

        {/* HEATMAP */}
        <div className="mb-16 bg-[#1e2024] p-8 rounded-[2rem] border border-white/5">
          <Heatmap studyDays={localProgress.studyDays || {}} />
        </div>

        {/* ACHIEVEMENTS */}
        <div className="mb-16">
          <h2 className="text-2xl md:text-3xl font-black mb-8 text-white uppercase tracking-tight">
            Achievements
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {ACHIEVEMENTS.map((achievement) => {
              const isUnlocked = unlocked.includes(achievement.id);
              return (
                <div
                  key={achievement.id}
                  className={`p-6 rounded-[2rem] border transition-all duration-300 relative overflow-hidden ${
                    isUnlocked
                      ? "bg-gradient-to-br from-[#0ef]/10 to-[#0ef]/5 border-[#0ef]/50 shadow-[0_0_20px_rgba(0,255,239,0.1)]"
                      : "bg-[#1e2024] border-white/5 opacity-50 grayscale"
                  }`}
                >
                  <h3
                    className={`font-black text-lg ${isUnlocked ? "text-[#0ef]" : "text-white"}`}
                  >
                    {achievement.title}
                  </h3>
                  <p className="text-sm mt-3 text-[#c4cfde]/80 leading-relaxed">
                    {achievement.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* DATA MANAGEMENT (BACKUP & RESTORE) */}
        <div className="pt-10 border-t border-white/5">
          <h2 className="text-2xl md:text-3xl font-black mb-4 text-white uppercase tracking-tight">
            Save Data
          </h2>
          <p className="text-sm text-[#c4cfde]/60 mb-8 max-w-2xl">
            Aplikasi ini berjalan 100% di browsermu. Unduh progres (XP, Level,
            Flashcard) kamu sesekali agar tidak hilang jika membersihkan cache
            atau pindah perangkat.
          </p>

          <div className="grid md:grid-cols-2 gap-6">
            <button
              onClick={exportData}
              className="p-8 rounded-[2rem] bg-gradient-to-br from-blue-500/10 to-[#1e2024] border border-blue-500/30 hover:border-blue-500 shadow-lg transition-all flex flex-col items-center justify-center group"
            >
              <div className="text-4xl mb-4 group-hover:-translate-y-2 transition-transform">
                💾
              </div>
              <h3 className="font-black text-xl text-white mb-2 uppercase">
                Backup Progress
              </h3>
              <p className="text-xs text-[#c4cfde]/60 text-center">
                Download file .json ke devicemu
              </p>
            </button>

            <div>
              <input
                type="file"
                accept=".json"
                ref={fileInputRef}
                onChange={handleFileUpload}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full h-full p-8 rounded-[2rem] bg-gradient-to-br from-green-500/10 to-[#1e2024] border border-green-500/30 hover:border-green-500 shadow-lg transition-all flex flex-col items-center justify-center group"
              >
                <div className="text-4xl mb-4 group-hover:-translate-y-2 transition-transform">
                  📂
                </div>
                <h3 className="font-black text-xl text-white mb-2 uppercase">
                  Restore Progress
                </h3>
                <p className="text-xs text-[#c4cfde]/60 text-center">
                  Upload file .json yang pernah disimpan
                </p>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
