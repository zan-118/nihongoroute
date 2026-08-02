"use client";

/**
 * @file DashboardTabs.tsx
 * @description Dashboard tab navigation bar component utilizing Framer Motion for smooth tab switching between panels (Home, Progress, Settings).
 * @module features/dashboard/components
 */

// ==========================================
// Import & Dependencies
// ==========================================
import React from "react";
import { m } from "framer-motion";

// ==========================================
// Component Props Interface
// ==========================================
/**
 * Represents a single tab item configuration.
 */
interface Tab {
 /** Unique identifier for the tab. */
 id: string;
 /** Display label text. */
 label: string;
 /** Icon component type. */
 icon: React.ComponentType<{ className?: string; size?: number }>;
}

/**
 * Props for the DashboardTabs component.
 */
interface DashboardTabsProps {
 /** Array of tab configurations. */
 tabs: Tab[];
 /** Currently active tab identifier. */
 activeTab: string;
 /** Callback triggered when a tab is clicked. */
 onTabChange: (id: string) => void;
}

// ==========================================
// KOMPONEN UTAMA
// ==========================================
/**
 * DashboardTabs component.
 * Renders an interactive tab navigation bar with smooth sliding animations.
 */
export function DashboardTabs({ tabs, activeTab, onTabChange }: DashboardTabsProps) {
 return (
 <div className="flex items-center gap-4 md:gap-5 mb-16">
 <div 
 role="tablist" 
 aria-label="Dashboard Navigation" 
 data-tour="dashboard-tabs"
 className="bg-muted/50 dark:bg-background/3 p-1.5 rounded-full border border-border/50 flex gap-1 shadow-sm max-w-full overflow-x-auto scrollbar-none"
 >
 {tabs.map((tab) => {
 // Determine if the current tab is active
 const isActive = activeTab === tab.id;
 const IconComponent = tab.icon;
 return (
 <m.button
 key={tab.id}
 role="tab"
 data-tour={`dashboard-tab-${tab.id}`}
 aria-selected={isActive}
 aria-controls={`${tab.id}-panel`}
 // Scale down slightly on tap for tactile feedback
 whileTap={{ scale: 0.95 }}
 onClick={() => onTabChange(tab.id)}
 className={`relative px-6 py-3 rounded-full text-xs font-black uppercase tracking-widest transition-colors duration-300 flex items-center gap-2 outline-none select-none min-h-11 ${
 isActive
 ? "text-primary-foreground font-black"
 : "text-muted-foreground hover:text-foreground hover:bg-background/5"
 }`}
 >
 {isActive && (
 // Shared layout animation for sliding background pill
 <m.div
 layoutId="active-dashboard-tab"
 className="absolute inset-0 bg-primary rounded-full shadow-lg shadow-primary/20"
 transition={{ type: "spring", stiffness: 380, damping: 30 }}
 style={{ originY: "0px" }}
 />
 )}
 <IconComponent className="relative z-10" size={16} />
 <span className="hidden sm:inline relative z-10">{tab.label}</span>
 </m.button>
 );
 })}
 </div>
 </div>
 );
}