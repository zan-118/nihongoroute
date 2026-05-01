import { useState } from "react";
import { usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

export function useFeedbackWidget() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [type, setType] = useState<"bug" | "suggestion" | "compliment">("suggestion");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isHidden =
    pathname === "/support" ||
    pathname?.startsWith("/studio") ||
    pathname?.includes("/exam") ||
    pathname === "/review";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    setIsSubmitting(true);
    const supabase = createClient();

    try {
      const { data: { session } } = await supabase.auth.getSession();

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

      toast.success("Feedback berhasil dikirim. Terima kasih!");
      setIsOpen(false);
      setMessage("");
    } catch (error) {
      console.error(error);
      toast.error("Gagal mengirim feedback. Silakan coba lagi.");
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
