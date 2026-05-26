"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useUIStore } from "@/store/useUIStore";

/**
 * Custom Hook: useOnboardingWizard
 * 
 * Mengelola state langkah demi langkah (wizard) selama proses onboarding pengguna baru,
 * menyimpan target tingkat JLPT dan motivasi belajar pengguna ke database Supabase.
 * 
 * @returns {Object} State dan callback handler wizard onboarding
 * @returns {number} step - Indeks langkah aktif (1, 2, dst.)
 * @returns {Function} setStep - Setter indeks langkah
 * @returns {string | null} targetLevel - Target level JLPT yang dipilih (misal: "N5", "N4")
 * @returns {Function} setTargetLevel - Setter target level JLPT
 * @returns {string | null} motivation - Motivasi utama pengguna belajar bahasa Jepang
 * @returns {Function} setMotivation - Setter motivasi pengguna
 * @returns {boolean} isSubmitting - Status pengiriman payload data onboarding ke Supabase
 * @returns {Function} handleComplete - Callback untuk menyimpan data onboarding dan mengarahkan ke Dasbor
 */
export function useOnboardingWizard() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [targetLevel, setTargetLevel] = useState<string | null>(null);
  const [motivation, setMotivation] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleComplete = useCallback(async () => {
    if (!targetLevel || !motivation) return;
    
    setIsSubmitting(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        const { error } = await supabase
          .from("profiles")
          .update({ 
            jlpt_target: targetLevel, 
            motivation: motivation 
          })
          .eq("id", user.id);

        if (error) throw error;
      }
      
      router.push("/dashboard");
    } catch (error) {
      console.error("Gagal menyimpan profil:", error);
      useUIStore.getState().addNotification({
        title: "Gagal Menyimpan",
        message: "Terjadi kendala saat menyimpan profil Anda. Silakan coba lagi.",
        type: "warning"
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [targetLevel, motivation, router]);

  return {
    step,
    setStep,
    targetLevel,
    setTargetLevel,
    motivation,
    setMotivation,
    isSubmitting,
    handleComplete,
  };
}
