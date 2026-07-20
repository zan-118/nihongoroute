/**
 * @file useFeedbackWidget.ts
 * @description Hook kustom (Custom Hook) untuk mengelola kondisi modal masukan, pemilihan tipe, dan pengiriman pesan ke tabel 'user_feedback' di Supabase.
 */

// ======================
// IMPOR
// ======================
import { useState } from "react";
import { usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

import { ROUTES } from "@/lib/core/routes";
/**
 * Custom hook to manage feedback widget state, visibility, and submission.
 * Handles modal open state, feedback type, message input, and Supabase database insertion.
 * 
 * @returns State variables, setters, visibility flag, and submit handler.
 */
export function useFeedbackWidget() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [type, setType] = useState<"bug" | "suggestion" | "compliment">("suggestion");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Hide widget on specific routes to prevent UI overlap or exam distraction
  const isHidden =
    pathname === "/support" ||
    pathname?.startsWith("/studio") ||
    pathname?.includes("/exam") ||
    pathname === ROUTES.REVIEW;

  /**
   * Handles feedback form submission.
   * Sends feedback data to Supabase 'user_feedback' table.
   * 
   * @param e - React form event.
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Block empty submissions
    if (!message.trim()) return;

    setIsSubmitting(true);
    const supabase = createClient();

    try {
      // Get current session to link feedback to user if logged in
      const { data: { session } } = await supabase.auth.getSession();

      // Insert feedback record into database
      const { error } = await supabase
        .from("user_feedback")
        .insert([
          { 
            user_id: session?.user?.id || null,
            type, 
            message, 
            route: pathname 
          }
        ]);

      if (error) throw error;

      toast.success("Masukanmu berhasil dikirim. Terima kasih ya!");
      // Reset state on success
      setIsOpen(false);
      setMessage("");
    } catch (error) {
      console.error(error);
      toast.error("Gagal mengirim masukan. Coba lagi sebentar lagi ya!");
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    isOpen,
    setIsOpen,
    type,
    setType,
    message,
    setMessage,
    isSubmitting,
    isHidden,
    handleSubmit,
  };
}