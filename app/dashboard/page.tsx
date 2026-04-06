"use client";

import { useEffect, useMemo, useState } from "react";
import { calculateLevel, xpForCurrentLevel, xpForNextLevel } from "@/lib/level";
import { ACHIEVEMENTS } from "@/lib/achievement";
import { loadProgress } from "@/lib/progress";
import { loadDailyMission, DailyMission } from "@/lib/daily";
import Heatmap from "@/components/Heatmap";

interface ProgressState {
  streak: number;
  totalReviews: number;
  todayReviewCount: number;
  dailyGoal: number;
  studyDays: Record<string, number>;
}

export default function DashboardPage() {
  const [xp, setXp] = useState<number>(0);
  const [level, setLevel] = useState<number>(1);
  const [progress, setProgress] = useState<ProgressState | null>(null);
  const [unlocked, setUnlocked] = useState<string[]>([]);
  const [mission, setMission] = useState<DailyMission | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const init = () => {
      const savedXP = localStorage.getItem("nihongo-xp");
      const savedUnlocks = localStorage.getItem("nihongo-achievements");

      const xpValue = savedXP ? Number(savedXP) : 0;

      setXp(xpValue);
      setLevel(calculateLevel(xpValue));

      if (savedUnlocks) {
        try {
          setUnlocked(JSON.parse(savedUnlocks));
        } catch {
          setUnlocked([]);
        }
      }

      const p = loadProgress();
      setProgress(p);

      const daily = loadDailyMission();
      setMission(daily);

      setLoading(false);
    };

    init();
  }, []);

  const progressPercent = useMemo(() => {
    if (!progress) return 0;

    const currentLevelXP = xpForCurrentLevel(level);
    const nextLevelXP = xpForNextLevel(level);
    const range = nextLevelXP - currentLevelXP;

    if (range <= 0) return 0;

    const percent = ((xp - currentLevelXP) / range) * 100;

    return Math.min(Math.max(percent, 0), 100);
  }, [xp, level, progress]);

  if (loading || !progress || !mission) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#1f242d] text-white">
        Loading dashboard...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1f242d] py-20 px-8 text-white">
      <div className="max-w-5xl mx-auto">
        {/* HEADER */}
        <h1 className="text-5xl font-black mb-12 text-[#0ef]">Dashboard</h1>

        {/* LEVEL CARD */}
        <div className="bg-[#1e2024] p-8 rounded-3xl border border-[#0ef]/20 mb-10">
          <h2 className="text-2xl font-bold mb-4">Level {level}</h2>

          <div className="w-full bg-white/10 h-3 rounded">
            <div
              className="bg-yellow-400 h-3 rounded transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <p className="mt-4 text-[#c4cfde]">XP: {xp}</p>
        </div>

        {/* DAILY MISSION */}
        <div className="bg-[#1e2024] p-6 rounded-2xl border border-[#0ef]/20 mb-10">
          <h3 className="text-[#0ef] font-bold mb-4">🎯 Daily Mission</h3>

          <p>
            Review: {mission.reviewProgress}/{mission.reviewGoal}
          </p>

          <p>
            Lessons: {mission.lessonProgress}/{mission.lessonGoal}
          </p>

          {mission.completed && (
            <p className="text-green-400 font-bold mt-4">
              ✅ Mission Completed! +{mission.rewardXP} XP
            </p>
          )}
        </div>

        {/* STATS GRID */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="bg-[#1e2024] p-6 rounded-2xl border border-white/10">
            <h3 className="text-[#0ef] font-bold">🔥 Streak</h3>
            <p className="text-3xl mt-2">{progress.streak}</p>
          </div>

          <div className="bg-[#1e2024] p-6 rounded-2xl border border-white/10">
            <h3 className="text-[#0ef] font-bold">📚 Total Reviews</h3>
            <p className="text-3xl mt-2">{progress.totalReviews}</p>
          </div>

          <div className="bg-[#1e2024] p-6 rounded-2xl border border-white/10">
            <h3 className="text-[#0ef] font-bold">🎯 Daily Progress</h3>
            <p className="mt-2">
              {progress.todayReviewCount} / {progress.dailyGoal}
            </p>
          </div>
        </div>

        {/* HEATMAP */}
        <div className="mb-16">
          <Heatmap studyDays={progress.studyDays || {}} />
        </div>

        {/* ACHIEVEMENTS */}
        <div>
          <h2 className="text-2xl font-bold mb-6 text-[#0ef]">Achievements</h2>

          <div className="grid md:grid-cols-3 gap-6">
            {ACHIEVEMENTS.map((achievement) => {
              const isUnlocked = unlocked.includes(achievement.id);

              return (
                <div
                  key={achievement.id}
                  className={`p-6 rounded-2xl border transition ${
                    isUnlocked
                      ? "bg-[#0ef]/10 border-[#0ef]"
                      : "bg-[#1e2024] border-white/10 opacity-40"
                  }`}
                >
                  <h3 className="font-bold">{achievement.title}</h3>
                  <p className="text-sm mt-2">{achievement.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
