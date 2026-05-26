"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

/**
 * Custom Hook: usePasswordUpdate
 * 
 * Mengelola logika interaksi pengguna untuk formulir pembaruan kata sandi
 * setelah pengguna melakukan alur reset password melalui email.
 * 
 * @returns {Object} State dan callback form pembaruan kata sandi
 * @returns {string} password - Input kata sandi baru
 * @returns {Function} setPassword - Setter kata sandi baru
 * @returns {string} confirmPassword - Input konfirmasi kata sandi baru
 * @returns {Function} setConfirmPassword - Setter konfirmasi kata sandi baru
 * @returns {boolean} loading - Status memproses pengiriman data ke Supabase Auth
 * @returns {boolean} isSuccess - Menandakan apakah pembaruan berhasil dilakukan
 * @returns {Function} handleUpdatePassword - Callback onSubmit untuk mengeksekusi pembaruan
 */
export function usePasswordUpdate() {
  const router = useRouter();
  const supabase = createClient();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    // Memeriksa apakah user benar-benar masuk dengan status pemulihan
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("Sesi Berakhir", {
          description: "Tautan ini sudah tidak berlaku. Silakan minta tautan pemulihan yang baru ya.",
        });
      }
    };
    checkSession();
  }, [supabase.auth]);

  const handleUpdatePassword = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast.error("Wah, passwordnya beda...", {
        description: "Pastikan kedua kolom kata sandi terisi dengan karakter yang sama persis.",
      });
      return;
    }
    
    if (password.length < 6) {
      toast.error("Password terlalu singkat", {
        description: "Gunakan minimal 6 karakter agar akunmu tetap aman.",
      });
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      });
      
      if (error) throw error;
      
      setIsSuccess(true);
      toast.success("Berhasil Diperbarui!", {
        description: "Kata sandi barumu sudah aktif. Yuk, lanjut belajar lagi!",
      });
      
      // Redirect setelah 3 detik
      setTimeout(() => {
        router.push("/");
      }, 3000);
      
    } catch (error: unknown) {
      console.error("Gagal memperbarui kata sandi:", error);
      const message = error instanceof Error ? error.message : "Terjadi kesalahan tidak dikenal";
      toast.error("Gagal Memperbarui", {
        description: message || "Terjadi kesalahan saat memperbarui kata sandi.",
      });
    } finally {
      setLoading(false);
    }
  }, [password, confirmPassword, router, supabase.auth]);

  return {
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    loading,
    isSuccess,
    handleUpdatePassword,
  };
}
