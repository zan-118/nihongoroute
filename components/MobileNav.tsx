"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useMobileNav } from "./layout/navbar/useMobileNav";

export default function MobileNav() {
  const { pathname, navItems } = useMobileNav();

  return (
    <div className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-sm z-50">
      <nav className="bg-slate-950/80 backdrop-blur-3xl border border-white/10 rounded-[2rem] p-2 shadow-[0_20px_50px_rgba(0,0,0,0.5),0_0_20px_rgba(0,238,255,0.1)]">
        <ul className="flex justify-between items-center relative">
          {navItems.map((item) => {
            const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);

            return (
              <li key={item.href + item.label} className="flex-1 relative z-10">
                <Link
                  href={item.href}
                  className="flex flex-col items-center justify-center py-2 relative group"
                >
                  <motion.div
                    animate={{
                      y: isActive ? -4 : 0,
                      scale: isActive ? 1.1 : 1,
                    }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    className={`relative z-10 p-2 rounded-xl transition-colors ${
                      isActive
                        ? "text-cyber-neon"
                        : "text-slate-500 group-hover:text-white"
                    }`}
                  >
                    <item.icon size={22} strokeWidth={isActive ? 2.5 : 2} className={isActive ? "drop-shadow-[0_0_8px_rgba(0,238,255,0.8)]" : ""} />
                    
                    {isActive && (
                      <motion.div
                        layoutId="mobile-active-pill"
                        className="absolute inset-0 bg-cyber-neon/10 rounded-xl -z-10 border border-cyber-neon/20 shadow-[inset_0_0_10px_rgba(0,238,255,0.2)]"
                        transition={{ type: "spring", stiffness: 400, damping: 25 }}
                      />
                    )}
                  </motion.div>
                  
                  <motion.span
                    animate={{
                      opacity: isActive ? 1 : 0.7,
                      y: isActive ? -2 : 0,
                    }}
                    className={`text-[9px] font-bold tracking-wide mt-1 transition-colors ${
                      isActive ? "text-cyber-neon" : "text-slate-500"
                    }`}
                  >
                    {item.label}
                  </motion.span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
