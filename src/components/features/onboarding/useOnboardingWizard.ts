"use client";

/**
 * @file useOnboardingWizard.ts
 * @description Hook kustom (Custom Hook) untuk mengelola state dan langkah-langkah pengisian form (wizard) onboarding bagi pengguna baru.
 * Menyimpan data target level JLPT dan motivasi belajar pengguna langsung ke tabel profiles di Supabase.
 */

// ======================
// IMPOR
// ======================
import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useUIStore } from "@/store/useUIStore";

// ======================
// HOOK UTAMA
// ======================
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
