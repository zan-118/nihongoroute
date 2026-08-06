"use client";

/**
 * @file LandingHeader.tsx
 * @description Header navigation component for landing and public pages featuring responsive branding, active link states, mobile drawer, theme toggle, and CTA.
 */

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight, Menu, X } from "@/components/ui/icons";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { ROUTES } from "@/lib/core/routes";

const navLinks = [
  { href: "/courses", label: "Materi Belajar" },
  { href: ROUTES.REVIEW, label: "Flashcard SRS" },
  { href: "/exams", label: "Simulasi JLPT" },
  { href: "/about", label: "Tentang Kami" },
  { href: "/contact", label: "Kontak" },
];

/**
 * LandingHeader component.
 * Sticky, responsive top navigation header for landing and public info pages.
 * Supports active route indicator and mobile drawer menu.
 */
export function LandingHeader() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/85 backdrop-blur-md transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 h-16 md:h-20 flex items-center justify-between gap-4">
        {/* Brand Logo & Name */}
        <Link
          href="/"
          className="flex items-center gap-3 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-xl"
        >
          <div className="relative size-9 md:size-10 transition-transform duration-300 group-hover:scale-105">
            <Image
              src="/logo-branding.svg"
              alt="NihongoRoute Logo"
              fill
              priority
              sizes="40px"
              className="object-contain"
            />
          </div>
          <div className="flex flex-col">
            <span className="text-foreground text-lg md:text-xl font-black tracking-tight leading-tight">
              Nihongo<span className="text-primary">Route</span>
            </span>
            <span className="text-[8px] text-muted-foreground font-extrabold uppercase tracking-widest hidden sm:inline-block">
              Offline-First Japanese
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 lg:gap-1.5 text-xs font-semibold">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3.5 py-2 rounded-full transition-all ${
                  isActive
                    ? "bg-primary/10 text-primary font-bold shadow-xs"
                    : "text-muted-foreground hover:text-primary hover:bg-muted/60"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Right Actions (Desktop) */}
        <div className="hidden md:flex items-center gap-2.5 sm:gap-3">
          <ThemeToggle />

          <Button
            asChild
            size="sm"
            className="bg-primary text-primary-foreground hover:bg-primary/90 h-9 md:h-10 px-4 text-xs font-bold rounded-full transition-all duration-300 active:scale-95"
          >
            <Link href="/dashboard" className="flex items-center gap-2">
              <span>Mulai Belajar</span>
              <ArrowRight size={13} />
            </Link>
          </Button>
        </div>

        {/* Mobile Action & Hamburger Toggle */}
        <div className="flex md:hidden items-center gap-2">
          <ThemeToggle />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Buka Menu Navigasi"
            className="size-9 rounded-xl border border-border text-foreground hover:bg-muted"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </Button>
        </div>
      </div>

      {/* Mobile Navigation Drawer / Dropdown Overlay */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-border/80 bg-background/95 backdrop-blur-lg px-5 py-6 space-y-4 animate-in slide-in-from-top-3 duration-300">
          <nav className="flex flex-col gap-1.5 text-sm font-semibold">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-4 py-3 rounded-xl transition-colors ${
                    isActive
                      ? "bg-primary/15 text-primary font-bold"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <div className="pt-2 border-t border-border/60">
            <Button
              asChild
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-11 px-5 text-sm font-bold rounded-xl transition-all"
            >
              <Link
                href="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center gap-2"
              >
                <span>Mulai Belajar Sekarang</span>
                <ArrowRight size={15} />
              </Link>
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}
