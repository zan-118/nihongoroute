/**
 * @file SidebarItem.tsx
 * @description Navigation link item component for individual desktop sidebar routes.
 */

"use client";

// ==========================================
// Import & Dependencies
// ==========================================
import React from "react";
import { m } from "framer-motion";
import Link from "next/link";
import { ChevronRight, IconType } from "@/components/ui/icons";

// ==========================================
// Component Props Interface
// ==========================================
/**
 * Properties for SidebarItem component.
 */
interface SidebarItemProps {
 /** Navigation item details. */
 item: {
 /** Target URL path. */
 href: string;
 /** Display label text. */
 label: string;
 /** Icon component. */
 icon: React.ElementType;
 };
 /** Current active URL path. */
 pathname: string;
 /** Optional click handler. */
 onClick?: () => void;
}

// ==========================================
// Main Component
// ==========================================
/**
 * Render single navigation link with active state styling and animations.
 */
export function SidebarItem({ item, pathname, onClick }: SidebarItemProps) {
 // Check if current path matches item destination.
 const isActive = pathname.startsWith(item.href);
 // Generate clean ID for tour guide step.
 const tourId = item.href.replace(/^\/+/, "").replace(/[^a-z0-9]+/gi, "-") || "home";

 return (
 <Link data-tour={`nav-${tourId}`} href={item.href} onClick={onClick}>
 <m.div
 whileHover={{ x: 3 }}
 whileTap={{ scale: 0.985 }}
 className={`flex items-center gap-3.5 px-3.5 py-3 rounded-xl transition-all duration-300 relative group overflow-hidden ${
 isActive 
 ? "bg-primary/[0.12] text-primary border border-primary/30 shadow-[0_12px_28px_hsl(var(--primary)/0.12)]"
 : "text-muted-foreground hover:bg-card/55 hover:text-foreground hover:border-primary/20 border border-transparent"
 }`}
 >
 {/* Active Side Glow Indicator */}
 {isActive && (
 // Framer motion layout animation for active state indicator.
 <m.div 
 layoutId="active-side-glow"
 className="absolute left-0 top-2 bottom-2 w-[1px] bg-primary rounded-full"
 />
 )}

 <div className={`size-8 rounded-lg flex items-center justify-center transition-all duration-300 ${
            isActive ? "bg-primary/20 text-primary dark:bg-primary dark:text-primary-foreground" : "bg-transparent text-foreground/80 group-hover:bg-muted/70 group-hover:text-foreground"
          }`}>
            <item.icon size={16} strokeWidth={2.1} />
          </div>
          <span className={`text-[10px] font-black uppercase tracking-[0.16em] flex-1 transition-colors duration-300 ${isActive ? 'text-primary dark:text-primary-foreground' : 'text-foreground/80 group-hover:text-foreground'}`}>
            {item.label}
          </span>
 {isActive && (
 // Framer motion layout animation for active dot.
 <m.div 
 layoutId="sidebar-active-indicator"
 className="size-[3px] rounded-full bg-primary"
 />
 )}
 <ChevronRight size={14} className={`opacity-0 group-hover:opacity-100 transition-all ${isActive ? 'text-primary' : 'text-muted-foreground'} group-hover:translate-x-0.5`} />
 </m.div>
 </Link>
 );
}