/* ============================= */
/* TYPES */
/* ============================= */

export type AchievementType = "xp" | "streak" | "review";

export interface Achievement {
  id: string;
  title: string;
  description: string;
  type: AchievementType;
  requirement: number;
}

/* ============================= */
/* ACHIEVEMENT CONFIG */
/* ============================= */

export const ACHIEVEMENTS: Achievement[] = [
  // Streak
  {
    id: "streak3",
    title: "🔥 3 Day Streak",
    description: "Belajar 3 hari berturut-turut",
    type: "streak",
    requirement: 3,
  },
  {
    id: "streak7",
    title: "🔥 7 Day Streak",
    description: "Belajar 7 hari berturut-turut",
    type: "streak",
    requirement: 7,
  },

  // XP
  {
    id: "xp100",
    title: "🌟 100 XP",
    description: "Mencapai 100 XP",
    type: "xp",
    requirement: 100,
  },
  {
    id: "xp500",
    title: "🌟 500 XP",
    description: "Mencapai 500 XP",
    type: "xp",
    requirement: 500,
  },
  {
    id: "xp1000",
    title: "🌟 1000 XP",
    description: "Mencapai 1000 XP",
    type: "xp",
    requirement: 1000,
  },

  // Reviews
  {
    id: "review50",
    title: "🧠 50 Reviews",
    description: "Menyelesaikan 50 review",
    type: "review",
    requirement: 50,
  },
];

/* ============================= */
/* CHECK ACHIEVEMENTS */
/* ============================= */

export interface CheckParams {
  xp: number;
  streak: number;
  reviewCount: number;
  unlocked: string[];
}

/**
 * Mengevaluasi progres user saat ini dan mengembalikan array achievement yang baru saja terbuka
 */
export function checkAchievements({
  xp,
  streak,
  reviewCount,
  unlocked,
}: CheckParams): Achievement[] {
  const newlyUnlocked: Achievement[] = [];

  for (const achievement of ACHIEVEMENTS) {
    if (unlocked.includes(achievement.id)) continue;

    let achieved = false;

    switch (achievement.type) {
      case "xp":
        achieved = xp >= achievement.requirement;
        break;
      case "streak":
        achieved = streak >= achievement.requirement;
        break;
      case "review":
        achieved = reviewCount >= achievement.requirement;
        break;
    }

    if (achieved) {
      newlyUnlocked.push(achievement);
    }
  }

  return newlyUnlocked;
}
