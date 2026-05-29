"use client";

/**
 * @file useAuth.ts
 * @description Hook kustom (Custom Hook) untuk menangani proses otentikasi di NihongoRoute.
 * Menyediakan metode masuk/daftar berbasis email, OAuth Google, dan masuk instan sebagai tamu anonim menggunakan Supabase Auth.
 */

// ======================
// IMPOR
// ======================
import React, { useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

// ======================
// HOOK UTAMA
// ======================
export function useAuth() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const supabase = createClient();

  const [loading, setLoading] = useState(false);
  const [isRegistering, setIsRegistering] = useState(() => searchParams.get("mode") === "signup");
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");

  const handleEmailAuth = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isRegistering) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
            },
          },
        });
        if (error) throw error;
        toast.success("Selamat Bergabung!", {
          description: "Akunmu sudah siap. Silakan masuk untuk mulai petualangan belajarmu!",
        });
        setIsRegistering(false);
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        
        toast.success(`Selamat Datang Kembali, ${data.user?.user_metadata?.full_name ? data.user.user_metadata.full_name.split(' ')[0] : 'Siswa'}!`, {
          description: "Senang melihatmu kembali. Mari lanjut belajarnya!",
        });

        router.push("/");
      }
    } catch (error: unknown) {
      const err = error as Error;
      console.error("Gagal autentikasi email:", err);
      toast.error("Ada sedikit kendala...", {
        description: err.message || "Email atau kata sandi mungkin salah. Coba cek lagi ya!",
      });
    } finally {
      setLoading(false);
    }
  }, [isRegistering, email, fullName, password, router, supabase.auth]);

  const handleSocialLogin = useCallback(async (provider: "google") => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) throw error;
    } catch (error) {
      console.error(`Gagal login dengan ${provider}:`, error);
      toast.error(`Gagal login dengan ${provider}`, {
        description: "Ada masalah saat menghubungkan ke akun sosmedmu. Coba lagi nanti ya!"
      });
      setLoading(false);
    }
  }, [supabase.auth]);

  const handleAnonymousLogin = useCallback(async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInAnonymously();
      if (error) throw error;
      
      toast.success("Mode Tamu Aktif", {
        description: "Kamu bisa belajar sekarang, tapi progresmu hanya tersimpan di perangkat ini.",
      });
      router.push("/");
    } catch (error) {
      console.error("Gagal login secara anonim:", error);
      setLoading(false);
    }
  }, [router, supabase.auth]);

  return {
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
  };
}
