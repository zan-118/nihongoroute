"use client";

import { useNavbar } from "@/components/layout/hooks/useNavbar";
import { 
  User, 
  Settings, 
  LogOut, 
  ShieldCheck,
  ChevronDown
} from "lucide-react";
import { useUserStore } from "@/store/useUserStore";
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
  const { isAuthenticated, userFullName, handleLogout } = useNavbar();
  const level = useUserStore(s => s.level);

  if (!isAuthenticated) {
    return (
      <div className="flex items-center gap-2">
        <Button 
          asChild 
          variant="ghost" 
          className="hidden sm:flex h-9 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-muted"
        >
          <Link href="/login">Masuk</Link>
        </Button>
        <Button 
          asChild 
          className="h-9 px-3 sm:px-4 rounded-xl bg-primary text-primary-foreground text-[10px] sm:text-xs font-black uppercase tracking-widest shadow-lg shadow-primary/20"
        >
          <Link href="/login?mode=signup">
            <span className="sm:hidden">Mulai</span>
            <span className="hidden sm:inline">Mulai Gratis</span>
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button type="button" className="flex items-center gap-1 sm:gap-3 p-1 pr-1 sm:pr-3 rounded-2xl bg-muted/30 border border-border/50 hover:border-primary/30 transition-all group outline-none">
          <div className="size-8 rounded-xl bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center text-primary-foreground text-xs font-black shadow-md group-hover:scale-105 transition-transform">
            {userFullName ? userFullName.charAt(0).toUpperCase() : "U"}
          </div>
          <div className="hidden md:flex flex-col items-start">
             <span className="text-xs font-black text-foreground uppercase tracking-wider truncate max-w-[80px]">
               {userFullName || "Pelajar"}
             </span>
             <div className="flex items-center gap-1">
               <ShieldCheck size={8} className="text-primary" />
               <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest">Level {level}</span>
             </div>
          </div>
          <ChevronDown size={14} className="hidden sm:block text-muted-foreground group-hover:text-primary transition-colors ml-1" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56 mt-2 p-2 bg-card/95 backdrop-blur-xl border border-border rounded-2xl shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <DropdownMenuLabel className="px-3 py-3">
          <div className="flex flex-col space-y-1">
            <p className="text-xs font-black uppercase tracking-wider text-foreground">{userFullName || 'Pelajar'}</p>
            <p className="text-xs font-medium text-muted-foreground truncate italic">Akun NihongoRoute Aktif</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-border/50 mx-2" />
        <div className="p-1 space-y-1">
          <DropdownMenuItem asChild className="rounded-xl cursor-pointer hover:bg-primary/10 hover:text-primary transition-colors py-2.5">
            <Link href="/settings" className="flex items-center">
              <Settings size={16} className="mr-3" />
              <span className="text-xs font-bold uppercase tracking-widest">Pengaturan Akun</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild className="rounded-xl cursor-pointer hover:bg-primary/10 hover:text-primary transition-colors py-2.5">
            <Link href="/dashboard" className="flex items-center">
              <User size={16} className="mr-3" />
              <span className="text-xs font-bold uppercase tracking-widest">Profil Belajar</span>
            </Link>
          </DropdownMenuItem>
        </div>
        <DropdownMenuSeparator className="bg-border/50 mx-2" />
        <div className="p-1">
          <DropdownMenuItem 
            onClick={handleLogout}
            className="rounded-xl cursor-pointer bg-destructive/5 hover:bg-destructive hover:text-destructive-foreground transition-all py-2.5 text-destructive"
          >
            <LogOut size={16} className="mr-3" />
            <span className="text-xs font-black uppercase tracking-widest">Keluar Akun</span>
          </DropdownMenuItem>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
