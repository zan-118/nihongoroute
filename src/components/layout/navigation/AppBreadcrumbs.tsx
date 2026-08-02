/**
 * @file AppBreadcrumbs.tsx
 * @description Breadcrumb navigation bar component for displaying hierarchical route paths.
 */

"use client";

// ==========================================
// Import & Dependencies
// ==========================================
import Link from "next/link";
import { ChevronRight } from "@/components/ui/icons";
import { BreadcrumbItem } from "@/lib/routes";

// ==========================================
// Component Props Interface
// ==========================================
/**
 * Props for AppBreadcrumbs component.
 */
interface AppBreadcrumbsProps {
 /** Breadcrumb route items list. */
 items: BreadcrumbItem[];
 /** Optional CSS class string. */
 className?: string;
}

// ==========================================
// Main Component
// ==========================================
/**
 * Render responsive breadcrumb navigation trail.
 */
export default function AppBreadcrumbs({ items, className = "" }: AppBreadcrumbsProps) {
 if (!items || items.length === 0) return null;

 return (
 <nav aria-label="Breadcrumb" className={`flex items-center min-w-0 ${className}`}>
 <ol className="flex items-center gap-1.5 text-xs text-muted-foreground overflow-x-auto no-scrollbar py-1">
 {items.map((item, index) => {
 const isLast = index === items.length - 1;

 return (
 <li key={item.href || index} className="flex items-center gap-1.5 shrink-0">
 {index > 0 && <ChevronRight size={12} className="text-muted-foreground/40 shrink-0" />}
 {isLast || !item.href ? (
 <span className="font-semibold text-foreground truncate max-w-50 sm:max-w-75">
 {item.label}
 </span>
 ) : (
 <Link
 href={item.href}
 className="hover:text-foreground transition-colors truncate max-w-37.5"
 >
 {item.label}
 </Link>
 )}
 </li>
 );
 })}
 </ol>
 </nav>
 );
}
