"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useMobileNav } from "./layout/navbar/useMobileNav";

export default function MobileNav() {
  const { pathname, navItems } = useMobileNav();

  return (
    <div className="md:hidden fixed bottom-5 left-1/2 -translate-x-1/2 w-[92%] max-w-md z-50">
      <nav className="bg-card/30 dark:bg-slate-950/30 backdrop-blur-3xl border border-border/40 rounded-[2rem] p-1.5 shadow-2xl transition-all duration-500 overflow-hidden relative">
        {/* Ambient Glow */}
        <div className="absolute inset-0 bg-gradient-to-t from-primary/5 to-transparent pointer-events-none" />
        
        <ul className="flex justify-between items-center relative z-10 gap-1 px-1">
          {navItems.map((item) => {
            const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);

            return (
              <li key={item.href + item.label} className="flex-1 relative">
                <Link
                  href={item.href}
                  className="flex flex-col items-center justify-center py-2 relative group"
                >
                  {/* Fluid Background Indicator */}
                  {isActive && (
                    <motion.div
                      layoutId="mobile-nav-pill"
                      className="absolute inset-x-1 inset-y-1 bg-primary/10 border border-primary/20 rounded-2xl z-0 shadow-[0_0_20px_rgba(0,238,255,0.05)]"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}

                  <motion.div
                    animate={{
                      y: isActive ? -1 : 0,
                      scale: isActive ? 1.1 : 1,
                    }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    className={`relative z-10 p-2 rounded-2xl transition-all duration-300 ${
                      isActive
                        ? "text-primary"
                        : "text-muted-foreground group-hover:text-foreground"
                    }`}
                  >
                    <item.icon 
                      size={18} 
                      strokeWidth={isActive ? 2.5 : 2} 
                      className={isActive ? "drop-shadow-[0_0_8px_rgba(0,238,255,0.6)]" : ""} 
                    />
                  </motion.div>
                  
                  <span
                    className={`text-[7px] font-black uppercase tracking-[0.15em] mt-1 transition-all duration-300 relative z-10 ${
                      isActive 
                        ? "text-primary opacity-100" 
                        : "text-muted-foreground opacity-60"
                    }`}
                  >
                    {item.label}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
