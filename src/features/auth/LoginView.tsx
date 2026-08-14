/**
 * @file LoginView.tsx
 * @description Main user authentication view component handling email/password login, account registration, guest sessions, and OAuth flows.
 * @module features/auth
 */

"use client";

// ==========================================
// Import & Dependencies
// ==========================================
import React, { Suspense } from "react";
import { User, LoginBox, ChevronRight, Mail, Lock, ArrowLeft } from "@/components/ui/icons";
import Link from "next/link";
import { useAuth } from "@/features/user/useAuth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

// ==========================================
// Internal Component Implementation
// ==========================================

/**
 * LoginContent component.
 * Render auth form, social login, guest access UI.
 */
function LoginContent() {
 // Get auth state, handlers from hook.
 const {
 loading,
 isRegistering,
 setIsRegistering,
 email,
 setEmail,
 fullName,
 setFullName,
 password,
 setPassword,
 handleEmailAuth,
 handleSocialLogin,
 handleAnonymousLogin,
 } = useAuth();

 return (
 <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-4 relative overflow-hidden transition-colors duration-300">
 {/* Dekorasi Latar Belakang & Kisi Neural */}
 <div className="grid-overlay" />
 <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none">
 <div className="size-[500px] bg-primary/10 rounded-full blur-[120px] opacity-40 absolute -top-12 -left-12" />
 <div className="size-[400px] bg-secondary/15 rounded-full blur-[100px] opacity-35 absolute -bottom-10 -right-10" />
 </div>

 <div className="w-full max-w-md relative group/login z-10">
 {/* Tombou Register Mark */}
 <div className="absolute -top-[6px] -right-[6px] w-[14px] h-[14px] pointer-events-none z-20">
 <div className="absolute top-0 right-0 w-[14px] h-[1px] bg-primary/20 group-hover/login:bg-primary transition-colors duration-500" />
 <div className="absolute top-0 right-0 w-[1px] h-[14px] bg-primary/20 group-hover/login:bg-primary transition-colors duration-500" />
 </div>

 <Card className="p-8 relative overflow-hidden rounded-2xl bg-card border border-border/50 dark:border-white/10 shadow-[0_4px_25px_rgba(0,0,0,0.015)]">

 <Link 
 href="/" 
 className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-primary transition-all group mb-8"
 >
 <div className="size-8 rounded-full bg-muted/60 border border-border flex items-center justify-center group-hover:border-primary/40 group-hover:bg-primary/5 transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]">
 <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]" />
 </div>
 Beranda
 </Link>

 <div className="text-center mb-6">
 <div className="size-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-primary/20 shadow-[0_0_20px_hsl(var(--primary)/0.15)]">
   <User className="size-8 text-primary" />
 </div>
 <h1 className="text-2xl md:text-3xl font-black text-foreground mb-2 uppercase tracking-tight font-japanese">
 {isRegistering ? "Yuk, bikin akun baru!" : "Siap lanjut belajar?"}
 </h1>
 <p className="text-xs md:text-sm text-muted-foreground font-medium leading-relaxed">
 {isRegistering 
 ? "Bikin akun yuk, biar semua progres belajarmu tersimpan rapi dan bisa diakses kapan saja." 
 : "Masuk ke akunmu, yuk! Kita lanjutkan petualangan belajar yang seru ini."}
 </p>
 </div>

 {/* Formulir Surel & Kata Sandi */}
 <form onSubmit={handleEmailAuth} className="space-y-4 mb-6">
 <div className="space-y-3">
 {/* Show name input if register mode active. */}
 {isRegistering && (
 <div className="relative animate-in fade-in slide-in- duration-350 ease-[cubic-bezier(0.32,0.72,0,1)]">
 <User className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
 <input aria-label="Nama panggilannya siapa?" 
 type="text" 
 placeholder="Nama panggilannya siapa?" 
 value={fullName}
 onChange={(e) => setFullName(e.target.value)}
 required={isRegistering}
 className="bg-card border border-border transition-colors hover:border-primary/40 w-full rounded-lg py-3.5 pl-10 pr-4 text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all duration-300"
 />
 </div>
 )}
 <div className="relative">
 <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
 <input aria-label="Alamat emailmu" 
 type="email" 
 placeholder="Alamat emailmu" 
 value={email}
 onChange={(e) => setEmail(e.target.value)}
 required
 className="bg-card border border-border transition-colors hover:border-primary/40 w-full rounded-lg py-3.5 pl-10 pr-4 text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all duration-300"
 />
 </div>
 <div className="relative">
 <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
 <input aria-label="Kata sandi rahasia" 
 type="password" 
 placeholder="Kata sandi rahasia" 
 value={password}
 onChange={(e) => setPassword(e.target.value)}
 required
 minLength={6}
 className="bg-card border border-border transition-colors hover:border-primary/40 w-full rounded-lg py-3.5 pl-10 pr-4 text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all duration-300"
 />
 </div>
 {!isRegistering && (
 <div className="flex justify-end mt-1">
 <Link 
 href="/forgot-password" 
 className="text-xs text-muted-foreground hover:text-primary transition-colors font-medium"
 >
 Lupa kata sandi? Tenang, bisa kita bantu kok!
 </Link>
 </div>
 )}
 </div>

        <Button
          type="submit"
          disabled={loading}
          className="w-full h-14 pl-8 pr-6 bg-primary text-primary-foreground hover:bg-primary/92 rounded-lg rounded-br-none text-xs disabled:opacity-50 flex items-center justify-between group transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.97]"
        >
          <span className="font-bold">{loading ? "Sedang memproses..." : (isRegistering ? "Daftar Sekarang" : "Masuk Sekarang")}</span>
          <div className="w-8 h-8 rounded-full bg-white/10 dark:bg-white/15 flex items-center justify-center group-hover:translate-x-1 transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]">
            <ChevronRight size={14} className="stroke-[1.5]" />
          </div>
        </Button>
      </form>

      <div className="text-center mb-6">
        <Button 
          type="button"
          variant="link"
          onClick={() => {
            setIsRegistering(!isRegistering);
          }}
          className="text-sm text-primary hover:text-primary/80 transition-colors font-semibold h-auto p-0"
        >
          {isRegistering 
            ? "Sudah punya akun? Masuk lewat sini aja" 
            : "Belum punya akun? Yuk, daftar dulu!"}
        </Button>
      </div>

      <div className="relative py-4 mb-2">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border/80"></div>
        </div>
        <div className="relative flex justify-center">
          <span className="bg-card px-4 text-xs font-bold text-muted-foreground uppercase tracking-widest">Atau pakai cara ini</span>
        </div>
      </div>

      <div className="space-y-3">
        {/* Start Google OAuth flow. */}
        <Button
          type="button"
          onClick={() => handleSocialLogin("google")}
          disabled={loading}
          className="w-full h-14 flex items-center justify-between p-3.5 rounded-lg rounded-br-none bg-foreground text-background hover:opacity-95 transition-all disabled:opacity-50 font-bold text-sm shadow-sm active:scale-[0.98] duration-300"
        >
          <div className="flex items-center gap-3">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Masuk dengan akun Google
          </div>
          <ChevronRight size={16} className="text-background/80" />
        </Button>

        {/* Start guest session. */}
        <Button
          type="button"
          variant="outline"
          onClick={handleAnonymousLogin}
          disabled={loading}
          className="w-full h-14 flex items-center justify-between p-3.5 rounded-lg rounded-br-none bg-card hover:bg-primary/5 border border-border/80 transition-colors text-foreground disabled:opacity-50 text-sm active:scale-[0.98] duration-300 shadow-sm"
        >
          <div className="flex items-center gap-3">
            <User size={20} className="text-primary" />
            <div className="text-left font-bold">Coba Intip Dulu (Mode Tamu)</div>
          </div>
          <LoginBox size={16} className="text-muted-foreground" />
        </Button>
 </div>
 </Card>
 </div>
 </div>
 );
}

/**
 * LoginView component.
 * Wrap LoginContent in Suspense boundary.
 */
export default function LoginView() {
 return (
 <Suspense fallback={
 <div className="min-h-screen bg-background flex items-center justify-center">
 <p className="text-muted-foreground text-xs font-bold uppercase tracking-widest animate-pulse">Memuat…</p>
 </div>
 }>
 <LoginContent />
 </Suspense>
 );
}