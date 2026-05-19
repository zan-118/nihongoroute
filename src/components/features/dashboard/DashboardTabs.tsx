"use client";

import React from "react";
import { motion } from "framer-motion";

interface Tab {
  id: string;
  label: string;
  icon: string;
}

interface DashboardTabsProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (id: string) => void;
}

/**
 * Komponen navigasi tab untuk Dashboard.
 */
export function DashboardTabs({ tabs, activeTab, onTabChange }: DashboardTabsProps) {
  return (
    <div className="flex items-center gap-4 md:gap-5 mb-16">
      <div 
        role="tablist" 
        aria-label="Dashboard Navigation" 
        className="bg-muted/50 dark:bg-background/[0.03] p-1.5 rounded-[2rem] border border-border/50 flex gap-1 shadow-sm max-w-full overflow-x-auto no-scrollbar"
      >
        {tabs.map((tab) => (
          <motion.button
            key={tab.id}
            role="tab"
            aria-selected={activeTab === tab.id}
            aria-controls={`${tab.id}-panel`}
            whileTap={{ scale: 0.95 }}
            onClick={() => onTabChange(tab.id)}
            className={`px-6 py-3 rounded-full text-xs font-black uppercase tracking-widest transition-all duration-300 flex items-center gap-2 ${
              activeTab === tab.id
                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20 scale-105"
                : "text-muted-foreground hover:text-foreground hover:bg-background/5"
            }`}
          >
            <span className="text-base" aria-hidden="true">{tab.icon}</span>
            <span className="hidden sm:inline">{tab.label}</span>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
