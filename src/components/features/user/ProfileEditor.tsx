"use client";

// ======================
// IMPOR
// ======================
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Edit2, Check, X, UserCircle, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { useUserStore } from "@/store/useUserStore";
import { useSRSStore } from "@/store/useSRSStore";
import { useUIStore } from "@/store/useUIStore";
import { useAuthStore } from "@/store/useAuthStore";
import { UserProgress } from "@/store/types";

/**
 * @file ProfileEditor.tsx
 * @description Komponen untuk mengedit profil pengguna (nama) langsung dari dashboard.
 * Terintegrasi dengan sistem store lokal dan sinkronisasi Supabase.
 */

/**
 * ProfileEditor component.
 * Renders user profile name. Allows inline editing.
 * Syncs changes to local store and Supabase database.
 * 
 * @returns React element.
 */
export default function ProfileEditor() {
  // Load user progress state from Zustand store
  const name = useUserStore(s => s.name);
  const xp = useUserStore(s => s.xp);
  const level = useUserStore(s => s.level);
  const streak = useUserStore(s => s.streak);
  const todayReviewCount = useUserStore(s => s.todayReviewCount);
  const lastStudyDate = useUserStore(s => s.lastStudyDate);
  const studyDays = useUserStore(s => s.studyDays);
  const inventory = useUserStore(s => s.inventory);
  const id = useUserStore(s => s.id);
  const isGuest = useUserStore(s => s.isGuest);
  const completedLessons = useUserStore(s => s.completedLessons);
  const updateProfileName = useUserStore(s => s.updateProfileName);

  // Load auth and UI state from stores
  const isAuthenticated = useAuthStore(s => s.isAuthenticated);
  const srs = useSRSStore(s => s.srs);
  const notifications = useUIStore(s => s.notifications);
  const settings = useUIStore(s => s.settings);
  
  // Consolidate user progress data
  const progress: UserProgress = { id, isGuest, name, xp, level, streak, todayReviewCount, lastStudyDate, studyDays, inventory, srs, notifications, settings, completedLessons };
  
  // Local UI states
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(progress.name || "");
  const [isLoading, setIsLoading] = useState(false);
  
  // Initialize Supabase client
  const supabase = createClient();

  /**
   * Saves updated profile name.
   * Validates input, updates local store, and syncs to Supabase if authenticated.
   */
  const handleSave = async () => {
    // Validate input name
    if (!editName.trim()) {
      toast.error("Nama tidak boleh kosong!");
      return;
    }

    setIsLoading(true);
    try {
      // 1. Update lokal store
      updateProfileName(editName.trim());

      // 2. Jika login, sync ke Supabase
      if (isAuthenticated) {
        // Get current authenticated user
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          // Update profiles table in database
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

  return (
    <div className="w-full">
      {isEditing ? (
        /* Render input field when editing */
        <Card className="p-1 bg-muted border-border flex items-center gap-2 rounded-lg animate-in fade-in slide-in-from-top-1 shadow-sm">
          <Input
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            placeholder="Masukkan nama kamu..."
            className="bg-transparent border-none text-foreground font-black uppercase tracking-tighter text-xl h-12 focus-visible:ring-0 placeholder:text-muted-foreground/30"
            autoFocus
            onKeyDown={(e) => {
              // Save on Enter, cancel on Escape
              if (e.key === "Enter") handleSave();
              if (e.key === "Escape") setIsEditing(false);
            }}
          />
          <div className="flex gap-1 pr-2">
            <Button
              size="icon"
              variant="ghost"
              onClick={handleSave}
              disabled={isLoading}
              className="size-10 rounded-xl bg-success/10 text-success text-success hover:bg-success hover:text-success-foreground transition-all"
              aria-label="Simpan Nama"
            >
              {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Check size={18} />}
            </Button>
            <Button
              size="icon"
              variant="ghost"
              onClick={() => setIsEditing(false)}
              disabled={isLoading}
              className="size-10 rounded-xl bg-muted border border-border text-muted-foreground hover:bg-background hover:text-foreground transition-all"
              aria-label="Batal Edit"
            >
              <X size={18} />
            </Button>
          </div>
        </Card>
      ) : (
        /* Render profile display when not editing */
        <div className="flex items-center gap-4 group">
          <div className="relative">
             <div className="size-16 rounded-lg bg-gradient-to-br from-primary/10 to-secondary/10 border border-border flex items-center justify-center text-primary shadow-sm group-hover:shadow-md transition-all">
                <UserCircle size={32} />
             </div>
             <div className="absolute -bottom-1 -right-1 size-5 bg-success rounded-full border-2 border-background" />
          </div>
          
          <div className="flex-1">
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-foreground tracking-tighter leading-none flex items-center gap-3 sm:gap-4 text-balance">
              <span className="brand-text-gradient">
                {progress.name || "Pelajar"}
              </span>
              <button type="button"
                onClick={() => setIsEditing(true)}
                className="opacity-0 group-hover:opacity-100 transition-opacity p-2 text-muted-foreground hover:text-primary outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-lg shrink-0"
                aria-label="Edit Nama Profil"
              >
                <Edit2 size={20} className="sm:w-6 sm:h-6" />
              </button>
            </h2>
            <p className="text-muted-foreground text-xs md:text-sm font-bold uppercase tracking-[0.2em] mt-2 flex items-center gap-2">
              <span className="size-1.5 rounded-full bg-success animate-pulse" />
              Member Aktif NihongoRoute
            </p>
          </div>
        </div>
      )}
    </div>
  );
}