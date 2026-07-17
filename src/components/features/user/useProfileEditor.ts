import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { useUserStore } from "@/store/useUserStore";
import { useAuthStore } from "@/store/useAuthStore";

/**
 * Custom hook to manage ProfileEditor state and Supabase synchronization.
 */
export function useProfileEditor() {
  const name = useUserStore((s) => s.name);
  const updateProfileName = useUserStore((s) => s.updateProfileName);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(name || "");
  const [isLoading, setIsLoading] = useState(false);

  const supabase = createClient();

  const handleSave = async () => {
    if (!editName.trim()) {
      toast.error("Nama tidak boleh kosong!");
      return;
    }

    setIsLoading(true);
    try {
      // 1. Update local store
      updateProfileName(editName.trim());

      // 2. If logged in, sync to Supabase
      if (isAuthenticated) {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { error } = await supabase
            .from("profiles")
            .update({ full_name: editName.trim() })
            .eq("id", user.id);

          if (error) throw error;
        }
      }

      toast.success("Profil berhasil diperbarui!");
      setIsEditing(false);
    } catch (error) {
      console.error("Gagal update profil:", error);
      toast.error("Gagal menyambung ke server, perubahan disimpan secara lokal.");
      setIsEditing(false);
    } finally {
      setIsLoading(false);
    }
  };

  const startEditing = () => {
    setEditName(name || "");
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setIsEditing(false);
  };

  return {
    name,
    isEditing,
    editName,
    setEditName,
    isLoading,
    handleSave,
    startEditing,
    cancelEditing,
  };
}
