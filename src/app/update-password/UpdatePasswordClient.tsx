/**
 * @file UpdatePasswordClient.tsx
 * @description Komponen utama formulir pembaruan kata sandi pengguna dengan antarmuka siber premium.
 */

"use client";

// ======================
// IMPOR
// ======================
import React from "react";
import { Lock, KeyRound, CheckCircle } from "lucide-react";
import Link from "next/link";
import { usePasswordUpdate } from "@/components/features/user/usePasswordUpdate";

// ======================
// EKSEKUSI UTAMA
// ======================
export default function UpdatePasswordClient() {
  const {
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    loading,
    isSuccess,
    handleUpdatePassword,
  } = usePasswordUpdate();

  return (
    <div className="min-h-screen premium-shell text-foreground flex items-center justify-center p-4 relative overflow-hidden transition-colors duration-300">
      {/* Dekorasi Latar Belakang & Kisi Neural */}
      <div className="neural-grid" />
      <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none">
        <div className="size-[500px] bg-primary/10 rounded-full blur-[120px] opacity-40 absolute -top-12 -left-12" />
        <div className="size-[400px] bg-primary/10 rounded-full blur-[100px] opacity-35 absolute -bottom-10 -right-10" />
      </div>

      <div className="w-full max-w-md bg-card/85 backdrop-blur-xl border border-border/80 rounded-[2rem] p-8 z-10 shadow-[0_15px_50px_rgba(var(--foreground-rgb),0.3)] hover:shadow-[0_20px_60px_rgb(var(--brand-cyan-rgb)/0.14)] transition-all duration-500 relative glass">
        {/* Kilau Sudut Dekoratif */}
        <div className="absolute top-0 right-0 size-24 bg-gradient-to-br from-primary/10 to-transparent blur-md rounded-tr-[2rem] pointer-events-none" />

        <div className="text-center mb-6">
          <div className="size-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-primary/20 shadow-[0_0_20px_rgb(var(--brand-cyan-rgb)/0.15)]">
            {isSuccess ? <CheckCircle className="text-primary animate-premium-bounce" size={32} /> : <KeyRound className="text-primary animate-pulse" size={32} />}
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-foreground mb-2 uppercase tracking-tight font-japanese">
            Perbarui Kata Sandi
          </h1>
          <p className="text-xs md:text-sm text-muted-foreground font-medium leading-relaxed">
            {isSuccess 
              ? "Yess! Kata sandimu udah diganti. Tunggu sebentar ya..." 
              : "Yuk, ketik kata sandi barumu di bawah ini."}
          </p>
        </div>

        {!isSuccess ? (
          <form onSubmit={handleUpdatePassword} className="space-y-4">
            <div className="space-y-3">
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                <input aria-label="Kata sandi baru" 
                  type="password" 
                  placeholder="Kata sandi baru" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="control-surface w-full rounded-xl py-3 pl-10 pr-4 text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all duration-300"
                />
              </div>
              
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                <input aria-label="Konfirmasi kata sandi baru" 
                  type="password" 
                  placeholder="Konfirmasi kata sandi baru" 
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={6}
                  className="control-surface w-full rounded-xl py-3 pl-10 pr-4 text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all duration-300"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 brand-button rounded-xl text-xs disabled:opacity-50"
            >
              {loading ? "Lagi disimpan..." : "Aktifkan Sandi Baru"}
            </button>
          </form>
        ) : (
          <Link
            href="/dashboard"
            className="block text-center w-full py-3.5 px-4 bg-muted/60 hover:bg-muted/80 text-foreground border border-border/80 rounded-xl font-bold uppercase tracking-widest text-xs transition-colors duration-300 active:scale-[0.98]"
          >
            Lanjutkan ke Dashboard
          </Link>
        )}
      </div>
    </div>
  );
}
