export interface Quest {
  id: string;
  title: string;
  type: "review" | "xp" | "streak";
  target: number;
  rewardXP: number;
  icon: React.ReactNode;
}
