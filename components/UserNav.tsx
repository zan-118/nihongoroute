"use client";

import { useNavbar } from "./layout/navbar/useNavbar";
import { 
  User, 
  Settings, 
  LogOut, 
  ShieldCheck,
  ChevronDown
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";

export default function UserNav() {
  const { isAuthenticated, userFullName, handleLogout, progress } = useNavbar();

  if (!isAuthenticated) {
    return (
      <div className="flex items-center gap-2">
        <Button 
          asChild 
          variant="ghost" 
          className="hidden sm:flex h-9 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-muted"
        >
          <Link href="/login">Masuk</Link>
        </Button>
        <Button 
          asChild 
          className="h-9 rounded-xl bg-primary text-primary-foreground text-[10px] font-black uppercase tracking-widest shadow-lg shadow-primary/20"
        >
          <Link href="/login">Mulai Gratis</Link>
        </Button>
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-3 p-1 pr-3 rounded-2xl bg-muted/30 border border-border/50 hover:border-primary/30 transition-all group outline-none">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center text-white text-xs font-black shadow-md group-hover:scale-105 transition-transform">
            {userFullName ? userFullName.charAt(0).toUpperCase() : "U"}
          </div>
          <div className="hidden md:flex flex-col items-start">
             <span className="text-[10px] font-black text-foreground uppercase tracking-wider truncate max-w-[80px]">
               {userFullName || "Pelajar"}
             </span>
             <div className="flex items-center gap-1">
               <ShieldCheck size={8} className="text-primary" />
               <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest">Level {progress.level}</span>
             </div>
          </div>
          <ChevronDown size={14} className="text-muted-foreground group-hover:text-primary transition-colors ml-1" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56 mt-2 p-2 bg-card/95 backdrop-blur-xl border border-border rounded-2xl shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <DropdownMenuLabel className="px-3 py-3">
          <div className="flex flex-col space-y-1">
            <p className="text-xs font-black uppercase tracking-wider text-foreground">{userFullName}</p>
            <p className="text-[10px] font-medium text-muted-foreground truncate italic">Akun NihongoRoute Aktif</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-border/50 mx-2" />
        <div className="p-1 space-y-1">
          <DropdownMenuItem asChild className="rounded-xl cursor-pointer hover:bg-primary/10 hover:text-primary transition-colors py-2.5">
            <Link href="/settings" className="flex items-center">
              <Settings size={16} className="mr-3" />
              <span className="text-[11px] font-bold uppercase tracking-widest">Pengaturan Akun</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild className="rounded-xl cursor-pointer hover:bg-primary/10 hover:text-primary transition-colors py-2.5">
            <Link href="/library" className="flex items-center">
              <User size={16} className="mr-3" />
              <span className="text-[11px] font-bold uppercase tracking-widest">Profil Belajar</span>
            </Link>
          </DropdownMenuItem>
        </div>
        <DropdownMenuSeparator className="bg-border/50 mx-2" />
        <div className="p-1">
          <DropdownMenuItem 
            onClick={handleLogout}
            className="rounded-xl cursor-pointer bg-red-500/5 hover:bg-red-500 hover:text-white dark:hover:text-black transition-all py-2.5 text-red-500"
          >
            <LogOut size={16} className="mr-3" />
            <span className="text-[11px] font-black uppercase tracking-widest">Keluar Akun</span>
          </DropdownMenuItem>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
