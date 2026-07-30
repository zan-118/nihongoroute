"use client";

import { useState } from "react";
import LeaderboardClient from "./LeaderboardClient";
import CommunityFeed from "./CommunityFeed";
import { MessageSquare, Trophy } from "@/components/ui/icons";
import { m, AnimatePresence } from "framer-motion";

/**
 * Social page client component.
 * Switch between community feed and leaderboard.
 */
export function SocialView() {
  // Track active tab view
  const [activeTab, setActiveTab] = useState<"discussion" | "leaderboard">("discussion");

  return (
    <div className="max-w-4xl mx-auto pb-24">
      {/* 🏆 TAB SWITCHER */}
      <div className="flex justify-center mb-10 relative z-20">
        <div className="bg-background/50 p-1.5 rounded-lg flex gap-2 border border-border/80 shadow-sm">
          <button
            type="button"
            onClick={() => setActiveTab("discussion")}
            className={`px-6 py-3 text-xs font-black uppercase tracking-wider rounded-lg transition-all flex items-center gap-2 ${
              activeTab === "discussion"
                ? "bg-primary text-primary-foreground shadow-md"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <MessageSquare size={14} />
            Diskusi Komunitas
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("leaderboard")}
            className={`px-6 py-3 text-xs font-black uppercase tracking-wider rounded-lg transition-all flex items-center gap-2 ${
              activeTab === "leaderboard"
                ? "bg-primary text-primary-foreground shadow-md"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Trophy size={14} />
            Papan Peringkat
          </button>
        </div>
      </div>

      {/* CONTENT AREA WITH ANIMATION */}
      {/* Animate tab switch transition */}
      <AnimatePresence mode="wait">
        <m.div
          key={activeTab}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -15 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === "discussion" ? (
            <CommunityFeed />
          ) : (
            <LeaderboardClient />
          )}
        </m.div>
      </AnimatePresence>
    </div>
  );
}

export default SocialView;