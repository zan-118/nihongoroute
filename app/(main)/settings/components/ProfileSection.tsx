"use client";

import { motion, Variants } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { useState, useEffect } from "react";

interface ProfileSectionProps {
  name: string;
  isAuthenticated: boolean;
  updateProfileName: (name: string) => void;
  itemVariants: Variants;
}

export default function ProfileSection({ 
  name, 
  isAuthenticated, 
  updateProfileName, 
  itemVariants 
}: ProfileSectionProps) {
  const [newName, setNewName] = useState(name);
  const [isSyncing, setIsSyncing] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    setNewName(name);
  }, [name]);

  const handleSave = async () => {
    setIsSyncing(true);
    try {
      updateProfileName(newName);
      
      if (isAuthenticated) {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { error } = await supabase
            .from("profiles")
            .update({ full_name: newName.trim() })
            .eq("id", user.id);
          
          if (error) throw error;
        }
      }
      toast.success("Nama profil berhasil diperbarui!");
    } catch (error) {
      console.error("Gagal sinkron nama:", error);
      toast.error("Nama disimpan lokal, tapi gagal sinkron ke cloud.");
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <motion.div variants={itemVariants}>
      <Card className="bg-card backdrop-blur-xl border border-border rounded-3xl p-6 md:p-8 neo-card shadow-sm overflow-hidden relative">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-3xl rounded-full -mr-16 -mt-16" />
        
        <div className="flex flex-col md:flex-row items-center gap-6 relative z-10">
          <div className="w-20 h-20 rounded-[2rem] bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center text-white shadow-lg shadow-primary/20">
            <span className="text-3xl font-black italic">{(name || "S").charAt(0).toUpperCase()}</span>
          </div>
          
          <div className="flex-1 w-full text-center md:text-left">
            <h2 className="text-xl font-black uppercase italic tracking-tight text-foreground mb-1">Profil Saya</h2>
            <p className="text-xs text-muted-foreground mb-4 font-medium uppercase tracking-widest">Atur identitas belajarmu</p>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <input 
                  type="text" 
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Masukkan nama Anda..."
                  className="w-full h-12 bg-muted/50 border border-border rounded-xl px-4 text-sm font-bold text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                />
              </div>
              <Button 
                onClick={handleSave}
                disabled={isSyncing}
                className="h-12 bg-primary text-primary-foreground font-black uppercase tracking-widest text-xs rounded-xl px-8 shadow-lg hover:shadow-primary/20 transition-all disabled:opacity-50"
              >
                {isSyncing ? "Menyimpan..." : "Simpan Nama"}
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
