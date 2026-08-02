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

/**
 * Custom hook to manage onboarding wizard state and submission.
 * Handles step navigation, user selections, and profile updates in Supabase.
 * 
 * @returns Object containing wizard state, setters, and completion handler.
 */
export function useOnboardingWizard() {
 const router = useRouter();
 
 // Wizard step state
 const [step, setStep] = useState(1);
 
 // User selection states
 const [targetLevel, setTargetLevel] = useState<string | null>(null);
 const [motivation, setMotivation] = useState<string | null>(null);
 
 // Submission loading state
 const [isSubmitting, setIsSubmitting] = useState(false);

 /**
 * Submits onboarding data to Supabase and redirects to dashboard.
 * Updates user profile with target JLPT level and motivation.
 */
 const handleComplete = useCallback(async () => {
 // Prevent submission if required fields are missing
 if (!targetLevel || !motivation) return;
 
 setIsSubmitting(true);
 try {
 // Initialize Supabase client
 const supabase = createClient();
 
 // Fetch current authenticated user
 const { data: { user } } = await supabase.auth.getUser();

 if (user) {
 // Update profile table with onboarding selections
 const { error } = await supabase
 .from("profiles")
 .update({ 
 jlpt_target: targetLevel, 
 motivation: motivation 
 })
 .eq("id", user.id);

 if (error) throw error;
 }
 
 // Redirect to dashboard on success
 router.push("/dashboard");
 } catch (error) {
 console.error("Gagal menyimpan profil:", error);
 
 // Notify user of failure via UI store
 useUIStore.getState().addNotification({
 title: "Gagal Menyimpan",
 message: "Terjadi kendala saat menyimpan profil kamu. Silakan coba lagi.",
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