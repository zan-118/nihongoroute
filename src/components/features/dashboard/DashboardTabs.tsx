"use client";

/**
 * @file DashboardTabs.tsx
 * @description Komponen navigasi tab (tabs bar) untuk antarmuka dashboard NihongoRoute.
 * Menyediakan tombol navigasi beranimasi menggunakan Framer Motion untuk berpindah antar panel konten (Home, Progress, Settings).
 *
 * @package components/features/dashboard
 * @project NihongoRoute
 */

// ==========================================
// IMPOR
// ==========================================
import React from "react";
import { m } from "framer-motion";

// ==========================================
// ANTARMUKA & PROPS (INTERFACES)
// ==========================================
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

// ==========================================
// KOMPONEN UTAMA
// ==========================================
/**
 * Komponen DashboardTabs
 * Navigasi tab bar interaktif untuk dashboard.
 */
export function DashboardTabs({ tabs, activeTab, onTabChange }: DashboardTabsProps) {
  return (
    <div className="flex items-center gap-4 md:gap-5 mb-16">
      <div 
        role="tablist" 
        aria-label="Dashboard Navigation" 
        data-tour="dashboard-tabs"
        className="bg-muted/50 dark:bg-background/[0.03] p-1.5 rounded-[2rem] border border-border/50 flex gap-1 shadow-sm max-w-full overflow-x-auto scrollbar-none"
      >
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <m.button
              key={tab.id}
              role="tab"
              data-tour={`dashboard-tab-${tab.id}`}
              aria-selected={isActive}
              aria-controls={`${tab.id}-panel`}
              whileTap={{ scale: 0.95 }}
              onClick={() => onTabChange(tab.id)}
              className={`relative px-6 py-3 rounded-full text-xs font-black uppercase tracking-widest transition-colors duration-300 flex items-center gap-2 outline-none select-none min-h-[44px] ${
                isActive
                  ? "text-primary-foreground font-black"
                  : "text-muted-foreground hover:text-foreground hover:bg-background/5"
              }`}
            >
              {isActive && (
                <m.div
                  layoutId="active-dashboard-tab"
                  className="absolute inset-0 bg-primary rounded-full shadow-lg shadow-primary/20"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  style={{ originY: "0px" }}
                />
              )}
              <span className="text-base relative z-10" aria-hidden="true">{tab.icon}</span>
              <span className="hidden sm:inline relative z-10">{tab.label}</span>
            </m.button>
          );
        })}
      </div>
    </div>
  );
}

